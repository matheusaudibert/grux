const config = require("../config/config");
const defaultImages = require("../config/defaultImages");

const checkUserInGuilds = async (client, USER_ID) => {
  const MAIN_GUILD = config.MAIN_GUILD;
  let member = null;

  try {
    const mainGuild = await client.guilds.fetch(MAIN_GUILD);
    member = await mainGuild.members.fetch(USER_ID, { force: true });

    if (member) {
      return { isUserFound: true, member };
    }
  } catch (error) { }

  return { isUserFound: false, member: null };
};

function getCreation(userId) {
  const DISCORD_EPOCH = 1420070400000;
  const timestamp = BigInt(userId) >> 22n;
  const creationDate = new Date(Number(timestamp) + DISCORD_EPOCH);

  return creationDate.toISOString();
}

const processConnectedAccounts = (accounts) => {
  return accounts.map((account) => {
    let link = null;
    switch (account.type) {
      case "reddit":
        link = `https://reddit.com/user/${account.name}`;
        break;
      case "tiktok":
        link = `https://tiktok.com/@${account.name}`;
        break;
      case "twitter":
        link = `https://twitter.com/${account.name}`;
        break;
      case "ebay":
        link = `https://ebay.com/usr/${account.name}`;
        break;
      case "github":
        link = `https://github.com/${account.name}`;
        break;
      case "instagram":
        link = `https://instagram.com/${account.name}`;
        break;
      case "twitch":
        link = `https://twitch.tv/${account.name}`;
        break;
      case "domain":
        link = `https://${account.id}`;
        break;
      case "roblox":
        link = `https://roblox.com/pt/users/${account.id}`;
        break;
      case "steam":
        link = `https://steamcommunity.com/profiles/${account.id}`;
        break;
      case "spotify":
        link = `https://open.spotify.com/user/${account.id}`;
        break;
      case "youtube":
        link = `https://youtube.com/channel/${account.id}`;
        break;
      default:
        link = null;
    }
    return { type: account.type, name: account.name, link };
  });
};

const processLargeImage = (image, applicationId, activityName) => {
  const defaultGame = defaultImages[activityName];

  if (defaultGame) {
    return defaultGame.largeImage;
  }

  if (image && image.startsWith("mp:external/")) {
    const urlParts = image.split("/");
    if (urlParts.length >= 4) {
      const externalUrl = urlParts.slice(3).join("/");
      return `https://${externalUrl}`;
    }
    return null;
  } else if (image) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  }
  return config.DEFAULT_ACTIVITY_IMAGE;
};

const processSmallImage = (image, applicationId) => {
  if (image && image.startsWith("mp:external/")) {
    const urlParts = image.split("/");
    if (urlParts.length >= 4) {
      const externalUrl = urlParts.slice(3).join("/");
      return `https://${externalUrl}`;
    }
    return null;
  } else if (image) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  }
  return null;
};

const processBadges = (badgesData) => {
  return badgesData
    ? badgesData.map((badge) => ({
      id: badge.id,
      description: badge.description,
      asset: badge.icon,
      badge_image: `https://cdn.discordapp.com/badge-icons/${badge.icon}.png`,
    }))
    : [];
};

const processClan = (clanData) => {
  if (
    !clanData ||
    !clanData.identity_guild_id ||
    !clanData.badge ||
    !clanData.tag
  ) {
    return null;
  }

  return {
    tag: clanData.tag,
    identity_guild_id: clanData.identity_guild_id,
    asset: clanData.badge,
    clan_image: `https://cdn.discordapp.com/clan-badges/${clanData.identity_guild_id}/${clanData.badge}.png`,
  };
};

const processProfileInfo = (member, userData) => {
  const nameplate_image = userData?.nameplate?.asset
    ? `https://cdn.discordapp.com/assets/collectibles/${userData.nameplate.asset}static.png`
    : null;

  return {
    bot: member.user.bot || false,
    device: member.presence?.clientStatus?.desktop
      ? "desktop"
      : member.presence?.clientStatus?.mobile
        ? "mobile"
        : member.presence?.clientStatus?.web
          ? "web"
          : null,
    id: member.user.id,
    creation_date: getCreation(member.user.id),
    username: member.user.username,
    display_name: member.user.globalName || member.user.username,
    link: `https://discord.com/users/${member.user.id}`,
    avatar: member.user.avatar,
    avatar_image: member.user.displayAvatarURL({
      size: 1024,
      extension: "png",
    }),
    avatar_decoration_image: member?.user?.avatarDecorationData?.asset
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${member.user.avatarDecorationData.asset}.png`
      : null,
    nameplate_image,
    bio: userData.bio || null,
    public_flags: member.user.flags.bitfield,
    badges: processBadges(userData.badges),
    clan: processClan(userData.clan),
    connected_accounts: processConnectedAccounts(
      userData.connectedAccounts || []
    ),
  };
};

const processSpotifyActivity = (activities) => {
  const spotifyActivity = activities
    .filter((activity) => activity.name === "Spotify")
    .map((activity) => ({
      type: "Listening to Spotify",
      name: activity.name,
      song: activity.details || null,
      artist: activity.state ? activity.state.replace(/;/g, ",") : null,
      album: activity.assets?.largeText || null,
      album_image:
        activity.assets?.largeImage?.replace(
          "spotify:",
          "https://i.scdn.co/image/"
        ) || null,
      link: activity.syncId
        ? `https://open.spotify.com/track/${activity.syncId}`
        : null,
      timestamps: {
        start: activity.timestamps?.start
          ? new Date(activity.timestamps.start).getTime()
          : null,
        end: activity.timestamps?.end
          ? new Date(activity.timestamps.end).getTime()
          : null,
      },
      created_at: activity.createdTimestamp
        ? new Date(activity.createdTimestamp).getTime()
        : null,
    }));
  return spotifyActivity.length > 0 ? spotifyActivity[0] : null;
};

const processGeneralActivities = (activities) => {
  const generalActivities = activities
    .filter((activity) => activity.type === 0)
    .map((activity) => ({
      type: "Playing",
      name: activity.name,
      state: activity.state || null,
      details: activity.details || null,
      largeText: activity.assets?.largeText || null,
      largeImage: processLargeImage(
        activity.assets?.largeImage,
        activity.applicationId,
        activity.name
      ),
      smallText: activity.assets?.smallText || null,
      smallImage: activity.assets?.smallImage
        ? processSmallImage(activity.assets.smallImage, activity.applicationId)
        : null,
      timestamps: {
        start: activity.timestamps?.start
          ? new Date(activity.timestamps.start).getTime()
          : null,
      },
      created_at: activity.createdTimestamp
        ? new Date(activity.createdTimestamp).getTime()
        : null,
    }));
  return generalActivities.length > 0 ? generalActivities.reverse() : null;
};

module.exports = {
  checkUserInGuilds,
  getCreation,
  processLargeImage,
  processSmallImage,
  processConnectedAccounts,
  processBadges,
  processClan,
  processProfileInfo,
  processSpotifyActivity,
  processGeneralActivities,
};
