use anchor_lang::prelude::*;

mod errors;
use errors::ErrorCode;

declare_id!("646xu1j5tJ56w1hiPmdjHo2KV4hXg4kCC7Xr3aRmDU4V");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,
    #[max_len(50)]
    pub color: String,
    pub authority: Option<Pubkey>,
}

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        seeds = [b"favorites", user.key().as_ref()],
        bump,
    )]
    pub favorites: Account<'info, Favorites>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetFavoritesWithAuthority<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        seeds = [b"favorites", user.key().as_ref()],
        bump,
    )]
    pub favorites: Account<'info, Favorites>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"favorites", owner.key().as_ref()],
        bump,
        constraint = user.key() == favorites.authority.unwrap_or(owner.key()) @ ErrorCode::Unauthorized
    )]
    pub favorites: Account<'info, Favorites>,

    /// CHECK: This is used only for PDA derivation and authorization check
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SetAuthority<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"favorites", user.key().as_ref()],
        bump,
        constraint = user.key() == favorites.to_account_info().key() @ ErrorCode::Unauthorized
    )]
    pub favorites: Account<'info, Favorites>,
}

#[program]
pub mod favorites {
    use super::*;
    pub fn set_favorites(context: Context<SetFavorites>, number: u64, color: String) -> Result<()> {
        let user_public_key = context.accounts.user.key();
        msg!("Greetings from {}", context.program_id);
        msg!(
            "User {}'s favorite number is {} and favorite color is: {}",
            user_public_key,
            number,
            color
        );

        context.accounts.favorites.set_inner(Favorites { 
            number, 
            color,
            authority: None,
        });
        Ok(())
    }

    pub fn set_favorites_with_authority(
        context: Context<SetFavoritesWithAuthority>, 
        number: u64, 
        color: String,
        authority: Option<Pubkey>
    ) -> Result<()> {
        let user_public_key = context.accounts.user.key();
        msg!(
            "Setting preferences for {}: number={}, color={}, authority={:?}",
            user_public_key,
            number,
            color,
            authority
        );

        context.accounts.favorites.set_inner(Favorites { 
            number, 
            color,
            authority,
        });
        Ok(())
    }

    pub fn update_favorites(
        context: Context<UpdateFavorites>,
        number: Option<u64>,
        color: Option<String>,
    ) -> Result<()> {
        let user_public_key = context.accounts.user.key();
        msg!("Updating favorites for user {}", user_public_key);

        let favorites = &mut context.accounts.favorites;

        if let Some(new_number) = number {
            msg!("Updating favorite number to: {}", new_number);
            favorites.number = new_number;
        }

        if let Some(new_color) = color {
            msg!("Updating favorite color to: {}", new_color);
            favorites.color = new_color;
        }

        Ok(())
    }

    pub fn set_authority(
        context: Context<SetAuthority>,
        new_authority: Option<Pubkey>,
    ) -> Result<()> {
        let favorites = &mut context.accounts.favorites;
        msg!("Setting new authority: {:?}",new_authority);
        favorites.authority = new_authority;
        Ok(())
    }
}
