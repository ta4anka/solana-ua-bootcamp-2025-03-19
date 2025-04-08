import "dotenv/config";
import { getExplorerLink } from "@solana-developers/helpers";
import { Keypair, clusterApiUrl, Connection } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";

// 1) Load and validate private key from environment variables
let privateKey = process.env.SECRET_KEY;
if (!privateKey) {
    console.log("No private key provided!");
    process.exit(1);
}

// 2) Convert private key to Uint8Array and create keypair
const asArray = Uint8Array.from(JSON.parse(privateKey));
const sender = Keypair.fromSecretKey(asArray);

// 3) Establish connection to Solana devnet
const connection = new Connection(clusterApiUrl("devnet"));

// 4) Log sender's public key for reference
console.log(`🔑 Our public key is: ${sender.publicKey.toBase58()}`);

// 5) Create a new token mint
const tokenMint = await createMint(
    connection,
    sender,
    sender.publicKey,
    null,
    2
);

// 6) Generate and display explorer link for the new token mint
const link = getExplorerLink("address", tokenMint.toString(), "devnet");
console.log(`✅ Token Mint: ${link}`);
// Example output:
// Token Mint: https://explorer.solana.com/address/AABhUAbkMfMApdj67nNPbGfojwA2i8BPU7fkknmJgh9W?cluster=devnet