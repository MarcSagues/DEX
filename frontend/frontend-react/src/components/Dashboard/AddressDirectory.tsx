import React from 'react';

interface AddressDirectoryProps {
  addresses: any;
}

const AddressDirectory: React.FC<AddressDirectoryProps> = ({ addresses }) => {
  if (!addresses) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/5 overflow-hidden">
      <div className="p-8 border-b border-white/5 bg-white/5">
        <h3 className="text-xl font-black text-white flex items-center gap-3">
          <span className="text-violet-500 text-2xl">📋</span> Contract Directory
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Copy these addresses to manually import tokens into your wallet.
        </p>
      </div>

      <div className="p-8 space-y-10">
        {/* Core Contracts */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Infrastructure</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group hover:bg-white/10 hover:shadow-md transition-all border border-transparent hover:border-white/5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-0.5">Router</p>
                <p className="text-sm text-white font-mono truncate max-w-[200px] xl:max-w-xs">{addresses.router}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(addresses.router)}
                className="p-2.5 bg-slate-800 shadow-xl rounded-xl border border-white/5 text-slate-500 hover:text-violet-400 hover:border-violet-500/30 transition-all active:scale-95"
                title="Copy Address"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group hover:bg-white/10 hover:shadow-md transition-all border border-transparent hover:border-white/5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-0.5">Factory</p>
                <p className="text-sm text-white font-mono truncate max-w-[200px] xl:max-w-xs">{addresses.factory}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(addresses.factory)}
                className="p-2.5 bg-slate-800 shadow-xl rounded-xl border border-white/5 text-slate-500 hover:text-violet-400 hover:border-violet-500/30 transition-all active:scale-95"
                title="Copy Address"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tokens Contracts */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Base Tokens</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(addresses.tokens || {}).map(([symbol, addr]: [string, any]) => (
              <div key={symbol} className="flex items-center justify-between p-4 bg-violet-500/10 rounded-2xl group hover:bg-white/10 hover:shadow-md transition-all border border-transparent hover:border-violet-500/10">
                <div className="min-w-0">
                  <p className="text-sm font-black text-white mb-0.5">{symbol}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{addr}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(addr)}
                  className="p-2 bg-white/5 shadow-sm rounded-lg border border-white/5 text-violet-400 hover:bg-violet-600 hover:text-white transition-all active:scale-95 shrink-0 ml-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* LP Tokens Contracts */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Liquidity Tokens (LP)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(addresses.pairs || {}).map(([name, addr]: [string, any]) => (
              <div key={name} className="flex items-center justify-between p-4 bg-fuchsia-500/10 rounded-2xl group hover:bg-white/10 hover:shadow-md transition-all border border-transparent hover:border-fuchsia-100/10">
                <div className="min-w-0">
                  <p className="text-sm font-black text-white mb-0.5">{name} LP</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{addr}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(addr)}
                  className="p-2 bg-white/5 shadow-sm rounded-lg border border-white/5 text-fuchsia-400 hover:bg-fuchsia-600 hover:text-white transition-all active:scale-95 shrink-0 ml-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressDirectory;
