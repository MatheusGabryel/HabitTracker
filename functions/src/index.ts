import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import cors from "cors";

// Inicialize o middleware CORS
// permitindo todos os domínios durante o desenvolvimento
const corsMiddleware = cors({ origin: true });

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const sendContactEmail = onRequest((req, res) => {
  corsMiddleware(req, res, () => {
    console.log('Método:', req.method);
    console.log('Corpo:', req.body);

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).send("Missing fields");
      return;
    }

    // Aqui é onde você processaria o envio do e-mail
    console.log("Dados recebidos:", { name, email, subject, message });

    res.status(200).send("Dados recebidos com sucesso");
  });
});
