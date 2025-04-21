use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Only the owner or authority can perform this action!")]
    Unauthorized,
} 