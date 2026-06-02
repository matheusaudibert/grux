const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    link: { type: String, default: null },
  },
  { _id: false }
);

const NameplateSchema = new mongoose.Schema(
  {
    sku_id: { type: String, required: true },
    asset: { type: String, required: true },
    label: { type: String, required: true },
    palette: { type: String, required: true },
  },
  { _id: false }
);

const ClanSchema = new mongoose.Schema(
  {
    identity_guild_id: { type: String, default: null },
    identity_enabled: { type: Boolean, required: true },
    tag: { type: String, default: null },
    badge: { type: String, default: null },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    bio: { type: String, default: null },
    nameplate: { type: NameplateSchema, default: null },
    badges: { type: [BadgeSchema], default: [] },
    clan: { type: ClanSchema, default: null },
    connectedAccounts: [
      {
        type: { type: String, required: true },
        id: { type: String, required: true },
        name: { type: String, required: true },
        verified: { type: Boolean, required: true },
        _id: false,
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
    versionKey: false,
    collection: "grux_users",
  }
);

module.exports = mongoose.model("User", UserSchema);
