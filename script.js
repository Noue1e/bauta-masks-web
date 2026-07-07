// --- Smooth Scrolling ---
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
    });
});

// Nav Mint Button - Scrolls directly to the terminal
document.getElementById('navMintBtn').addEventListener('click', () => {
    const targetElement = document.getElementById('mint');
    window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
    });
});

// --- WEB3 MINTING LOGIC ---
const connectBtn = document.getElementById('connectBtn');
const networkStatus = document.getElementById('networkStatus');
const mintControls = document.getElementById('mintControls');
const mintAmountDisplay = document.getElementById('mintAmount');
const decreaseMint = document.getElementById('decreaseMint');
const increaseMint = document.getElementById('increaseMint');
const mintBtn = document.getElementById('mintBtn');
const mintMessage = document.getElementById('mintMessage');

let currentAccount = null;
let mintQuantity = 1;

// UPDATED: Changed from Polygon (0x89) to Base Mainnet Hex Code
const BASE_MAINNET_HEX = '0x2105'; // Chain ID 8453

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 1. Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            
            // 2. NETWORK GUARD: Check if they are on Base Mainnet
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (currentChainId !== BASE_MAINNET_HEX) {
                try {
                    // Force MetaMask to switch to Base Mainnet
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: BASE_MAINNET_HEX }],
                    });
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        try {
                            // If they don't have Base configured, automatically add it for them
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: BASE_MAINNET_HEX,
                                        chainName: 'Base',
                                        rpcUrls: ['https://mainnet.base.org'], // Official Base RPC
                                        nativeCurrency: {
                                            name: 'Ethereum',
                                            symbol: 'ETH', // Base uses ETH for gas
                                            decimals: 18
                                        },
                                        blockExplorerUrls: ['https://basescan.org']
                                    }
                                ]
                            });
                        } catch (addError) {
                            alert("Node connection rejected. Failed to add the Base network to your wallet.");
                            return; // Abort connection
                        }
                    } else {
                        // If they just rejected the switch
                        alert("Node connection rejected. You must switch to the Base Mainnet to interface with the Grand Ledger.");
                        return; // Abort connection
                    }
                }
            }
            
            // 3. UI Updates on Success
            connectBtn.innerText = currentAccount.substring(0, 6) + "..." + currentAccount.substring(38);
            connectBtn.style.color = "var(--accent-neon)";
            connectBtn.style.borderColor = "var(--accent-neon)";
            
            networkStatus.innerText = "ONLINE (NODE VERIFIED)";
            networkStatus.className = "online";
            
            mintControls.classList.remove('disabled');
            
        } catch (error) {
            console.error("Connection failed", error);
        }
    } else {
        alert("No Web3 Provider detected. Please install a compatible wallet (like MetaMask) to interface with the ledger.");
    }
}

// Mint Amount Handlers
decreaseMint.addEventListener('click', () => {
    if (mintQuantity > 1) {
        mintQuantity--;
        mintAmountDisplay.innerText = mintQuantity;
    }
});

increaseMint.addEventListener('click', () => {
    if (mintQuantity < 10) { // Max 10 per transaction
        mintQuantity++;
        mintAmountDisplay.innerText = mintQuantity;
    }
});

// Dummy Mint Function (Awaiting Smart Contract Deployment on Base)
mintBtn.addEventListener('click', async () => {
    if (!currentAccount) return;
    
    // UI Loading State
    mintBtn.innerText = "PROCESSING TRANSACTION...";
    mintMessage.style.display = "block";
    mintMessage.innerText = "Awaiting Base network confirmation...";
    
    // Simulate Blockchain Delay
    setTimeout(() => {
        mintBtn.innerText = "MINT VALIDATOR";
        mintMessage.innerText = `> SUCCESS: ${mintQuantity} Validator(s) added to the Ledger.`;
    }, 2500);

    /* ========================================================
    FUTURE BASE SMART CONTRACT INTEGRATION:
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    // Remember to update CONTRACT_ADDRESS to your new Base deployment!
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const cost = await contract.cost();
    const tx = await contract.mint(mintQuantity, { value: cost.mul(mintQuantity) });
    await tx.wait();
    ========================================================
    */
});

// Event Listeners
connectBtn.addEventListener('click', connectWallet);

// Listen for wallet changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected
            currentAccount = null;
            connectBtn.innerText = "CONNECT NODE";
            connectBtn.style.color = "";
            connectBtn.style.borderColor = "";
            networkStatus.innerText = "OFFLINE (CONNECT WALLET)";
            networkStatus.className = "offline";
            mintControls.classList.add('disabled');
        } else {
            connectWallet();
        }
    });

    // Also listen for network changes, so if they manually switch away from Base, the UI resets
    window.ethereum.on('chainChanged', (chainId) => {
        if (chainId !== BASE_MAINNET_HEX) {
             window.location.reload(); // Best practice: reload page on chain change to prevent stale data
        }
    });
}