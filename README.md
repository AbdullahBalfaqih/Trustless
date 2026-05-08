# Trustless: A Sovereign Infrastructure for Freelance Economy and Private Escrow

## Overview

Trustless is a decentralized freelance marketplace and financial settlement layer built on the Solana Mainnet. The platform is designed to address the fundamental issues of trust, intermediary risk, and data privacy that plague the modern gig economy. By integrating Palm USD (PUSD) for stable on-chain payments, QVAC for local-first artificial intelligence, and the Umbra SDK for transactional privacy, Trustless provides a comprehensive ecosystem where professional work and financial value can be exchanged without centralized oversight or data exploitation.

## The Core Problem

The global freelance industry currently relies on centralized intermediaries that impose high commission fees, delay payment releases, and often lack robust dispute resolution for international users. Furthermore, existing AI-assisted tools for job optimization and management rely on cloud-based processing, which forces users to upload sensitive project details and intellectual property to centralized servers, creating significant privacy risks.

## Our Solution

Trustless reimagines this flow by combining three pillars of sovereign technology:

## 🚀 Sovereign AI & PUSD Integration

Trustless is a high-performance, local-first talent hub built to demonstrate the power of **Sovereign Intelligence** and **Stable Payments**.

### 🧠 QVAC AI Engine (On-Device)
We have integrated the **Tether QVAC SDK** to provide a multi-modal AI experience that respects user privacy. Unlike traditional platforms, our AI features run **locally on your hardware** using the Node.js runtime and Vulkan-accelerated GPU inference.
- **Local LLM:** Professionalizes job descriptions locally via `@qvac/llm-llamacpp`.
- **Sovereign Translation:** Uses `@qvac/translation-nmtcpp` for private, offline NMT.
- **Local OCR:** Scans CVs and documents without cloud processing via `@qvac/ocr-onnx`.

### 💸 PUSD Escrow System
Security is handled on-chain via **Solana**. We utilize **PUSD (Palm USD)** for our escrow contracts to ensure:
- **Stability:** Protection against market volatility.
- **Trustless Execution:** Funds are released only upon milestone completion.
- **Instant Settlements:** Global payments at the speed of Solana.

## 🛠️ Local Setup
To see the Sovereign AI in action, you **must** run the project locally:
1. `npm install`
2. `npm run dev`
3. Ensure your local machine supports Vulkan/GPU acceleration for the best QVAC performance.

### 3. Transactional Privacy via Umbra SDK
Financial privacy is a prerequisite for professional business operations. Trustless integrates the Umbra SDK to offer confidential transfers. By utilizing stealth addresses and zero-knowledge primitives, the platform allows for the release of payments in a way that shields the freelancer's wallet history and overall balance from the employer and public blockchain explorers, while still maintaining compliance and verifiability for the parties involved.

## Technical Architecture

The application is built with a modern, high-performance stack designed for the Solana ecosystem:

- **Blockchain:** Solana Mainnet-beta.
- **Smart Contracts:** Developed using the Anchor Framework (Rust).
- **Financial Asset:** PUSD (Palm USD) for stable value preservation.
- **AI Layer:** QVAC SDK for local-first LLM inference (Llama 3.2 1B).
- **Privacy Layer:** Umbra SDK for confidential on-chain settlements.
- **Frontend:** Next.js 16 with a customized "Cyber-Luxury" design system.
- **State Management:** Supabase for real-time indexing of job metadata and applications.

## Key Features

- **Automated Escrow:** Secure locking of PUSD funds upon project initiation.
- **Local AI Analysis:** Sub-second job description optimization without cloud dependency.
- **Private Release:** Shielded payment disbursement to protect freelancer financial data.
- **Sovereign UI:** A high-fidelity, responsive interface designed for professional use.
- **Dispute Mediation:** Built-in logic for multi-signature or arbitrator-based fund resolution.

## Installation and Setup

To run the project locally for development or testing:

1. Clone the repository to your local environment.
2. Install dependencies using:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Configure your environment variables in `.env.local`:
   - `NEXT_PUBLIC_RPC_URL`: Your Solana Mainnet RPC endpoint.
   - `NEXT_PUBLIC_PUSD_MINT`: The PUSD mint address on Solana.
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Hackathon Compliance

### QVAC Integration
This project utilizes the QVAC SDK to perform on-device inference for job description expansion. This demonstrates a core use case for sovereign intelligence where professional data privacy is paramount.

### Umbra Integration
The platform implements Umbra's privacy primitives during the payment release phase. By generating stealth addresses for fund disbursement, the project addresses the critical need for financial privacy in the gig economy.

## Conclusion

Trustless is not just a marketplace; it is a demonstration of how decentralized technology can return agency to individual professionals. By removing the need for trust in intermediaries and replacing it with verifiable code and local intelligence, we are building the foundation for a truly global and private workforce.
