import { OAuth2Scopes, PermissionResolvable } from "discord.js";

export default {
  support_server: "https://discord.gg/SQwdQMDz9S",
  invite: {
    scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
    permissions: [
      "ViewChannel",
      "SendMessages",
      "AttachFiles",
      "UseExternalEmojis",
      "UseExternalStickers",
      "SendMessagesInThreads",
    ] as PermissionResolvable,
  },
  website: "https://aroxbot.xyz/",
  termsOfService: "https://aroxbot.xyz/tos",
  privacy: "https://aroxbot.xyz/privacy",
};
