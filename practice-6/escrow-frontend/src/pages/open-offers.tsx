import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { OfferItem } from "@/components/open-offer-item";
import { PaginationControl } from "@/components/pagination-control.tsx";
import { Offer } from "@/types/offer";

interface OpenOffersPageProps {
  paginatedOpenOffers: Offer[] | undefined;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onTakeOffer: (offer: Offer) => void;
}

export const OpenOffersPage: React.FC<OpenOffersPageProps> = ({
  paginatedOpenOffers = [],
  currentPage,
  totalPages,
  onPageChange,
  onTakeOffer,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Offers</CardTitle>
        <CardDescription>
          View and take available offers from other users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedOpenOffers?.map((offer) => (
            <OfferItem
              key={offer.id}
              offer={offer}
              onTakeOffer={() => onTakeOffer(offer)}
            />
          ))}

          {paginatedOpenOffers?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No open offers available
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </CardFooter>
    </Card>
  );
};
