import "dotenv/config";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, Connection, sendAndConfirmTransaction, TransactionInstruction } from "@solana/web3.js";
// 1) Load private key from environment variables and validate its presence
let privateKey = process.env.SECRET_KEY;
if (!privateKey) {
    console.log("No private key provided!");
    process.exit(1);
}
// 2) Convert the private key string to Uint8Array and create keypair
const asArray = Uint8Array.from(JSON.parse(privateKey));
const keypair = Keypair.fromSecretKey(asArray);
// 3) Establish connection to Solana devnet and define recipient address
const connection = new Connection(clusterApiUrl("devnet"));
const recipient = new PublicKey("3ZPcth6Uk1JrxhhzQr9Q2diDrjYDdAqTWhdcrDPENtha");
// 4) Create a new transaction and add transfer instruction
console.log(`💸 Attempting to send 0.01 SOL to ${recipient.toBase58()}...`);
const transaction = new Transaction();
const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: keypair.publicKey,
    toPubkey: recipient,
    lamports: 0.01 * LAMPORTS_PER_SOL,
});
transaction.add(sendSolInstruction);
// 5) Add memo instruction to the transaction
// Get this address from https://spl.solana.com/memo
const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const memoText = "Hello from Solana!";
const addMemoInstruction = new TransactionInstruction({
    keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }],
    data: Buffer.from(memoText, "utf-8"),
    programId: memoProgram,
});
transaction.add(addMemoInstruction);
console.log(`📝 memo is: ${memoText}`);
// 6) Send and confirm the transaction
const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
console.log(`✅ Transaction confirmed, signature: ${signature}\n`)
// 7) Example transaction link for reference
// without memo https://explorer.solana.com/tx/3dwtsRhciRszAbn2GWCscL1pTpu2BXEkvuPRaq4rihGxSZQE6YAbB1yqDsroNo8psWVBq1QYPBx9NkGigL6YCu46?cluster=devnet
// with memo https://explorer.solana.com/tx/48LtNXQKZ22urrqxgQ9iU6RnkVKSGME2FUzHPqpunDiJ9U2Zn48E8Gv3vEvxWBdXaii24NynhuswaBiJENUYUEBp?cluster=devnet