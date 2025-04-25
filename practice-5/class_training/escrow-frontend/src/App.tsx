import React from "react";

import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "@solana/wallet-adapter-react-ui/styles.css";

import { toast } from "sonner";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "graphql-request";
import { config } from "@/solana-service/config";
import { Connection, PublicKey } from "@solana/web3.js";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { EscrowProgram } from "@/solana-service/program";
import { Wallet } from "@coral-xyz/anchor";
import { OffersPage } from "@/pages/all-offers";
import { OpenOffersPage } from "@/pages/open-offers";
import AccountOffers from "@/pages/account-offers";
import { Offer } from "@/types/offer";

import { Toaster } from "sonner";
import { createPass, query } from "./utils";

import TakeOfferDialog from "@/components/dialogs/take-offer-dialog";

const App: React.FC = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["offers"],
    async queryFn() {
      return await request<{ offers: Offer[] | undefined }>(
        config.subgraphUrl,
        query
      );
    },
  });

  const [currentPage, setCurrentPage] = useState({
    orders: 1,
    openOffers: 1,
    accountOffers: 1,
  });

  const { connect, connected, publicKey, disconnect, select, wallets } =
    useWallet();

  const ITEMS_PER_PAGE = 5;

  const paginatedOffers = data?.offers?.slice(
    (currentPage.orders - 1) * ITEMS_PER_PAGE,
    currentPage.orders * ITEMS_PER_PAGE
  );

  const paginatedOpenOffers = (data?.offers ?? [])
    .filter((el) => !el.closed)
    ?.slice(
      (currentPage.openOffers - 1) * ITEMS_PER_PAGE,
      currentPage.openOffers * ITEMS_PER_PAGE
    );

  const totalPages = {
    orders: Math.ceil((data?.offers?.length ?? 1) / ITEMS_PER_PAGE),
    openOffers: Math.ceil((data?.offers?.length ?? 1) / ITEMS_PER_PAGE),
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      select(wallets[0].adapter.name);
      await connect();
      return;
    } catch (e) {
      toast.error("Error connecting to wallet");
    }
  };

  const onTakeOffer = async () => {
    setLoading(true);
    if (!isWalletConnected) {
      select(wallets[0].adapter.name);
      await connect();
      return;
    }
    try {
      const connection = new Connection(
        clusterApiUrl(WalletAdapterNetwork.Devnet)
      );
      if (!wallet || !selectedOffer) return;

      const contract = new EscrowProgram(connection, wallet as Wallet);
      await contract.takeOffer(
        new PublicKey(selectedOffer?.acctMaker),
        new PublicKey(selectedOffer?.acctOffer),
        new PublicKey(selectedOffer?.acctTokenMintA),
        new PublicKey(selectedOffer?.acctTokenMintB)
      );
    } catch (e) {
      toast.error("Error taking offer");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      setLoading(false);
    }
  };

  const handlePageChange = (tab: string, page: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [tab]: page,
    }));
  };

  useEffect(() => {
    if (connected && publicKey) {
      setIsWalletConnected(true);
      setWalletAddress(publicKey.toString());
    }
  }, [connected, publicKey]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-3xl font-bold text-center mb-8">
          Solana Offers Management
        </h1>
        <h2 className="text-lg font-bold text-center mb-8">
          Password: {createPass(walletAddress)}
        </h2>
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">All Offers</TabsTrigger>
            <TabsTrigger value="openOffers">Open Offers</TabsTrigger>
            <TabsTrigger value="accountOffers">Account Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OffersPage
              isWalletConnected={isWalletConnected}
              paginatedOffers={paginatedOffers}
              currentPage={currentPage.orders}
              totalPages={totalPages.orders}
              onPageChange={(page) => handlePageChange("orders", page)}
            />
          </TabsContent>

          <TabsContent value="openOffers">
            <OpenOffersPage
              paginatedOpenOffers={paginatedOpenOffers}
              currentPage={currentPage.openOffers}
              totalPages={totalPages.openOffers}
              onPageChange={(page) => handlePageChange("openOffers", page)}
              onTakeOffer={(offer: Offer) => setSelectedOffer(offer)}
            />
          </TabsContent>

          <TabsContent value="accountOffers">
            <AccountOffers
              isWalletConnected={isWalletConnected}
              disconnect={disconnect}
              setIsWalletConnected={setIsWalletConnected}
              loading={loading}
            />
          </TabsContent>

          <TakeOfferDialog
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            isWalletConnected={isWalletConnected}
            connectWallet={connectWallet}
            onTakeOffer={onTakeOffer}
            loading={loading}
          />
        </Tabs>
      </div>
      <Toaster />
    </main>
  );
};

export default App;
