import { Listener } from "@sapphire/framework";
export class I18nReadyListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      once: true,
      event: "ready",
    });
  }

  public run() {
    this.container.logger.warn(`Logged in ${this.container.client.user?.tag}!`);
  }
}
