use anchor_lang::prelude::*;

mod instructions;

use instructions::*;

declare_id!("61HQ6q3pczwKZK1d2bJTqKVkiX5bxLuEHjKUv9rxeXMT");

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
