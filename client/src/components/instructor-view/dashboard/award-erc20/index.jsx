import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import FaucetLottie from "@/assets/lotties/FaucetLottie.json";

function AwardERC20() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAwarding, setIsAwarding] = useState(false);

  async function handleAwardToken() {
    if (!walletAddress) return;
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
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <Button
          className="w-full"
          onClick={handleAwardToken}
          disabled={!walletAddress || isAwarding}
        >
          {isAwarding ? "Awarding..." : "Award 0.1 MLD"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default AwardERC20;
