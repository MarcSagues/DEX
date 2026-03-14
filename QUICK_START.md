# 🚀 Quick Start - DEX

## ⚡ Quick Setup

### 1️⃣ Installation
```bash
npm install
```

### 2️⃣ Compile Contracts
```bash
npm run compile
```

### 3️⃣ Run Tests
```bash
npm test
```

## 🎯 Main Commands

### Local Development

```bash
# Terminal 1: Start local network
npm run node

# Terminal 2: Deploy contracts
npm run deploy

# Terminal 3: Interact with the DEX
npm run interact
```

### Testnet

```bash
# 1. Configure .env
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# 2. Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 3. Interact
npx hardhat run scripts/interact.js --network sepolia
```

## 📚 DEX Architecture

```
┌─────────────────┐
│   DEXFactory    │  ← Creates token pairs
└────────┬────────┘
         │ creates
         ▼
    ┌─────────┐
    │ DEXPair │  ← Liquidity Pool (AMM)
    └─────────┘
         ▲
          │ uses
┌────────┴────────┐
│   DEXRouter     │  ← Main interface
└─────────────────┘
```

## 🔑 Key Functions

### 1. Add Liquidity
```javascript
router.addLiquidity(
  tokenA,           // Token A address
  tokenB,           // Token B address
  amountA,          // Desired amount of A
  amountB,          // Desired amount of B
  amountAMin,       // Minimum acceptable amount of A
  amountBMin,       // Minimum acceptable amount of B
  to,               // Recipient of LP tokens
  deadline          // Timestamp limit
)
```

### 2. Token Swap
```javascript
router.swapExactTokensForTokens(
  amountIn,         // Amount to exchange
  amountOutMin,     // Minimum acceptable amount to receive
  [tokenA, tokenB], // Token path
  to,               // Recipient
  deadline          // Timestamp limit
)
```

### 3. Remove Liquidity
```javascript
router.removeLiquidity(
  tokenA,           // Token A
  tokenB,           // Token B
  liquidity,        // LP tokens to burn
  amountAMin,       // Minimum A to receive
  amountBMin,       // Minimum B to receive
  to,               // Recipient
  deadline          // Timestamp limit
)
```

## 📊 Important Formulas

### Swap Price
```
amountOut = (amountIn × 997 × reserveOut) / (reserveIn × 1000 + amountIn × 997)
```
*Note: 997/1000 = 0.3% fee*

### Liquidity
```
k = reserveA × reserveB  (must remain constant)
```

## 💡 Tips

1. **Deadline**: Always include a reasonable deadline (e.g., 20 minutes)
2. **Slippage**: Adjust `amountMin` to protect against slippage
3. **Approve**: Don't forget to approve tokens before each operation
4. **Gas**: Consider the gas cost in your operations

## 🛠️ Troubleshooting

### Error: INSUFFICIENT_LIQUIDITY
- Ensure the pool has enough liquidity
- Verify that you are using the correct tokens

### Error: EXPIRED
- The deadline has passed, use a longer timestamp

### Error: INSUFFICIENT_OUTPUT_AMOUNT
- Slippage is too high
- Reduce `amountOutMin` or wait for better conditions

### Error: PAIR_DOES_NOT_EXIST
- The token pair does not exist
- Create the pair first with `addLiquidity`

## 🔗 Resources

- [Hardhat Docs](https://hardhat.org/)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf)
- [Ethers.js Docs](https://docs.ethers.org/)

## 📞 Support

If you encounter issues:
1. Check the tests: `npm test`
2. Verify console logs
3. Use Hardhat console for debugging: `npx hardhat console`

---

**Happy DEXing! 🎉**
