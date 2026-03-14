# DEX - Decentralized Exchange

A complete Decentralized Exchange (DEX) implemented with Solidity, similar to Uniswap V2. It uses the AMM (Automated Market Maker) model with the formula `x * y = k`.

## 🚀 Features

- **AMM (Automated Market Maker)**: Liquidity model based on the constant product formula
- **Swaps**: Token exchange with a 0.3% fee
- **Liquidity**: Add and remove liquidity from pools
- **Factory Pattern**: Dynamic creation of token pairs
- **Router**: Routing system to optimize swaps
- **LP Tokens**: Liquidity tokens representing participation in the pools

## 📁 Project Structure

```
DEX/
├── contracts/
│   ├── DEXFactory.sol    # Creates and manages pairs
│   ├── DEXPair.sol       # Liquidity pool contract
│   ├── DEXRouter.sol     # Router for swaps and liquidity
│   └── MockERC20.sol     # Test token
├── scripts/
│   └── deploy.js         # Deployment script
├── test/
│   └── DEX.test.js       # Complete test suite
├── hardhat.config.js     # Hardhat configuration
└── package.json
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile
```

## 🧪 Tests

```bash
# Run tests
npm test

# View coverage
npx hardhat coverage
```

## 🚢 Deployment

### Local Network (Hardhat Network)

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy contracts
npm run deploy
```

### Testnet (Sepolia)

1. Configure `.env`:
```bash
cp .env.example .env
# Edit .env with your PRIVATE_KEY and RPC URLs
```

2. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 📖 Usage

### 1. Add Liquidity

```javascript
// Approve tokens
await tokenA.approve(routerAddress, amountA);
await tokenB.approve(routerAddress, amountB);

// Add liquidity
await router.addLiquidity(
  tokenAAddress,
  tokenBAddress,
  amountA,
  amountB,
  amountAMin,
  amountBMin,
  toAddress,
  deadline
);
```

### 2. Token Swap

```javascript
// Approve tokens
await tokenA.approve(routerAddress, amountIn);

// Swap
const path = [tokenAAddress, tokenBAddress];
await router.swapExactTokensForTokens(
  amountIn,
  amountOutMin,
  path,
  toAddress,
  deadline
);
```

### 3. Remove Liquidity

```javascript
// Approve LP tokens
await pairContract.approve(routerAddress, liquidity);

// Remove liquidity
await router.removeLiquidity(
  tokenAAddress,
  tokenBAddress,
  liquidity,
  amountAMin,
  amountBMin,
  toAddress,
  deadline
);
```

## 🔧 Core Contracts

### DEXFactory
Creates and manages liquidity pairs. Uses CREATE2 for deterministic addresses.

### DEXPair
Liquidity pool implementing:
- AMM Formula: `x * y = k`
- LP tokens Mint/Burn
- Swap with 0.3% fee
- Price oracle

### DEXRouter
Main user interface:
- Liquidity management
- Simple and multi-hop swaps
- Price calculations
- Slippage protection

## 🔐 Security

- ✅ Reentrancy protection
- ✅ Deadline validations
- ✅ Slippage protection
- ✅ Minimum liquidity checks
- ✅ Consistent token ordering

## 📊 Fee Structure

- **Swap Fee**: 0.3% per transaction
- **Distribution**: 100% to liquidity providers

## 🧮 AMM Formula

The DEX uses the constant product formula:

```
x * y = k
```

Where:
- `x` = Token A reserve
- `y` = Token B reserve
- `k` = constant (maintained after each swap)

## 🌐 Next Steps

1. **Frontend**: Create React interface to interact with the DEX
2. **Subgraph**: Index events for analytics
3. **Governance**: Add governance token
4. **Farms**: Implement liquidity mining
5. **Multihop**: Optimize routes for complex swaps

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request.

---

**⚠️ Disclaimer**: This code is for educational purposes. Perform a security audit before using in production.
