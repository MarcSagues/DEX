// Ejemplo de cómo implementar Web3 en el componente Exchange
import { useState, useEffect } from 'react';
import { BrowserProvider, formatUnits, parseUnits } from 'ethers';
import { useContracts, addresses } from '../hooks/useContracts';

export default function ExchangeExample() {
  // Estados
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('DAI');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Obtener contratos
  const contracts = useContracts(signer);

  // Conectar wallet
  const connectWallet = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setSigner(signer);
      setAccount(address);
    } catch (error) {
      console.error("Error conectando wallet:", error);
    }
  };

  // Calcular cantidad a recibir cuando el usuario escribe
  const calculateOutput = async (inputAmount) => {
    if (!contracts || !inputAmount || inputAmount === '0') {
      setToAmount('');
      return;
    }

    try {
      // Obtener direcciones de los tokens
      const tokenInAddress = addresses.tokens[fromToken];
      const tokenOutAddress = addresses.tokens[toToken];

      // Obtener dirección del par
      const pairAddress = await contracts.factory.getPair(tokenInAddress, tokenOutAddress);

      // Obtener instancia del par
      const pair = contracts.getPair(pairAddress);

      // Obtener reservas
      const reserves = await pair.getReserves();
      const [reserve0, reserve1] = reserves;

      // Determinar qué reserva corresponde a qué token
      const token0 = await pair.token0();
      const [reserveIn, reserveOut] = token0.toLowerCase() === tokenInAddress.toLowerCase()
        ? [reserve0, reserve1]
        : [reserve1, reserve0];

      // Calcular cantidad de salida
      const amountIn = parseUnits(inputAmount, 18);
      const amountOut = await contracts.router.getAmountOut(amountIn, reserveIn, reserveOut);

      // Formatear y mostrar
      setToAmount(formatUnits(amountOut, 18));
    } catch (error) {
      console.error("Error calculando output:", error);
      setToAmount('0');
    }
  };

  // Aprobar tokens
  const approveToken = async () => {
    if (!contracts) return;

    setLoading(true);
    try {
      const tokenContract = contracts.tokens[fromToken];
      const amount = parseUnits(fromAmount, 18);

      const tx = await tokenContract.approve(addresses.router, amount);
      await tx.wait();

      alert('✅ Token aprobado!');
    } catch (error) {
      console.error("Error aprobando:", error);
      alert('❌ Error al aprobar');
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar swap
  const executeSwap = async () => {
    if (!contracts) return;

    setLoading(true);
    try {
      const amountIn = parseUnits(fromAmount, 18);
      const amountOutMin = parseUnits(toAmount, 18) * BigInt(95) / BigInt(100); // 5% slippage

      const path = [
        addresses.tokens[fromToken],
        addresses.tokens[toToken]
      ];

      const tx = await contracts.router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        account
      );

      await tx.wait();

      alert('✅ Swap exitoso!');
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error("Error en swap:", error);
      alert('❌ Error en swap');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para calcular output cuando cambia el input
  useEffect(() => {
    if (fromAmount) {
      calculateOutput(fromAmount);
    }
  }, [fromAmount, fromToken, toToken]);

  return (
    <div className="p-6">
      {!account ? (
        <button onClick={connectWallet} className="btn">
          Conectar Wallet
        </button>
      ) : (
        <div>
          <p>Conectado: {account.slice(0, 6)}...{account.slice(-4)}</p>

          {/* Input de cantidad */}
          <div className="mt-4">
            <label>De:</label>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
            />
            <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          {/* Output */}
          <div className="mt-4">
            <label>A:</label>
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
            />
            <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          {/* Botones */}
          <div className="mt-4 space-x-2">
            <button onClick={approveToken} disabled={loading}>
              {loading ? 'Aprobando...' : 'Aprobar'}
            </button>
            <button onClick={executeSwap} disabled={loading}>
              {loading ? 'Swapeando...' : 'Swap'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
