
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

// Program ID for the escrow smart contract
declare_id!("4KQEPJFeRBfNuoSfecPXeJXEthzzKPfegpD887JYYhv6");

// Main program module for the escrow system
#[program]
pub mod escrow {
    use super::*;

    // Function to create a new token swap offer
    // id: unique identifier for the offer
    // token_a_offered_amount: amount of token A being offered
    // token_b_wanted_amount: amount of token B wanted in return
    pub fn make_offer(
        context: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_wanted_amount: u64,
    ) -> Result<()> {
        // First, transfer the offered tokens to the escrow vault
        instructions::make_offer::send_offered_tokens_to_vault(&context, token_a_offered_amount)?;
        // Then, save the offer details to the blockchain
        instructions::make_offer::save_offer(context, id, token_b_wanted_amount)
    }
}
