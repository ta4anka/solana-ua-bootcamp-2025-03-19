pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("9BS84xNpE1MurcvcZZJ3QBECfw6pX2xftVVWwyJawdfn");

#[program]
pub mod escrow_v2 {
    use super::*;

    pub fn make_offer(
        context: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_wanted_amount: u64,
    ) -> Result<()> {
        approve_tokens(&context, token_a_offered_amount)?;
        save_offer(context, id, token_a_offered_amount, token_b_wanted_amount)
    }

    pub fn take_offer(context: Context<TakeOffer>) -> Result<()> {
        send_wanted_tokens_to_maker(&context)?;
        transfer_approved_tokens(context)
    }
}
