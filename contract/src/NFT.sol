// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract GeoCasterNFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256[] private _allTokens;
    uint256 private _nextTokenId = 1;
    bool private _initialized;

    // Replace with your actual PNG URL or base64 data URI
    string private constant NFT_IMAGE = "https://geo-l1r2.onrender.com/nft.png";

    // $3 USD in ETH (hardcoded for simplicity, update as needed)
    uint256 private constant USD3_IN_WEI = 0.0009 ether; // Example: $3 ~ 0.0009 ETH at $3,333/ETH

    event Minted(address indexed minter, uint256 indexed tokenId);

    constructor() ERC721("GeoCasterNFT", "GCN") Ownable(msg.sender) {
        require(!_initialized, "Already initialized");
        _initialized = true;
    }

    function mint() external payable nonReentrant returns (uint256) {
        require(msg.value >= USD3_IN_WEI, "Insufficient ETH sent for minting");
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _allTokens.push(tokenId);
        _safeMint(msg.sender, tokenId);
        // Pay owner $3 in ETH
        (bool sent, ) = owner().call{value: USD3_IN_WEI}("");
        require(sent, "ETH transfer to owner failed");
        emit Minted(msg.sender, tokenId);
        // Refund any excess
        if (msg.value > USD3_IN_WEI) {
            (bool refund, ) = msg.sender.call{value: msg.value - USD3_IN_WEI}("");
            require(refund, "Refund failed");
        }
        return tokenId;
    }

    function mintTo(address to) external onlyOwner nonReentrant returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _allTokens.push(tokenId);
        _safeMint(to, tokenId);
        emit Minted(to, tokenId);
        return tokenId;
    }

    function burn(uint256 tokenId) external nonReentrant {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved or owner");
        _burn(tokenId);
        // Remove from _allTokens (simple linear search, optimize if needed)
        for (uint256 i = 0; i < _allTokens.length; i++) {
            if (_allTokens[i] == tokenId) {
                _allTokens[i] = _allTokens[_allTokens.length - 1];
                _allTokens.pop();
                break;
            }
        }
    }

    // Internal helper for OpenZeppelin 5.x compatibility
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    function totalSupply() public view returns (uint256) {
        return _allTokens.length;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        require(tokenId > 0, "Token ID must be positive");
        // Standard ERC721 Metadata JSON with static PNG
        return string(abi.encodePacked(
            "data:application/json;utf8,",
            '{"name":"GeoCasterNFT #', tokenId.toString(),
            '","description":"GeoCaster NFT with static PNG image.",',
            '"image":"', NFT_IMAGE, '"}'
        ));
    }

    // Internal helper for OpenZeppelin 5.x compatibility
    function _exists(uint256 tokenId) internal view returns (bool) {
        // This is the standard OZ logic for _exists in 5.x
        try this.ownerOf(tokenId) returns (address owner) {
            return owner != address(0);
        } catch {
            return false;
        }
    }

    receive() external payable {}
}
