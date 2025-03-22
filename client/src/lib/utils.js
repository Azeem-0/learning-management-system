import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ContractFunctionExecutionError } from "viem";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const faucetRevertMapping = (error) => {
  const revertError = error.walk(
    (err) => err instanceof ContractFunctionExecutionError
  );
  if (!revertError) {
    return error.shortMessage;
  }
  if (revertError.message.includes("TooFrequentRequests")) {
    return "Faucet drip limited to once per 24hours";
  } else if (revertError.message.includes("TooHighBalance")) {
    return "Faucet requester must have less than 1.5MLD";
  } else if (revertError.message.includes("DepletedFaucetReserves")) {
    return "Faucet reserves depleted";
  }
  return "Error fetching drip";
};
