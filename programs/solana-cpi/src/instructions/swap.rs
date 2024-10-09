use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use anchor_spl::token_interface::{Mint, TokenAccount};
use raydium_cp_swap::{cpi, program::RaydiumCpSwap, states::{AmmConfig, ObservationState, PoolState}};

#[derive(Accounts)]
#[instruction(args: SwapArgs)]
pub struct SwapCtx<'info> {
    pub input_mint: InterfaceAccount<'info, Mint>,

    pub output_mint: InterfaceAccount<'info, Mint>,

    /// The program account of the pool in which the swap will be performed
    #[account(mut)]
    pub pool_state: AccountLoader<'info, PoolState>,

    #[account(
        mut,
        constraint = user_input_token_account.owner == args.user.key(),
    )]
    pub user_input_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_output_token_account.owner == args.user.key(),
    )]
    pub user_output_token_account: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: pool vault and lp mint authority
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,

    /// The factory state to read protocol fees
    #[account(address = pool_state.load()?.amm_config)]
    pub amm_config: Box<Account<'info, AmmConfig>>,

    /// The vault token account for input token
    #[account(
        mut,
        constraint = input_vault.key() == pool_state.load()?.token_0_vault || input_vault.key() == pool_state.load()?.token_1_vault
    )]
    pub input_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The vault token account for output token
    #[account(
        mut,
        constraint = output_vault.key() == pool_state.load()?.token_0_vault || output_vault.key() == pool_state.load()?.token_1_vault
    )]
    pub output_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The program account for the most recent oracle observation
    #[account(mut, address = pool_state.load()?.observation_key)]
    pub observation_state: AccountLoader<'info, ObservationState>,

    pub cp_swap_program: Program<'info, RaydiumCpSwap>,

    /// SPL program for input token transfers
    pub token_program: Program<'info, Token>,

    pub signer: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SwapArgs {
    pub user: Pubkey,
}

pub fn swap(ctx: Context<SwapCtx>, _args: SwapArgs) -> Result<()> {

    let cpi_accounts = cpi::accounts::Swap {
        payer: ctx.accounts.signer.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
        amm_config: ctx.accounts.amm_config.to_account_info(),
        pool_state: ctx.accounts.pool_state.to_account_info(),
        input_token_account: ctx.accounts.user_input_token_account.to_account_info(),
        output_token_account: ctx.accounts.user_output_token_account.to_account_info(),
        input_vault: ctx.accounts.input_vault.to_account_info(),
        output_vault: ctx.accounts.output_vault.to_account_info(),
        input_token_program: ctx.accounts.token_program.to_account_info(),
        output_token_program: ctx.accounts.token_program.to_account_info(),
        input_token_mint: ctx.accounts.input_mint.to_account_info(),
        output_token_mint: ctx.accounts.output_mint.to_account_info(),
        observation_state: ctx.accounts.observation_state.to_account_info(),
    };
    let cpi_context = CpiContext::new(ctx.accounts.cp_swap_program.to_account_info(), cpi_accounts);
    let result = cpi::swap_base_input(cpi_context, 1 * (10u64.pow(8)), 0);

    if result.is_err() {
        msg!("Swap failed");
        return Err(Error::SwapFailed.into());
    }

    msg!("Swap successful");
    ctx.accounts.user_input_token_account.reload()?;

    Ok(())
}

#[error_code]   
pub enum Error {
    #[msg("Swap failed")]
    SwapFailed
}