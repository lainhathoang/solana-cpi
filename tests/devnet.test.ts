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

  const token0 = new anchor.web3.PublicKey(
    "E9FtswyfWvjPKG2eJvp6tcxVQGc6P7ZSpo3NvMtnqqtK"
  );
  const token1 = spl.NATIVE_MINT;

  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const programId = new anchor.web3.PublicKey(
    "BbBXo1vyGPcUvZP2KasdJ7peobAU4zq5snUAxZYmQyS" // Devnet program ID from Anchor.toml
  );
  const program = new anchor.Program(idl as SolanaCpi);

  const cpSwapProgram = new PublicKey(
    "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
  );

  const ammConfig = new anchor.web3.PublicKey(
    "9zSzfkYy6awexsHvmggeH36pfVUdDGyCcwmjT3AQPBj6"
  );

  const poolState = new PublicKey(
    "99AM9YAPUGUAvLwjQYVXE2UgkBGQGRv8rJD7LfrHqUiy"
  );

  const creatorToken0 = getAssociatedTokenAddressSync(
    token0,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );
  const creatorToken1 = getAssociatedTokenAddressSync(
    token1,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  const authority = new PublicKey(
    "7rQ1QFNosMkUCuh7Z7fPbTHvh73b68sQYdirycEzJVuw"
  );

  try {
    const tx = await program.methods
      .swap({ user: wallet.publicKey })
      .accountsStrict({
        inputMint: token1,
        outputMint: token0,
        poolState,
        userInputTokenAccount: creatorToken1,
        userOutputTokenAccount: creatorToken0,
        authority,
        ammConfig,
        inputVault: new PublicKey(
          "DAvv1Y6i1a5pdhNtE1KBMSjtyT4B27LTtnQG3kzZMgcR"
        ),
        outputVault: new PublicKey(
          "6yKfU5VdSwVaDSGkkuz7r1KPHt2tC3J6uJzqrnk7GuZw"
        ),
        observationState: new PublicKey(
          "DpucbP5AhZGwTHAARLpysHVU18FTJcxu8X4QCPUBiof3"
        ),
        cpSwapProgram: new PublicKey(
          "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        ),
        tokenProgram: TOKEN_PROGRAM_ID,
        signer: wallet.publicKey,
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
      ])
      .rpc({ commitment: "confirmed", skipPreflight: false });

    console.log("Transaction signature: ", tx);
  } catch (error) {
    console.error("Error: ", error);
  }
})();
