import { container } from "@sapphire/framework";
import { Interaction, Message } from "discord.js";
import { getUser } from "libs/discord";

export function generateDefaultVariable() {
  return {
    botname: container.client.user?.displayName,
    bot_name: container.client.user?.displayName,
    supportLink: container.links.support_server,
    support_link: container.links.support_server,
    support_server: container.links.support_server,
    supportServer: container.links.support_server,
    website: container.links.website,
    tos: container.links.termsOfService,
    termsOfService: container.links.termsOfService,
    terms: container.links.termsOfService,
    invite: container.links.invite,
    inviteLink: container.links.invite,
    top_gg: container.links.topGGvote,
    tgg: container.links.topGGvote,
    vote: container.links.topGGvote,
  };
}
export function generateUserVariable(int: Interaction | Message) {
  const user = getUser(int);
  return {
    username: user.username,
    user_name: user.username,
    displayName: user.displayName,
    display_name: user.displayName,
  };
}
