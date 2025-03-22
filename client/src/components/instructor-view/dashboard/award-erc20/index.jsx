import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import FaucetLottie from "@/assets/lotties/FaucetLottie.json";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { client } from "@/web3/config/viemConfig.js";
import {
  CONTRACT_ADDRESS,
  MELODY_COIN_ABI,
} from "@/web3/constants/contractConstants";
import { Loader2, CheckCircle2 } from "lucide-react";

const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

function AwardERC20() {
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
    } finally {
      setIsAwarding(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Award ERC20 Tokens</span>
          <div className="w-12 h-12">
            <Lottie animationData={FaucetLottie} loop={true} autoplay={true} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="Enter student wallet address"
          value={walletAddress}
          onChange={(e) => {
            const address = e.target.value;
            setWalletAddress(address);
            setIsValidAddress(isValidEthereumAddress(address));
          }}
          className={walletAddress && !isValidAddress ? "border-red-500" : ""}
          aria-invalid={walletAddress && !isValidAddress}
        />
        {hash && (
          <div className="text-sm bg-gray-100 p-3 rounded-md mb-4 break-all">
            <span className="font-semibold">Transaction hash:</span> {hash}
          </div>
        )}
        {isConfirming && (
          <div className="text-sm text-blue-600 flex items-center justify-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Waiting for confirmation...
          </div>
        )}
        {isConfirmed && (
          <div className="text-sm text-green-600 flex items-center justify-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Transaction confirmed.
          </div>
        )}
        <Button
          className="w-full"
          onClick={handleAwardToken}
          disabled={!isValidAddress || isAwarding}
        >
          {isAwarding ? "Awarding..." : "Award 0.1 MLD"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default AwardERC20;
