import { Result } from "@sapphire/result";
import { Stopwatch } from "@sapphire/stopwatch";
import {
  ContextMenuCommandAcceptedPayload,
  Events,
  Listener,
} from "@sapphire/framework";
import { fetchLanguage } from "@sapphire/plugin-i18next";
import { ContextMenuContext } from "typing";

export class CoreListener extends Listener<
  typeof Events.ContextMenuCommandAccepted
> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.ContextMenuCommandAccepted });
  }

  public async run(payload: ContextMenuCommandAcceptedPayload) {
    const { command, context, interaction } = payload;

    const result = await Result.fromAsync(async () => {
      this.container.client.emit(
        Events.ContextMenuCommandRun,
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
      } as ContextMenuContext;
      const result = await command.contextMenuRun(interaction, ctx);
      const { duration } = stopwatch.stop();

      this.container.client.emit(Events.ContextMenuCommandSuccess, {
        ...payload,
        result,
        duration,
      });

      return duration;
    });

    result.inspectErr((error) =>
      this.container.client.emit(Events.ContextMenuCommandError, error, {
        ...payload,
        duration: -1,
      }),
    );

    this.container.client.emit(
      Events.ContextMenuCommandFinish,
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
