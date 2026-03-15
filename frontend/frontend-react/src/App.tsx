import { ethers } from 'ethers';
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
    const [networkName, setNetworkName] = useState<string>('Unknown');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);

    // Close sidebar on navigation (mobile)
    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 768) {
            setSidebarCollapsed(true);
        }
    };

    // Listen for network or account changes
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
            console.log('Attempting to connect wallet...');
            if (!window.ethereum) {
                console.log('❌ No wallets detected');
                alert('Please install MetaMask or another wallet');
                return;
            }

            // Detect if there are multiple wallets
            if (window.ethereum.providers && window.ethereum.providers.length > 1) {
                console.log('Detecting multiple wallets...');
                const wallets = window.ethereum.providers;
                const walletOptions = wallets.map((provider: any) => {
                    if (provider.isMetaMask) return { name: 'MetaMask', provider };
                    if (provider.isCoinbaseWallet) return { name: 'Coinbase Wallet', provider };
                    if (provider.isTrust) return { name: 'Trust Wallet', provider };
                    return { name: 'Unknown Wallet', provider };
                });

                setAvailableWallets(walletOptions);
                setShowWalletSelector(true);
            } else {
                // Only one wallet, connect directly
                await selectAndConnect(window.ethereum);
            }
        } catch (error) {
            console.error('❌ Connection error:', error);
            alert('Error: ' + error);
        }
    };

    const selectAndConnect = async (provider: any) => {
        try {
            console.log('Connecting with selected wallet...');
            
            // Request accounts to trigger MetaMask popup
            await provider.request({ method: 'eth_requestAccounts' });

            const ethersProvider = new ethers.BrowserProvider(provider);
            const signerInstance = await ethersProvider.getSigner();
            const address = await signerInstance.getAddress();
            const network = await ethersProvider.getNetwork();
            const currentChainId = Number(network.chainId);

            console.log('✅ Connected:', address, 'ChainId:', currentChainId);


            setConnected(true);
            setWallet(address);
            setSigner(signerInstance);
            setChainId(currentChainId);
            setNetworkName(getNetworkName(currentChainId));
            setEthersProvider(ethersProvider);

            const balance = await ethersProvider.getBalance(address);
            setBalance(ethers.formatEther(balance));

            // Close selector
            setShowWalletSelector(false);
        } catch (error) {
            console.error('❌ Wallet connection error:', error);
            alert('Connection failed: ' + error);
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
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <Sidebar 
                currentPage={currentPage} 
                onNavigate={handleNavigate} 
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <MainLayout
                connected={connected}
                wallet={wallet}
                balance={balance}
                onConnectWallet={connectWallet}
                currentPage={currentPage}
                chainId={chainId}
                networkName={networkName}
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                isMobileMenuOpen={!sidebarCollapsed}
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
