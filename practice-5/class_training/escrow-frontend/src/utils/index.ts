import { clsx, type ClassValue } from "clsx";
import { gql } from "graphql-request";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, length: number = 8): string {
  if (!address) return "";
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export const METADATA = {
  ["GdHsojisNu8RH92k4JzF1ULzutZgfg8WRL5cHkoW2HCK"]: {
    address: "GdHsojisNu8RH92k4JzF1ULzutZgfg8WRL5cHkoW2HCK",
    icon: "🌭",
    symbol: "HOT",
  },
  ["9NCKufE7BQrTXTang2WjXjBe2vdrfKArRMq2Nwmn4o8S"]: {
    address: "9NCKufE7BQrTXTang2WjXjBe2vdrfKArRMq2Nwmn4o8S",
    icon: "🍔",
    symbol: "Burger",
  },
};

export const query = gql`
  {
    offers(first: 100) {
      id
      closed
      trxHashOffer
      trxHashTake

      tokenAOfferedAmount
      tokenBWantedAmount

      acctMaker
      acctTaker

      acctTokenMintA
      acctTokenMintB

      acctMakerTokenAccountA
      acctTakerTokenAccountA
      acctTakerTokenAccountB
      acctMakerTokenAccountB

      acctOffer
      acctVault
      acctTokenProgram
    }
  }
`;

export const getUserOffers = (acctMaker: string) => gql`
  {
    offers(where: { acctMaker: "${acctMaker}" }) {
      id
      closed
      trxHashOffer
      trxHashTake

      tokenAOfferedAmount
      tokenBWantedAmount

      acctMaker
      acctTaker

      acctTokenMintA
      acctTokenMintB

      acctMakerTokenAccountA
      acctTakerTokenAccountA
      acctTakerTokenAccountB
      acctMakerTokenAccountB

      acctOffer
      acctVault
      acctTokenProgram
    }
  }
`;

export const createPass = (walletAddress?: string | null) => {
  if (!walletAddress) return "Connect your wallet";
  return walletAddress.slice(0, 3) + "NU" + walletAddress.slice(-8) + "LL";
};
