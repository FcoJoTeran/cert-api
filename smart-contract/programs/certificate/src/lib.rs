use anchor_lang::prelude::*;

declare_id!("4FF3GJpWfiMxRjGECkAyqtCgo6mfpNzfATTU158GF5Xs");

#[program]
pub mod certificate {
    use super::*;

    pub fn store_certificate(ctx: Context<StoreCertificate>, id: String, json_data: String) -> Result<()> {
        require!(id.len() <= 64, CustomError::IdTooLong);
        require!(json_data.len() <= 1024, CustomError::DataTooLong);

        let cert = &mut ctx.accounts.certificate;
        cert.id = id;
        cert.data = json_data;
        cert.owner = ctx.accounts.user.key();
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct StoreCertificate<'info> {
    #[account(
        init,
        seeds = [b"certificate", id.as_bytes(), user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 4 + id.len() + 4 + json_data.len()
    )]
    pub certificate: Account<'info, Certificate>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Certificate {
    pub owner: Pubkey,
    pub id: String,
    pub data: String,
}

#[error_code]
pub enum CustomError {
    #[msg("El ID es demasiado largo.")]
    IdTooLong,
    #[msg("Los datos JSON son demasiado grandes.")]
    DataTooLong,
}
