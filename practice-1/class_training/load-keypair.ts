import "dotenv/config";
import { Keypair } from "@solana/web3.js";

let privateKey = process.env.SECRET_KEY;
if (!privateKey) {
  console.log("No private key provided!");
  process.exit(1);
}
const asArray = Uint8Array.from(JSON.parse(privateKey));
const keypair = Keypair.fromSecretKey(asArray);

console.log(`The public key is: ${keypair.publicKey.toBase58()}`);