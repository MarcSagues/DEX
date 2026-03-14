import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getAddresses } from './hooks/useContracts';
import Sidebar from './components/Layout/Sidebar';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import Swap from './components/Swap/Swap';
import Liquidity from './components/Liquidity/Liquidity';
import WalletSelector from './components/WalletSelector';

type Page = 'dashboard' | 'swap' | 'liquidity';

const App: React.FC = () => {
    const [connected, setConnected] = React.useState(false);
    const [wallet, setWallet] = React.useState<string | null>(null);
    const [balance, setBalance] = React.useState<string | null>(null);
    const [signer, setSigner] = React.useState<any>(null);
    const [chainId, setChainId] = React.useState<number | null>(null);
    const [ethersProvider, setEthersProvider] = React.useState<any>(null);
    const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');
    const [showWalletSelector, setShowWalletSelector] = useState(false);
    const [availableWallets, setAvailableWallets] = useState<any[]>([]);
    const [networkName, setNetworkName] = useState<string>('Desconocida');

    // Escuchar cambios en la red o cuenta
    React.useEffect(() => {
        if (window.ethereum) {
            const handleChainChanged = () => window.location.reload();
            const handleAccountsChanged = () => window.location.reload();

            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('chainChanged', handleChainChanged);
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    const getNetworkName = (id: number) => {
        if (id === 11155111) return 'Sepolia';
        if (id === 31337) return 'Localhost';
        if (id === 1) return 'Ethereum Mainnet';
        return `Red ID: ${id}`;
    };

    const connectWallet = async () => {
        try {
            console.log('Intentando conectar wallet...');
            if (!window.ethereum) {
                console.log('❌ No hay wallets detectadas');
                alert('Por favor instala MetaMask u otra wallet');
                return;
            }

            // Detectar si hay múltiples wallets
            if (window.ethereum.providers && window.ethereum.providers.length > 1) {
                console.log('Detectando múltiples wallets...');
                const wallets = window.ethereum.providers;
                const walletOptions = wallets.map((provider: any) => {
                    if (provider.isMetaMask) return { name: 'MetaMask', provider };
                    if (provider.isCoinbaseWallet) return { name: 'Coinbase Wallet', provider };
                    if (provider.isTrust) return { name: 'Trust Wallet', provider };
                    return { name: 'Wallet Desconocida', provider };
                });

                setAvailableWallets(walletOptions);
                setShowWalletSelector(true);
            } else {
                // Solo hay una wallet, conectar directamente
                await selectAndConnect(window.ethereum);
            }
        } catch (error) {
            console.error('❌ Error al conectar:', error);
            alert('Error: ' + error);
        }
    };

    const selectAndConnect = async (provider: any) => {
        try {
            console.log('Conectando con wallet seleccionada...');
            
            // Request accounts to trigger MetaMask popup
            await provider.request({ method: 'eth_requestAccounts' });

            const ethersProvider = new ethers.BrowserProvider(provider);
            const signerInstance = await ethersProvider.getSigner();
            const address = await signerInstance.getAddress();
            const network = await ethersProvider.getNetwork();
            const currentChainId = Number(network.chainId);

            console.log('✅ Conectado:', address, 'ChainId:', currentChainId);


            setConnected(true);
            setWallet(address);
            setSigner(signerInstance);
            setChainId(currentChainId);
            setNetworkName(getNetworkName(currentChainId));
            setEthersProvider(ethersProvider);

            const balance = await ethersProvider.getBalance(address);
            setBalance(ethers.formatEther(balance));

            // Cerrar el selector
            setShowWalletSelector(false);
        } catch (error) {
            console.error('❌ Error al conectar con la wallet:', error);
            alert('Error al conectar: ' + error);
            setShowWalletSelector(false);
        }
    };

    const addTokenToWallet = async (address: string, symbol: string, decimals: number = 18) => {
        if (!window.ethereum) return;
        try {
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address,
                        symbol,
                        decimals,
                    },
                },
            });
        } catch (error) {
            console.error('Error adding token to wallet:', error);
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard connected={connected} wallet={wallet} balance={balance} provider={ethersProvider} chainId={chainId} />;
            case 'swap':
                return <Swap connected={connected} signer={signer} wallet={wallet} chainId={chainId} onAddToken={addTokenToWallet} />;
            case 'liquidity':
                return <Liquidity connected={connected} wallet={wallet} signer={signer} chainId={chainId} onAddToken={addTokenToWallet} />;
            default:
                return <Dashboard connected={connected} wallet={wallet} balance={balance} provider={ethersProvider} chainId={chainId} />;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

            {/* Main Content */}
            <MainLayout
                connected={connected}
                wallet={wallet}
                balance={balance}
                onConnectWallet={connectWallet}
                currentPage={currentPage}
                chainId={chainId}
                networkName={networkName}
            >
                {renderPage()}
            </MainLayout>

            {/* Wallet Selector Modal */}
            {showWalletSelector && (
                <WalletSelector
                    wallets={availableWallets}
                    onSelect={selectAndConnect}
                    onClose={() => setShowWalletSelector(false)}
                />
            )}
        </div>
    );
};

export default App;
