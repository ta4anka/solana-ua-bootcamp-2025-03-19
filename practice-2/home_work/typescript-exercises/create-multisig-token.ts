import "dotenv/config";
import { getExplorerLink } from "@solana-developers/helpers";
import { Keypair, Connection, clusterApiUrl, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMint, createMultisig, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const loadKeypair = (envVar: string) => {
    const privateKey = process.env[envVar];
    if (!privateKey) {
        console.log(`No ${envVar} provided!`);
        process.exit(1);
    }
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKey)));
};

const payer = loadKeypair("PAYER_SECRET_KEY");
const signer1 = loadKeypair("SIGNER1_SECRET_KEY");
const signer2 = loadKeypair("SIGNER2_SECRET_KEY");

const connection = new Connection(clusterApiUrl("devnet"));

console.log(`🔑 Payer public key: ${payer.publicKey.toBase58()}`);
console.log(`🔑 Signer 1 public key: ${signer1.publicKey.toBase58()}`);
console.log(`🔑 Signer 2 public key: ${signer2.publicKey.toBase58()}\n`);

// 1) Create 2-of-2 multisig
const multisig = await createMultisig(
    connection,
    payer,
    [signer1.publicKey, signer2.publicKey],
    2 // Number of required signatures
);
console.log(`✅ Multisig created: ${getExplorerLink("address", multisig.toBase58(), "devnet")}\n`);

// 2) Create token mint with multisig as mint authority
const tokenMint = await createMint(
    connection,
    payer,
    multisig, // Mint authority = multisig address
    null,     // No freeze authority
    2         // Decimals
);
console.log(`✅ Token mint created: ${getExplorerLink("address", tokenMint.toBase58(), "devnet")}\n`);

// 3) Create token account for recipient
const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    signer1.publicKey
);
console.log(`✅ Token account created: ${getExplorerLink("address", tokenAccount.address.toBase58(), "devnet")}\n`);

// 4) Mint tokens (requires both signatures)
const amount = 10 * Math.pow(10, 2); // 10 tokens accounting for decimals=2
console.log(`Minting ${amount / 100} tokens to ${tokenAccount.address.toBase58()}`);

const mintSignature = await mintTo(
    connection,
    payer,
    tokenMint,
    tokenAccount.address,
    multisig,
    amount,
    [signer1, signer2]
);

console.log(`✅ Tokens minted! Signature: ${mintSignature}`);
console.log(`   Explorer: https://explorer.solana.com/tx/${mintSignature}?cluster=devnet\n`);

