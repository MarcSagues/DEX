# 🚀 Guía Rápida - DEX

## ⚡ Inicio Rápido

### 1️⃣ Instalación
```bash
npm install
```

### 2️⃣ Compilar Contratos
```bash
npm run compile
```

### 3️⃣ Ejecutar Tests
```bash
npm test
```

## 🎯 Comandos Principales

### Desarrollo Local

```bash
# Terminal 1: Iniciar red local
npm run node

# Terminal 2: Desplegar contratos
npm run deploy

# Terminal 3: Interactuar con el DEX
npm run interact
```

### Testnet

```bash
# 1. Configurar .env
cp .env.example .env
# Editar .env con tu PRIVATE_KEY

# 2. Desplegar en Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 3. Interactuar
npx hardhat run scripts/interact.js --network sepolia
```

## 📚 Arquitectura del DEX

```
┌─────────────────┐
│   DEXFactory    │  ← Crea pares de tokens
└────────┬────────┘
         │ crea
         ▼
    ┌─────────┐
    │ DEXPair │  ← Pool de liquidez (AMM)
    └─────────┘
         ▲
         │ usa
┌────────┴────────┐
│   DEXRouter     │  ← Interfaz principal
└─────────────────┘
```

## 🔑 Funciones Principales

### 1. Añadir Liquidez
```javascript
router.addLiquidity(
  tokenA,           // Dirección del token A
  tokenB,           // Dirección del token B
  amountA,          // Cantidad deseada de A
  amountB,          // Cantidad deseada de B
  amountAMin,       // Mínimo aceptable de A
  amountBMin,       // Mínimo aceptable de B
  to,               // Destinatario de LP tokens
  deadline          // Timestamp límite
)
```

### 2. Swap de Tokens
```javascript
router.swapExactTokensForTokens(
  amountIn,         // Cantidad a intercambiar
  amountOutMin,     // Mínimo aceptable a recibir
  [tokenA, tokenB], // Path de tokens
  to,               // Destinatario
  deadline          // Timestamp límite
)
```

### 3. Remover Liquidez
```javascript
router.removeLiquidity(
  tokenA,           // Token A
  tokenB,           // Token B
  liquidity,        // LP tokens a quemar
  amountAMin,       // Mínimo de A a recibir
  amountBMin,       // Mínimo de B a recibir
  to,               // Destinatario
  deadline          // Timestamp límite
)
```

## 📊 Fórmulas Importantes

### Precio de Swap
```
amountOut = (amountIn × 997 × reserveOut) / (reserveIn × 1000 + amountIn × 997)
```
*Nota: 997/1000 = 0.3% de fee*

### Liquidez
```
k = reserveA × reserveB  (debe mantenerse constante)
```

## 💡 Tips

1. **Deadline**: Siempre incluye un deadline razonable (ej: 20 minutos)
2. **Slippage**: Ajusta `amountMin` para protegerte contra slippage
3. **Aprobar**: No olvides aprobar tokens antes de cada operación
4. **Gas**: Considera el costo de gas en tus operaciones

## 🛠️ Troubleshooting

### Error: INSUFFICIENT_LIQUIDITY
- Asegúrate de que el pool tenga suficiente liquidez
- Verifica que estás usando los tokens correctos

### Error: EXPIRED
- El deadline ha pasado, usa un timestamp más largo

### Error: INSUFFICIENT_OUTPUT_AMOUNT
- El slippage es muy alto
- Reduce `amountOutMin` o espera mejores condiciones

### Error: PAIR_DOES_NOT_EXIST
- El par de tokens no existe
- Crea el par primero con `addLiquidity`

## 🔗 Recursos

- [Hardhat Docs](https://hardhat.org/)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf)
- [Ethers.js Docs](https://docs.ethers.org/)

## 📞 Soporte

Si encuentras problemas:
1. Revisa los tests: `npm test`
2. Verifica los logs en la consola
3. Usa Hardhat console para debugging: `npx hardhat console`

---

**Happy DEXing! 🎉**
