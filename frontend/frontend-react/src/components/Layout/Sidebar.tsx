import React from 'react';

interface SidebarProps {
    currentPage: 'dashboard' | 'swap' | 'liquidity';
    onNavigate: (page: 'dashboard' | 'swap' | 'liquidity') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
    const menuItems = [
        {
            id: 'dashboard' as const,
            name: 'Dashboard',
            icon: '📊',
            description: 'Vista general'
        },
        {
            id: 'swap' as const,
            name: 'Swap',
            icon: '🔄',
            description: 'Intercambiar tokens'
        },
        {
            id: 'liquidity' as const,
            name: 'Liquidity',
            icon: '💧',
            description: 'Añadir/remover liquidez'
        }
    ];

    return (
        <aside className="w-64 bg-gradient-to-b from-purple-900 to-indigo-900 min-h-screen p-6 shadow-2xl">
            {/* Logo */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    🚀 Sagui DEX
                </h1>
                <p className="text-purple-300 text-sm">
                    Decentralized Exchange
                </p>
            </div>

            {/* Menu Items */}
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`
                            w-full text-left px-4 py-3 rounded-lg transition-all duration-200
                            flex items-center gap-3 group
                            ${currentPage === item.id
                                ? 'bg-white text-purple-900 shadow-lg transform scale-105'
                                : 'text-white hover:bg-white/10 hover:translate-x-1'
                            }
                        `}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className={`text-xs ${currentPage === item.id ? 'text-purple-600' : 'text-purple-300'
                                }`}>
                                {item.description}
                            </div>
                        </div>
                    </button>
                ))}
            </nav>


        </aside>
    );
};

export default Sidebar;
