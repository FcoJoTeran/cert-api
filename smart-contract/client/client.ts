import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import type { Certificate } from "../target/types/certificate";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Certificate as anchor.Program<Certificate>;

// Cliente para store_certificate en Solana Playground

// Mostrar la dirección de la billetera actual
console.log("Dirección de mi billetera:", program.provider.publicKey.toString());

// Obtener y mostrar el balance de la billetera
const balance = await program.provider.connection.getBalance(program.provider.publicKey);
console.log(`Balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

// Generar una nueva clave para la cuenta del certificado
const certKp = new web3.Keypair();

// Definir los datos del certificado
const id = "cert-001";
const jsonData = '{"nombre":"Juan","curso":"Solana"}';

// Enviar la transacción para almacenar el certificado
const tx = await program.methods
  .storeCertificate(id, jsonData)
  .accounts({
    certificate: certKp.publicKey,
    user: program.provider.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([certKp])
  .rpc();

console.log("Transacción enviada:", tx);

// Confirmar la transacción
await program.provider.connection.confirmTransaction(tx);

// Recuperar y mostrar los datos almacenados en la cuenta del certificado
const certAccount = await program.account.certificate.fetch(certKp.publicKey);
console.log("ID almacenado:", certAccount.id);
console.log("Datos almacenados:", certAccount.data);
