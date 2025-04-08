import "dotenv/config";
import { getExplorerLink } from "@solana-developers/helpers";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

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
// 4) Display sender's public key for reference
console.log(`🔑 Our public key is: ${sender.publicKey.toBase58()}`);

// 5) Define the token mint account created in previous step(create-token-mint.ts))
const tokenMintAccount = new PublicKey("AABhUAbkMfMApdj67nNPbGfojwA2i8BPU7fkknmJgh9W");
// 6) Define recipient's wallet address
const recipient = new PublicKey("7gE3KxG74TTQzHMdBX2XpQXetHTr2gAfrxkYPqLvKKvf");
// 7) Get or create an associated token account for the recipient
const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMintAccount,
    recipient
);
// 8) Display the created token account address
console.log(`Token Account: ${tokenAccount.address.toBase58()}`);

// 9) Generate and display explorer link for the token account
const link = getExplorerLink("address", tokenAccount.address.toBase58(), "devnet");
console.log(`✅ Created token account: ${link}\n`);
// Example output:
// Created token account: https://explorer.solana.com/address/7bnopchMWY9jTTABmjR8MPY4RmfwipwFT7w2znwmdHCT?cluster=devnet