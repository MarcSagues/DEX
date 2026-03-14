# 🦊 MetaMask Configuration Guide for the DEX

## 📋 Prerequisites

1. **MetaMask installed** in your browser ([Download here](https://metamask.io/))
2. **Hardhat node running** at `localhost:8545`

---

## 🚀 Step-by-Step Configuration

### 1️⃣ Add Hardhat Local Network to MetaMask

#### Option A: Automatic (Recommended)
1. Open the DEX interface at `http://localhost:3000`
2. Click on **"🦊 Connect MetaMask"**
3. MetaMask will automatically ask to add the Hardhat Local network
4. Accept the request

#### Option B: Manual
1. Open MetaMask
2. Click on the network selector (top)
3. Select **"Add network"** → **"Add a network manually"**
4. Fill in the fields:
   - **Network name:** Hardhat Local
   - **New RPC URL:** `http://localhost:8545`
   - **Chain ID:** `1337`
   - **Currency symbol:** `ETH`
5. Click **"Save"**

---

### 2️⃣ Import Hardhat Accounts

Hardhat provides 20 test accounts with 10,000 ETH each.

#### Import Account #0 (Recommended)
1. Open MetaMask
2. Click on the account icon (top right)
3. Select **"Import account"**
4. Paste this private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. Click **"Import"**

#### Other Available Accounts

**Account #1:**
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Account #2:**
```
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

**Account #3:**
```
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

⚠️ **IMPORTANT:** These keys are ONLY for local development. NEVER use these accounts on real networks.

---

### 3️⃣ Obtain Test Tokens

To use the DEX you need Token A and Token B:

#### Option 1: From the Hardhat console
```bash
npx hardhat console --network localhost
```

Then run:
```javascript
const MockERC20 = await ethers.getContractFactory("MockERC20");
const tokenA = await MockERC20.attach("0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf");
const tokenB = await MockERC20.attach("0x9d4454B023096f34B160D6B654540c56A1F81688");

// Mint 1000 tokens of each type to your address
await tokenA.mint("YOUR_ADDRESS_HERE", ethers.parseEther("1000"));
await tokenB.mint("YOUR_ADDRESS_HERE", ethers.parseEther("1000"));
```

#### Option 2: Use the minting script
Create a file `scripts/mint-tokens.js`:
```javascript
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  
  const tokenA = await hre.ethers.getContractAt(
    "MockERC20", 
    "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf"
  );
  const tokenB = await hre.ethers.getContractAt(
    "MockERC20",
    "0x9d4454B023096f34B160D6B654540c56A1F81688"
  );
  
  await tokenA.mint(address, hre.ethers.parseEther("1000"));
  await tokenB.mint(address, hre.ethers.parseEther("1000"));
  
  console.log("✅ 1000 Token A and 1000 Token B minted to", address);
}

main().catch(console.error);
```

Run:
```bash
npx hardhat run scripts/mint-tokens.js --network localhost
```

---

### 4️⃣ Add Tokens to MetaMask

To see your Token A and Token B balances:

1. Open MetaMask
2. Go to the **"Tokens"** tab
3. Click on **"Import tokens"**
4. Select **"Custom token"**
5. Paste the contract address:
   - **Token A:** `0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf`
   - **Token B:** `0x9d4454B023096f34B160D6B654540c56A1F81688`
6. The symbol and decimals will auto-fill
7. Click **"Add custom token"** → **"Import tokens"**

---

## 🎯 Using the DEX

### Connect Wallet
1. Open `http://localhost:3000`
2. Click on **"🦊 Connect MetaMask"**
3. Authorize the connection in MetaMask
4. Ready! Your wallet is connected

### Make a Swap
1. Select the input token
2. Enter the amount
3. Select the output token
4. Click **"Swap"**
5. Confirm the transaction in MetaMask (2 transactions: approve + swap)

### Add Liquidity
1. Enter the amounts for Token A and Token B
2. Click **"Add Liquidity"**
3. Confirm the transactions in MetaMask (3 transactions: approve A + approve B + add liquidity)
4. You will receive LP tokens

### Remove Liquidity
1. Enter the amount of LP tokens
2. Click **"Remove Liquidity"**
3. Confirm the transactions in MetaMask
4. You will receive back your Token A and Token B

---

## 🔧 Troubleshooting

### "MetaMask is not installed"
- Install MetaMask from [metamask.io](https://metamask.io/)
- Reload the page

### "Error connecting to the network"
- Verify that the Hardhat node is running: `npm run node`
- Verify that the RPC URL is `http://localhost:8545`
- Verify that the Chain ID is `1337`

### "Insufficient balance"
- Mint tokens using the scripts above
- Verify that you are on the correct account

### "Transaction failed"
- Ensure you have enough tokens
- Verify that the pool has liquidity
- Try with a smaller amount

### "Nonce too high"
- In MetaMask: Settings → Advanced → Clear activity tab data (or Reset account)

---

## 📱 Available Interfaces

- **Web Frontend:** `http://localhost:3000`
- **Hardhat Node:** `http://localhost:8545`
- **Hardhat Console:** `npx hardhat console --network localhost`

---

## ✨ Tips

1. **Free Gas:** In local Hardhat there are no real gas costs
2. **Reset:** If something goes wrong, restart the node: `Ctrl+C` and `npm run node`
3. **Multiple Accounts:** Import several accounts to test transfers
4. **Explorer:** Logs appear in the terminal where the node is running

---

## 🔐 Security

⚠️ **WARNING:**
- These private keys are PUBLIC
- ONLY for local development
- NEVER send real ETH to these addresses
- NEVER use these keys on mainnet or public testnets

---

¡Enjoy using your DEX! 🚀
