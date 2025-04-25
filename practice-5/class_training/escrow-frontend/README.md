# Solana Escrow Frontend

Deployed version could be found on [link](solana-bootcamp-amber.vercel.app)

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

1. Clone the repository:

```bash
git clone https://github.com/yourusername/solana-escrow.git
cd solana-escrow
```

2. Install dependencies using either yarn or npm:

Using yarn:

```bash
yarn install
```

Using npm:

```bash
npm install
```

## Running the Project

1. Start the development server:

Using yarn:

```bash
yarn dev
```

Using npm:

```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
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

Using yarn:

```bash
yarn build
yarn start
```

Using npm:

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Solana Foundation for the web3.js library
- Coral-xyz team for the Anchor framework
- Solana community for support and resources

## Support

For support, please open an issue in the GitHub repository or reach out to the maintainers.
