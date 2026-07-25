import * as fs from 'fs';
import * as path from 'path';

// Load .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (matched) {
      const key = matched[1];
      let value = matched[2] || '';
      if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  }
}

import { DebiturService } from "../src/backend/services/clients.service";

async function main() {
  const id = "cmqk8l1ic0001ok84c2x4433l";
  console.log(`Querying Debitur ID: ${id}`);
  
  try {
    const debitur = await DebiturService.getById(id);
    console.log("Result:", JSON.stringify(debitur, null, 2));
    if (debitur) {
      console.log("ID:", JSON.stringify(debitur.id));
      console.log("ID Length:", debitur.id.length);
      console.log("ID CharCodes:", [...debitur.id].map(c => c.charCodeAt(0)));
      
      console.log("noKtp:", JSON.stringify(debitur.noKtp));
      console.log("noKtp Length:", debitur.noKtp.length);
      console.log("noKtp CharCodes:", [...debitur.noKtp].map(c => c.charCodeAt(0)));
    }
  } catch (error) {
    console.error("Error querying debitur service:", error);
  }
}

main();
