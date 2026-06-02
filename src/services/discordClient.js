const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const config = require("../config/config");
const websocketServer = require("./websocketServer");
const UserService = require("../../infra/services/userService");
const { sendJoinWebhook } = require("../../webhooks/joinsWebhook");
const {
  processSpotifyActivity,
  processGeneralActivities,
} = require("../utils/jsonProcessor");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

const userService = new UserService();
const presenceCache = new Map();

client.once("ready", async () => {
  console.log(`${client.user.tag} online!`);
  client.user.setPresence({
    activities: [
      {
        name: "grux.audibert.dev",
        type: ActivityType.Watching,
      },
    ],
  });

  setInterval(() => {
    checkAllPresences();
  }, 3000);

  try {
    const mainGuild = client.guilds.cache.get(config.MAIN_GUILD);
    if (mainGuild) {
      await mainGuild.members.fetch();
      const memberIds = mainGuild.members.cache
        .filter((m) => !m.user.bot)
        .map((m) => m.user.id);
      await userService.populateUsers(memberIds);
    }
  } catch (error) {
    console.error("Error populating users on startup:", error);
  }
});

client.on("guildMemberAdd", async (member) => {
  if (member.user.bot) return;
  if (member.guild.id !== config.MAIN_GUILD) return;

  try {
    const exists = await userService.getUserByDiscordId(member.user.id);
    if (!exists) {
      await userService.registerUser(member.user.id);
      console.log(`Registered new user ${member.user.id}`);
      const avatarUrl = member.user.displayAvatarURL({ extension: "png", size: 128 });
      await sendJoinWebhook(member.user.id, avatarUrl);
    } else {
      console.log(`User ${member.user.id} already in database, skipping registration`);
    }
  } catch (error) {
    console.error(`Error registering new user ${member.user.id}:`, error);
  }
});

client.on("guildMemberRemove", async (member) => {
  if (member.user.bot) return;
  if (member.guild.id !== config.MAIN_GUILD) return;

  try {
    const exists = await userService.getUserByDiscordId(member.user.id);
    if (exists) {
      const avatarUrl = member.user.displayAvatarURL({ extension: "png", size: 128 });
      await userService.deleteUserByDiscordId(member.user.id, avatarUrl);
      console.log(`Deleted user ${member.user.id} from database`);
    }
  } catch (error) {
    console.error(`Error deleting user ${member.user.id}:`, error);
  }
});

function checkAllPresences() {
  const mainGuild = client.guilds.cache.get(config.MAIN_GUILD);
  if (!mainGuild) return;

  mainGuild.members.cache.forEach((member) => {
    if (member.user.bot) return;

    const userId = member.user.id;
    const currentPresence = member.presence;
    const cachedPresence = presenceCache.get(userId);

    if (hasPresenceChanged(cachedPresence, currentPresence)) {
      presenceCache.set(userId, serializePresence(currentPresence));
      broadcastPresenceUpdate(userId, currentPresence);
    }
  });
}

function hasPresenceChanged(oldPresence, newPresence) {
  const oldSerialized = serializePresence(oldPresence);
  const newSerialized = serializePresence(newPresence);
  return JSON.stringify(oldSerialized) !== JSON.stringify(newSerialized);
}

function serializePresence(presence) {
  if (!presence) return null;
  return {
    status: presence.status,
    activities:
      presence.activities?.map((activity) => ({
        name: activity.name,
        type: activity.type,
        details: activity.details,
        state: activity.state,
        timestamps: activity.timestamps,
        assets: activity.assets,
        syncId: activity.syncId,
        createdTimestamp: activity.createdTimestamp,
      })) || [],
  };
}

function broadcastPresenceUpdate(userId, presence) {
  const activities = presence?.activities || [];
  const spotifyActivity = processSpotifyActivity(activities);
  const generalActivity = processGeneralActivities(activities);

  let userStatus = presence?.status || "invisible";
  if (userStatus === "offline") {
    userStatus = "invisible";
  }

  websocketServer.broadcastPresenceUpdate(
    userId,
    userStatus,
    spotifyActivity,
    generalActivity
  );
}

client.on("presenceUpdate", (oldPresence, newPresence) => {
  const userId = newPresence.userId;

  const mainGuild = client.guilds.cache.get(config.MAIN_GUILD);
  if (!mainGuild || !mainGuild.members.cache.has(userId)) {
    return;
  }

  presenceCache.set(userId, serializePresence(newPresence));
  broadcastPresenceUpdate(userId, newPresence);
});

client.on("error", (error) => {
  console.error("Error in client:", error);
});

client.on("disconnect", () => {
  console.warn("Discord client disconnected, attempting to reconnect...");
});

client.on("reconnecting", () => {
  console.log("Discord client reconnecting...");
});

client.login(config.DISCORD_TOKEN).catch((error) => {
  console.error("Login failed:", error);
});

module.exports = client;
