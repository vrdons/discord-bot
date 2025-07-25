import { container } from "@sapphire/pieces";
import { Result } from "@sapphire/result";
import { Stopwatch } from "@sapphire/stopwatch";
import {
  ChatInputCommandAcceptedPayload,
  Events,
  Listener,
} from "@sapphire/framework";
import { fetchLanguage } from "@sapphire/plugin-i18next";
import { ChatInputContext } from "typing";

export class CoreListener extends Listener<
  typeof Events.ChatInputCommandAccepted
> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.ChatInputCommandAccepted });
  }

  public async run(payload: ChatInputCommandAcceptedPayload) {
    const { command, context, interaction } = payload;

    const result = await Result.fromAsync(async () => {
      this.container.client.emit(
        Events.ChatInputCommandRun,
        interaction,
        command,
        { ...payload },
      );

      const stopwatch = new Stopwatch();
      const language = await fetchLanguage(interaction);
      const t = this.container.i18n.getT(language);
      const ctx = {
        ...context,
        language,
        t,
      } as ChatInputContext;
      const result = await command.chatInputRun(interaction, ctx);
      const { duration } = stopwatch.stop();

      this.container.client.emit(Events.ChatInputCommandSuccess, {
        ...payload,
        result,
        duration,
      });

      return duration;
    });

    result.inspectErr((error) =>
      this.container.client.emit(Events.ChatInputCommandError, error, {
        ...payload,
        duration: -1,
      }),
    );

    this.container.client.emit(
      Events.ChatInputCommandFinish,
      interaction,
      command,
      {
        ...payload,
        success: result.isOk(),
        duration: result.unwrapOr(-1),
      },
    );
  }
}
