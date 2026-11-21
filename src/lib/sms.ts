/**
 * SMS Provider Abstraction for The Wedding Wish
 * 
 * Note on Indian SMS Delivery:
 * Under Telecom Regulatory Authority of India (TRAI) regulations, sending transactional
 * SMS in India requires DLT (Distributed Ledger Technology) entity and template registration
 * (e.g., via Jio, Airtel, Vodafone DLT portals) with a registered Header/Sender ID (e.g., "WDWISH").
 */

export interface SmsProvider {
  send(mobile: string, message: string): Promise<boolean>;
}

/**
 * Dev/Local SMS Provider: Logs OTP and message clearly to the terminal server console
 */
export class ConsoleSmsProvider implements SmsProvider {
  async send(mobile: string, message: string): Promise<boolean> {
    const divider = "=".repeat(60);
    console.log(`\n${divider}`);
    console.log(`📱 [SMS DISPATCH TO: ${mobile}]`);
    console.log(`💬 MESSAGE: ${message}`);
    console.log(`${divider}\n`);
    return true;
  }
}

/**
 * Production SMS Provider Stub (Twilio / MSG91)
 * Toggle via SMS_PROVIDER=twilio or SMS_PROVIDER=msg91 in .env
 */
export class ProductionSmsProvider implements SmsProvider {
  async send(mobile: string, message: string): Promise<boolean> {
    const provider = process.env.SMS_PROVIDER?.toLowerCase() || "console";

    if (provider === "msg91") {
      // MSG91 API integration stub (DLT flow_id / authkey)
      console.log(`[MSG91] Sending DLT approved template SMS to ${mobile}`);
      // In production: await fetch("https://control.msg91.com/api/v5/flow/", { ... })
      return true;
    }

    if (provider === "twilio") {
      // Twilio API integration stub
      console.log(`[Twilio] Sending SMS to ${mobile} via Twilio Messaging Service`);
      // In production: await twilioClient.messages.create({ ... })
      return true;
    }

    // Default fallback to console provider
    const fallback = new ConsoleSmsProvider();
    return fallback.send(mobile, message);
  }
}

export function getSmsProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER?.toLowerCase();
  if (provider === "twilio" || provider === "msg91") {
    return new ProductionSmsProvider();
  }
  return new ConsoleSmsProvider();
}
