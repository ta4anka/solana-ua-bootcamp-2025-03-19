import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowDownUp } from "lucide-react";

import { toast } from "sonner";
import { EscrowProgram } from "@/solana-service/program";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";

import { Wallet } from "@coral-xyz/anchor";
import { METADATA } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useMetadata } from "@/hooks/useMetadata";

const DEFAULT_FORM_DATA = {
  tokenA: METADATA["9NCKufE7BQrTXTang2WjXjBe2vdrfKArRMq2Nwmn4o8S"].address,
  tokenB: METADATA["GdHsojisNu8RH92k4JzF1ULzutZgfg8WRL5cHkoW2HCK"].address,
  amountA: "0",
  amountB: "0",
};
interface CreateOfferDialogProps {
  isWalletConnected: boolean;
}

export function CreateOfferDialog({
  isWalletConnected,
}: CreateOfferDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { connect, wallets, select } = useWallet();
  const wallet = useAnchorWallet();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const queryClient = useQueryClient();
  const { data: firstTokenMetadata } = useMetadata(formData.tokenA);
  const { data: secondTokenMetadata } = useMetadata(formData.tokenB);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWalletConnected) {
      select(wallets[0].adapter.name);
      await connect();
      return;
    }

    if (!formData.amountA || !formData.amountB) {
      toast("Missing information");
      return;
    }

    setIsSubmitting(true);

    try {
      const connection = new Connection(
        clusterApiUrl(WalletAdapterNetwork.Devnet)
      );
      if (!wallet) return;

      const contract = new EscrowProgram(connection, wallet as Wallet);
      const response = await contract.makeOffer(
        new PublicKey(formData.tokenA),
        new PublicKey(formData.tokenB),
        Number(formData.amountA),
        Number(formData.amountB)
      );
      if (!response) {
        toast("Error creating Offer");
        return;
      }
      toast("Offer created");

      setFormData(DEFAULT_FORM_DATA);
      setIsOpen(false);
    } catch (error) {
      toast("Error creating Offer");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTokenChange = (tokenType: "tokenA" | "tokenB", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [tokenType]: value,
    }));
  };

  const swapTokens = () => {
    setFormData((prev) => ({
      tokenA: prev.tokenB,
      tokenB: prev.tokenA,
      amountA: prev.amountB,
      amountB: prev.amountA,
    }));
  };

  const calculateExchangeRate = () => {
    if (!formData.amountA || !formData.amountB)
      return "Enter amounts to see rate";

    const amountA = Number.parseFloat(formData.amountA);
    const amountB = Number.parseFloat(formData.amountB);

    if (amountA <= 0 || amountB <= 0) return "Invalid amounts";

    const rate = amountB / amountA;
    return `1 ${firstTokenMetadata?.symbol} = ${rate.toFixed(2)} ${
      secondTokenMetadata?.symbol
    }`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Offer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Offer</DialogTitle>
          <DialogDescription>
            Create a new Offer to exchange tokens. You offer one token and
            receive another.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tokenA">Token to Offer</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.tokenA}
                  onValueChange={(value) => handleTokenChange("tokenA", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METADATA).map(([address, metadata]) => (
                      <SelectItem key={address} value={address}>
                        <div className="flex items-center gap-2">
                          <span>{metadata.icon}</span>
                          <span>{metadata.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="amountA"
                  name="amountA"
                  placeholder="Amount"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.amountA}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={swapTokens}
                className="rounded-full h-8 w-8"
              >
                <ArrowDownUp className="h-4 w-4" />
                <span className="sr-only">Swap tokens</span>
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tokenB">Token to Receive</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.tokenB}
                  onValueChange={(value) => handleTokenChange("tokenB", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METADATA).map(([address, metadata]) => (
                      <SelectItem key={address} value={address}>
                        <div className="flex items-center gap-2">
                          <span>{metadata.icon}</span>
                          <span>{metadata.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="amountB"
                  name="amountB"
                  placeholder="Amount"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.amountB}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {formData.amountA && formData.amountB && (
              <div className="text-sm text-muted-foreground text-center">
                Exchange Rate: {calculateExchangeRate()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : !isWalletConnected ? (
                "Connect Wallet to Create"
              ) : (
                "Create Offer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
