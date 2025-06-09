import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import type { Certificate } from "../target/types/certificate";
describe("store_certificate", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Certificate as anchor.Program<Certificate>;
  
  it("Crea un certificado correctamente", async () => {
    const certKp = new web3.Keypair();

    const id = "cert-001";
    const jsonData = '{"nombre":"Juan","curso":"Solana"}';

    const tx = await program.methods
      .storeCertificate(id, jsonData)
      .accounts({
        certificate: certKp.publicKey,
        user: program.provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([certKp])
      .rpc();

    console.log(`Usa 'solana confirm -v ${tx}' para ver los logs`);

    // Confirmamos la transacción
    await program.provider.connection.confirmTransaction(tx);

    // Leemos la cuenta creada
    const certAccount = await program.account.certificate.fetch(
      certKp.publicKey
    );

    console.log("ID almacenado:", certAccount.id);
    console.log("JSON almacenado:", certAccount.data);

    // Verificación rápida
    if (certAccount.id !== id) throw new Error("ID no coincide");
    if (certAccount.data !== jsonData) throw new Error("Datos JSON no coinciden");
  });
});
