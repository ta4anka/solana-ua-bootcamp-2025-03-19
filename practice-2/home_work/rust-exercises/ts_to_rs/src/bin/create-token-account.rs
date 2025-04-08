use anyhow::{Context, Result};
use dotenvy::dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use spl_associated_token_account::{
    get_associated_token_address, instruction::create_associated_token_account,
};
use spl_token::ID as TOKEN_PROGRAM_ID;
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
    let owner = Pubkey::from_str("7gE3KxG74TTQzHMdBX2XpQXetHTr2gAfrxkYPqLvKKvf")?;

    let associated_token = get_associated_token_address(&owner, &token_mint);
    println!("Associated Token Address: {}", associated_token);

    let instruction =
        create_associated_token_account(&payer.pubkey(), &owner, &token_mint, &TOKEN_PROGRAM_ID);

    let mut tx = Transaction::new_with_payer(&[instruction], Some(&payer.pubkey()));
    let recent_blockhash = client.get_latest_blockhash()?;
    tx.sign(&[&payer], recent_blockhash);
    let signature = client.send_and_confirm_transaction(&tx)?;

    println!("Token Account: {}", associated_token);
    println!(
        "Explorer: https://explorer.solana.com/address/{}?cluster=devnet",
        associated_token
    );
    println!("Tx signature: {}", signature);

    Ok(())
}
