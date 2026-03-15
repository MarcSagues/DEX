import React, { useState } from 'react';

interface SidebarProps {
    currentPage: 'dashboard' | 'swap' | 'liquidity';
    onNavigate: (page: 'dashboard' | 'swap' | 'liquidity') => void;
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isCollapsed, onToggle }) => {
    const menuItems = [
        {
            id: 'dashboard' as const,
            name: 'Dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
            description: 'Overview'
        },
        {
            id: 'swap' as const,
            name: 'Swap',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            description: 'Exchange tokens'
        },
        {
            id: 'liquidity' as const,
            name: 'Liquidity',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            description: 'Add or remove liquidity'
        }
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {!isCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onToggle}
                ></div>
            )}
            
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-[#0a0c1a] border-r border-white/5
                    transition-all duration-300 shadow-2xl z-50 flex flex-col
                    ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'}
                `}
            >
            {/* Header / Logo */}
            <div className={`p-6 mb-8 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                        🚀
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-xl font-black text-white whitespace-nowrap tracking-tight">
                                Sagui <span className="text-violet-500">DEX</span>
                            </h1>
                            <p className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.2em]">
                                Decentralized Exchange
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={onToggle}
                    className={`
                        p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5
                        ${isCollapsed ? 'w-10 h-10 flex items-center justify-center' : ''}
                    `}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`
                            w-full text-left p-4 rounded-2xl transition-all duration-300
                            flex items-center gap-3 group relative
                            ${currentPage === item.id
                                ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-white font-bold border border-violet-500/20 shadow-lg shadow-violet-500/5'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.name : ''}
                    >
                        <span className={`shrink-0 transition-all duration-300 ${currentPage === item.id ? 'text-violet-400 scale-110' : 'group-hover:scale-110 group-hover:text-white'}`}>
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <div className="font-bold whitespace-nowrap tracking-tight text-sm">{item.name}</div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-60`}>
                                    {item.description}
                                </div>
                            </div>
                        )}
                        {currentPage === item.id && (
                            <div className="absolute left-0 w-1 h-6 bg-violet-500 rounded-r-full shadow-[0_0_12px_rgba(139,92,246,0.5)]"></div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 mt-auto">
                <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {!isCollapsed ? (
                        <>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Status</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-xs font-bold text-white">Live Connection</span>
                            </div>
                        </>
                    ) : (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Connected"></div>
                    )}
                </div>
            </div>
        </aside>
    </>
    );
};

export default Sidebar;
