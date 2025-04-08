use anyhow::{Context, Result};
use dotenvy::dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use spl_token::{ID as TOKEN_PROGRAM_ID, instruction::mint_to};
use std::{env, str::FromStr};

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let private_key_json = env::var("SECRET_KEY").context("SECRET_KEY must be set")?;
    let private_key_bytes: Vec<u8> = serde_json::from_str(&private_key_json)?;
    let payer = Keypair::from_bytes(&private_key_bytes)?;
    println!("Our public key: {}", payer.pubkey());

    let client = RpcClient::new("https://api.devnet.solana.com");

    let token_mint = Pubkey::from_str("45frjMuy6BitU3wbKmgSDRkQZq6agrP8TpnuMcCJpuL1")?;
    let token_account = Pubkey::from_str("9LPgihhChZStkQJjRiENF1AfViA9L26xNhppw1Uhz2Tu")?;

    let raw_amount = 2000; // Will mint 10.00 tokens (decimals=2)
    println!("Minting {} tokens to {}", raw_amount / 100, token_account);

    let mint_instruction = mint_to(
        &TOKEN_PROGRAM_ID,
        &token_mint,
        &token_account,
        &payer.pubkey(),
        &[],
        raw_amount,
    )?;

    let mut tx = Transaction::new_with_payer(&[mint_instruction], Some(&payer.pubkey()));
    let recent_blockhash = client.get_latest_blockhash()?;
    tx.sign(&[&payer], recent_blockhash);
    let signature = client.send_and_confirm_transaction(&tx)?;

    println!("Tokens minted successfully!");
    println!(
        "Explorer: https://explorer.solana.com/tx/{}?cluster=devnet\n",
        signature
    );

    Ok(())
}
