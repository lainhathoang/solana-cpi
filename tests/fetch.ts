import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import * as fs from "fs";
import idl from "../target/idl/solana_cpi.json";
import { SolanaCpi } from "../target/types/solana_cpi";
import {
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

(async function main() {
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com"
  );

  const keypair = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        fs.readFileSync("/Users/lainhathoang/.config/solana/id.json", "utf-8")
      )
    )
  );

  const wallet = new anchor.Wallet(keypair);
  console.log("Using wallet: ", wallet.publicKey.toBase58());

  // token0 : DONE token
  // token1: WSOL - SOL
  const token0 = new anchor.web3.PublicKey(
    "E9FtswyfWvjPKG2eJvp6tcxVQGc6P7ZSpo3NvMtnqqtK"
  );
  const token1 = spl.NATIVE_MINT;

  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const programId = new anchor.web3.PublicKey(
    "61HQ6q3pczwKZK1d2bJTqKVkiX5bxLuEHjKUv9rxeXMT" // Devnet program ID from Anchor.toml
  );
  const program = new anchor.Program(idl as SolanaCpi);


})();
