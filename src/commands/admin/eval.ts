import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command } from "@sapphire/framework";
import { Message } from "discord.js";
import { MessageContext } from "typing";

@ApplyOptions<Command.Options>({
  name: "eval",
  aliases: ["evaluate"],
  preconditions: ["AdminOnly"],
  rulesDisabled: true,
})
export class EvalCommand extends Command {
  public override async messageRun(
    message: Message,
    args: Args,
    context: MessageContext,
  ) {
    const str = await args.peekResult("string");
    if (str.isOk()) {
      const action =
        "send" in message.channel ? message.channel.send : message.reply;
      const string = str.unwrap();

      try {
        const result = String(eval(string));
        const maxLength = 2000;
        const outputPrefix = "# Output: ";
        let messages: string[] = [];

        if (outputPrefix.length + result.length <= maxLength) {
          messages = [`${outputPrefix}${result}`];
        } else {
          let firstChunk = result.slice(0, maxLength - outputPrefix.length);
          messages.push(`${outputPrefix}${firstChunk}`);

          for (
            let i = maxLength - outputPrefix.length;
            i < result.length;
            i += maxLength
          ) {
            messages.push(result.slice(i, i + maxLength));
          }
        }

        for (const msg of messages) {
          await action({ content: msg });
        }
      } catch (error) {
        try {
          const errorMessage = `# Error: ${error instanceof Error ? error.message : String(error)}`;
          if (errorMessage.length > 2000) {
            await action({
              content: "Error message is too long to display.",
            });
          } else {
            await action({ content: errorMessage });
          }
        } catch (err) {
          console.error("Failed to send error message:", err);
        }
      }
    } else {
    }
  }
}
