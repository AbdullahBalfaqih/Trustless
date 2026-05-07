import * as anchor from "@coral-xyz/anchor";
import { Buffer } from "buffer";

// إعداد Buffer بشكل عالمي لضمان عمل Anchor في المتصفح
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress 
} from "@solana/spl-token";
import idl from "../idl (1).json";

const { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = anchor.web3;

// الـ Program ID الخاص بك
export const PROGRAM_ID = new anchor.web3.PublicKey("53JwBJV2C4wLfYVyiG1U8rdcYafEBchhLQegg7JmS5iS");

export const getProgram = (provider: anchor.AnchorProvider) => {
  if (!provider || !provider.wallet) {
    throw new Error("Wallet not connected");
  }

  try {
    // ترقية الـ IDL برمجياً وحقن الـ Discriminators يدوياً لتجاوز أخطاء التشفير في المتصفح
    const idlCopy = JSON.parse(JSON.stringify(idl));
    if (!idlCopy.types) idlCopy.types = [];
    
    if (idlCopy.accounts) {
      idlCopy.accounts.forEach((acc: any) => {
        if (acc.name === "EscrowState") {
          acc.discriminator = [19, 90, 148, 111, 55, 130, 229, 108];
        }

        if (acc.type && !idlCopy.types.find((t: any) => t.name === acc.name)) {
          idlCopy.types.push({ name: acc.name, type: acc.type });
        }
      });
    }

    // حقن الـ Discriminators للتعليمات (Instructions)
    if (idlCopy.instructions) {
      idlCopy.instructions.forEach((ix: any) => {
        if (ix.name === "initializeEscrow") {
          ix.discriminator = [243, 160, 77, 153, 11, 92, 48, 209];
        } else if (ix.name === "releasePayment") {
          ix.discriminator = [24, 34, 191, 86, 145, 160, 183, 233];
        } else if (ix.name === "resolveDispute") {
          ix.discriminator = [231, 6, 202, 6, 96, 103, 12, 230];
        }
      });
    }

    const finalIdl = JSON.parse(JSON.stringify(idlCopy).replace(/"publicKey"/g, '"pubkey"'));
    finalIdl.address = PROGRAM_ID.toBase58();

    return new anchor.Program(finalIdl as anchor.Idl, provider);
  } catch (err) {
    console.error("GET_PROGRAM CRITICAL ERROR:", err);
    throw err;
  }
};

export const getEscrowPDA = (employer: PublicKey) => {
  try {
    console.log("PDA GENERATION - Employer:", employer?.toBase58());
    if (typeof Buffer === 'undefined') {
       console.error("Buffer is not defined in this environment!");
    }
    
    return PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), employer.toBuffer()],
      PROGRAM_ID
    );
  } catch (err) {
    console.error("Failed to generate PDA:", err);
    throw err;
  }
};

// دالة لجلب حالة الضمان من البلوكشين
export const fetchEscrowState = async (program: anchor.Program, employer: PublicKey) => {
  try {
    const [escrowPDA] = getEscrowPDA(employer);
    const state = await program.account.escrowState.fetch(escrowPDA);
    return state;
  } catch (err) {
    console.error("Error fetching escrow state:", err);
    return null;
  }
};
