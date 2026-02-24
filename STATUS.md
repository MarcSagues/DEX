# 🚀 DEX - Estado del Sistema

## ✅ Servicios Activos

### 🔗 Blockchain Local
- **Nodo Hardhat:** `http://localhost:8545`
- **Estado:** ✅ Corriendo
- **Chain ID:** 1337
- **Cuentas:** 20 cuentas con 10,000 ETH cada una

### 🌐 Frontend Web
- **URL:** `http://localhost:3000`
- **Estado:** ✅ Corriendo
- **Características:**
  - Conectar MetaMask o usar cuenta local
  - Swap de tokens
  - Añadir/Remover liquidez
  - Ver estadísticas del pool en tiempo real

---

## 📝 Contratos Desplegados

| Contrato | Dirección |
|----------|-----------|
| **DEXFactory** | `0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf` |
| **DEXRouter** | `0x0E801D84Fa97b50751Dbf25036d067dCf18858bF` |
| **Token A (TKA)** | `0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf` |
| **Token B (TKB)** | `0x9d4454B023096f34B160D6B654540c56A1F81688` |

---

## 🎮 Cómo Usar

### Opción 1: Con MetaMask 🦊

1. **Conectar MetaMask:**
   - Abre `http://localhost:3000`
   - Haz clic en "🦊 Conectar MetaMask"
   - Acepta añadir la red Hardhat Local
   - Autoriza la conexión

2. **Importar Cuenta (si es necesario):**
   - Clave privada cuenta #0:
     ```
     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
     ```

3. **Obtener Tokens:**
   ```bash
   npm run mint -- --network localhost
   ```

4. **Añadir tokens a MetaMask:**
   - Token A: `0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf`
   - Token B: `0x9d4454B023096f34B160D6B654540c56A1F81688`

5. **¡Listo para usar el DEX!**

### Opción 2: Sin MetaMask (Cuenta Local)

Si no tienes MetaMask instalado, la aplicación se conectará automáticamente usando la primera cuenta del nodo Hardhat.

---

## 🛠️ Comandos Útiles

```bash
# Ver balances y estado
npm run interact -- --network localhost

# Mintear más tokens
npm run mint -- --network localhost

# Ejecutar tests
npm test

# Compilar contratos
npm run compile

# Ver consola de Hardhat
npx hardhat console --network localhost
```

---

## 📊 Pool de Liquidez Actual

Ejecuta para ver el estado actual:
```bash
npm run interact -- --network localhost
```

---

## 🔧 Troubleshooting

### Frontend no carga
```bash
# Reiniciar servidor
cd frontend
node server.js
```

### Nodo no responde
```bash
# Reiniciar nodo Hardhat
# Ctrl+C para detener
npm run node
```

### Resetear todo
```bash
# 1. Detener todos los procesos (Ctrl+C)
# 2. Reiniciar nodo
npm run node

# 3. (En otra terminal) Redesplegar
npm run deploy -- --network localhost

# 4. (En otra terminal) Iniciar frontend
npm run frontend
```

---

## 📖 Documentación

- **README.md** - Documentación completa del proyecto
- **QUICK_START.md** - Guía rápida de inicio
- **METAMASK_GUIDE.md** - Configuración detallada de MetaMask

---

## 🎯 Funcionalidades Disponibles

### ✅ Swap de Tokens
- Intercambio instantáneo entre Token A y Token B
- Fee del 0.3% por transacción
- Cálculo automático de precio

### ✅ Gestión de Liquidez
- Añadir liquidez (recibe LP tokens)
- Remover liquidez (quema LP tokens)
- Ver participación en el pool

### ✅ Información en Tiempo Real
- Reservas del pool
- Precio actual
- Balance de LP tokens
- Balance de ETH

---

## 🔐 Cuentas de Hardhat

### Cuenta #0 (Principal)
```
Dirección: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Clave Privada: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance: ~10,000 ETH
```

### Cuenta #1
```
Dirección: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Clave Privada: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Balance: 10,000 ETH
```

⚠️ **SOLO para desarrollo local**

---

## 📱 Acceso Rápido

- 🌐 **Frontend:** [http://localhost:3000](http://localhost:3000)
- 🔗 **Blockchain:** http://localhost:8545
- 📝 **Contratos:** Ver `deployment-addresses.json`

---

## ✨ Próximos Pasos

1. ✅ Conectar wallet
2. ✅ Obtener tokens de prueba
3. ✅ Añadir liquidez inicial
4. ✅ Hacer tu primer swap
5. 🚀 Explorar y experimentar

---

**¡Todo está listo para usar! 🎉**
