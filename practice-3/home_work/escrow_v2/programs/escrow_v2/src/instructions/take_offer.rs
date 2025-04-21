use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{error::ErrorCode, state::Offer};

#[derive(Accounts)]
pub struct TakeOffer<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(mut)]
    pub maker: SystemAccount<'info>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_b,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        close = maker,
        has_one = maker,
        has_one = token_mint_a,
        has_one = token_mint_b,
    )]
    pub offer: Account<'info, Offer>,


    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn send_wanted_tokens_to_maker(ctx: &Context<TakeOffer>) -> Result<()> {
    let transfer_accounts = TransferChecked {
        from: ctx.accounts.taker_token_account_b.to_account_info(),
        mint: ctx.accounts.token_mint_b.to_account_info(),
        to: ctx.accounts.maker_token_account_b.to_account_info(),
        authority: ctx.accounts.taker.to_account_info(),
    };

    let cpi_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );

    transfer_checked(
        cpi_context,
        ctx.accounts.offer.token_b_wanted_amount,
        ctx.accounts.token_mint_b.decimals,
    )
}

pub fn transfer_approved_tokens(ctx: Context<TakeOffer>) -> Result<()> {
   
    if ctx.accounts.maker_token_account_a.amount < ctx.accounts.offer.token_a_offered_amount {
        return Err(ErrorCode::InsufficientTokenBalance.into());
    }

    let signer_seeds: [&[&[u8]]; 1] = [&[
        b"offer",
        ctx.accounts.maker.to_account_info().key.as_ref(),
        &ctx.accounts.offer.id.to_le_bytes()[..],
        &[ctx.accounts.offer.bump],
    ]];

    let transfer_accounts = TransferChecked {
        from: ctx.accounts.maker_token_account_a.to_account_info(),
        mint: ctx.accounts.token_mint_a.to_account_info(),
        to: ctx.accounts.taker_token_account_a.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
    };

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
        &signer_seeds,
    );

    transfer_checked(
        cpi_context,
        ctx.accounts.offer.token_a_offered_amount,
        ctx.accounts.token_mint_a.decimals,
    )
}
