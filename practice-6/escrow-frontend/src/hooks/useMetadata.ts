import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  getMint,
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import { ENV, TokenListProvider } from "@solana/spl-token-registry";

interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
}

const DUMMY_TOKENS: Record<string, TokenMetadata> = {
  GdHsojisNu8RH92k4JzF1ULzutZgfg8WRL5cHkoW2HCK: {
    address: "GdHsojisNu8RH92k4JzF1ULzutZgfg8WRL5cHkoW2HCK",
    icon: "🌭",
    symbol: "HOT",
    name: "Hot",
    decimals: 9,
  },
  "9NCKufE7BQrTXTang2WjXjBe2vdrfKArRMq2Nwmn4o8S": {
    address: "9NCKufE7BQrTXTang2WjXjBe2vdrfKArRMq2Nwmn4o8S",
    icon: "🍔",
    symbol: "Burger",
    name: "Burger",
    decimals: 9,
  },
  So11111111111111111111111111111111111111112: {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Wrapped SOL",
    decimals: 9,
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
};

async function fetchTokenMetadata(
  connection: Connection,
  mintAddress: string
): Promise<TokenMetadata> {
  try {
    try {
      const ownerAddress = await connection.getAccountInfo(
        new PublicKey(mintAddress)
      );

      const mintData = await getMint(
        connection,
        new PublicKey(mintAddress),
        "confirmed",
        ownerAddress?.owner
      );

      let metadata: Partial<TokenMetadata> = {};

      if (ownerAddress?.owner === TOKEN_2022_PROGRAM_ID) {
        const token2022Metadata = await getTokenMetadata(
          connection,
          new PublicKey(mintAddress)
        );

        if (token2022Metadata) {
          metadata.name = token2022Metadata.name;
          metadata.symbol = token2022Metadata.symbol;
          metadata.icon = token2022Metadata.uri;
        }
      } else {
        const metaplex = Metaplex.make(connection);

        const metadataAccount = metaplex
          .nfts()
          .pdas()
          .metadata({ mint: new PublicKey(mintAddress) });

        const metadataAccountInfo = await connection.getAccountInfo(
          metadataAccount
        );

        if (metadataAccountInfo) {
          const token = await metaplex
            .nfts()
            .findByMint({ mintAddress: new PublicKey(mintAddress) });

          metadata.name = token.name;
          metadata.symbol = token.symbol;
          metadata.icon = token.json?.image;
        } else {
          const provider = await new TokenListProvider().resolve();
          const tokenList = provider.filterByChainId(ENV.Devnet).getList();

          const tokenMap = tokenList.reduce((map, item) => {
            map.set(item.address, item);
            return map;
          }, new Map());

          const token = tokenMap.get(mintAddress);

          metadata.name = token.name;
          metadata.symbol = token.symbol;
          metadata.icon = token.json?.image;
        }
      }

      if (!metadata.decimals) {
        throw new Error("No metadata found");
      }

      return {
        address: mintAddress,
        symbol: metadata.symbol || "UNKNOWN",
        name: metadata.name || "Unknown Token",
        decimals: mintData.decimals,
        icon: metadata?.icon || "👁",
      };
    } catch (e) {
      console.log("No Metaplex metadata found, using dummy data if available");

      if (DUMMY_TOKENS[mintAddress]) {
        return DUMMY_TOKENS[mintAddress];
      }

      return {
        address: mintAddress,
        symbol: "UNKNOWN",
        name: "Unknown Token",
        decimals: 9,
        icon: "👁",
      };
    }
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    throw error;
  }
}

export function useMetadata(mintAddress?: string) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["tokenMetadata", mintAddress],
    queryFn: async () => {
      if (!mintAddress) {
        throw new Error("Mint address is required");
      }
      return fetchTokenMetadata(connection, mintAddress);
    },
    enabled: !!mintAddress,
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}

export function formatTokenAmount(amount: number, decimals: number): string {
  return (amount / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function useMultipleMetadata(mintAddresses: string[]) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["multipleTokenMetadata", mintAddresses],
    queryFn: async () => {
      const metadataPromises = mintAddresses.map(async (address) => {
        const metadata = await fetchTokenMetadata(connection, address);
        return [address, metadata] as [string, TokenMetadata];
      });

      const metadataResults = await Promise.all(metadataPromises);
      return Object.fromEntries(metadataResults);
    },
    enabled: mintAddresses.length > 0,
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}
