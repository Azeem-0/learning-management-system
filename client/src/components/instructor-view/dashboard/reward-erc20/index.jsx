"use client";
import { useContext, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BaseError, parseEther } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { client } from "@/web3/config/viemConfig";
import {
  CONTRACT_ADDRESS,
  MELODY_COIN_ABI,
} from "@/web3/constants/contractConstants";
import { transferRevertMapping } from "@/lib/utils";
import { nContext } from "@/context/notification-context";

export default function RewardERC20() {
  const { notify } = useContext(nContext);
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (amount == 0) {
      return toaster("error", "Amount cannot be 0");
    }
    try {
      const amountInWei = parseEther(amount.toString());
      const { request } = await client.simulateContract({
        account: address,
        address: CONTRACT_ADDRESS,
        abi: MELODY_COIN_ABI,
        functionName: "transfer",
        args: [toAddress, amountInWei],
      });
      writeContract(request);
    } catch (error) {
      console.log(error);
      if (error instanceof BaseError) {
        const errorText = transferRevertMapping(error);
        notify("error", errorText);
      } else {
        notify("error", "Failed to transfer funds");
      }
    }
  };

  if (hash) {
    addRecentTransaction({
      hash,
      description: `Transferring ${amount}MLD to ${toAddress}`,
    });
  }

  return (
    <Card className="border-0 shadow-none">
      <form onSubmit={handleTransfer}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="toAddress"
              className="text-sm font-medium text-gray-800"
            >
              To Address
            </Label>
            <Input
              id="toAddress"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              required
              placeholder="Enter recipient's address"
              className="border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-gray-800"
            >
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              placeholder="Enter amount to transfer"
              className="border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-black"
              min={0.000000000000000001}
              step={0.000000000000000001}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center flex-wrap gap-2">
          {hash && (
            <div className="text-sm bg-gray-100 p-3 rounded-md break-all">
              <span className="font-semibold">Transaction hash:</span> {hash}
            </div>
          )}
          <Button
            type="submit"
            disabled={isConfirming}
            className="w-full transition-all duration-200 hover:scale-105 bg-black text-white hover:bg-gray-900 rounded-lg"
          >
            {isConfirming ? "Transferring..." : "Transfer"}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
