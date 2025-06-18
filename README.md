# Solana Token Creator

A professional web application for creating Solana SPL tokens with custom parameters and optional vanity addresses. Build your token with a beautiful UI and deploy it to the Solana blockchain with just a few clicks.

![Solana Token Creator](https://i.imgur.com/example-screenshot.png)

## 🚀 Features

- **Create SPL Tokens**: Easily create tokens on the Solana blockchain
- **Custom Parameters**: Set token name, symbol, decimals, and initial supply
- **Vanity Addresses**: Generate token addresses with custom prefixes or suffixes
- **Token Metadata**: Add descriptions, logos, and social links to your tokens
- **Authority Management**: Optionally revoke mint and freeze authorities
- **IPFS Integration**: Store token images and metadata on IPFS via Pinata
- **Wallet Connection**: Seamless integration with Phantom wallet
- **Network Support**: Works on devnet, testnet, and mainnet
- **Modern UI**: Beautiful, responsive interface with glass morphism design

## 📋 Prerequisites

- Node.js 16+ and npm
- Phantom wallet browser extension
- A Pinata account for IPFS storage (free tier works)
- Solana CLI tools installed (required for vanity address generation)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/solana-token-creator.git
   cd solana-token-creator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment configuration:
   ```bash
   cp env-config-example.txt .env.local
   ```

4. Configure your environment variables in `.env.local` (see Environment Configuration section)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## ⚙️ Environment Configuration

The application is configured through environment variables in the `.env.local` file. Here's what each variable does:

### Required Configuration

```
# Solana Network Configuration
# Options: 'devnet', 'testnet', or 'mainnet-beta'
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Pinata IPFS Configuration (required for image and metadata storage)
PINATA_JWT=your_pinata_jwt_here
NEXT_PUBLIC_GATEWAY_URL=your_gateway_domain.mypinata.cloud
```

### Optional Configuration

```
# Custom RPC Endpoints (recommended for mainnet to avoid rate limits)
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_TESTNET_RPC_URL=https://api.testnet.solana.com
NEXT_PUBLIC_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com

# UI Configuration
NEXT_PUBLIC_APP_NAME=Solana Token Creator
NEXT_PUBLIC_APP_DESCRIPTION=Create Solana SPL tokens with custom parameters and vanity addresses

# Feature Flags
NEXT_PUBLIC_ENABLE_VANITY_ADDRESSES=true
NEXT_PUBLIC_ENABLE_METADATA=true
```

### Important Notes

- For **mainnet** usage, we strongly recommend providing your own RPC endpoint in `NEXT_PUBLIC_MAINNET_RPC_URL` to avoid rate limits. You can get free RPC endpoints from providers like [Helius](https://helius.dev) or [QuickNode](https://quicknode.com).
- The Pinata JWT token can be obtained from your [Pinata Dashboard](https://app.pinata.cloud/keys) by creating a new API key with upload permissions.

## 💡 How to Use

### Creating a Basic Token

1. Connect your Phantom wallet using the "Connect Wallet" button
2. Fill in the required token details:
   - Token Name (e.g., "My Token")
   - Token Symbol (e.g., "MTK")
   - Decimals (typically 6 or 9)
   - Initial Supply (e.g., "1000000")
3. Optionally add a description and upload a logo image
4. Choose whether to revoke mint/freeze authorities
5. Click "Create Token on Solana"
6. Approve the transaction in your Phantom wallet
7. Once confirmed, your token will be created and visible in your wallet

### Creating a Token with a Vanity Address

1. Enable the "Vanity Address" toggle
2. Enter a prefix (start of address) and/or suffix (end of address)
   - Example: prefix "COOL" will generate an address starting with "COOL"
   - Example: suffix "TOKEN" will generate an address ending with "TOKEN"
3. Choose whether to use case sensitivity
4. Click "Generate Vanity Address"
5. Once the address is generated, proceed with token creation
6. Your token will use the generated vanity address

> **Note**: The vanity address generator requires Solana CLI tools to be installed on your computer. You can install them by following the official instructions at [https://docs.solanalabs.com/cli/install](https://docs.solanalabs.com/cli/install).

### Adding Metadata and Social Links

1. Add a description for your token
2. Upload a logo image by clicking "Choose File" and then "Upload to IPFS"
3. Click "Show Links" to expand the social links section
4. Add your website, Twitter, Discord, and/or Telegram links
5. This information will be stored in your token's metadata

## 🧩 Project Structure

The application is built with a modular component structure:

```
token-creator/
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── token-creator/ # Token creator components
│   │   ├── TokenCreator.tsx  # Main component
│   │   └── WalletProvider.tsx  # Wallet connection provider
│   └── utils/             # Utility functions
│       ├── token/         # Token-related utilities
│       ├── tokenMetadata.ts  # Metadata utilities
│       └── printaApi.ts   # IPFS upload utilities
├── public/               # Static assets
└── .env.local            # Environment configuration
```

## 📝 Token Metadata Standards

The tokens created follow the Metaplex Token Metadata standard, ensuring compatibility with most Solana wallets and marketplaces. The metadata JSON structure:

```json
{
  "name": "My Token",
  "symbol": "MTK",
  "description": "A description of my token",
  "image": "ipfs://your-ipfs-image-cid",
  "website": "https://example.com",
  "twitter": "https://twitter.com/example",
  "discord": "https://discord.gg/example",
  "telegram": "https://t.me/example",
  "createdOn": "2023-06-18T12:34:56.789Z"
}
```

## 🔧 Advanced Configuration

### Custom Created-On Field

You can customize the "createdOn" field in your token's metadata:

1. Check the "Custom 'createdOn' Field" checkbox
2. Enter a custom value, which could be a URL, timestamp, or any text
3. This can be useful for referencing an external website, origin, or specific date

### Direct Metadata URL

If you already have a hosted metadata JSON file:

1. Check the "Use Direct Metadata URL" checkbox
2. Enter the URL to your metadata JSON
3. The application will use this URL directly instead of generating new metadata

## 🌐 Network Selection

The application can operate on three Solana networks:

- **Devnet**: For development and testing (default)
- **Testnet**: For pre-production testing
- **Mainnet**: For production tokens

Select the appropriate network in your `.env.local` file.

## 📦 Building for Production

```bash
npm run build
npm start
```

## 📄 License

MIT

## 🙏 Acknowledgements

- [Solana](https://solana.com) - The blockchain platform
- [Phantom](https://phantom.app) - Wallet provider
- [Pinata](https://pinata.cloud) - IPFS storage
- [Next.js](https://nextjs.org) - The React framework used
- [Tailwind CSS](https://tailwindcss.com) - For styling
