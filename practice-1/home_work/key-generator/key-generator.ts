import { Keypair } from "@solana/web3.js";

function findKeyWithPrefix(prefix = "anza") {
  prefix = prefix.toLowerCase();
  console.log(`Searching for address starting with "${prefix}"...`);

  const startTime = Date.now();
  let attempts = 0;

  while (true) {
    const keypair = Keypair.generate();
    const address = keypair.publicKey.toBase58().toLowerCase();
    attempts++;

    if (address.startsWith(prefix)) {
      const endTime = Date.now();
      const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`Found in ${attempts} attempts!`);
      console.log(`Time taken: ${elapsedTime} seconds`);
      console.log(`Public address: ${address}`);
      console.log(`Private key: [${keypair.secretKey}]`);
      console.log(`✅ Finished!\n`);
      
      return { keypair, address, attempts, privateKey: keypair.secretKey, elapsedTime };
    }
  }
}

findKeyWithPrefix();
