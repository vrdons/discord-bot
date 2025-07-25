import { Listener } from "@sapphire/framework";
export class LoaderListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      once: false,
      event: "ready",
    });
  }

  public async run() {
    const storeListener = this.container.stores.get("listeners");
    this.container.logger.info("Unloading listeners...");
    await storeListener.get("CoreMessageCommandAccepted")?.unload();
    this.container.logger.debug("Unloaded: CoreMessageCommandAccepted");
    await storeListener.get("CoreChatInputCommandAccepted")?.unload();
    this.container.logger.debug("Unloaded: CoreChatInputCommandAccepted");
    await storeListener.get("CoreContextMenuCommandAccepted")?.unload();
    this.container.logger.debug("Unloaded: CoreContextMenuCommandAccepted");
  }
}
