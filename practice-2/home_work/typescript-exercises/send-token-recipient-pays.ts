import "dotenv/config";
import { Keypair, clusterApiUrl, Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getAccount, getMint } from "@solana/spl-token";
import fs from "fs";

// Helper function to load a keypair from environment variable
const loadKeypair = (envVar: string) => {
    const privateKey = process.env[envVar];
    if (!privateKey) {
        console.log(`No ${envVar} provided!`);
        process.exit(1);
    }
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKey)));
};

// Helper function to print wallet and token balances
const printBalances = async (label: string, wallet: PublicKey, tokenAccount: PublicKey) => {
    try {
        const solBalance = await connection.getBalance(wallet);
        const tokenBalance = await getAccount(connection, tokenAccount);

        console.log(`[${label}]`);
        console.log(`  Wallet: ${wallet.toBase58()}`);
        console.log(`  SOL balance: ${solBalance / LAMPORTS_PER_SOL} SOL`);
        console.log(`  Token balance: ${tokenBalance.amount} tokens\n`);
    } catch (error) {
        console.error(`Error fetching balances for ${label}:`, error);
    }
};

// Load sender and receiver keypairs from environment variables
const senderKey = loadKeypair("SENDER_SECRET_KEY");
const receiverKey = loadKeypair("RECEIVER_SECRET_KEY");
// Establish connection to Solana devnet
const connection = new Connection(clusterApiUrl("devnet"));
// Existing token mint address
const MINT_ADDRESS = new PublicKey("AABhUAbkMfMApdj67nNPbGfojwA2i8BPU7fkknmJgh9W");

// 1) Get token metadata and display information
const tokenMint = await getMint(connection, MINT_ADDRESS);
console.log("Token Information:");
console.log(`  Address: ${MINT_ADDRESS.toBase58()}`);
console.log(`  Decimals: ${tokenMint.decimals}`);
console.log(`  Supply: ${tokenMint.supply}\n`);

// 2) Get or create token accounts for sender and receiver
const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    senderKey,
    MINT_ADDRESS,
    senderKey.publicKey
);
const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    receiverKey,
    MINT_ADDRESS,
    receiverKey.publicKey
);

console.log(`Sender Token Account: ${senderTokenAccount.address.toBase58()}`);
console.log(`Receiver Token Account: ${receiverTokenAccount.address.toBase58()}\n`);

// Print initial balances before transaction
console.log("Initial Balances:");
const initialSenderSol = await connection.getBalance(senderKey.publicKey);
const initialReceiverSol = await connection.getBalance(receiverKey.publicKey);
await printBalances("Sender (Before)", senderKey.publicKey, senderTokenAccount.address);
await printBalances("Receiver (Before)", receiverKey.publicKey, receiverTokenAccount.address);

// 3) Create transfer transaction (receiver pays fee)
const transferAmount = BigInt(3 * 10 ** tokenMint.decimals);
console.log(`\nTransferring ${3} tokens (${transferAmount} in raw units)`);
const tx = new Transaction().add(
    createTransferInstruction(
        senderTokenAccount.address,
        receiverTokenAccount.address,
        senderKey.publicKey,
        transferAmount
    )
);
tx.feePayer = receiverKey.publicKey;
const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
tx.recentBlockhash = blockhash;

// 4) Partially sign by sender
tx.partialSign(senderKey);

// 5) Save transaction to file
const serialized = tx.serialize({ requireAllSignatures: false });
fs.writeFileSync("transfer_tx.bin", serialized);
console.log("\nTransaction partially signed by sender and saved to transfer_tx.bin");

// 6) Receiver signs and sends transaction
const readTx = Transaction.from(fs.readFileSync("transfer_tx.bin"));
readTx.partialSign(receiverKey);

console.log("\nSending transaction...");
const sig = await connection.sendRawTransaction(readTx.serialize());
console.log(`🚀 Transaction sent! Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);

await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
console.log("✅ Transaction confirmed!\n");

// Print final balances after transaction
console.log("Final Balances:");

// Add 1-minute delay before checking final balances
console.log("Waiting 60 seconds for transaction to fully confirm...");
await new Promise(resolve => setTimeout(resolve, 60000)); // 60 seconds delay

const finalSenderSol = await connection.getBalance(senderKey.publicKey);
const finalReceiverSol = await connection.getBalance(receiverKey.publicKey);
await printBalances("Sender (After)", senderKey.publicKey, senderTokenAccount.address);
await printBalances("Receiver (After)", receiverKey.publicKey, receiverTokenAccount.address);

// Calculate and display fee information
const senderSolChange = (finalSenderSol - initialSenderSol) / LAMPORTS_PER_SOL;
const receiverSolChange = (initialReceiverSol - finalReceiverSol) / LAMPORTS_PER_SOL;

console.log("\nTransaction Fee Analysis:");
console.log(`  Transaction fee: ${receiverSolChange} SOL`);
console.log(`  Paid by:`);
console.log(`    - Sender: ${senderSolChange >= 0 ? senderSolChange : 0} SOL`);
console.log(`    - Receiver: ${receiverSolChange} SOL`);
console.log(`  Total fees: ${senderSolChange + receiverSolChange} SOL`);

// Explorer: https://explorer.solana.com/tx/2iesXmvKQVPBkHPa95LeaYgr2NiNcnZ27Qee2BhwrL7CRC8P7XHozNKMK6ChQVjVQA7ymvPNUaaQXadzWYCHRzvT?cluster=devnet