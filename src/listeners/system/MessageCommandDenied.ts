import {
  Events,
  Identifiers,
  Listener,
  type MessageCommandDeniedPayload,
  type UserError,
} from "@sapphire/framework";
import { Message } from "discord.js";
import { TFunction, TOptions } from "i18next";
import { deleteMessage, fetchLocale } from "libs/discord";

export class MessageCommandDenied extends Listener<
  typeof Events.MessageCommandDenied
> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      once: true,
      event: Events.MessageCommandDenied,
    });
  }
  public async run(error: UserError, payload: MessageCommandDeniedPayload) {
    if (Reflect.get(Object(error.context), "silent")) return;

    const t = this.container.i18n.getT(await fetchLocale(payload.message));
    switch (error.identifier) {
      case Identifiers.PreconditionCooldown: {
        const context = error.context as any;
        const remaining = context.remaining as number;
        return this.replyAndDelete(
          payload.message,
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
          payload.message,
          t,
          "defaults/error:argsMissing",
        );

      case Identifiers.ArgsUnavailable:
        return this.replyAndDelete(
          payload.message,
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
    interaction: Message,
    t: TFunction,
    content: string,
    options: TOptions = {},
    time?: number,
  ) {
    interaction.reply(t(content, options)).then((m) => deleteMessage(m, time));
  }
}
