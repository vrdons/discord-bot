import "@sapphire/plugin-hmr/register";
import "@sapphire/plugin-i18next/register";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";
import {
  ApplicationCommandRegistries,
  container,
  SapphireClient,
} from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { LanguageConfig } from "config/LanguageConfig";
import { fetchPrefix } from "config/Prefix";
import { importModels, Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import Links from "config/Links";

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  loadMessageCommandListeners: true,
  fetchPrefix: fetchPrefix,
  hmr: {
    enabled: true,
  },

  i18n: LanguageConfig,
});
/* ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);
*/
async function main() {
  const obj = {
    ...Links,
    invite: "",
    topGGvote: "",
  };
  container.links = obj;
  const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    clientMinMessages: "notice",
    client_encoding: "UTF8",
    models: await importModels(
      __dirname.replace(/\\/g, "/") + "/models/**/*.{ts,js}",
    ),
  });
  await sequelize.authenticate();
  await sequelize.sync();
  container.database = sequelize;
  await client.login(process.env.DISCORD_TOKEN!);
}

void main();
