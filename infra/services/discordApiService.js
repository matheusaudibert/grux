const axios = require("axios");

class DiscordApiService {
  constructor() {
    this.currentTokenIndex = 0;
    this.tokens = [];
    this.botToken = process.env.DISCORD_TOKEN || "";
    this.loadTokens();
  }

  static getInstance() {
    if (!DiscordApiService.instance) {
      DiscordApiService.instance = new DiscordApiService();
    }
    return DiscordApiService.instance;
  }

  loadTokens() {
    const tokenString = process.env.DISCORD_USER_TOKENS || "";
    this.tokens = tokenString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  getNextToken() {
    if (this.tokens.length === 0) {
      throw new Error("No user tokens available");
    }
    const token = this.tokens[this.currentTokenIndex];
    this.currentTokenIndex = (this.currentTokenIndex + 1) % this.tokens.length;
    return token;
  }

  async getUserProfile(userId) {
    const maxRetries = this.tokens.length;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const token = this.getNextToken();
        const response = await axios.get(
          `https://discord.com/api/v10/users/${userId}/profile`,
          {
            headers: {
              Authorization: token,
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          }
        );
        return response.data;
      } catch (error) {
        attempts++;

        if (error.response?.status === 429) {
          console.log("Rate limit reached, trying next token...");
          continue;
        }

        if (error.response?.status === 401) {
          console.log("Invalid token, trying next...");
          continue;
        }

        if (attempts >= maxRetries) {
          throw new Error(
            `Error fetching profile after ${maxRetries} attempts: ${error.message}`
          );
        }
      }
    }
  }

  async getUserBasicInfo(userId) {
    if (!this.botToken) {
      throw new Error("Bot token is not configured");
    }

    try {
      const response = await axios.get(
        `https://discord.com/api/v10/users/${userId}`,
        {
          headers: {
            Authorization: `Bot ${this.botToken}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching basic user info: ${error.message}`);
    }
  }
}

module.exports = DiscordApiService;
