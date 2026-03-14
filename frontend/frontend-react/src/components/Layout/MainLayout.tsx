import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    connected: boolean;
    wallet: string | null;
    balance: string | null;
    onConnectWallet: () => void;
    currentPage: 'dashboard' | 'swap' | 'liquidity';
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    connected,
    wallet,
    balance,
    onConnectWallet,
    currentPage
}) => {
    const pageNames = {
        dashboard: '📊 Dashboard',
        swap: '🔄 Swap',
        liquidity: '💧 Liquidity'
    };

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-8 py-4 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white">
                            {pageNames[currentPage]}
                        </h2>
                        <span className="text-purple-300 text-sm">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* Wallet Section */}
                    <div className="flex items-center gap-4">
                        {connected && wallet ? (
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
                                <div className="text-right">
                                    <div className="text-white font-mono text-sm">
                                        {wallet.slice(0, 6)}...{wallet.slice(-4)}
                                    </div>
                                    <div className="text-green-300 text-xs font-semibold">
                                        {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Cargando...'}
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <button
                                onClick={onConnectWallet}
                                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <span>🦊</span>
                                <span>Conectar Wallet</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
