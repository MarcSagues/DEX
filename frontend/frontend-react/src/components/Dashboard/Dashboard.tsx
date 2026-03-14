import React from 'react';
import { useWalletSwapHistory } from '../../hooks/useWalletSwapHistory';
import SwapHistory from '../SwapHistory';
import AddressDirectory from './AddressDirectory';
import { getAddresses } from '../../hooks/useContracts';

interface DashboardProps {
    connected: boolean;
    wallet: string | null;
    balance: string | null;
    provider: any; // ethers provider
    chainId: number | null;
}

const Dashboard: React.FC<DashboardProps> = ({ connected, wallet, balance, provider, chainId }) => {
    // Obtener direcciones para mostrar en el directorio
    const addresses = chainId ? getAddresses(chainId) : null;

    const stats = [
        {
            title: 'Balance Total',
            value: balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0.0000 ETH',
            icon: '💰',
            color: 'from-green-400 to-emerald-500'
        },
        {
            title: 'Transacciones',
            value: '0',
            icon: '📊',
            color: 'from-blue-400 to-blue-500'
        },
        {
            title: 'Liquidez Provista',
            value: '0.00 USD',
            icon: '💎',
            color: 'from-purple-400 to-purple-500'
        },
        {
            title: 'Recompensas',
            value: '0.00 USD',
            icon: '🎁',
            color: 'from-orange-400 to-red-500'
        }
    ];



    const { swaps } = useWalletSwapHistory(wallet, provider, chainId);

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">
                    👋 ¡Bienvenido a Sagui DEX!
                </h1>
                <p className="text-purple-100 text-lg">
                    {connected
                        ? 'Tu wallet está conectada y lista para operar'
                        : 'Conecta tu wallet para comenzar a operar'
                    }
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Getting Started */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-purple-800 mb-4">
                        🚀 Primeros Pasos
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition cursor-pointer">
                            <span className="text-2xl">{connected ? '✅' : '⏳'}</span>
                            <div>
                                <div className="font-semibold text-gray-800">Conectar Wallet</div>
                                <div className="text-sm text-gray-600">
                                    {connected ? 'Completado' : 'Conecta MetaMask para empezar'}
                                </div>
                            </div>
                        </li>
                        <li className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition cursor-pointer">
                            <span className="text-2xl">💰</span>
                            <div>
                                <div className="font-semibold text-gray-800">Obtener ETH de Prueba</div>
                                <div className="text-sm text-gray-600">Solicita fondos para probar</div>
                            </div>
                        </li>
                        <li className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition cursor-pointer">
                            <span className="text-2xl">🔄</span>
                            <div>
                                <div className="font-semibold text-gray-800">Hacer tu Primer Swap</div>
                                <div className="text-sm text-gray-600">Intercambia tokens en Exchange</div>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Activity */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-purple-800 mb-4">
                        📜 Actividad Reciente
                    </h2>
                    <SwapHistory history={swaps} />
                </div>

                {/* Directorio de Direcciones */}
                <div className="lg:col-span-2">
                    <AddressDirectory addresses={addresses} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
