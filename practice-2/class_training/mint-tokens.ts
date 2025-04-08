import "dotenv/config";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { mintTo } from "@solana/spl-token";
import { getExplorerLink } from "@solana-developers/helpers";

// 1) Load and validate the private key from environment variables
let privateKey = process.env.SECRET_KEY;
if (!privateKey) {
    console.log("No private key provided!");
    process.exit(1);
}
// 2) Convert the private key to Uint8Array and create keypair
const asArray = Uint8Array.from(JSON.parse(privateKey));
const sender = Keypair.fromSecretKey(asArray);
// 3) Establish connection to Solana devnet
const connection = new Connection(clusterApiUrl("devnet"));
// 4) Define conversion factor for token decimals (2 decimal places)
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

// 5) Address that create-token-mint.ts created
const tokenMintAccount = new PublicKey("AABhUAbkMfMApdj67nNPbGfojwA2i8BPU7fkknmJgh9W");
// 6) Address that create-token-account.ts created
const recipientAssociatedTokenAccount = new PublicKey("7bnopchMWY9jTTABmjR8MPY4RmfwipwFT7w2znwmdHCT");

// 7) Execute the mintTo operation to create new tokens
const transactionSignature = await mintTo(
    connection,
    sender,
    tokenMintAccount,
    recipientAssociatedTokenAccount,
    sender,
    10 * MINOR_UNITS_PER_MAJOR_UNITS // Minting 10 tokens 
);

// 8) Generate explorer link for the transaction
const link = getExplorerLink("transaction", transactionSignature, "devnet");

console.log("✅ Success!");
console.log(`Mint Token Transaction: ${link}\n`);
// Example output:
// Mint Token Transaction: https://explorer.solana.com/tx/5gUhR24X2v2rsTZPBCFauhytfsj8LLobqsMEZFbg7DWpJf7Z5EigFj9U4KTEFdh1ToeKob4Hr7gJwyoL52dhQ48v?cluster=devnet