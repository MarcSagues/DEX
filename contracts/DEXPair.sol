// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ERC20: Para que este contrato sea un token LP (Liquidity Provider)
// Los LP tokens representan la participación de un usuario en el pool
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// IERC20: Interface para interactuar con otros tokens ERC20 (token0 y token1)
// Necesario para consultar balances y hacer transferencias
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// SafeERC20: Wrapper seguro para llamadas a tokens ERC20
// Algunos tokens no siguen el estándar correctamente (no devuelven bool)
// SafeERC20 maneja estos casos y revierte si la transferencia falla
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract DEXPair is ERC20 {
    
    // Usar SafeERC20 para todas las operaciones con tokens externos
    // Esto convierte IERC20 en una versión segura con safeTransfer, safeTransferFrom, etc.
    using SafeERC20 for IERC20;

    // ========== VARIABLES DE ESTADO ==========
    
    // factory: Dirección del contrato Factory que creó este par
    // Necesario para validar que solo el Factory puede inicializar el par
    address public factory;

    // token0 y token1: Las dos monedas que forman este par de trading
    // Ejemplo: Si es USDC/DAI, token0=USDC y token1=DAI
    address public token0;
    address public token1;

    // reserve0 y reserve1: Cantidades de cada token guardadas en el pool
    // IMPORTANTE: Son private porque solo deben modificarse mediante _update()
    // uint112 es suficiente (max ~5.2e33) y permite empaquetar 2 en un slot de storage
    uint112 private reserve0;  // Cantidad de token0 en el pool
    uint112 private reserve1;  // Cantidad de token1 en el pool

    // blockTimestampLast: Timestamp del último bloque donde se actualizaron las reservas
    // Se usa para crear un oracle de precios TWAP (Time-Weighted Average Price)
    uint32 public blockTimestampLast;

    // MINIMUM_LIQUIDITY: Los primeros 1000 LP tokens se bloquean permanentemente
    // ¿Por qué? Para evitar ataques de manipulación de precio en pools vacíos
    // Al bloquearlos en address(0), se hace muy caro manipular el ratio inicial
    uint constant MINIMUM_LIQUIDITY = 1000;

    // ========== EVENTOS ==========
    
    // Events: Se emiten para que aplicaciones externas puedan monitorear actividad
    // Se guardan en el log de la blockchain (NO en el estado del contrato)
    // Son más baratos que guardar datos en storage
    
    // Mint: Se emite cuando alguien añade liquidez
    // sender: Quien llamó la función (normalmente el Router)
    // amount0/amount1: Cantidades de cada token añadidas
    event Mint(address indexed sender, uint amount0, uint amount1);
    
    // Burn: Se emite cuando alguien retira liquidez
    // sender: Quien llamó la función
    // amount0/amount1: Cantidades de cada token devueltas
    // to: Dirección que recibió los tokens
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    
    // Swap: Se emite cuando alguien intercambia tokens
    // sender: Quien llamó la función
    // amount0In/amount1In: Cantidades de entrada
    // amount0Out/amount1Out: Cantidades de salida
    // to: Dirección que recibió los tokens de salida
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    
    // Sync: Se emite cuando las reservas se actualizan
    // reserve0/reserve1: Nuevos valores de las reservas
    event Sync(uint112 reserve0, uint112 reserve1);

    // ========== CONSTRUCTOR ==========
    
    // Se ejecuta UNA sola vez al deployar el contrato
    // ERC20("DEX LP Token", "DEX-LP"): Inicializa el token LP con nombre y símbolo
    // msg.sender = La dirección que está desplegando este contrato (el Factory)
    constructor() ERC20("DEX LP Token", "DEX-LP") {
        factory = msg.sender;  // Guardamos quién nos creó para validaciones futuras
    }

    // ========== INITIALIZE ==========
    
    // ¿Por qué initialize() separado del constructor?
    // CREATE2 necesita bytecode determinístico (siempre igual) para calcular direcciones
    // Si pusieramos token0/token1 en el constructor, cada par tendría bytecode diferente
    // Con initialize(), el bytecode es idéntico y solo cambiamos los tokens después
    function initialize(address _token0, address _token1) external {
        // Validación: Solo el Factory puede llamar a esta función
        // Evita que alguien más intente reinicializar el par con otros tokens
        if(msg.sender != factory) {
            revert("Only factory can initialize");
        }
        
        // Asignamos las direcciones de los dos tokens que formarán el par
        token0 = _token0;
        token1 = _token1;
    }

    // ========== MINT: Crear Liquidez ==========
    
    // Esta función se llama cuando alguien AÑADE liquidez al pool
    // FLUJO: Usuario transfiere tokens al contrato → Router llama a mint() → Usuario recibe LP tokens
    // @param to: Dirección que recibirá los LP tokens (quien añadió liquidez)
    // @return liquidity: Cantidad de LP tokens creados
    function mint(address to) external returns (uint liquidity) {
        
        // PASO 1: Guardar el estado ANTERIOR (antes de que llegaran los nuevos tokens)
        // ¿Por qué? Para calcular cuánto NUEVO llegó (diferencia entre antes y ahora)
        // Usamos variables locales (_reserve0) para ahorrar gas vs leer storage múltiples veces
        (uint112 _reserve0, uint112 _reserve1) = (reserve0, reserve1);
        
        // PASO 2: Consultar cuántos tokens tiene el contrato AHORA
        // IERC20(token0): Convertimos la dirección a un contrato ERC20 para llamar sus funciones
        // balanceOf(address(this)): Cuántos token0 tiene ESTE contrato en este momento
        // Incluye tanto las reservas antiguas como lo que acaba de llegar
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        
        // PASO 3: Calcular cuántos tokens NUEVOS llegaron
        // Fórmula: Balance actual - Balance anterior = Lo que acaba de llegar
        // Ejemplo: Si reserve0 era 1000 y balance0 es 1100 → llegaron 100 nuevos
        uint amount0 = balance0 - _reserve0;
        uint amount1 = balance1 - _reserve1;
        
        // PASO 4: Obtener el supply total actual de LP tokens
        // totalSupply(): Función heredada de ERC20, suma de todos los LP tokens existentes
        // Si es 0, significa que el pool está vacío (primera liquidez)
        uint _totalSupply = totalSupply();
        
        // PASO 5: Calcular cuántos LP tokens crear para el usuario
        // La lógica cambia si es la primera vez o liquidez adicional
        
        if (_totalSupply == 0) {
            // === PRIMERA LIQUIDEZ (Pool vacío) ===
            
            // Usamos la raíz cuadrada del producto: sqrt(x * y)
            // ¿Por qué sqrt? Es la media geométrica, el punto medio proporcional
            // Ejemplo: 100 USDC * 100 DAI = 10,000 → sqrt(10,000) = 100 LP tokens
            // Esto es justo porque ambos tokens contribuyen igualmente
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            
            // Bloqueamos permanentemente los primeros 1000 LP tokens
            // En lugar de mintear a address(0) (prohibido en OpenZeppelin moderno),
            // minteamos al contrato mismo y luego los quemamos
            _mint(address(this), MINIMUM_LIQUIDITY);
            // Los tokens quedan "atrapados" en el contrato, mismo efecto que enviarlos a address(0)
            
        } else {
            // === LIQUIDEZ ADICIONAL (Ya existe el pool) ===
            
            // Calculamos la proporción basada en lo que YA existe
            // Fórmula: (tokens_nuevos * lp_totales_existentes) / reserva_anterior
            
            // Opción A: Basado en token0
            // Si añades 10% más de token0, obtienes 10% más de LP tokens
            uint result0 = (amount0 * _totalSupply) / _reserve0;
            
            // Opción B: Basado en token1  
            uint result1 = (amount1 * _totalSupply) / _reserve1;
            
            // Tomamos el MÍNIMO de ambos para respetar el ratio del pool
            // ¿Por qué el mínimo? Para evitar que alguien añada solo un token
            // Ejemplo: Pool es 50/50 pero añades 100/10 → solo cuenta el menor (10)
            // El exceso del otro token queda en el pool (donación a otros LPs)
            liquidity = min(result0, result1);
        }
        
        // PASO 6: Validar que se creó liquidez
        // Si liquidity = 0, algo salió mal (cantidades muy pequeñas o ratio incorrecto)
        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");
        
        // PASO 7: Crear los LP tokens y dárselos al usuario
        // _mint(): Función heredada de ERC20 que crea nuevos tokens
        // Aumenta el totalSupply y el balance del usuario
        _mint(to, liquidity);
        
        // PASO 8: Actualizar las reservas guardadas con los nuevos balances
        // CRITICAL: Esto sincroniza reserve0/reserve1 con la realidad del contrato
        // Sin esto, la próxima llamada calcularía mal los amounts
        _update(balance0, balance1);
        
        // PASO 9: Emitir evento para que apps externas puedan monitorear
        emit Mint(msg.sender, amount0, amount1);
    }  

    // ========== HELPERS ==========
    
    // getReserves: Función pública para leer las reservas actuales
    // Apps externas (frontend, router) necesitan conocer las reservas para:
    // - Calcular precios actuales (price = reserve1 / reserve0)
    // - Calcular cuánto output recibirás por un input dado
    // - Mostrar liquidez disponible en el pool
    //
    // Returns:
    // - _reserve0: Cantidad de token0 en el pool
    // - _reserve1: Cantidad de token1 en el pool  
    // - _blockTimestampLast: Último timestamp de actualización
    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }
    
    // _update: Actualiza las reservas guardadas en el contrato
    // Es PRIVATE porque solo debe llamarse internamente después de mint/burn/swap
    // @param balance0: Nuevo balance real de token0 en el contrato
    // @param balance1: Nuevo balance real de token1 en el contrato
    function _update(uint balance0, uint balance1) private {
        // Validación de overflow: Verificar que los balances caben en uint112
        // type(uint112).max = 5.2e33, más que suficiente para la mayoría de tokens
        // ¿Por qué uint112? Para empaquetar 2 reservas + timestamp en 1 slot (ahorro de gas)
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "OVERFLOW");
        
        // Actualizar las reservas guardadas con los nuevos valores
        // Casting explícito a uint112 es seguro porque ya validamos arriba
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        
        // Guardar el timestamp actual del bloque
        // Se usa para calcular precios promedio ponderados en el tiempo (TWAP)
        // Permite crear un oracle de precios resistente a manipulación
        blockTimestampLast = uint32(block.timestamp % 2**32);
        
        // Emitir evento Sync para notificar cambio en reservas
        emit Sync(reserve0, reserve1);
    }

    // min: Devuelve el menor de dos números
    // Pure = No lee ni modifica el estado, solo calcula
    // Operador ternario: condición ? si_verdadero : si_falso
    function min(uint x, uint y) private pure returns (uint) {
        return x < y ? x : y;
    }

    // sqrt: Calcula la raíz cuadrada de un número
    // Usa el algoritmo de Newton (Babylonian method) para aproximación iterativa
    // @param y: Número del cual calcular la raíz
    // @return z: Raíz cuadrada de y
    function sqrt(uint y) private pure returns (uint z) {
        if (y > 3) {
            // Empezar con una estimación inicial
            z = y;
            uint x = y / 2 + 1;  // Primera aproximación
            
            // Iteración de Newton: x_nuevo = (y / x_viejo + x_viejo) / 2
            // Se acerca cada vez más a la raíz real
            // Ejemplo: sqrt(16) → 8.5 → 5.19 → 4.13 → 4.00
            while (x < z) {
                z = x;  // Guardar aproximación actual
                x = (y / x + x) / 2;  // Calcular siguiente aproximación
            }
        } else if (y != 0) {
            // Para números pequeños (1, 2, 3) devolver 1
            // Es suficiente precisión para el caso de uso
            z = 1;
        } else {
            // Si y = 0, devolver 0
            z = 0;
        }
    }

    // ========== BURN (Remover liquidez) ==========
    
    // burn(): Destruye LP tokens y devuelve token0 y token1 proporcionalmente
    // Es el proceso INVERSO a mint()
    // 
    // Flujo:
    // 1. Usuario transfiere LP tokens a este contrato
    // 2. Llamar burn()
    // 3. Contrato calcula: amount = (lpTokens * reserve) / totalSupply
    // 4. Quema los LP tokens
    // 5. Transfiere token0 y token1 al usuario
    //
    // Parámetros:
    // - to: Dirección que recibirá token0 y token1
    //
    // Returns:
    // - amount0: Cantidad de token0 devuelta
    // - amount1: Cantidad de token1 devuelta
    function burn(address to) external returns (uint amount0, uint amount1) {
        
        // Obtener los balances actuales del contrato
        // Incluyen las reservas + cualquier token extra
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        
        // Obtener cuántos LP tokens enviaron a este contrato
        // El usuario debe transferir sus LP tokens ANTES de llamar burn()
        uint liquidity = balanceOf(address(this));
        
        // Calcular cuánto token0 y token1 le toca al usuario (proporcional)
        // Fórmula: amount = (liquidity * balance) / totalSupply
        // Ejemplo: Si tienes 10% de los LP tokens, recibes 10% de cada reserva
        amount0 = (liquidity * balance0) / totalSupply();
        amount1 = (liquidity * balance1) / totalSupply();

        // Validar que amount0 y amount1 sean > 0
        // Si alguno es 0, no hay suficiente liquidez para quemar
        require(amount0 > 0 && amount1 > 0, 'INSUFFICIENT_LIQUIDITY_BURNED');
        
        // Quemar (destruir) los LP tokens
        // _burn: Función de OpenZeppelin que reduce totalSupply y balance
        _burn(address(this), liquidity);
        
        // Transferir token0 al address "to" de forma segura
        // safeTransfer revierte si la transferencia falla (tokens no-estándar)
        IERC20(token0).safeTransfer(to, amount0);
        
        // Transferir token1 al address "to" de forma segura
        IERC20(token1).safeTransfer(to, amount1);
        
        // Actualizar balance0 y balance1 leyendo los nuevos balances del contrato
        // Después de la transferencia, las reservas disminuyeron
        balance0 = IERC20(token0).balanceOf(address(this));
        balance1 = IERC20(token1).balanceOf(address(this));
        
        // Actualizar las reservas guardadas con los nuevos balances
        _update(balance0, balance1);
        
        // Emitir evento Burn para notificar que se removió liquidez
        emit Burn(msg.sender, amount0, amount1, to);
    } 

    // ========== SWAP (Intercambiar tokens) ==========
    
    // swap(): Intercambia un token por otro usando el modelo AMM (x * y = k)
    // 
    // Fórmula del AMM: reserve0 * reserve1 = k (constante del producto)
    // Si sacas token0, debes añadir token1 para mantener k constante
    // 
    // Fee del 0.3%: Se cobra sobre el input
    // - Usuario envía 100 tokens → solo 99.7 cuentan para el swap
    // - 0.3 tokens quedan en el pool como ganancia para los LPs
    //
    // Flujo:
    // 1. Usuario transfiere tokens al contrato
    // 2. Usuario llama swap() especificando cuánto quiere recibir
    // 3. Contrato valida que el swap cumpla la fórmula AMM + fee
    // 4. Contrato transfiere los tokens de salida al usuario
    // 5. Actualiza las reservas
    //
    // Parámetros:
    // - amount0Out: Cantidad de token0 que el usuario recibirá (0 si compra token1)
    // - amount1Out: Cantidad de token1 que el usuario recibirá (0 si compra token0)
    // - to: Dirección que recibirá los tokens
    //
    // Ejemplo: Comprar token1 con token0
    // - amount0Out = 0 (no recibes token0)
    // - amount1Out = 50 (recibes 50 token1)
    // - Usuario ya envió token0 al contrato antes de llamar esta función
    function swap(uint amount0Out, uint amount1Out, address to) external {
        
        // TODO: Validar que al menos uno de los outputs sea > 0
        // Hint: require(amount0Out > 0 || amount1Out > 0, 'INSUFFICIENT_OUTPUT_AMOUNT');
        require(amount0Out > 0 || amount1Out > 0, 'INSUFFICIENT_OUTPUT_AMOUNT');
        
        // TODO: Guardar las reservas actuales en memoria (ahorro de gas)
        // Hint: (uint112 _reserve0, uint112 _reserve1) = (reserve0, reserve1);
        (uint112 _reserve0, uint112 _reserve1) = (reserve0, reserve1);
        
        // TODO: Validar que los outputs no excedan las reservas
        // No puedes sacar más de lo que hay en el pool
        // Hint: require(amount0Out < _reserve0 && amount1Out < _reserve1, 'INSUFFICIENT_LIQUIDITY');
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'INSUFFICIENT_LIQUIDITY');
        
        // TODO: Validar que 'to' no sea la dirección de los tokens (previene errores)
        // Hint: require(to != token0 && to != token1, 'INVALID_TO');
        require(to != token0 && to != token1, 'INVALID_TO');
        
        // TODO: Transferir token0 al usuario (si amount0Out > 0)
        // Hint: if (amount0Out > 0) IERC20(token0).safeTransfer(to, amount0Out);
        if(amount0Out > 0) IERC20(token0).safeTransfer(to, amount0Out);      
        // TODO: Transferir token1 al usuario (si amount1Out > 0)
        // Hint: if (amount1Out > 0) IERC20(token1).safeTransfer(to, amount1Out);
        if(amount1Out > 0) IERC20(token1).safeTransfer(to, amount1Out);
        
        // TODO: Leer los balances actuales del contrato
        // Después de las transferencias, necesitamos ver cuánto quedó
        // Hint: uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        
        // TODO: Calcular cuántos tokens ENTRARON (input del usuario)
        // Balance actual > reserva anterior significa que entraron tokens
        // Fórmula: amountIn = balance > reserve ? balance - reserve + amountOut : 0
        // El "+ amountOut" es porque ya sacamos tokens, entonces debemos "devolverlos" al cálculo
        // Ejemplo: reserve=100, usuario envió 10, sacamos 5 → balance=105
        //          amountIn = 105 - 100 + 5 = 10 ✅
        uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        
        // TODO: Validar que al menos uno de los inputs sea > 0
        require(amount0In > 0 || amount1In > 0, 'INSUFFICIENT_INPUT_AMOUNT');
        
        // TODO: Validar la fórmula AMM con el fee del 0.3%
        // 
        // La fórmula es: (balance0 - fee0) * (balance1 - fee1) >= reserve0 * reserve1
        // El fee es 0.3% del input: fee = amountIn * 0.003 = amountIn * 3 / 1000
        //
        // Para evitar decimales, multiplicamos todo por 1000:
        // balance0Adjusted = balance0 * 1000 - amount0In * 3
        // balance1Adjusted = balance1 * 1000 - amount1In * 3
        // require(balance0Adjusted * balance1Adjusted >= _reserve0 * _reserve1 * 1000^2)
        //
        // ¿Por qué funciona? 
        // - Si amount0In = 100, restamos 100 * 3 = 300 (que es 0.3 * 1000)
        // - Es equivalente a restar el 0.3% pero sin usar decimales
        uint balance0Adjusted = balance0 * 1000 - amount0In * 3;
        uint balance1Adjusted = balance1 * 1000 - amount1In * 3;
        require(balance0Adjusted * balance1Adjusted >= uint(_reserve0) * uint(_reserve1) * 1000 * 1000, 'K');
    
        
        // TODO: Actualizar las reservas con _update()
        _update(balance0, balance1);
        
        // TODO: Emitir evento Swap
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    // ========== SYNC (Sincronizar reservas) ==========
    
    // sync(): Forza la sincronización de las reservas con los balances reales
    // 
    // ¿Cuándo se usa?
    // - Si alguien envía tokens directamente al contrato (sin mint/burn/swap)
    // - Los balances reales del contrato serían mayores que las reservas guardadas
    // - sync() actualiza reserve0/reserve1 para que coincidan con la realidad
    // 
    // Esto es útil en casos edge (errores de usuario, airdrops al pool, etc.)
    // También puede usarse para "donar" tokens al pool sin recibir LP tokens
    //
    // Es una función pública que cualquiera puede llamar
    function sync() external {
        // TODO: Leer los balances actuales del contrato
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        
        // TODO: Actualizar las reservas con _update()
        _update(balance0, balance1);
    }
}
