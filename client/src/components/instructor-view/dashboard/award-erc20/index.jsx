import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import FaucetLottie from "@/assets/lotties/FaucetLottie.json";

const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

function AwardERC20() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAwarding, setIsAwarding] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);

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
      // TODO: Implement token award logic here
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay
      console.log(`Awarded 0.1 MLD to ${walletAddress}`);
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
