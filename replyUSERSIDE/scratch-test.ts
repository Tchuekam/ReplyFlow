import { generateSalesResponse } from './src/lib/ai-core.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  console.log("Starting test...");
  try {
    const res = await generateSalesResponse("hello", [], [], [], {
      businessName: "Test",
      tagline: "Test",
      phone: "000",
      whatsapp: "000",
      bookingUrl: "",
      primaryColor: "",
      language: "en",
      leadWebhook: "",
      clientId: "",
      aiActive: true,
      theme: "dark"
    });
    console.log("Result:", res);
  } catch(e) {
    console.error("Fatal:", e);
  }
}
run();
