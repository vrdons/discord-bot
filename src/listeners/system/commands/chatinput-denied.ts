import {
  Events,
  Identifiers,
  Listener,
  type ChatInputCommandDeniedPayload,
  type UserError,
} from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import { TFunction, TOptions } from "i18next";
import { deleteMessage, fetchLocale } from "libs/discord";

export class ChatInputCommandDenied extends Listener<
  typeof Events.ChatInputCommandDenied
> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      once: true,
      event: Events.ChatInputCommandDenied,
    });
  }

  public async run(
    error: UserError,
    { interaction }: ChatInputCommandDeniedPayload,
  ) {
    if (Reflect.get(Object(error.context), "silent")) return;
    const t = this.container.i18n.getT(await fetchLocale(interaction));

    switch (error.identifier) {
      case Identifiers.PreconditionCooldown: {
        const context = error.context as any;
        const remaining = context.remaining as number;
        return this.replyAndDelete(
          interaction,
          t,
          "defaults/error:onCooldown",
          {
            time: Date.now() + remaining,
            context: remaining ? "time" : undefined,
          },
          remaining,
        );
      }

      case Identifiers.ArgsMissing:
        return this.replyAndDelete(
          interaction,
          t,
          "defaults/error:argsMissing",
        );

      case Identifiers.ArgsUnavailable:
        return this.replyAndDelete(
          interaction,
          t,
          "defaults/error:argsUnavailable",
          { name: (error.context as any)?.name },
        );
      case Identifiers.CommandDisabled:
        break;

      default:
        break;
    }
    return;
  }
  replyAndDelete(
    interaction: ChatInputCommandInteraction,
    t: TFunction,
    content: string,
    options: TOptions = {},
    time?: number,
  ) {
    interaction.reply(t(content, options)).then((m) => deleteMessage(m, time));
  }
}
