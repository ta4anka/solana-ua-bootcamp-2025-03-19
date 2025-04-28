import { useMultipleMetadata, formatTokenAmount } from '@/hooks/useMetadata';

interface TokenBalance {
  mint: string;
  amount: number;
}

interface TokenListProps {
  tokens: TokenBalance[];
}

export function TokenList({ tokens }: TokenListProps) {
  const { data: tokensMetadata, isLoading } = useMultipleMetadata(
    tokens.map((t) => t.mint),
  );

  if (isLoading) {
    return <div>Loading tokens...</div>;
  }

  if (!tokensMetadata) {
    return <div>No tokens found</div>;
  }

  return (
    <div className="space-y-3">
      {tokens.map((token) => {
        const metadata = tokensMetadata[token.mint];
        if (!metadata) return null;

        return (
          <div
            key={token.mint}
            className="flex items-center justify-between p-3 bg-card rounded-lg"
          >
            <div className="flex items-center gap-2">
              {metadata.icon && (
                <span className="text-xl">
                  {metadata.icon.startsWith('http') ? (
                    <img
                      src={metadata.icon}
                      alt={metadata.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    metadata.icon
                  )}
                </span>
              )}
              <div>
                <div className="font-medium">{metadata.name}</div>
                <div className="text-sm text-muted-foreground">
                  {metadata.symbol}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {formatTokenAmount(token.amount, metadata.decimals)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
