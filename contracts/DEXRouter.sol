// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DEXFactory.sol";
import "./DEXPair.sol";

contract DEXRouter {
    
    // ========== VARIABLES DE ESTADO ==========
    
    // ¿Por qué immutable? Porque nunca cambiará y ahorra gas
    address public immutable factory;
    
    // ========== CONSTRUCTOR ==========
    
    // Debe guardar la dirección en la variable factory
    constructor(address _factory) {
        factory = _factory;
    }
    // ========== FUNCIONES HELPER (VIEW/PURE) ==========
    
    // Estas funciones NO modifican estado, solo hacen cálculos
    // Los usuarios y el frontend las usan para calcular cantidades antes de hacer transacciones
    
    // TODO: function quote(uint amountA, uint reserveA, uint reserveB) 
    //       returns (uint amountB)
    // ¿Qué hace? Dada una cantidad de tokenA, calcula cuánto tokenB equivale según las reservas
    // Fórmula: amountB = (amountA * reserveB) / reserveA
    // Ejemplo: Tengo 100 USDC, ¿cuántos DAI equivalen si hay 1000 USDC y 1000 DAI en el pool?
    //          amountB = (100 * 1000) / 1000 = 100 DAI
    // Es una proporción simple: si las reservas son 1:1, obtienes lo mismo
    function quote(uint amountA, uint reserveA, uint reserveB) public pure returns (uint amountB) {
        require(amountA > 0, 'INSUFFICIENT_AMOUNT');
        require(reserveA > 0 && reserveB > 0, 'INSUFFICIENT_LIQUIDITY');
        amountB = (amountA * reserveB) / reserveA;
        return amountB;
    } 
    
    // TODO: function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
    //       returns (uint amountOut)
    // ¿Qué hace? Calcula cuánto recibirás en un swap considerando el FEE de 0.3%
    // Pasos:
    // 1. Calcular amountIn con fee: amountInWithFee = amountIn * 997 (0.3% fee = 997/1000)
    // 2. Calcular numerador: numerator = amountInWithFee * reserveOut
    // 3. Calcular denominador: denominator = (reserveIn * 1000) + amountInWithFee
    // 4. amountOut = numerator / denominator
    // Ejemplo: Vendo 100 USDC en pool 1000 USDC / 1000 DAI
    //          amountInWithFee = 100 * 997 = 99700
    //          numerator = 99700 * 1000 = 99700000
    //          denominator = (1000 * 1000) + 99700 = 1099700
    //          amountOut = 99700000 / 1099700 ≈ 90.66 DAI (menos que 100 por el fee + slippage)
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure returns (uint amountOut) {
        require(amountIn > 0, 'INSUFFICIENT_INPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'INSUFFICIENT_LIQUIDITY');
        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;
    }
    
    // TODO: function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut)
    //       returns (uint amountIn)
    // ¿Qué hace? Inversa de getAmountOut - Calcula cuánto necesitas dar para recibir amountOut
    // Pasos:
    // 1. Calcular numerador: numerator = reserveIn * amountOut * 1000
    // 2. Calcular denominador: denominator = (reserveOut - amountOut) * 997
    // 3. amountIn = (numerator / denominator) + 1  (el +1 es para redondear hacia arriba)
    // Ejemplo: Quiero comprar 90 DAI del pool 1000 USDC / 1000 DAI
    //          numerator = 1000 * 90 * 1000 = 90000000
    //          denominator = (1000 - 90) * 997 = 907270
    //          amountIn = 90000000 / 907270 + 1 ≈ 99.2 USDC

    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) public pure returns (uint amountIn) {
        require(amountOut > 0, 'INSUFFICIENT_OUTPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'INSUFFICIENT_LIQUIDITY');
        uint numerator = reserveIn * amountOut * 1000;
        uint denominator = (reserveOut - amountOut) * 997;
        amountIn = (numerator / denominator) + 1;
    }
    
    // ========== FUNCIONES DE LIQUIDEZ ==========
    
    // TODO: function addLiquidity(
    //     address tokenA,
    //     address tokenB,
    //     uint amountADesired,      // Cuánto quiero poner de tokenA
    //     uint amountBDesired,      // Cuánto quiero poner de tokenB
    //     uint amountAMin,          // Mínimo de tokenA que acepto (protección slippage)
    //     uint amountBMin,          // Mínimo de tokenB que acepto (protección slippage)
    //     address to                // Quién recibe los LP tokens
    // ) returns (uint amountA, uint amountB, uint liquidity)
    //
    // ¿Qué hace? Añade liquidez a un par (o lo crea si no existe)
    // Pasos:
    // 1. Crear el par si no existe: factory.createPair(tokenA, tokenB)
    // 2. Calcular cantidades óptimas con _addLiquidity()
    // 3. Transferir tokens del usuario al par: transferFrom(msg.sender, pair, amount)
    // 4. Llamar mint() en el par para acuñar LP tokens
    // 5. Devolver las cantidades usadas y LP tokens recibidos

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to
    ) external returns (uint amountA, uint amountB, uint liquidity) {
        // Crear el par solo si no existe
        if (DEXFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            DEXFactory(factory).createPair(tokenA, tokenB);
        }
        
        // Calcular cantidades óptimas y CAPTURAR los valores retornados
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        
        address pair = DEXFactory(factory).getPair(tokenA, tokenB);
        
        // Ahora amountA y amountB tienen valores correctos
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);
        
        liquidity = DEXPair(pair).mint(to);
        
        return (amountA, amountB, liquidity);
    }
    
    // TODO: function _addLiquidity(
    //     address tokenA,
    //     address tokenB,
    //     uint amountADesired,
    //     uint amountBDesired,
    //     uint amountAMin,
    //     uint amountBMin
    // ) internal returns (uint amountA, uint amountB)
    //
    // ¿Qué hace? Calcula las cantidades óptimas respetando la proporción del pool
    // Casos:
    // 1. Pool vacío: Usa amountADesired y amountBDesired tal cual
    // 2. Pool con liquidez: Ajusta las cantidades para mantener la proporción
    //    - Calcula amountBOptimal = quote(amountADesired, reserveA, reserveB)
    //    - Si amountBOptimal <= amountBDesired: Usa (amountADesired, amountBOptimal)
    //    - Si no, calcula amountAOptimal = quote(amountBDesired, reserveB, reserveA)
    //    - Usa (amountAOptimal, amountBDesired)
    // 3. Verifica que las cantidades finales sean >= mins

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal returns (uint amountA, uint amountB) {
        // Obtener el par y sus reservas
        address pair = DEXFactory(factory).getPair(tokenA, tokenB);
        (uint reserve0, uint reserve1,) = DEXPair(pair).getReserves();
        
        // Mapear correctamente las reservas según el orden de tokenA y tokenB
        (uint reserveA, uint reserveB) = tokenA < tokenB ? (reserve0, reserve1) : (reserve1, reserve0);
        
        if (reserveA == 0 && reserveB == 0) {
            // Pool vacío: usa las cantidades deseadas
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            // Pool con liquidez: ajusta las cantidades para mantener la proporción
            uint amountBOptimal = quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, 'INSUFFICIENT_B_AMOUNT');
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = quote(amountBDesired, reserveB, reserveA);
                require(amountAOptimal >= amountAMin, 'INSUFFICIENT_A_AMOUNT');
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
        
        return (amountA, amountB);
    }
    
    // TODO: function removeLiquidity(
    //     address tokenA,
    //     address tokenB,
    //     uint liquidity,           // Cuántos LP tokens quemar
    //     uint amountAMin,          // Mínimo de tokenA que acepto recibir
    //     uint amountBMin,          // Mínimo de tokenB que acepto recibir
    //     address to                // Quién recibe los tokens
    // ) returns (uint amountA, uint amountB)
    //
    // ¿Qué hace? Elimina liquidez quemando LP tokens y recibiendo tokens de vuelta
    // Pasos:
    // 1. Obtener la dirección del par
    // 2. Transferir LP tokens del usuario al par
    // 3. Llamar burn() en el par
    // 4. Verificar que las cantidades recibidas sean >= mins

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to
    ) external returns (uint amountA, uint amountB) {
        address pair = DEXFactory(factory).getPair(tokenA, tokenB);
        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        (amountA, amountB) = DEXPair(pair).burn(to);
        require(amountA >= amountAMin, 'INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'INSUFFICIENT_B_AMOUNT');
        return (amountA, amountB);
    }
    
    // ========== FUNCIONES DE SWAP ==========
    
    // TODO: function swapExactTokensForTokens(
    //     uint amountIn,            // Cantidad exacta que vendo
    //     uint amountOutMin,        // Mínimo que acepto recibir (protección slippage)
    //     address[] calldata path,  // Ruta de tokens [USDC, DAI] o [USDC, WETH, DAI]
    //     address to                // Quién recibe los tokens finales
    // ) returns (uint[] memory amounts)
    //
    // ¿Qué hace? Vende una cantidad exacta de tokens
    // Pasos:
    // 1. Calcular cantidades para cada paso del path con getAmountOut()
    // 2. Verificar que la cantidad final >= amountOutMin
    // 3. Transferir el primer token del usuario al primer par
    // 4. Ejecutar swaps secuenciales en cada par del path

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to
    ) external returns (uint[] memory amounts) {
        require(path.length >= 2, 'INVALID_PATH');

        // Crear array para almacenar todas las cantidades del path
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        
        // Calcular cantidades para cada swap del path
        for (uint i = 0; i < path.length - 1; i++) {
            address pair = DEXFactory(factory).getPair(path[i], path[i + 1]);
            (uint reserve0, uint reserve1,) = DEXPair(pair).getReserves();
            (uint reserveIn, uint reserveOut) = path[i] < path[i + 1] ? (reserve0, reserve1) : (reserve1, reserve0);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
        
        // Verificar que la cantidad final sea suficiente
        require(amounts[amounts.length - 1] >= amountOutMin, 'INSUFFICIENT_OUTPUT_AMOUNT');
        
        // Transferir el primer token del usuario al primer par
        address firstPair = DEXFactory(factory).getPair(path[0], path[1]);
        IERC20(path[0]).transferFrom(msg.sender, firstPair, amounts[0]);
        
        // Ejecutar los swaps secuencialmente
        _swap(amounts, path, to);
    }
    
    // TODO: function swapTokensForExactTokens(
    //     uint amountOut,           // Cantidad exacta que quiero comprar
    //     uint amountInMax,         // Máximo que acepto pagar (protección slippage)
    //     address[] calldata path,
    //     address to
    // ) returns (uint[] memory amounts)
    //
    // ¿Qué hace? Compra una cantidad exacta de tokens
    // Similar a la anterior pero calculando hacia atrás con getAmountIn()

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to
    ) external returns (uint[] memory amounts) {
        require(path.length >= 2, 'INVALID_PATH');

        // Crear array para almacenar todas las cantidades del path
        amounts = new uint[](path.length);
        amounts[amounts.length - 1] = amountOut;
        
        // Calcular cantidades hacia atrás para cada swap del path
        for (uint i = path.length - 1; i > 0; i--) {
            address pair = DEXFactory(factory).getPair(path[i - 1], path[i]);
            (uint reserve0, uint reserve1,) = DEXPair(pair).getReserves();
            (uint reserveIn, uint reserveOut) = path[i - 1] < path[i] ? (reserve0, reserve1) : (reserve1, reserve0);
            amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut);
        }
        
        // Verificar que la cantidad inicial no sea excesiva
        require(amounts[0] <= amountInMax, 'EXCESSIVE_INPUT_AMOUNT');
        
        // Transferir el primer token del usuario al primer par
        address firstPair = DEXFactory(factory).getPair(path[0], path[1]);
        IERC20(path[0]).transferFrom(msg.sender, firstPair, amounts[0]);
        
        // Ejecutar los swaps secuencialmente
        _swap(amounts, path, to);
    }
    
    // ========== FUNCIONES HELPER PRIVADAS ==========
    
    // TODO: function _swap(
    //     uint[] memory amounts,
    //     address[] memory path,
    //     address _to
    // ) internal
    //
    // ¿Qué hace? Ejecuta los swaps llamando a pair.swap() para cada paso del path
    // Debe iterar sobre el path y llamar swap() en cada par
    
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal {
        for (uint i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            address pair = DEXFactory(factory).getPair(input, output);
            
            // Determinar si el token de salida es token0 o token1 del par
            (uint amount0Out, uint amount1Out) = input < output ? (uint(0), amounts[i + 1]) : (amounts[i + 1], uint(0));
            
            // Determinar el destinatario: siguiente par o el destinatario final
            address recipient = i < path.length - 2 ? DEXFactory(factory).getPair(output, path[i + 2]) : _to;
            
            // Ejecutar el swap en el par
            DEXPair(pair).swap(amount0Out, amount1Out, recipient);
        }
    }
}
