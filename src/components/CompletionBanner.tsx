import { sdk } from "@farcaster/frame-sdk";
import { useSetAtom } from "jotai";
import { continentsCompletedAtom } from "../state";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import GeoCasterNFTAbi from "../abi/GeoCasterNFT.json";

const CONTRACT_ADDRESS = "0xABAC242395e9E8F53360Fa98d4a71f6ECe397c91";

interface CompletionBannerProps {
  resetGame: () => void;
  elapsedTimeMs: number;
  formatElapsedTime: (ms: number) => string;
}

export default function CompletionBanner({ resetGame, elapsedTimeMs, formatElapsedTime }: CompletionBannerProps) {
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
      text: `🌍 I just conquered the continents on GeoCaster in ${formatElapsedTime(elapsedTimeMs)}!\n\nCan you name them all? Play: https://farcaster.xyz/miniapps/w28yvS34f1Xq/geocaster`,
      embeds: isMinted ? [nftImageUrl] : undefined,
    });
    setContinentsCompleted(0);
  };



  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">🏆 You're a world master!</h2>
      <p className="mb-6">You've identified every country on every continent. That’s impressive.</p>
      <div className="mb-4 text-lg text-cyan-300 font-semibold">⏱️ Your time: <span className="text-cyan-100">{formatElapsedTime(elapsedTimeMs)}</span></div>
      {isConnected && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={handleMint}
            className="w-full sm:w-auto px-10 py-4 rounded-3xl font-extrabold text-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white shadow-2xl hover:scale-105 hover:shadow-yellow-400/60 focus:outline-none focus:ring-4 focus:ring-yellow-300/50 active:scale-98 transition-all duration-200 ring-inset animate-pulse border-4 border-yellow-300/60 flex items-center justify-center gap-3 relative z-10"
            style={{ boxShadow: '0 0 32px 4px #fbbf24, 0 0 64px 16px #ec4899' }}
            disabled={isMinting || isConfirming || isMinted}
          >
            <span className="inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-200 drop-shadow animate-bounce" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.539 1.118l-3.388-2.462a1 1 0 00-1.176 0l-3.388 2.462c-.783.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z"/></svg>
              {isMinting ? "Minting..." : isConfirming ? "Confirming..." : isMinted ? "NFT Minted!" : "Mint Your Proof of Completion"}
            </span>
            <span className="absolute -inset-1.5 z-[-1] rounded-3xl bg-gradient-to-r from-yellow-200/40 via-pink-200/30 to-purple-200/40 blur-lg opacity-80 animate-glow" />
          </button>
          {mintError && (
  <div className="text-red-600 mt-2">
    <div>Mint error: {mintError.message}</div>
    <pre className="text-xs bg-red-50 text-red-700 p-2 rounded overflow-x-auto mt-1">{JSON.stringify(mintError, null, 2)}</pre>
    <div className="text-yellow-700 text-xs mt-1">Hint: Make sure you are connected to Arbitrum One and have enough ETH on Arbitrum, not Ethereum mainnet.</div>
  </div>
)}
          {txError && (
  <div className="text-red-600 mt-2">
    <div>Tx error: {txError.message}</div>
    <pre className="text-xs bg-red-50 text-red-700 p-2 rounded overflow-x-auto mt-1">{JSON.stringify(txError, null, 2)}</pre>
    <div className="text-yellow-700 text-xs mt-1">Hint: Make sure you are connected to Arbitrum One and have enough ETH on Arbitrum, not Ethereum mainnet.</div>
  </div>
)}
          {isMinted && <div className="text-green-600 mt-2">Success! Your NFT is minted.</div>}
        </div>
      )}
      <div className="flex flex-col items-center w-full mt-6">
        <button
          onClick={handleCast}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-300 text-yellow-900 shadow-lg hover:scale-105 hover:shadow-yellow-200/60 focus:outline-none focus:ring-2 focus:ring-yellow-300/70 active:scale-98 transition-all duration-200 ring-inset flex items-center justify-center gap-2 animate-pulse-slow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10v4a1 1 0 001 1h2l3 3V6L6 9H4a1 1 0 00-1 1zm13.293-1.707a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L16.586 12l-1.293-1.293a1 1 0 010-1.414z" /></svg>
          Cast Your Achievement{isMinted ? " with NFT" : ""}
        </button>
      </div>
      {isMinted && (
        <div className="mt-4">
          <img src={nftImageUrl} alt="Your Proof of Completion NFT" className="mx-auto rounded shadow-md w-48 h-48 object-cover" />
        </div>
      )}
      {/* Always show Start Again button at completion */}
      <div className="flex flex-col items-center mt-8">
        <button
          onClick={resetGame}
          className="w-40 px-4 py-2 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-500 via-blue-400 to-sky-400 text-white shadow-md hover:scale-105 hover:shadow-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 active:scale-97 transition-all duration-200 ring-inset border border-cyan-200/50"
        >
          <span className="inline-flex items-center gap-2">
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-white animate-spin-slow' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582M20 20v-5h-.581M5.635 17.657A9 9 0 104.582 9.582' /></svg>
            Start Again
          </span>
        </button>
      </div>
    </div>
  );
}