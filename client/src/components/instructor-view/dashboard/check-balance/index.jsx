import { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import MintLottie from "@/assets/lotties/mintlottie.json";
import { useContractRead } from "wagmi";
import { client } from "@/web3/config/viemConfig.js";
import {
  CONTRACT_ADDRESS,
  MELODY_COIN_ABI,
} from "@/web3/constants/contractConstants";
import { Loader2 } from "lucide-react";
import { nContext } from "@/context/notification-context";

const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

function CheckBalance() {
  const { notify } = useContext(nContext);
  const [walletAddress, setWalletAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);

  const { data: balance, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MELODY_COIN_ABI,
    functionName: "balanceOf",
    args: [walletAddress],
    enabled: isValidAddress,
  });

  const formattedBalance = balance ? Number(balance) / 10 ** 18 : null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-lg mt-6">
      <CardContent className="p-6 flex flex-col items-center space-y-6">
        <div className="w-48 h-48 mb-4">
          <Lottie animationData={MintLottie} loop={true} autoplay={true} />
        </div>

        <CardTitle className="text-2xl font-bold text-center text-blue-600">
          Check Token Balance
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

          {isValidAddress && (
            <div className="text-center">
              {isLoading ? (
                <div className="text-sm text-blue-600 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading balance...
                </div>
              ) : (
                <div className="text-lg font-semibold text-blue-700">
                  Balance: {formattedBalance} MLD
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CheckBalance;
