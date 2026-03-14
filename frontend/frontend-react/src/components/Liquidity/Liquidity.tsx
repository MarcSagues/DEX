import React, { useState } from 'react';
import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity';
import MyPools from './MyPools';

type Tab = 'add' | 'my-pools' | 'remove';

interface LiquidityProps {
    connected: boolean;
    wallet: string | null;
    signer: any;
}

const Liquidity: React.FC<LiquidityProps> = ({ connected, wallet, signer }) => {
    const [activeTab, setActiveTab] = useState<Tab>('add');

    const tabs = [
        { id: 'add' as Tab, label: 'Add Liquidity', icon: '➕' },
        { id: 'my-pools' as Tab, label: 'My Pools', icon: '💧' },
        { id: 'remove' as Tab, label: 'Remove', icon: '➖' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'add':
                return <AddLiquidity connected={connected} wallet={wallet} signer={signer} />;
            case 'my-pools':
                return <MyPools connected={connected} wallet={wallet} signer={signer} onNavigate={(t) => setActiveTab(t)} />;
            case 'remove':
                return <RemoveLiquidity connected={connected} wallet={wallet} signer={signer} />;
            default:
                return <AddLiquidity connected={connected} wallet={wallet} signer={signer} />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default Liquidity;
