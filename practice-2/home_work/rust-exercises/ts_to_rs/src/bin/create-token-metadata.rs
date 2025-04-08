use anyhow::{Context, Result};
use dotenvy::dotenv;
use mpl_token_metadata::{
    instructions::{CreateMetadataAccountV3, CreateMetadataAccountV3InstructionArgs},
    types::DataV2,
    ID as TOKEN_METADATA_PROGRAM_ID,
};
use serde_json;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    system_program,
    transaction::Transaction,
};
use std::{env, str::FromStr};

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let private_key_json = env::var("SECRET_KEY").context("SECRET_KEY must be set")?;
    let private_key_bytes: Vec<u8> = serde_json::from_str(&private_key_json)?;
    let payer = Keypair::from_bytes(&private_key_bytes)?;

    let client = RpcClient::new("https://api.devnet.solana.com");
    let token_mint = Pubkey::from_str("45frjMuy6BitU3wbKmgSDRkQZq6agrP8TpnuMcCJpuL1")?;

    let metadata_data = DataV2 {
        name: "Rust Token".to_string(),
        symbol: "RT".to_string(),
        uri: "https://gateway.pinata.cloud/ipfs/bafkreiaz7szdc4c2mzprpzxkyp53zppqfsooeboh2bpypwtpncyzrt3qoe".to_string(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    let metadata_seeds = &[
        b"metadata",
        TOKEN_METADATA_PROGRAM_ID.as_ref(),
        token_mint.as_ref(),
    ];
    let (metadata_pda, _bump) =
        Pubkey::find_program_address(metadata_seeds, &TOKEN_METADATA_PROGRAM_ID);

    let create_instruction = CreateMetadataAccountV3 {
        metadata: metadata_pda,
        mint: token_mint,
        mint_authority: payer.pubkey(),
        payer: payer.pubkey(),
        update_authority: (payer.pubkey(), true),
        system_program: system_program::ID,
        rent: None,
    }
    .instruction(CreateMetadataAccountV3InstructionArgs {
        data: metadata_data,
        is_mutable: true,
        collection_details: None,
    });

    let latest_blockhash = client.get_latest_blockhash()?;

    let transaction = Transaction::new_signed_with_payer(
        &[create_instruction],
        Some(&payer.pubkey()),
        &[&payer],
        latest_blockhash,
    );
    let signature = client.send_and_confirm_transaction(&transaction)?;
    println!(
        "Transaction signature: https://explorer.solana.com/tx/{}?cluster=devnet\n",
        signature
    );

    println!(
        "Look at the token mint again: https://explorer.solana.com/address/{}?cluster=devnet\n",
        token_mint
    );
    Ok(())
}
