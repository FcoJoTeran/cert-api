## 🚀 Cómo ejecutar el proyecto localmente
### 📦 Requisitos previos
- Tener instalado Anchor

- Tener instalado Node.js y Yarn

⚙️ Instalación del Smart Contract

 **1. Instala las dependencias del contrato**

Desde la raíz del contrato (por ejemplo: smart-contract/certificate):

```
yarn
```

**2. Construye el programa con Anchor**

```
anchor build
```

**3. Realiza pruebas**

```
anchor test
```

**4. Ejecuta el cliente (si tienes uno configurado)**

```
anchor run client
```

⚠️ **Nota:** Puede que necesites ajustar el código del cliente o test si originalmente fue usado en Anchor Playground. Por ejemplo, si ves algo como pg.wallets.myWallet, deberás cargar manualmente las keypairs.

### 🌐 Backend (API REST con Node.js)
El backend permite subir un archivo PDF y metadata asociada, y almacena un identificador en la blockchain de Solana.

**1. Ubícate en la carpeta del backend**

```
cd backend
```

**2. Instala dependencias**

```
yarn
```

**3. Crea tu archivo .env (opcional)**

Para definir el puerto u otras variables (ejemplo):

```
PORT=3000
```

**4. Coloca tu wallet (keypair) en formato JSON**

Debes tener un archivo tipo YOUR_WALLET_KEYPAIR.json que será usado para firmar las transacciones.

**5. Ejecuta el servidor**

```
node index.js
```

**6. Endpoint disponible**

Puedes hacer un POST a:

```
http://localhost:3000/upload
```
Con un FormData que incluya:

- Un archivo PDF (file)

- Un campo metadata como JSON string que incluya las características del certificado.