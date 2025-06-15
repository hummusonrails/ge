import { sdk } from "@farcaster/frame-sdk";
import { useSetAtom } from "jotai";
import { continentsCompletedAtom } from "../state";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import GeoCasterNFTAbi from "../abi/GeoCasterNFT.json";

const CONTRACT_ADDRESS = "0xABAC242395e9E8F53360Fa98d4a71f6ECe397c91";

export default function CompletionBanner() {
  const setContinentsCompleted = useSetAtom(continentsCompletedAtom);
  const { isConnected } = useAccount();

  // Mint NFT setup (wagmi v1+)
  const {
    writeContract,
    data: mintTxHash,
    isPending: isMinting,
    error: mintError,
  } = useWriteContract();

  // Wait for transaction receipt if there's a hash
  const {
    isLoading: isConfirming,
    isSuccess: isMinted,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: mintTxHash as `0x${string}` | undefined,
  });



  // Mocked NFT image URL (should be fetched from token_uri in a real app)
  const nftImageUrl = "https://ge-z3kf.onrender.com/nft.png";

  // Separate handlers for mint and cast
  const handleMint = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: GeoCasterNFTAbi,
      functionName: "mint",
      value: BigInt("1000000000000000"), // 0.001 ETH in wei
    });
  };

  const handleCast = () => {
    sdk.actions.composeCast({
      text: `🌍 I just conquered the continents on GeoCaster.\n\nCan you name them all? Play: https://farcaster.xyz/miniapps/w28yvS34f1Xq/geocaster`,
      embeds: isMinted ? [nftImageUrl] : undefined,
    });
    setContinentsCompleted(0);
  };

  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">🏆 You're a world master!</h2>
      <p className="mb-6">You've identified every country on every continent. That’s impressive.</p>
      {isConnected && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={handleMint}
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-500 disabled:opacity-60"
            disabled={isMinting || isConfirming || isMinted}
          >
            {isMinting ? "Minting..." : isConfirming ? "Confirming..." : isMinted ? "NFT Minted!" : "Mint Your Proof of Completion"}
          </button>
          {mintError && <div className="text-red-600 mt-2">Mint error: {mintError.message}</div>}
          {txError && <div className="text-red-600 mt-2">Tx error: {txError.message}</div>}
          {isMinted && <div className="text-green-600 mt-2">Success! Your NFT is minted.</div>}
        </div>
      )}
      <button
        onClick={handleCast}
        className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded hover:bg-yellow-300 mt-8"
      >
        Cast Your Achievement{isMinted ? " with NFT" : ""}
      </button>
      {isMinted && (
        <div className="mt-4">
          <img src={nftImageUrl} alt="Your Proof of Completion NFT" className="mx-auto rounded shadow-md w-48 h-48 object-cover" />
        </div>
      )}
    </div>
  );
}