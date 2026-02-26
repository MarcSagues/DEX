// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DEXPair.sol";

contract DEXFactory {
    
    // ========== VARIABLES DE ESTADO ==========
    
    // TODO: Crear un mapping bidireccional para encontrar pares
    // ¿Por qué bidireccional? Para que getPair[USDC][DAI] y getPair[DAI][USDC] devuelvan lo mismo
    mapping(address => mapping(address => address)) public getPair;
    
    // TODO: Array con todas las direcciones de pares creados
    // ¿Para qué? Para poder listar todos los pares del DEX
    address[] public allPairs;
    
    // ========== EVENTOS ==========
    
    // TODO: Crear evento PairCreated que se emite cuando se crea un par
    // Debe incluir: token0, token1, dirección del par, total de pares creados
    // Hint: event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    
    // ========== FUNCIONES PÚBLICAS ==========
    
    // TODO: Función allPairsLength() que devuelve cuántos pares existen
    // Es una función view que devuelve allPairs.length
    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }
    
    // TODO: Función createPair(address tokenA, address tokenB) que crea un nuevo par
    // Pasos:
    // 1. Validar que tokenA != tokenB
    // 2. Ordenar los tokens (token0 debe ser el menor)
    // 3. Validar que token0 != address(0)
    // 4. Validar que el par no existe (getPair[token0][token1] == address(0))
    // 5. Crear el contrato DEXPair usando CREATE2
    // 6. Llamar initialize(token0, token1) en el nuevo par
    // 7. Actualizar el mapping getPair en AMBAS direcciones
    // 8. Añadir el par al array allPairs
    // 9. Emitir evento PairCreated
    // 10. Devolver la dirección del nuevo par
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES');
        
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'ZERO_ADDRESS');

        // Comprobamos que el par no existe (en ambas direcciones) ya que si no existe debe devolver address(0)
        require(getPair[token0][token1] == address(0), 'PAIR_EXISTS'); 

        // Creamos el par usando CREATE2 para que la dirección sea determinista
        bytes memory bytecode = type(DEXPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        // Effects primero
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        // Interaction después
        DEXPair(pair).initialize(token0, token1);

        // Emitimos el evento PairCreated
        emit PairCreated(token0, token1, pair, allPairs.length);

        // Devolvemos la dirección del nuevo par
        return pair;
    }
    
}
