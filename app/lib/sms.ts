// config PlasGate for send-otp

export async function sendOTP(phone: string, otp: string): Promise<string> {
  const isProduction = process.env.NODE_ENV === "production";
  const plasgatePrivateKey = process.env.PLASGATE_PRIVATE_KEY;
  const plasgateSecret = process.env.PLASGATE_SECRET;
  const plasgateSender = process.env.PLASGATE_SENDER;
  const plasgateBaseUrl = "https://cloudapi.plasgate.com";

  if (!plasgatePrivateKey || !plasgateSecret || !plasgateSender) {
    throw new Error(
      "Missing PlasGate SMS config (PLASGATE_PRIVATE_KEY, PLASGATE_SECRET, PLASGATE_SENDER)."
    );
  }

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
      content: `Your Jober verification code is: ${otp}. Valid for 5 minutes.`,
    }),
  });

  const responseBody = await response.text().catch(() => "");
  // if (!isProduction && responseBody) {
  //   console.log(`[PlasGate] /rest/send response: ${responseBody}`);
  // }

  if (!response.ok) {
    throw new Error(
      `PlasGate SMS failed (${response.status}): ${
        responseBody || response.statusText
      }`
    );
  }

  return responseBody;
}
