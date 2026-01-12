// config PlasGate for send-otp

export async function sendOTP(phone: string, otp: string): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const plasgatePrivateKey = process.env.PLASGATE_PRIVATE_KEY;
  const plasgateSecret = process.env.PLASGATE_SECRET;
  const plasgateSender = process.env.PLASGATE_SENDER;
  const plasgateBaseUrl =
    process.env.PLASGATE_BASE_URL || "https://cloudapi.plasgate.com";
  const usePlasGate = !!(
    plasgatePrivateKey &&
    plasgateSecret &&
    plasgateSender
  );

  if (usePlasGate) {
    const url = `${plasgateBaseUrl}/rest/send?private_key=${encodeURIComponent(
      plasgatePrivateKey
    )}`;
    const to = phone.replace(/[^\d]/g, "");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Secret": plasgateSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: plasgateSender,
        to,
        content: `Your Jobber verification code is: ${otp}. Valid for 5 minutes.`,
      }),
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(`PlasGate SMS failed (${response.status}): ${message}`);
    }

    return;
  }

  if (isProduction) {
    console.warn("[SMS] No SMS provider configured for production.");
    return;
  }

  {
    // Development: Log to console
    console.log("=".repeat(50));
    console.log(`📱 SMS OTP for ${phone}:`);
    console.log(`   Code: ${otp}`);
    console.log(`   Valid for 5 minutes`);
    console.log("=".repeat(50));
  }
}
