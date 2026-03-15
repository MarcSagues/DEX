import React, { useState } from 'react';
import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity';
import MyPools from './MyPools';

type Tab = 'add' | 'my-pools' | 'remove';

interface LiquidityProps {
    connected: boolean;
    wallet: string | null;
    signer: any;
    chainId: number | null;
    onAddToken?: (address: string, symbol: string, decimals?: number) => void;
}

const Liquidity: React.FC<LiquidityProps> = ({ connected, wallet, signer, chainId, onAddToken }) => {
    const [activeTab, setActiveTab] = useState<Tab>('add');

    const tabs = [
        { id: 'add' as Tab, label: 'Add Liquidity', icon: '➕' },
        { id: 'my-pools' as Tab, label: 'My Pools', icon: '💧' },
        { id: 'remove' as Tab, label: 'Remove', icon: '➖' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'add':
                return <AddLiquidity connected={connected} wallet={wallet} signer={signer} chainId={chainId} onAddToken={onAddToken} />;
            case 'my-pools':
                return <MyPools connected={connected} wallet={wallet} signer={signer} chainId={chainId} onAddToken={onAddToken} onNavigate={(t) => setActiveTab(t)} />;
            case 'remove':
                return <RemoveLiquidity connected={connected} wallet={wallet} signer={signer} chainId={chainId} onAddToken={onAddToken} />;
            default:
                return <AddLiquidity connected={connected} wallet={wallet} signer={signer} chainId={chainId} onAddToken={onAddToken} />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter shadow-sm">
                        Liquidity Provision
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Earn 0.3% on all trades by providing liquidity to the Sagui DEX.
                    </p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-slate-900/60 backdrop-blur-md p-1.5 rounded-[22px] border border-white/5 shadow-2xl self-start md:self-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all duration-300 text-sm tracking-tight
                                ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-2xl shadow-violet-500/20'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 p-4 md:p-10 min-h-[400px] shadow-2xl shadow-black/20">
                {renderContent()}
            </div>
        </div>
    );
};

export default Liquidity;
