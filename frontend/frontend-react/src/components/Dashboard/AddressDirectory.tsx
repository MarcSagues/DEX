import React from 'react';

interface AddressDirectoryProps {
  addresses: any;
}

const AddressDirectory: React.FC<AddressDirectoryProps> = ({ addresses }) => {
  if (!addresses) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Podríamos añadir un toast aquí después
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-blue-500">📋</span> Directorio de Contratos
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Copia las direcciones para importarlas manualmente en tu billetera.
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Core Contracts */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Infraestructura</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition">
              <div>
                <p className="text-sm font-medium text-gray-700">Router</p>
                <p className="text-xs text-gray-400 font-mono truncate max-w-[200px] md:max-w-md">{addresses.router}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(addresses.router)}
                className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition text-gray-400 hover:text-blue-500 shadow-sm"
                title="Copiar dirección"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition">
              <div>
                <p className="text-sm font-medium text-gray-700">Factory</p>
                <p className="text-xs text-gray-400 font-mono truncate max-w-[200px] md:max-w-md">{addresses.factory}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(addresses.factory)}
                className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition text-gray-400 hover:text-blue-500 shadow-sm"
                title="Copiar dirección"
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
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tokens Base</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(addresses.tokens || {}).map(([symbol, addr]: [string, any]) => (
              <div key={symbol} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl group hover:bg-blue-50 transition border border-blue-100/50">
                <div>
                  <p className="text-sm font-bold text-blue-700">{symbol}</p>
                  <p className="text-[10px] text-blue-400 font-mono truncate max-w-[120px]">{addr}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(addr)}
                  className="p-1.5 bg-white hover:bg-blue-100 rounded-lg border border-blue-100 transition text-blue-500 shadow-sm"
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
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tokens de Liquidez (LP)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(addresses.pairs || {}).map(([name, addr]: [string, any]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl group hover:bg-indigo-50 transition border border-indigo-100/50">
                <div>
                  <p className="text-sm font-bold text-indigo-700">LP-{name}</p>
                  <p className="text-[10px] text-indigo-400 font-mono truncate max-w-[120px]">{addr}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(addr)}
                  className="p-1.5 bg-white hover:bg-indigo-100 rounded-lg border border-indigo-100 transition text-indigo-500 shadow-sm"
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
