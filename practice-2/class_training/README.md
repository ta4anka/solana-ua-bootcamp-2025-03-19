# Class Practice 2

## Tasks

- [Task 2.1-2.2: Send SOL and Memo](send-sol.ts)
- [Task 2.3: Create a Token Mint](create-token-mint.ts)
- [Task 2.4: Create a Token Account](create-token-account.ts)
- [Task 2.5: Mint Tokens](mint-tokens.ts)
- [Task 2.6: Create Token Metadata](create-token-metadata.ts)

## Pre-installation

```bash
# Initialize a new Node.js project with default settings (creates package.json)
npm init -y

# Install required dependencies:
# - esrun: A fast TypeScript/ES module runner
# - @solana/web3.js: Solana JavaScript API
# - @solana-developers/helpers: Helper utilities for Solana development
npm i esrun @solana/web3.js @solana-developers/helpers 

# Additional installations:
# For Task 2.3 (Create a Token Mint)
npm install @solana/spl-token

# For Task 2.6 (Create Token Metadata)
npm install "@metaplex-foundation/mpl-token-metadata@2"
```

## Usage

```bash
# Executes Solana TS scripts instantly with esrun (Devnet/testing only)
npx esrun <file.ts>
```

## Resources

- [Pinata is a cloud-based IPFS pinning service](https://app.pinata.cloud/)
- [Solana Explorer](https://explorer.solana.com)
