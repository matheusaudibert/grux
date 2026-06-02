const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const WEBHOOK_URL = process.env.RULES_WEBHOOK + "?with_components=true";

const payload = {
  components: [
    {
      "type": 17,
      "accent_color": null,
      "spoiler": false,
      "components": [
        {
          "type": 10,
          "content": "### Rules"
        },
        {
          "type": 10,
          "content": "Keep things **respectful** and **on-topic**. **No spam**, **hate**, or **unsolicited self-promo**. Use the right channels and help keep the space organized. By being here, you agree to follow Discord’s **[Terms of Service](https://discord.com/terms)** and **[Community Guidelines](https://discord.com/guidelines)**. Let’s keep it friendly and fun!"
        },
        {
          "type": 10,
          "content": "-# _Breaking these rules may result in a ban from the server._"
        }
      ]
    }
  ],
  flags: 32768,
};

async function sendWebhook() {
  console.log("[Rules] Sending rules panel.");
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log("[Rules] Webhook sent successfully.");
    } else {
      console.error("[Rules] Failed to send webhook:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[Rules] Error sending webhook:", err);
  }
}

sendWebhook();