const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const WEBHOOK_URL = process.env.WELCOME_WEBHOOK + "?with_components=true";

const payload = {
  components: [
    {
      "type": 17,
      "accent_color": null,
      "spoiler": false,
      "components": [
        {
          "type": 10,
          "content": "### Welcome to audibert.dev"
        },
        {
          "type": 10,
          "content": "This is my **professional server**. Here, you can **explore my projects**, **check out my certifications**, **read my blog posts**, and **discover other things related to my work as a developer**."
        },
        {
          "type": 10,
          "content": "You can also **contact me here** to ask questions, exchange ideas, or talk about possible projects and opportunities. Feel free to look around!"
        },
        {
          "type": 10,
          "content": "-# _If you enjoy my work, make sure to follow me on my social media to keep up with my latest projects and updates._"
        }
      ]
    },
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 5,
          "label": "GitHub",
          "emoji": null,
          "disabled": false,
          "url": "https://github.com/matheusaudibert"
        },
        {
          "type": 2,
          "style": 5,
          "label": "LinkedIn",
          "emoji": null,
          "disabled": false,
          "url": "https://www.linkedin.com/in/matheusaudibert/"
        },
        {
          "type": 2,
          "style": 5,
          "label": "YouTube",
          "emoji": null,
          "disabled": false,
          "url": "https://www.youtube.com/@audibert"
        },
        {
          "type": 2,
          "style": 5,
          "label": "Portfolio",
          "disabled": false,
          "url": "https://audibert.dev/"
        },
        {
          "type": 2,
          "style": 5,
          "label": "Resume",
          "disabled": false,
          "url": "https://audibert.dev/"
        }
      ]
    }
  ],
  flags: 32768,
};

async function sendWebhook() {
  console.log("[Welcome] Sending welcome panel.");
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log("[Welcome] Webhook sent successfully.");
    } else {
      console.error("[Welcome] Failed to send webhook:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[Welcome] Error sending webhook:", err);
  }
}

sendWebhook();