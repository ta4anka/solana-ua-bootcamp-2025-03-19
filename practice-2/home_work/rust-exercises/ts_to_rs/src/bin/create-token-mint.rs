use anyhow::{Context, Result};
use dotenvy::dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    program_pack::Pack,
    signature::{Keypair, Signer},
    system_instruction,
    transaction::Transaction,
};
use spl_token::{ID as TOKEN_PROGRAM_ID, instruction::initialize_mint, state::Mint};
use std::env;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let private_key_json = env::var("SECRET_KEY").context("SECRET_KEY must be set")?;
    let private_key_bytes: Vec<u8> = serde_json::from_str(&private_key_json)?;
    let payer = Keypair::from_bytes(&private_key_bytes)?;
    println!("Our public key: {}", payer.pubkey());

    let client = RpcClient::new("https://api.devnet.solana.com");

    let mint_keypair = Keypair::new();
    let decimals = 2;

    let space = Mint::LEN;
    let create_account_ix = system_instruction::create_account(
        &payer.pubkey(),
        &mint_keypair.pubkey(),
        client.get_minimum_balance_for_rent_exemption(space)?,
        space as u64,
        &TOKEN_PROGRAM_ID,
    );

    let initialize_mint_ix = initialize_mint(
        &TOKEN_PROGRAM_ID,
        &mint_keypair.pubkey(),
        &payer.pubkey(),
        None,
        decimals,
    )?;

    let mut tx = Transaction::new_with_payer(
        &[create_account_ix, initialize_mint_ix],
        Some(&payer.pubkey()),
    );

    let recent_blockhash = client.get_latest_blockhash()?;
    tx.sign(&[&payer, &mint_keypair], recent_blockhash);

    let signature = client.send_and_confirm_transaction(&tx)?;

    println!("Token Mint: {}", mint_keypair.pubkey());
    println!(
        "Explorer: https://explorer.solana.com/address/{}?cluster=devnet",
        mint_keypair.pubkey()
    );
    println!("Tx signature: {}", signature);

    Ok(())
}
