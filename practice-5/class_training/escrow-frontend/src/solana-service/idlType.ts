/**
 * Program IDL in camelCase format in Offer to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/escrow.json`.
 */
export type Escrow = {
  address: "4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy";
  metadata: {
    name: "escrow";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "makeOffer";
      discriminator: [214, 98, 97, 35, 59, 12, 44, 178];
      accounts: [
        {
          name: "maker";
          writable: true;
          signer: true;
        },
        {
          name: "tokenMintA";
        },
        {
          name: "tokenMintB";
        },
        {
          name: "makerTokenAccountA";
          writable: true;
        },
        {
          name: "offer";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [111, 102, 102, 101, 114];
              },
              {
                kind: "account";
                path: "maker";
              },
              {
                kind: "arg";
                path: "id";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "id";
          type: "u64";
        },
        {
          name: "tokenAOfferedAmount";
          type: "u64";
        },
        {
          name: "tokenBWantedAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "takeOffer";
      discriminator: [128, 156, 242, 207, 237, 192, 103, 240];
      accounts: [
        {
          name: "taker";
          writable: true;
          signer: true;
        },
        {
          name: "maker";
          writable: true;
          relations: ["offer"];
        },
        {
          name: "tokenMintA";
          relations: ["offer"];
        },
        {
          name: "tokenMintB";
          relations: ["offer"];
        },
        {
          name: "takerTokenAccountA";
          writable: true;
        },
        {
          name: "takerTokenAccountB";
          writable: true;
        },
        {
          name: "makerTokenAccountB";
          writable: true;
        },
        {
          name: "offer";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [111, 102, 102, 101, 114];
              },
              {
                kind: "account";
                path: "maker";
              },
              {
                kind: "account";
                path: "offer.id";
                account: "offer";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "offer";
      discriminator: [215, 88, 60, 71, 170, 162, 73, 229];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "customError";
      msg: "Custom error message";
    }
  ];
  types: [
    {
      name: "offer";
      type: {
        kind: "struct";
        fields: [
          {
            name: "id";
            type: "u64";
          },
          {
            name: "maker";
            type: "pubkey";
          },
          {
            name: "tokenMintA";
            type: "pubkey";
          },
          {
            name: "tokenMintB";
            type: "pubkey";
          },
          {
            name: "tokenBWantedAmount";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
  constants: [
    {
      name: "seed";
      type: "string";
      value: '"anchor"';
    }
  ];
};
