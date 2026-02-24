const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX Test Suite", function () {
  let factory, router, tokenA, tokenB, pair;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Desplegar Factory
    const DEXFactory = await ethers.getContractFactory("DEXFactory");
    factory = await DEXFactory.deploy();
    await factory.waitForDeployment();

    // Desplegar Router
    const DEXRouter = await ethers.getContractFactory("DEXRouter");
    router = await DEXRouter.deploy(await factory.getAddress());
    await router.waitForDeployment();

    // Desplegar tokens de prueba
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenA = await MockERC20.deploy("Token A", "TKA", ethers.parseEther("1000000"));
    tokenB = await MockERC20.deploy("Token B", "TKB", ethers.parseEther("1000000"));
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();
  });

  describe("Factory", function () {
    it("Debería crear un nuevo par correctamente", async function () {
      const tx = await factory.createPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
      );
      await tx.wait();

      const pairAddress = await factory.getPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
      );
      expect(pairAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("No debería permitir crear pares duplicados", async function () {
      await factory.createPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
      );

      await expect(
        factory.createPair(
          await tokenA.getAddress(),
          await tokenB.getAddress()
        )
      ).to.be.revertedWith("DEXFactory: PAIR_EXISTS");
    });

    it("Debería retornar el número correcto de pares", async function () {
      await factory.createPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
      );

      const length = await factory.allPairsLength();
      expect(length).to.equal(1);
    });
  });

  describe("Router - Liquidez", function () {
    beforeEach(async function () {
      // Aprobar tokens para el router
      await tokenA.approve(await router.getAddress(), ethers.parseEther("10000"));
      await tokenB.approve(await router.getAddress(), ethers.parseEther("10000"));
    });

    it("Debería añadir liquidez correctamente", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutos

      const tx = await router.addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        ethers.parseEther("100"),
        ethers.parseEther("100"),
        0,
        0,
        owner.address,
        deadline
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      // Verificar que el par fue creado
      const pairAddress = await factory.getPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
      );
      expect(pairAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Debería remover liquidez correctamente", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      // Añadir liquidez primero
      await router.addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        ethers.parseEther("100"),
        ethers.parseEther("100"),
        0,
        0,
        owner.address,
        deadline
      );

      // Obtener el par y balance de LP tokens
      const pairAddress = await factory.getPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
      );
      const DEXPair = await ethers.getContractFactory("DEXPair");
      pair = DEXPair.attach(pairAddress);

      const lpBalance = await pair.balanceOf(owner.address);
      expect(lpBalance).to.be.gt(0);

      // Aprobar LP tokens para el router
      await pair.approve(await router.getAddress(), lpBalance);

      // Remover liquidez
      const balanceABefore = await tokenA.balanceOf(owner.address);
      const balanceBBefore = await tokenB.balanceOf(owner.address);

      await router.removeLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        lpBalance,
        0,
        0,
        owner.address,
        deadline
      );

      const balanceAAfter = await tokenA.balanceOf(owner.address);
      const balanceBAfter = await tokenB.balanceOf(owner.address);

      expect(balanceAAfter).to.be.gt(balanceABefore);
      expect(balanceBAfter).to.be.gt(balanceBBefore);
    });
  });

  describe("Router - Swaps", function () {
    beforeEach(async function () {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      // Aprobar y añadir liquidez inicial
      await tokenA.approve(await router.getAddress(), ethers.parseEther("1000"));
      await tokenB.approve(await router.getAddress(), ethers.parseEther("1000"));

      await router.addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        ethers.parseEther("500"),
        ethers.parseEther("500"),
        0,
        0,
        owner.address,
        deadline
      );
    });

    it("Debería hacer swap de tokens correctamente", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const amountIn = ethers.parseEther("10");

      // Transferir tokens a user1
      await tokenA.transfer(user1.address, ethers.parseEther("100"));

      // Aprobar para user1
      await tokenA.connect(user1).approve(await router.getAddress(), amountIn);

      const balanceBBefore = await tokenB.balanceOf(user1.address);

      // Hacer swap
      const path = [await tokenA.getAddress(), await tokenB.getAddress()];
      await router.connect(user1).swapExactTokensForTokens(
        amountIn,
        0,
        path,
        user1.address,
        deadline
      );

      const balanceBAfter = await tokenB.balanceOf(user1.address);
      expect(balanceBAfter).to.be.gt(balanceBBefore);
    });

    it("Debería calcular correctamente los amounts out", async function () {
      const amountIn = ethers.parseEther("10");
      const path = [await tokenA.getAddress(), await tokenB.getAddress()];

      const amounts = await router.getAmountsOut(amountIn, path);
      expect(amounts.length).to.equal(2);
      expect(amounts[0]).to.equal(amountIn);
      expect(amounts[1]).to.be.gt(0);
    });

    it("Debería fallar si el output es menor que el mínimo", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const amountIn = ethers.parseEther("10");

      await tokenA.transfer(user1.address, ethers.parseEther("100"));
      await tokenA.connect(user1).approve(await router.getAddress(), amountIn);

      const path = [await tokenA.getAddress(), await tokenB.getAddress()];
      
      // Obtener el amount out real y pedir más
      const amounts = await router.getAmountsOut(amountIn, path);
      const amountOutMin = amounts[1] * 2n; // Pedir el doble

      await expect(
        router.connect(user1).swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          user1.address,
          deadline
        )
      ).to.be.revertedWith("DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT");
    });
  });

  describe("Pair", function () {
    beforeEach(async function () {
      await factory.createPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
      );

      const pairAddress = await factory.getPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
      );

      const DEXPair = await ethers.getContractFactory("DEXPair");
      pair = DEXPair.attach(pairAddress);
    });

    it("Debería tener los tokens correctos", async function () {
      const token0 = await pair.token0();
      const token1 = await pair.token1();

      const tokenAAddr = await tokenA.getAddress();
      const tokenBAddr = await tokenB.getAddress();

      expect([token0, token1]).to.include(tokenAAddr);
      expect([token0, token1]).to.include(tokenBAddr);
    });

    it("Debería inicializar con reservas en 0", async function () {
      const [reserve0, reserve1] = await pair.getReserves();
      expect(reserve0).to.equal(0);
      expect(reserve1).to.equal(0);
    });
  });
});
