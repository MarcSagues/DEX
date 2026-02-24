# 🦊 Guía de Configuración de MetaMask para el DEX

## 📋 Prerrequisitos

1. **MetaMask instalado** en tu navegador ([Descargar aquí](https://metamask.io/))
2. **Nodo de Hardhat corriendo** en `localhost:8545`

---

## 🚀 Configuración Paso a Paso

### 1️⃣ Añadir Red Local de Hardhat a MetaMask

#### Opción A: Automática (Recomendada)
1. Abre la interfaz del DEX en `http://localhost:3000`
2. Haz clic en **"🦊 Conectar MetaMask"**
3. MetaMask te pedirá automáticamente añadir la red Hardhat Local
4. Acepta la solicitud

#### Opción B: Manual
1. Abre MetaMask
2. Haz clic en el selector de red (arriba)
3. Selecciona **"Añadir red"** → **"Añadir red manualmente"**
4. Completa los campos:
   - **Nombre de la red:** Hardhat Local
   - **Nueva URL de RPC:** `http://localhost:8545`
   - **ID de cadena:** `1337`
   - **Símbolo de moneda:** `ETH`
5. Haz clic en **"Guardar"**

---

### 2️⃣ Importar Cuentas de Hardhat

Hardhat proporciona 20 cuentas de prueba con 10,000 ETH cada una.

#### Importar Cuenta #0 (Recomendada)
1. Abre MetaMask
2. Haz clic en el icono de cuenta (arriba derecha)
3. Selecciona **"Importar cuenta"**
4. Pega esta clave privada:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. Haz clic en **"Importar"**

#### Otras Cuentas Disponibles

**Cuenta #1:**
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Cuenta #2:**
```
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

**Cuenta #3:**
```
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

⚠️ **IMPORTANTE:** Estas claves son SOLO para desarrollo local. NUNCA uses estas cuentas en redes reales.

---

### 3️⃣ Obtener Tokens de Prueba

Para usar el DEX necesitas Token A y Token B:

#### Opción 1: Desde la consola de Hardhat
```bash
npx hardhat console --network localhost
```

Luego ejecuta:
```javascript
const MockERC20 = await ethers.getContractFactory("MockERC20");
const tokenA = await MockERC20.attach("0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf");
const tokenB = await MockERC20.attach("0x9d4454B023096f34B160D6B654540c56A1F81688");

// Mintear 1000 tokens de cada tipo a tu dirección
await tokenA.mint("TU_DIRECCION_AQUI", ethers.parseEther("1000"));
await tokenB.mint("TU_DIRECCION_AQUI", ethers.parseEther("1000"));
```

#### Opción 2: Usar el script de minteo
Crea un archivo `scripts/mint-tokens.js`:
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
  
  console.log("✅ 1000 Token A y 1000 Token B minteados a", address);
}

main().catch(console.error);
```

Ejecuta:
```bash
npx hardhat run scripts/mint-tokens.js --network localhost
```

---

### 4️⃣ Añadir Tokens a MetaMask

Para ver tus balances de Token A y Token B:

1. Abre MetaMask
2. Ve a la pestaña **"Tokens"**
3. Haz clic en **"Importar tokens"**
4. Selecciona **"Token personalizado"**
5. Pega la dirección del contrato:
   - **Token A:** `0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf`
   - **Token B:** `0x9d4454B023096f34B160D6B654540c56A1F81688`
6. El símbolo y decimales se completarán automáticamente
7. Haz clic en **"Añadir token personalizado"** → **"Importar tokens"**

---

## 🎯 Usar el DEX

### Conectar Wallet
1. Abre `http://localhost:3000`
2. Haz clic en **"🦊 Conectar MetaMask"**
3. Autoriza la conexión en MetaMask
4. ¡Listo! Tu wallet está conectada

### Hacer un Swap
1. Selecciona el token de entrada
2. Ingresa la cantidad
3. Selecciona el token de salida
4. Haz clic en **"Swap"**
5. Confirma la transacción en MetaMask (2 transacciones: aprobar + swap)

### Añadir Liquidez
1. Ingresa las cantidades de Token A y Token B
2. Haz clic en **"Añadir Liquidez"**
3. Confirma las transacciones en MetaMask (3 transacciones: aprobar A + aprobar B + añadir liquidez)
4. Recibirás LP tokens

### Remover Liquidez
1. Ingresa la cantidad de LP tokens
2. Haz clic en **"Remover Liquidez"**
3. Confirma las transacciones en MetaMask
4. Recibirás de vuelta tus Token A y Token B

---

## 🔧 Troubleshooting

### "MetaMask no está instalado"
- Instala MetaMask desde [metamask.io](https://metamask.io/)
- Recarga la página

### "Error al conectar a la red"
- Verifica que el nodo de Hardhat esté corriendo: `npm run node`
- Verifica que la URL RPC sea `http://localhost:8545`
- Verifica que el Chain ID sea `1337`

### "Balance insuficiente"
- Mintea tokens usando los scripts de arriba
- Verifica que estés en la cuenta correcta

### "Transaction failed"
- Asegúrate de tener suficientes tokens
- Verifica que el pool tenga liquidez
- Intenta con una cantidad menor

### "Nonce too high"
- En MetaMask: Configuración → Avanzado → Restablecer cuenta

---

## 📱 Interfaces Disponibles

- **Frontend Web:** `http://localhost:3000`
- **Nodo Hardhat:** `http://localhost:8545`
- **Hardhat Console:** `npx hardhat console --network localhost`

---

## ✨ Tips

1. **Gas gratis:** En Hardhat local no hay costos reales de gas
2. **Reset:** Si algo sale mal, reinicia el nodo: `Ctrl+C` y `npm run node`
3. **Múltiples cuentas:** Importa varias cuentas para probar transferencias
4. **Explorador:** Los logs aparecen en la terminal donde corre el nodo

---

## 🔐 Seguridad

⚠️ **ADVERTENCIA:**
- Estas claves privadas son PÚBLICAS
- SOLO para desarrollo local
- NUNCA envíes ETH real a estas direcciones
- NUNCA uses estas claves en mainnet o testnets públicas

---

¡Disfruta usando tu DEX! 🚀
