use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};

use crate::Offer;

#[derive(Accounts)]
pub struct CloseOffer<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        mut,
        close = maker,
        seeds = [b"offer", maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump,
        has_one = maker,
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn close_offer(context: Context<CloseOffer>) -> Result<()> {
    // Transfer tokens from vault back to maker
    let transfer_accounts = TransferChecked {
        from: context.accounts.vault.to_account_info(),
        mint: context.accounts.token_mint_a.to_account_info(),
        to: context.accounts.maker_token_account_a.to_account_info(),
        authority: context.accounts.offer.to_account_info(),
    };

    // Store the values before using them in seeds
    let maker_key = context.accounts.maker.key();
    let offer_id_bytes = context.accounts.offer.id.to_le_bytes();
    let offer_bump = context.accounts.offer.bump;

    let seeds = &[
        b"offer",
        maker_key.as_ref(),
        offer_id_bytes.as_ref(),
        &[offer_bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_context = CpiContext::new_with_signer(
        context.accounts.token_program.to_account_info(),
        transfer_accounts,
        signer,
    );

    transfer_checked(
        cpi_context,
        context.accounts.vault.amount,
        context.accounts.token_mint_a.decimals,
    )?;

    // Close the vault account
    let close_accounts = anchor_spl::token_interface::CloseAccount {
        account: context.accounts.vault.to_account_info(),
        destination: context.accounts.maker.to_account_info(),
        authority: context.accounts.offer.to_account_info(),
    };

    let cpi_context = CpiContext::new_with_signer(
        context.accounts.token_program.to_account_info(),
        close_accounts,
        signer,
    );

    close_account(cpi_context)?;

    Ok(())
}
