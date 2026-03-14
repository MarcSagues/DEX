const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Iniciando deployment del DEX...\n");
  
  // 1. Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying con la cuenta:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 2. Desplegar Factory
  console.log("🏭 Desplegando DEXFactory...");
  const Factory = await ethers.getContractFactory("DEXFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ DEXFactory desplegado en:", factoryAddress, "\n");

  // 3. Desplegar Router
  console.log("🚦 Desplegando DEXRouter...");
  const Router = await ethers.getContractFactory("DEXRouter");
  const router = await Router.deploy(factoryAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ DEXRouter desplegado en:", routerAddress, "\n");

  // 4. Desplegar tokens de prueba
  console.log("💵 Desplegando tokens de prueba...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  const usdc = await MockERC20.deploy("USD Coin", "USDC");
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  
  const dai = await MockERC20.deploy("Dai Stablecoin", "DAI");
  await dai.waitForDeployment();
  const daiAddress = await dai.getAddress();
  
  const usdt = await MockERC20.deploy("Tether USD", "USDT");
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  
  console.log("✅ USDC desplegado en:", usdcAddress);
  console.log("✅ DAI desplegado en:", daiAddress);
  console.log("✅ USDT desplegado en:", usdtAddress, "\n");

  // 5. Mintear tokens iniciales al deployer
  console.log("🪙 Minteando tokens iniciales...");
  const initialAmount = ethers.parseUnits("100000", 18); // 100,000 tokens
  await (await usdc.mint(deployer.address, initialAmount)).wait();
  await (await dai.mint(deployer.address, initialAmount)).wait();
  await (await usdt.mint(deployer.address, initialAmount)).wait();
  console.log("✅ Minteados 100,000 de cada token al deployer\n");

  // 6. Crear pares
  console.log("👥 Creando pares...");
  await (await factory.createPair(usdcAddress, daiAddress)).wait();
  await (await factory.createPair(usdcAddress, usdtAddress)).wait();
  await (await factory.createPair(daiAddress, usdtAddress)).wait();
  
  const pairUSDC_DAI = await factory.getPair(usdcAddress, daiAddress);
  const pairUSDC_USDT = await factory.getPair(usdcAddress, usdtAddress);
  const pairDAI_USDT = await factory.getPair(daiAddress, usdtAddress);
  
  console.log("✅ Par USDC/DAI:", pairUSDC_DAI);
  console.log("✅ Par USDC/USDT:", pairUSDC_USDT);
  console.log("✅ Par DAI/USDT:", pairDAI_USDT, "\n");

  // 7. Añadir liquidez inicial
  console.log("💧 Añadiendo liquidez inicial (esto puede tardar un poco)...");
  const liquidityAmount = ethers.parseUnits("10000", 18); // 10,000 tokens
  
  // Aprobar tokens al router
  console.log("🔓 Aprobando tokens...");
  await (await usdc.approve(routerAddress, ethers.parseUnits("30000", 18))).wait();
  await (await dai.approve(routerAddress, ethers.parseUnits("20000", 18))).wait();
  await (await usdt.approve(routerAddress, ethers.parseUnits("20000", 18))).wait();
  
  // Añadir liquidez USDC/DAI
  console.log("➕ Añadiendo liquidez USDC/DAI...");
  const tx1 = await router.addLiquidity(
    usdcAddress,
    daiAddress,
    liquidityAmount,
    liquidityAmount,
    0,
    0,
    deployer.address
  );
  await tx1.wait();
  console.log("✅ Liquidez añadida a USDC/DAI");
  
  // Añadir liquidez USDC/USDT
  console.log("➕ Añadiendo liquidez USDC/USDT...");
  const tx2 = await router.addLiquidity(
    usdcAddress,
    usdtAddress,
    liquidityAmount,
    liquidityAmount,
    0,
    0,
    deployer.address
  );
  await tx2.wait();
  console.log("✅ Liquidez añadida a USDC/USDT");
  
  // Añadir liquidez DAI/USDT
  console.log("➕ Añadiendo liquidez DAI/USDT...");
  const tx3 = await router.addLiquidity(
    daiAddress,
    usdtAddress,
    liquidityAmount,
    liquidityAmount,
    0,
    0,
    deployer.address
  );
  await tx3.wait();
  console.log("✅ Liquidez añadida a DAI/USDT\n");

  // 8. Guardar direcciones y ABIs para React
  console.log("💾 Guardando configuración para frontend...");
  
  const config = {
    factory: factoryAddress,
    router: routerAddress,
    tokens: {
      USDC: usdcAddress,
      DAI: daiAddress,
      USDT: usdtAddress
    },
    pairs: {
      "USDC-DAI": pairUSDC_DAI,
      "USDC-USDT": pairUSDC_USDT,
      "DAI-USDT": pairDAI_USDT
    }
  };
  
  // Guardar direcciones
  const networkName = hre.network.name;
  const frontendDir = path.join(__dirname, "..", "frontend", "frontend-react", "src", "contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendDir, `addresses-${networkName}.json`),
    JSON.stringify(config, null, 2)
  );
  
  // Copiar ABIs
  const artifacts = [
    { name: "DEXFactory", path: "contracts/DEXFactory.sol/DEXFactory.json" },
    { name: "DEXRouter", path: "contracts/DEXRouter.sol/DEXRouter.json" },
    { name: "DEXPair", path: "contracts/DEXPair.sol/DEXPair.json" },
    { name: "MockERC20", path: "contracts/MockERC20.sol/MockERC20.json" }
  ];
  
  for (const artifact of artifacts) {
    const artifactPath = path.join(__dirname, "..", "artifacts", artifact.path);
    const artifactData = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(frontendDir, `${artifact.name}.json`),
      JSON.stringify(artifactData.abi, null, 2)
    );
  }
  
  console.log("✅ Configuración guardada en:", frontendDir);
  
  console.log("\n🎉 ¡Deployment completado exitosamente!");
  console.log("\n📋 Resumen:");
  console.log("   Factory:", factoryAddress);
  console.log("   Router:", routerAddress);
  console.log("   USDC:", usdcAddress);
  console.log("   DAI:", daiAddress);
  console.log("   USDT:", usdtAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
