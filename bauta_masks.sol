// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BautaMasks is ERC721A, Ownable, ERC2981 {
    using Strings for uint256;

    // --- GRAND LEDGER ARCHITECTURE ---
    uint256 public constant MAX_SUPPLY = 1111;
    uint256 public mintPrice = 10 ether; // Set your POL price here
    bool public isMintActive = false;
    string private _baseTokenURI;

    // --- PROTOCOL GUARDS & PHASES ---
    uint256 public maxMintPerWallet = 5;       
    bool public isWhitelistOnly = true;        
    mapping(address => bool) public whitelist; 

    // --- CUSTOM ERRORS (Gas Optimized) ---
    error MintNotActive();
    error SupplyExceeded();
    error InsufficientFunds();
    error WalletLimitExceeded();
    error NotWhitelisted();

    constructor() ERC721A("Bauta Masks", "BAUTA") Ownable(msg.sender) {
        // Enforce a 10% creator royalty across all secondary markets
        _setDefaultRoyalty(msg.sender, 1000);
    }

    // Override the starting token ID to 1 instead of 0
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    // --- DEPLOYMENT TERMINAL (MINTING) ---
    function mint(uint256 quantity) external payable {
        if (!isMintActive) revert MintNotActive();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert SupplyExceeded();
        
        if (isWhitelistOnly && !whitelist[msg.sender]) revert NotWhitelisted();
        
        if (msg.sender != owner() && _numberMinted(msg.sender) + quantity > maxMintPerWallet) revert WalletLimitExceeded();
        
        if (msg.value < mintPrice * quantity) revert InsufficientFunds();

        _mint(msg.sender, quantity);
    }

    // --- CREATOR RESERVE ---
    function creatorReserve(address to, uint256 quantity) external onlyOwner {
        if (_totalMinted() + quantity > MAX_SUPPLY) revert SupplyExceeded();
        _mint(to, quantity);
    }

    // --- ON-CHAIN COMMERCIAL RIGHTS ---
    // Immutable proof that Bauta Mask holders own the exclusive commercial rights
    function getLicenseName() external pure returns (string memory) {
        return "CBE-ECR (Exclusive Commercial Rights)";
    }

    function getLicenseURI() external pure returns (string memory) {
        return "ar://_D9kN1WrNWbCq55BSAGRbTB4bS3v8QAPTYmBThSbX3A/1";
    }

    // --- UTILITY SCANNER (EPOCH 0x02 & 0x03) ---
    // Allows any front-end interface to instantly verify holdings for token-gated access
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _totalMinted(); i++) {
            if (ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        return tokenIds;
    }

    // --- ARCHITECT CONTROLS ---
    function setWhitelist(address[] calldata addresses, bool _status) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = _status;
        }
    }

    function setWhitelistOnly(bool _state) external onlyOwner {
        isWhitelistOnly = _state;
    }

    function setMaxMintPerWallet(uint256 _limit) external onlyOwner {
        maxMintPerWallet = _limit;
    }

    function setMintActive(bool _state) external onlyOwner {
        isMintActive = _state;
    }

    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        string memory baseURI = _baseURI();
        return bytes(baseURI).length != 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    // --- TREASURY ROUTING ---
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721A, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}