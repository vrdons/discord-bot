import { Listener } from "@sapphire/framework";
export class ReadyListener extends Listener {
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
