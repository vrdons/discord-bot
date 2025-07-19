import { AllFlowsPrecondition, Result, UserError } from "@sapphire/framework";
import { checkAdmin } from "config/Other";
import {
  CommandInteraction,
  ContextMenuCommandInteraction,
  Message,
} from "discord.js";

export class AdminOnlyPrecondition extends AllFlowsPrecondition {
  public constructor(context: AllFlowsPrecondition.LoaderContext) {
    super(context, {
      name: "AdminOnly",
    });
  }

  public override async messageRun(message: Message) {
    const admin = checkAdmin(message.author.id);
    return admin ? this.ok() : this.error();
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    const admin = checkAdmin(interaction.user.id);
    return admin ? this.ok() : this.error();
  }

  public override async contextMenuRun(
    interaction: ContextMenuCommandInteraction,
  ): Promise<Result<unknown, UserError>> {
    const admin = checkAdmin(interaction.user.id);
    return admin ? this.ok() : this.error();
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    AdminOnly: never;
  }
}
