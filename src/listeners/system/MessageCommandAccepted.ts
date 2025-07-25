import {
  Events,
  Listener,
  MessageCommandAcceptedPayload,
} from "@sapphire/framework";
import { fetchLanguage } from "@sapphire/plugin-i18next";
import { Result } from "@sapphire/result";
import { Stopwatch } from "@sapphire/stopwatch";
import { MessageContext } from "typing";

export class CoreListener extends Listener<
  typeof Events.MessageCommandAccepted
> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.MessageCommandAccepted });
  }

  public async run(payload: MessageCommandAcceptedPayload) {
    const { message, command, parameters, context } = payload;
    const args = await command.messagePreParse(message, parameters, context);

    const result = await Result.fromAsync(async () => {
      message.client.emit(Events.MessageCommandRun, message, command, {
        ...payload,
        args,
      });
      const language = await fetchLanguage(message);
      const t = this.container.i18n.getT(language);
      const ctx = {
        ...context,
        language,
        t,
      } as MessageContext;
      const stopwatch = new Stopwatch();
      const result = await command.messageRun(message, args, ctx);
      const { duration } = stopwatch.stop();
      message.client.emit(Events.MessageCommandSuccess, {
        ...payload,
        args,
        result,
        duration,
      });

      return duration;
    });

    result.inspectErr((error) =>
      message.client.emit(Events.MessageCommandError, error, {
        ...payload,
        args,
        duration: -1,
      }),
    );

    message.client.emit(Events.MessageCommandFinish, message, command, {
      ...payload,
      args,
      success: result.isOk(),
      duration: result.unwrapOr(-1),
    });
  }
}
