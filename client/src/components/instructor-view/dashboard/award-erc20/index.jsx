import { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import FaucetLottie from "@/assets/lotties/FaucetLottie.json";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { client } from "@/web3/config/viemConfig.js";
import { BaseError } from "viem";
import {
  CONTRACT_ADDRESS,
  MELODY_COIN_ABI,
} from "@/web3/constants/contractConstants";
import { Loader2, CheckCircle2 } from "lucide-react";
import { nContext } from "@/context/notification-context";
import { faucetRevertMapping } from "@/lib/utils";

const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

function AwardERC20() {
  const { notify } = useContext(nContext);
  const [walletAddress, setWalletAddress] = useState("");
  const [isAwarding, setIsAwarding] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  async function handleAwardToken() {
    if (!walletAddress) {
      notify("Please enter a wallet address");
      return;
    }
    if (!isValidAddress) {
      notify("Invalid EVM address format");
      return;
    }
    setIsAwarding(true);
    try {
      const { request } = await client.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: MELODY_COIN_ABI,
        functionName: "getFaucetAssets",
        account: walletAddress,
        args: [],
      });
      writeContract(request);
    } catch (error) {
      console.error("Error awarding token:", error);
      setIsAwarding(false);
      if (error instanceof BaseError) {
        const errorText = faucetRevertMapping(error);
        notify(errorText);
      } else {
        notify("Failed to get assets from faucet");
      }
    } finally {
      setIsAwarding(false);
    }
  }

  if (hash) {
    notify("Transaction hash: " + hash);
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-lg">
      <CardContent className="p-6 flex flex-col items-center space-y-6">
        <div className="w-48 h-48 mb-4">
          <Lottie animationData={FaucetLottie} loop={true} autoplay={true} />
        </div>

        <CardTitle className="text-2xl font-bold text-center text-blue-600">
          Award ERC20 Tokens
        </CardTitle>

        <div className="w-full max-w-md space-y-4">
          <Input
            type="text"
            placeholder="Enter student wallet address"
            value={walletAddress}
            onChange={(e) => {
              const address = e.target.value;
              setWalletAddress(address);
              setIsValidAddress(isValidEthereumAddress(address));
            }}
            className={`transition-all duration-200 ${
              walletAddress && !isValidAddress
                ? "border-red-500 bg-red-50"
                : "focus:border-blue-500"
            }`}
            aria-invalid={walletAddress && !isValidAddress}
          />

          {hash && (
            <div className="text-sm bg-white/50 backdrop-blur-sm p-4 rounded-lg break-all border border-blue-100">
              <span className="font-semibold text-blue-700">
                Transaction hash:
              </span>
              <span className="text-gray-600"> {hash}</span>
            </div>
          )}

          <div className="flex justify-center">
            {isConfirming && (
              <div className="text-sm text-blue-600 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Waiting for confirmation...
              </div>
            )}
            {isConfirmed && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Transaction confirmed!
              </div>
            )}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            onClick={handleAwardToken}
            disabled={!isValidAddress || isAwarding}
          >
            {isAwarding ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Awarding...
              </div>
            ) : (
              "Award 0.1 MLD"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AwardERC20;
