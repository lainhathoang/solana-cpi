use anchor_lang::prelude::*;

mod instructions;

use instructions::*;

declare_id!("BbBXo1vyGPcUvZP2KasdJ7peobAU4zq5snUAxZYmQyS");

#[program]
pub mod solana_cpi {
    use super::*;

    pub fn initialize(ctx: Context<HelloCtx>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn swap(ctx: Context<SwapCtx>, args: SwapArgs) -> Result<()> {
        instructions::swap(ctx, args)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct HelloCtx {}
