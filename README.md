# DEX - Decentralized Exchange

Un DEX (Exchange Descentralizado) completo implementado con Solidity, similar a Uniswap V2. Utiliza el modelo AMM (Automated Market Maker) con la fórmula `x * y = k`.

## 🚀 Características

- **AMM (Automated Market Maker)**: Modelo de liquidez basado en la fórmula constante de producto
- **Swaps**: Intercambio de tokens con 0.3% de fee
- **Liquidez**: Añadir y remover liquidez de los pools
- **Factory Pattern**: Creación dinámica de pares de tokens
- **Router**: Sistema de enrutamiento para optimizar swaps
- **LP Tokens**: Tokens de liquidez para representar la participación en los pools

## 📁 Estructura del Proyecto

```
DEX/
├── contracts/
│   ├── DEXFactory.sol    # Crea y gestiona los pares
│   ├── DEXPair.sol       # Contrato del pool de liquidez
│   ├── DEXRouter.sol     # Router para swaps y liquidez
│   └── MockERC20.sol     # Token de prueba
├── scripts/
│   └── deploy.js         # Script de deployment
├── test/
│   └── DEX.test.js       # Tests completos
├── hardhat.config.js     # Configuración de Hardhat
└── package.json
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Compilar contratos
npm run compile
```

## 🧪 Tests

```bash
# Ejecutar tests
npm test

# Ver coverage
npx hardhat coverage
```

## 🚢 Deployment

### Red Local (Hardhat Network)

```bash
# Terminal 1: Iniciar nodo local
npm run node

# Terminal 2: Desplegar contratos
npm run deploy
```

### Testnet (Sepolia)

1. Configurar `.env`:
```bash
cp .env.example .env
# Editar .env con tu PRIVATE_KEY y RPC URLs
```

2. Desplegar:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 📖 Uso

### 1. Añadir Liquidez

```javascript
// Aprobar tokens
await tokenA.approve(routerAddress, amountA);
await tokenB.approve(routerAddress, amountB);

// Añadir liquidez
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

### 2. Swap de Tokens

```javascript
// Aprobar tokens
await tokenA.approve(routerAddress, amountIn);

// Hacer swap
const path = [tokenAAddress, tokenBAddress];
await router.swapExactTokensForTokens(
  amountIn,
  amountOutMin,
  path,
  toAddress,
  deadline
);
```

### 3. Remover Liquidez

```javascript
// Aprobar LP tokens
await pairContract.approve(routerAddress, liquidity);

// Remover liquidez
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

## 🔧 Contratos Principales

### DEXFactory
Crea y gestiona los pares de liquidez. Utiliza CREATE2 para direcciones determinísticas.

### DEXPair
Pool de liquidez que implementa:
- Fórmula AMM: `x * y = k`
- Mint/Burn de LP tokens
- Swap con 0.3% fee
- Oracle de precios

### DEXRouter
Interfaz principal para usuarios:
- Gestión de liquidez
- Swaps simples y multi-hop
- Cálculos de precios
- Protección contra slippage

## 🔐 Seguridad

- ✅ Protección contra reentrancy
- ✅ Validaciones de deadline
- ✅ Slippage protection
- ✅ Checks de liquidez mínima
- ✅ Ordenamiento de tokens consistente

## 📊 Fee Structure

- **Swap Fee**: 0.3% por transacción
- **Distribución**: 100% a los proveedores de liquidez

## 🧮 Fórmula AMM

El DEX utiliza la fórmula de producto constante:

```
x * y = k
```

Donde:
- `x` = reserva del token A
- `y` = reserva del token B
- `k` = constante (se mantiene después de cada swap)

## 🌐 Próximos Pasos

1. **Frontend**: Crear interfaz React para interactuar con el DEX
2. **Subgraph**: Indexar eventos para analytics
3. **Governance**: Añadir token de gobernanza
4. **Farms**: Implementar liquidity mining
5. **Multihop**: Optimizar rutas para swaps complejos

## 📝 Licencia

MIT

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor abre un issue o pull request.

---

**⚠️ Disclaimer**: Este código es para fines educativos. Realizar auditoría de seguridad antes de usar en producción.
