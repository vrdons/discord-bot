import {
  ChatInputCommandContext,
  ContextMenuCommandContext,
  MessageCommandContext,
} from "@sapphire/framework";
import Sequelize from "@sequelize/core";
import { TFunction } from "i18next";

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_HOST?: string;
      DB_PORT?: string;
      DB_USER?: string;
      DB_PASSWORD?: string;
      DB_NAME?: string;
      SHARDING_MANAGER?: string;
      SHARDS?: string;
      SHARD_COUNT?: string | "auto";
      DISCORD_TOKEN?: string;
      [key: string]: string | undefined;
    }
  }
}
export enum ExtraEvents {
  FindCommandAliases = "findCommandAliases",
}
declare module "@sapphire/pieces" {
  interface Container {
    database: Sequelize;
    links: {
      support_server: string;
      invite: string;
      website: string;
      termsOfService: string;
      privacy: string;
      topGGvote: string;
      [key: string]: string;
    };
  }
}
export interface BaseContext {
  language: string;
  t: TFunction;
}
export interface MessageContext extends MessageCommandContext, BaseContext {}
export interface ChatInputContext
  extends ChatInputCommandContext,
    BaseContext {}
export interface ContextMenuContext
  extends ContextMenuCommandContext,
    BaseContext {}
