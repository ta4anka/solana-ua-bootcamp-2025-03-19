import { useMetadata, formatTokenAmount } from '@/hooks/useMetadata';

interface TokenDisplayProps {
  mintAddress: string;
  amount: number;
}

export function TokenDisplay({ mintAddress, amount }: TokenDisplayProps) {
  const { data: metadata, isLoading } = useMetadata(mintAddress);

  if (isLoading) {
    return <div>Loading token info...</div>;
  }

  if (!metadata) {
    return <div>Token not found</div>;
  }

  return (
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
        <div className="font-medium">
          {formatTokenAmount(amount, metadata.decimals)} {metadata.symbol}
        </div>
        <div className="text-sm text-muted-foreground">{metadata.name}</div>
      </div>
    </div>
  );
}
