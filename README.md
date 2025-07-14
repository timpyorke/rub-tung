# PromptPay QR Generator

A Next.js application for generating Thai PromptPay QR codes.

## Features

- Generate QR codes for Thai phone numbers, tax IDs, and e-wallet IDs
- Support for fixed amounts or flexible amounts
- Download generated QR codes as PNG files
- Responsive design with modern UI
- TypeScript support

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a Thai phone number (e.g., 0812345678), tax ID, or e-wallet ID
2. Optionally enter an amount in Thai Baht
3. Click "Generate QR Code"
4. Download the QR code if needed

## How It Works

This application implements the EMV QR Code specification for PromptPay payments in Thailand. It generates QR codes that can be scanned by any Thai banking app or PromptPay-enabled payment system.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- CSS Modules
- QRCode.js library

## Deployment

This app can be easily deployed to:
- Vercel (recommended)
- Netlify
- Railway
- Any Node.js hosting platform

For Vercel deployment:
```bash
npm run build
```

## License

MIT License
