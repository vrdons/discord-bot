import {
  Events,
  Identifiers,
  Listener,
  type MessageCommandDeniedPayload,
  type UserError,
} from "@sapphire/framework";
import { deleteMessage, fetchLocale } from "libs/discord";
import { CooldownContext } from "typing";

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
    if (error.identifier === Identifiers.PreconditionCooldown) {
      const context = error.context as CooldownContext;
      const remaining = context.remaining as number;
      const t = this.container.i18n.getT(await fetchLocale(payload.message));
      return payload.message
        .reply(
          t("defaults/error:onCooldown", {
            time: Date.now() + remaining,
            context: remaining ? "time" : undefined,
          }),
        )
        .then((m) => deleteMessage(m, remaining));
    }
    return;
  }
}
