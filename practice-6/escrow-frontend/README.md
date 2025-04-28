# Solana Escrow Frontend

A modern React-based frontend application for interacting with Solana Escrow smart contracts. This project demonstrates how to build a user-friendly interface for creating and taking offers using SPL Tokens on the Solana blockchain.

## Features

- 🔐 Wallet Integration with multiple wallet providers (Phantom, Solflare, etc.)
- 💱 Create escrow offers with SPL tokens
- 📋 View and manage your created offers
- 🔄 Take open offers from other users
- 📱 Responsive and modern UI using Tailwind CSS and shadcn
- 📊 Pagination for better performance

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- A Solana wallet (e.g., Phantom, Solflare)

## Installation

Install dependencies using either yarn or npm:

```bash
yarn install / npm install
```

## Running the Project

- Start the development server:

```bash
yarn dev / npm run dev
```

- Open your browser and navigate to `http://localhost:5173/`

## Project Structure

```shell
src/
├── components/         # React components
├── pages/             # Page components
├── solana-service/    # Solana interaction logic
├── types/             # TypeScript type definitions
└── lib/              # Utility functions
```

## Technical Details

### Solana Integration

This project serves as an example of how to set up a frontend application that interacts with the Solana blockchain. It demonstrates:

- Connection to Solana RPC providers
- Wallet integration using `@solana/wallet-adapter-react-ui`
- SPL Token interactions
- Transaction building and signing
- Program account management

### Smart Contract Interaction

The frontend interacts with a Solana Escrow program that enables:

- Creating offers with any SPL Token
- Taking offers by providing the requested tokens
- Managing offer lifecycle (create, take)

### Key Dependencies

- `@solana/web3.js`: Core Solana web3 functionality
- `@solana/wallet-adapter-react`: React hooks for Solana wallet integration
- `@solana/wallet-adapter-react-ui`: UI components for wallet connection
- `@solana/spl-token`: SPL Token program interactions
- `@coral-xyz/anchor`: Framework for Solana program interaction

### Building for Production

```bash
yarn build / npm run build
yarn start / npm start
```

## License

Special thanks to [@Solniechniy](https://github.com/Solniechniy) for the original [solana-bootcamp](https://github.com/Solniechniy/solana-bootcamp-empty).  
This version includes custom changes and updates.

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Solana Foundation for the web3.js library
- Coral-xyz team for the Anchor framework
- Solana community for support and resources
