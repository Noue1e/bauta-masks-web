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

const POLYGON_MAINNET_HEX = '0x89'; // Chain ID 137

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 1. Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            
            // 2. NETWORK GUARD: Check if they are on Polygon Mainnet
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (currentChainId !== POLYGON_MAINNET_HEX) {
                try {
                    // Force MetaMask to switch to Polygon Mainnet
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: POLYGON_MAINNET_HEX }],
                    });
                } catch (switchError) {
                    alert("Node connection rejected. You must switch to the Polygon Mainnet to interface with the Grand Ledger.");
                    return; // Abort connection if they refuse to switch
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
        alert("No Web3 Provider detected. Please install MetaMask to interface with the ledger.");
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
    if (mintQuantity < 10) { // Max 10 per transaction (adjustable later)
        mintQuantity++;
        mintAmountDisplay.innerText = mintQuantity;
    }
});

// Dummy Mint Function (To be replaced with Smart Contract Call)
mintBtn.addEventListener('click', async () => {
    if (!currentAccount) return;
    
    // UI Loading State
    mintBtn.innerText = "PROCESSING TRANSACTION...";
    mintMessage.style.display = "block";
    mintMessage.innerText = "Awaiting network confirmation...";
    
    // Simulate Blockchain Delay (Remove this when contract is ready)
    setTimeout(() => {
        mintBtn.innerText = "MINT VALIDATOR";
        mintMessage.innerText = `> SUCCESS: ${mintQuantity} Validator(s) added to Ledger.`;
    }, 2500);

    /* ========================================================
    FUTURE SMART CONTRACT INTEGRATION CODE GOES HERE:
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
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
}