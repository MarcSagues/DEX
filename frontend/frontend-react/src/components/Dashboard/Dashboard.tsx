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
    // Get addresses to display in the directory
    const addresses = chainId ? getAddresses(chainId) : null;

    const stats = [
        {
            title: 'Total Balance',
            value: balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0.0000 ETH',
            icon: '💰',
            color: 'from-green-400 to-emerald-500'
        },
        {
            title: 'Transactions',
            value: '0',
            icon: '📊',
            color: 'from-blue-400 to-blue-500'
        },
        {
            title: 'Provided Liquidity',
            value: '0.00 USD',
            icon: '💎',
            color: 'from-purple-400 to-purple-500'
        },
        {
            title: 'Rewards',
            value: '0.00 USD',
            icon: '🎁',
            color: 'from-orange-400 to-red-500'
        }
    ];

    const { swaps } = useWalletSwapHistory(wallet, provider, chainId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-[40px] shadow-2xl p-8 md:p-14 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
                        👋 Welcome to Sagui <span className="opacity-80">DEX</span>
                    </h1>
                    <p className="text-white/80 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed">
                        {connected
                            ? "Your wallet is securely connected. You're ready to trade and provide liquidity."
                            : "Connect your decentralized wallet to start swapping assets with ultra-low fees."
                        }
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-slate-900/40 backdrop-blur-md rounded-[28px] shadow-xl border border-white/5 p-8 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group hover:border-violet-500/20"
                    >
                        <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-slate-500 text-xs font-black mb-1 uppercase tracking-[0.2em]">{stat.title}</h3>
                        <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions & History */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Getting Started */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/5 p-10 hover:border-violet-500/10 transition-colors">
                    <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <span className="text-violet-500 text-3xl">🚀</span> Getting Started
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 cursor-pointer group">
                            <span className="text-2xl bg-[#0a0c1a] w-14 h-14 flex items-center justify-center rounded-2xl shadow-xl group-hover:scale-110 transition-transform group-hover:shadow-violet-500/20">{connected ? '✅' : '⏳'}</span>
                            <div className="flex-1">
                                <div className="font-black text-white tracking-tight text-lg">Connect Wallet</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {connected ? 'Successfully connected' : 'Connect MetaMask to begin'}
                                </div>
                            </div>
                        </li>
                        <li className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 cursor-pointer group">
                            <span className="text-2xl bg-[#0a0c1a] w-14 h-14 flex items-center justify-center rounded-2xl shadow-xl group-hover:scale-110 transition-transform group-hover:shadow-violet-500/20">💰</span>
                            <div className="flex-1">
                                <div className="font-black text-white tracking-tight text-lg">Get Test ETH</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Request faucet funds for testing</div>
                            </div>
                        </li>
                        <li className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 cursor-pointer group">
                            <span className="text-2xl bg-[#0a0c1a] w-14 h-14 flex items-center justify-center rounded-2xl shadow-xl group-hover:scale-110 transition-transform group-hover:shadow-violet-500/20">🔄</span>
                            <div className="flex-1">
                                <div className="font-black text-white tracking-tight text-lg">First Swap</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trade your first tokens instantly</div>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Activity */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/5 p-10 overflow-hidden h-full hover:border-violet-500/10 transition-colors">
                    <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <span className="text-violet-500 text-3xl">📜</span> Recent Activity
                    </h2>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <SwapHistory history={swaps} />
                    </div>
                </div>

                {/* Contract Directory */}
                <div className="xl:col-span-2">
                    <AddressDirectory addresses={addresses} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
