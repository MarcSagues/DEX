import React from 'react';

interface WalletOption {
    name: string;
    provider: any;
    icon?: string;
}

interface WalletSelectorProps {
    wallets: WalletOption[];
    onSelect: (provider: any) => void;
    onClose: () => void;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ wallets, onSelect, onClose }) => {
    const getWalletIcon = (name: string) => {
        switch (name) {
            case 'MetaMask':
                return '🦊';
            case 'Coinbase Wallet':
                return '🔵';
            case 'Trust Wallet':
                return '🛡️';
            default:
                return '💼';
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Selecciona tu Wallet</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-3">
                    {wallets.map((wallet, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(wallet.provider)}
                            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 hover:from-purple-800/40 hover:to-indigo-800/40 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{getWalletIcon(wallet.name)}</span>
                                <span className="text-white font-semibold text-lg">{wallet.name}</span>
                            </div>
                            <svg 
                                className="w-6 h-6 text-purple-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 5l7 7-7 7" 
                                />
                            </svg>
                        </button>
                    ))}
                </div>

                <p className="text-gray-400 text-sm mt-6 text-center">
                    Elige la wallet que deseas usar para conectarte al DEX
                </p>
            </div>
        </div>
    );
};

export default WalletSelector;
