use anchor_lang::prelude::*;

/// Mint - metadata for a token (decimals, supply, mint authority, etc.)
/// TokenAccount - holds token balance for a specific user and mint
/// AssociatedToken - program that creates a unique TokenAccount (ATA) for each (user, mint) pair
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{Offer, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct MakeOffer<'info> {
    // The user creating the offer (must sign the transaction)
    #[account(mut)]
    pub maker: Signer<'info>,

    // The mint for token A (the token being offered)
    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    // The mint for token B (the token wanted in return)
    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    // The maker's token account containing token A (will be debited)
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_token_account_a: InterfaceAccount<'info, TokenAccount>,
    
    // The escrow offer account that will store offer details
    #[account(
        init,
        payer = maker,
        space = ANCHOR_DISCRIMINATOR + Offer::INIT_SPACE,
        seeds = [b"offer", maker.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    // The vault token account that will hold the offered tokens
    #[account(
        init,
        payer = maker,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    // Required program accounts
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

/// ---handler---
/// This function is responsible for transferring tokens from a maker's account to a vault account
/// as part of creating an escrow offer
pub fn send_offered_tokens_to_vault(
    context: &Context<MakeOffer>,
    token_a_offered_amount: u64,
) -> Result<()> {
    // 1. Sets up the accounts needed for the transfer
    let transfer_accounts = TransferChecked {
        from: context.accounts.maker_token_account_a.to_account_info(),
        mint: context.accounts.token_mint_a.to_account_info(),
        to: context.accounts.vault.to_account_info(),
        authority: context.accounts.maker.to_account_info(),
    };
    // 2. Creates a Cross-Program Invocation (CPI) context
    // CPI is a mechanism that allows one Solana program to call another program
    // in this case, `token_program` is called
    let cpi_context = CpiContext::new(
        context.accounts.token_program.to_account_info(),
        transfer_accounts,
    );
    // 3. Executes the transfer with amount verification
    transfer_checked(
        cpi_context,
        token_a_offered_amount,
        context.accounts.token_mint_a.decimals,
    )
}
//-------------------------------------------------------
/// saves the offer details into a new Offer account on the Solana blockchain. 
pub fn save_offer(context: Context<MakeOffer>, id: u64, token_b_wanted_amount: u64) -> Result<()> {
    context.accounts.offer.set_inner(Offer {
        id,
        maker: context.accounts.maker.key(),
        token_mint_a: context.accounts.token_mint_a.key(),
        token_mint_b: context.accounts.token_mint_b.key(),
        token_b_wanted_amount,
        bump: context.bumps.offer,
    });
    Ok(())
}
