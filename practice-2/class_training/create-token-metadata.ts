import "dotenv/config";
import { Connection, clusterApiUrl, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { getExplorerLink } from "@solana-developers/helpers";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

// 1) Load and validate the private key from environment variables
let privateKey = process.env.SECRET_KEY;
if (!privateKey) {
    console.log("No private key provided!");
    process.exit(1);
}

// 2) Convert the private key to Uint8Array and create keypair
const asArray = Uint8Array.from(JSON.parse(privateKey));
const user = Keypair.fromSecretKey(asArray);

// 3) Establish connection to Solana devnet
const connection = new Connection(clusterApiUrl("devnet"));

// 4) Define constants for token metadata program and token mint address
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const tokenMintAccount = new PublicKey("AABhUAbkMfMApdj67nNPbGfojwA2i8BPU7fkknmJgh9W");

// 5) Define metadata for the token including name, symbol, and URI
const metadataData = {
    name: "Ta4anka Token",
    symbol: "TT",
    uri: "https://gateway.pinata.cloud/ipfs/bafkreic2ext56dapwsph5jouhwbleldieuecwfhgbswnlyfppaxv4oelkq",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
};

// 6) Find the Program Derived Address (PDA) for the metadata account
const [metadataPDA, _metadataBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenMintAccount.toBuffer()], 
    TOKEN_METADATA_PROGRAM_ID
);

// 7) Create a new transaction and add metadata creation instruction
const transaction = new Transaction();
const createMetadataAccountInstruction = createCreateMetadataAccountV3Instruction(
    {
        metadata: metadataPDA,
        mint: tokenMintAccount,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
    },
    {
        createMetadataAccountArgsV3: { 
            collectionDetails: null, 
            data: metadataData, 
            isMutable: true 
        },
    }
);
transaction.add(createMetadataAccountInstruction);

// 8) Send and confirm the transaction
await sendAndConfirmTransaction(connection, transaction, [user]);

// 9) Generate and display explorer link for the token mint
const tokenMintLink = getExplorerLink("address", tokenMintAccount.toString(), "devnet");
console.log(`✅ Look at the token mint again: ${tokenMintLink}\n`);
// Example output:
// https://explorer.solana.com/address/AABhUAbkMfMApdj67nNPbGfojwA2i8BPU7fkknmJgh9W?cluster=devnet