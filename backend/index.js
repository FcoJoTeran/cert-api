const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const anchor = require("@project-serum/anchor");
const web3 = require("@solana/web3.js");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configurar multer para subir PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueId = req.uniqueId;
    cb(null, `${uniqueId}.pdf`);
  },
});
const upload = multer({ storage });

const storagePath = process.env.CERTIFICATE_STORAGE;

// Crear carpeta de uploads si no existe
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath);
}

// Configuración Solana/Anchor
const walletKey = JSON.parse(fs.readFileSync(process.env.WALLET, "utf-8"));
const keypair = web3.Keypair.fromSecretKey(new Uint8Array(walletKey));
const connection = new web3.Connection(process.env.SOLANA_CLUSTER, "confirmed");
const wallet = new anchor.Wallet(keypair);
const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
anchor.setProvider(provider);

const idl = JSON.parse(fs.readFileSync("./idl.json", "utf-8"));
const programId = new web3.PublicKey("4FF3GJpWfiMxRjGECkAyqtCgo6mfpNzfATTU158GF5Xs");
const program = new anchor.Program(idl, programId, provider);

// Middleware para generar ID único
app.use("/certificado-con-pdf", (req, res, next) => {
  req.uniqueId = uuidv4();
  next();
});

// Ruta POST con PDF + metadata JSON
app.post("/certificado-con-pdf", upload.single("pdf"), async (req, res) => {
  const id = req.uniqueId;
  const metadata = req.body.metadata;

  if (!req.file || !metadata) {
    return res.status(400).json({ error: "Faltan el archivo PDF o la metadata" });
  }

  try {
    // Guardar metadata en un archivo
    fs.writeFileSync(`uploads/${id}.json`, metadata);

    const certKp = web3.Keypair.generate();

    // Enviar a Solana: id + metadata (como string)
    const tx = await program.methods
      .storeCertificate(id, metadata)
      .accounts({
        certificate: certKp.publicKey,
        user: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([certKp])
      .rpc();

    return res.json({
      success: true,
      transaction: tx,
      certificateId: id,
      publicKey: certKp.publicKey.toBase58(),
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});