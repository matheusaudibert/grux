const UserModel = require("../models/users");
const DiscordApiService = require("./discordApiService");
const {
  sendInsertWebhook,
  sendDeleteWebhook,
  sendUpdateWebhook,
  sendPopulationWebhook,
} = require("../../webhooks/databaseWebhooks");

class UserService {
  constructor() {
    this.discordApi = DiscordApiService.getInstance();
  }

  _avatarUrl(discordId, avatarHash) {
    if (avatarHash) {
      return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=128`;
    }
    return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordId) % 5n)}.png`;
  }

  async registerUser(discordId) {
    try {
      const profileData = await this.discordApi.getUserProfile(discordId);

      const badges = (profileData.badges || []).map((badge) => ({
        id: badge.id,
        description: badge.description,
        icon: badge.icon,
        link: badge.link || null,
      }));

      let nameplate = null;
      if (profileData.user?.collectibles?.nameplate) {
        const np = profileData.user.collectibles.nameplate;
        nameplate = {
          sku_id: np.sku_id,
          asset: np.asset,
          label: np.label,
          palette: np.palette,
        };
      }

      let clan = null;
      if (profileData.user?.clan) {
        clan = {
          identity_guild_id: profileData.user.clan.identity_guild_id,
          identity_enabled: profileData.user.clan.identity_enabled,
          tag: profileData.user.clan.tag,
          badge: profileData.user.clan.badge,
        };
      }

      const connectedAccounts = profileData.connected_accounts || [];
      const bio = profileData.user_profile?.bio || null;

      const user = new UserModel({
        _id: discordId,
        badges,
        nameplate,
        clan,
        connectedAccounts,
        bio,
        lastUpdated: new Date(),
      });

      await user.save();

      const avatarUrl = this._avatarUrl(discordId, profileData.user?.avatar);
      sendInsertWebhook(discordId, avatarUrl).catch(() => {});

      return user;
    } catch (error) {
      await UserModel.findByIdAndUpdate(
        discordId,
        { lastUpdated: new Date() },
        { upsert: true }
      );
      throw error;
    }
  }

  async updateUserProfile(user) {
    try {
      const profileData = await this.discordApi.getUserProfile(user._id);

      const badges = (profileData.badges || []).map((badge) => ({
        id: badge.id,
        description: badge.description,
        icon: badge.icon,
        link: badge.link || null,
      }));

      let nameplate = null;
      if (profileData.user?.collectibles?.nameplate) {
        const np = profileData.user.collectibles.nameplate;
        nameplate = {
          sku_id: np.sku_id,
          asset: np.asset,
          label: np.label,
          palette: np.palette,
        };
      }

      let clan = null;
      if (profileData.user?.clan) {
        clan = {
          identity_guild_id: profileData.user.clan.identity_guild_id,
          identity_enabled: profileData.user.clan.identity_enabled,
          tag: profileData.user.clan.tag,
          badge: profileData.user.clan.badge,
        };
      }

      const connectedAccounts = profileData.connected_accounts || [];
      const bio = profileData.user_profile?.bio || null;

      user.badges = badges;
      user.nameplate = nameplate;
      user.clan = clan;
      user.connectedAccounts = connectedAccounts;
      user.bio = bio;
      user.lastUpdated = new Date();

      await user.save();

      const avatarUrl = this._avatarUrl(user._id, profileData.user?.avatar);
      sendUpdateWebhook(user._id, avatarUrl).catch(() => {});

      return user;
    } catch (error) {
      await UserModel.findByIdAndUpdate(user._id, { lastUpdated: new Date() });
      throw error;
    }
  }

  async updateAllUsers() {
    const users = await UserModel.find();
    for (const user of users) {
      try {
        await this.updateUserProfile(user);
        console.log(`Updated user ${user._id}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error updating ${user._id}:`, error);
      }
    }
  }

  async populateUsers(memberIds) {
    console.log(`Populating ${memberIds.length} members...`);
    for (const id of memberIds) {
      try {
        const exists = await this.getUserByDiscordId(id);
        if (!exists) {
          await this.registerUser(id);
          console.log(`Populated user ${id}`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error populating user ${id}:`, error);
      }
    }
    console.log("Population complete.");
    await sendPopulationWebhook();
  }

  async getUserByDiscordId(discordId) {
    return UserModel.findById(discordId).exec();
  }

  async deleteUserByDiscordId(discordId, avatarUrl) {
    await UserModel.findByIdAndDelete(discordId).exec();
    sendDeleteWebhook(discordId, avatarUrl).catch(() => {});
  }
}

module.exports = UserService;
