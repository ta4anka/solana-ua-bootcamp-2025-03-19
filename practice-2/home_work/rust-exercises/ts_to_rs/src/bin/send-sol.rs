use anyhow::{Context, Result};
use dotenvy::dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    native_token::LAMPORTS_PER_SOL,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    system_instruction,
    transaction::Transaction,
};
use spl_memo::build_memo;
use std::env;
use std::str::FromStr;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let private_key_json = env::var("SECRET_KEY").context("SECRET_KEY must be in .env file")?;
    let private_key_bytes: Vec<u8> =
        serde_json::from_str(&private_key_json).context("Failed to parse SECRET_KEY as JSON")?;
    let sender_keypair = Keypair::from_bytes(&private_key_bytes)
        .map_err(|e| anyhow::anyhow!("Failed to create keypair: {}", e))?;
    println!("Sender public key: {}", sender_keypair.pubkey());

    let rpc_client = RpcClient::new("https://api.devnet.solana.com");

    let recipient = Pubkey::from_str("3ZPcth6Uk1JrxhhzQr9Q2diDrjYDdAqTWhdcrDPENtha")?;

    println!("Attempting to send 0.01 SOL to {}...", recipient);
    let amount = (0.01 * LAMPORTS_PER_SOL as f64) as u64;
    let transfer_instruction =
        system_instruction::transfer(&sender_keypair.pubkey(), &recipient, amount);

    let memo_text = "Rust Forever!";
    println!("memo is: {}", memo_text);
    let memo_instruction = build_memo(memo_text.as_bytes(), &[&sender_keypair.pubkey()]);

    let mut transaction = Transaction::new_with_payer(
        &[transfer_instruction, memo_instruction],
        Some(&sender_keypair.pubkey()),
    );

    let recent_blockhash = rpc_client.get_latest_blockhash()?;
    transaction.sign(&[&sender_keypair], recent_blockhash);
    let signature = rpc_client.send_and_confirm_transaction(&transaction)?;

    println!("Transaction confirmed, signature: {}", signature);
    Ok(())
}
