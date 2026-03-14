# 🚀 DEX - System Status

## ✅ Active Services

### 🔗 Local Blockchain
- **Hardhat Node:** `http://localhost:8545`
- **Status:** ✅ Running
- **Chain ID:** 1337
- **Accounts:** 20 accounts with 10,000 ETH each

### 🌐 Web Frontend
- **URL:** `http://localhost:3000`
- **Status:** ✅ Running
- **Features:**
  - Connect MetaMask or use local account
  - Token swap
  - Add/Remove liquidity
  - View real-time pool statistics

---

## 📝 Deployed Contracts

| Contract | Address |
|----------|-----------|
| **DEXFactory** | `0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf` |
| **DEXRouter** | `0x0E801D84Fa97b50751Dbf25036d067dCf18858bF` |
| **Token A (TKA)** | `0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf` |
| **Token B (TKB)** | `0x9d4454B023096f34B160D6B654540c56A1F81688` |

---

## 🎮 How to Use

### Option 1: With MetaMask 🦊

1. **Connect MetaMask:**
   - Open `http://localhost:3000`
   - Click on "🦊 Connect MetaMask"
   - Accept to add the Hardhat Local network
   - Authorize the connection

2. **Import Account (if needed):**
   - Private key for account #0:
     ```
     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
     ```

3. **Get Tokens:**
   ```bash
   npm run mint -- --network localhost
   ```

4. **Add tokens to MetaMask:**
   - Token A: `0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf`
   - Token B: `0x9d4454B023096f34B160D6B654540c56A1F81688`

5. **Ready to use the DEX!**

### Option 2: Without MetaMask (Local Account)

If you don't have MetaMask installed, the application will automatically connect using the first account from the Hardhat node.

---

## 🛠️ Useful Commands

```bash
# View balances and status
npm run interact -- --network localhost

# Mint more tokens
npm run mint -- --network localhost

# Run tests
npm test

# Compile contracts
npm run compile

# View Hardhat console
npx hardhat console --network localhost
```

---

## 📊 Current Liquidity Pool

Run to see the current status:
```bash
npm run interact -- --network localhost
```

---

## 🔧 Troubleshooting

### Frontend not loading
```bash
# Restart server
cd frontend
node server.js
```

### Node not responding
```bash
# Restart Hardhat node
# Ctrl+C to stop
npm run node
```

### Reset everything
```bash
# 1. Stop all processes (Ctrl+C)
# 2. Restart node
npm run node

# 3. (In another terminal) Redeploy
npm run deploy -- --network localhost

# 4. (In another terminal) Start frontend
npm run frontend
```

---

## 📖 Documentation

- **README.md** - Complete project documentation
- **QUICK_START.md** - Quick start guide
- **METAMASK_GUIDE.md** - Detailed MetaMask configuration

---

## 🎯 Available Features

### ✅ Token Swap
- Instant exchange between Token A and Token B
- 0.3% fee per transaction
- Automatic price calculation

### ✅ Liquidity Management
- Add liquidity (receive LP tokens)
- Remove liquidity (burn LP tokens)
- View pool participation

### ✅ Real-time Information
- Pool reserves
- Current price
- LP tokens balance
- ETH balance

---

## 🔐 Hardhat Accounts

### Account #0 (Primary)
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance: ~10,000 ETH
```

### Account #1
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Balance: 10,000 ETH
```

⚠️ **ONLY for local development**

---

## 📱 Quick Access

- 🌐 **Frontend:** [http://localhost:3000](http://localhost:3000)
- 🔗 **Blockchain:** http://localhost:8545
- 📝 **Contracts:** See `deployment-addresses.json`

---

## ✨ Next Steps

1. ✅ Connect wallet
2. ✅ Get test tokens
3. ✅ Add initial liquidity
4. ✅ Make your first swap
5. 🚀 Explore and experiment

---

**Everything is ready to use! 🎉**
