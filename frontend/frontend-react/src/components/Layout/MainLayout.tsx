import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    connected: boolean;
    wallet: string | null;
    balance: string | null;
    onConnectWallet: () => void;
    currentPage: 'dashboard' | 'swap' | 'liquidity';
    chainId: number | null;
    networkName: string;
    sidebarCollapsed: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    connected,
    wallet,
    balance,
    onConnectWallet,
    currentPage,
    chainId,
    networkName,
    sidebarCollapsed
}) => {
    const pageNames = {
        dashboard: '📊 Dashboard',
        swap: '🔄 Swap',
        liquidity: '💧 Liquidity'
    };

    return (
        <div 
            className={`
                flex-1 flex flex-col bg-[#0f111a] text-slate-100
                transition-all duration-300
                ${sidebarCollapsed ? 'ml-20' : 'ml-64'}
            `}
        >
            {/* Header */}
            <header className="bg-[#0a0c1a]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 shadow-2xl sticky top-0 z-40">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {pageNames[currentPage]}
                        </h2>
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] hidden md:block">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* Wallet Section */}
                    <div className="flex items-center gap-4">
                        {connected && (
                            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${chainId === 11155111 ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                🌐 {networkName}
                            </div>
                        )}
                        {connected && wallet ? (
                            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2 border border-white/10 shadow-xl">
                                <div className="text-right">
                                    <div className="text-white font-mono text-sm font-bold">
                                        {wallet.slice(0, 6)}...{wallet.slice(-4)}
                                    </div>
                                    <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest leading-tight">
                                        {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
                                    </div>
                                </div>
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse"></div>
                            </div>
                        ) : (
                            <button
                                onClick={onConnectWallet}
                                className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10"
                            >
                                <span className="text-lg">🦊</span>
                                <span>Connect Wallet</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
