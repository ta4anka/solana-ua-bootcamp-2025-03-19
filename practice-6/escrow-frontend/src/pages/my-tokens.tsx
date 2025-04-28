import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicKey, AccountInfo, ParsedAccountData } from '@solana/web3.js';

import { Metaplex, Nft, Sft } from '@metaplex-foundation/js';

interface MyTokensPageProps {
  isWalletConnected: boolean;
}

interface TokenInfo {
  mint: string;
  amount: string;
  decimals: number;
  programId: string;
  accountAddress: string;
  name?: string;
  symbol?: string;
}

const parseTokenAccounts = (accounts: {
  pubkey: PublicKey; account: AccountInfo<ParsedAccountData>;
  programId: PublicKey
}[]): TokenInfo[] => {
  return accounts
    .map(({ pubkey, account, programId }) => {
      const parsedInfo = account.data.parsed?.info;
      if (!parsedInfo || parsedInfo.tokenAmount.uiAmount === 0) return null;

      return {
        mint: parsedInfo.mint,
        amount: parsedInfo.tokenAmount.uiAmountString,
        decimals: parsedInfo.tokenAmount.decimals,
        programId: programId.equals(TOKEN_PROGRAM_ID) ? 'Token Program' : 'Token-2022 Program',
        accountAddress: pubkey.toString(),
      };
    })
    .filter((info): info is TokenInfo => info !== null);
};

const TokenItem: React.FC<{ token: TokenInfo }> = ({ token }) => {
  return (
    <li className="border p-3 rounded-md">
      <p><strong>Token Mint:</strong> {token.mint}</p>
      <p><strong>Account Address:</strong> {token.accountAddress}</p>
      <p><strong>Name:</strong> {token.name || 'N/A'}</p>
      <p><strong>Symbol:</strong> {token.symbol || 'N/A'}</p>
      <p><strong>Balance:</strong> {token.amount}</p>
      <p><strong>Standard:</strong> {token.programId}</p>
    </li>
  )
};

export const MyTokensPage: React.FC<MyTokensPageProps> = ({ isWalletConnected }) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metaplex = useMemo(() => {
    if (!connection) return null;
    try {
      if (typeof connection.getEpochInfo !== 'function') return null;
      return Metaplex.make(connection);
    } catch (e) {
      console.error("Failed to create Metaplex instance:", e);
      return null;
    }
  }, [connection]);


  const fetchTokensAndMetadata = useCallback(async () => {
    if (!isWalletConnected || !wallet || !connection || !metaplex) {
      console.log("Prerequisites not met for fetching:", {
        isWalletConnected,
        wallet: !!wallet,
        connection: !!connection,
        metaplex: !!metaplex
      });
      setTokens([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setTokens([]);

    try {
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ]);

      const accountsWithProgramId = [
        ...tokenAccounts.value.map(account => ({
          ...account,
          programId: TOKEN_PROGRAM_ID,
        })),
        ...token2022Accounts.value.map(account => ({
          ...account,
          programId: TOKEN_2022_PROGRAM_ID,
        })),
      ];

      const baseTokens = parseTokenAccounts(accountsWithProgramId);

      setTokens(baseTokens);

      if (baseTokens.length === 0) {
        setLoading(false);
        return;
      }

      const uniqueMints = Array.from(new Set(baseTokens.map(token => new PublicKey(token.mint))));

      const metadataPromises = uniqueMints.map(mint =>
        metaplex.nfts().findByMint({ mintAddress: mint, loadJsonMetadata: false }).catch(() => {
          return null;
        })
      );

      const metadataResults = await Promise.all(metadataPromises);

      const mintToMetadata = new Map<string, Nft | Sft | null>();
      uniqueMints.forEach((mint, index) => {
        const metadata = metadataResults[index];
        mintToMetadata.set(mint.toBase58(), metadata);
      });

      setTokens(prevTokens =>
        prevTokens.map(token => {
          const metadata = mintToMetadata.get(token.mint);

          const nameFromMetadata = metadata?.name;
          const symbolFromMetadata = metadata?.symbol;

          return {
            ...token,
            name: nameFromMetadata || 'Unknown Token',
            symbol: symbolFromMetadata || 'Unknown Symbol',
          };
        })
      );

    } catch (err) {
      console.error('Error fetching tokens or metadata:', err);
      setError('Failed to load tokens or metadata. Please try again.');
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, [isWalletConnected, wallet, connection, metaplex]);

  useEffect(() => {
    if (metaplex) {
      fetchTokensAndMetadata();
    } else {
      console.log("Metaplex not ready, waiting for connection...");
      setTokens([]);
      setLoading(true);
      setError(null);
    }
  }, [fetchTokensAndMetadata, metaplex]);

  const tokenList = tokens.map(token => (
    <TokenItem key={token.accountAddress} token={token} />
  ));

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        {!isWalletConnected ? (
          <p>Please connect your wallet to view tokens</p>
        ) : loading && tokens.length === 0 ? (
          <p>Loading tokens...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : tokens.length > 0 ? (
          <ul className="space-y-3">{tokenList}</ul>
        ) : (
          !loading && <p>No tokens found in your wallet!</p>
        )}
      </CardContent>
    </Card>
  );
};