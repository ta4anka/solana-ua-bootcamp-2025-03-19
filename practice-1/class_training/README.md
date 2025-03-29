# Install

```bash
# Initialize a new Node.js project with default settings (creates package.json)
npm init -y

# Install required dependencies:
# - esrun: A fast TypeScript/ES module runner
# - @solana/web3.js: Solana JavaScript API
# - @solana-developers/helpers: Helper utilities for Solana development
npm i esrun @solana/web3.js @solana-developers/helpers 
```

```bash
# Executes Solana TS scripts instantly with esrun (Devnet/testing only)
npx esrun <file.ts>
```
