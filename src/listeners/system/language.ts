import { Listener } from "@sapphire/framework";
import Links from "config/Links";
import i18next from "i18next";
import { emojiProcessor } from "libs/language/emoji";
import { generateDefaultVariable } from "libs/language/variable";
import humanizeDuration, { Unit } from "humanize-duration";
import { formatTimestamp, TIMESTAMP_TYPE } from "libs/discord";
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
    i18next.use(emojiProcessor);
    this.container.links.invite = this.container.client.generateInvite(
      Links.invite,
    );
    this.container.links.topGGvote = `https://top.gg/bot/${this.container.client.user?.id}/vote`;
    const links = generateDefaultVariable();

    this.container.i18n.options.i18next = {
      ...this.container.i18n.options.i18next,
      interpolation: {
        //@ts-ignore
        ...(this.container.i18n.options.i18next?.interpolation ?? {}),
        format: (value, format, lng) => {
          if (format == "timestamp") {
            return formatTimestamp(value, "R");
          }
          if (format?.startsWith("timestamp:")) {
            const type = format.split(":")[1] as TIMESTAMP_TYPE;
            return formatTimestamp(value, type);
          }
          if (format === "duration") {
            return humanizeDuration(value, {
              units: ["s", "ms"],
              language: lng,
            });
          }
          if (format?.startsWith("duration:")) {
            const options: Record<string, any> = { language: lng };

            format
              .slice(9)
              .split(",")
              .forEach((opt) => {
                const [k, v] = opt.split("=");
                if (k === "units") options.units = v.split("|") as Unit[];
                else if (k === "largest") options.largest = parseInt(v);
                else if (k === "round") options.round = v === "true";
                else if (k === "delimiter") options.delimiter = v;
                else if (k === "spacer") options.spacer = v;
                else options[k] = v;
              });

            return humanizeDuration(value, options);
          }
          return value;
        },
        defaultVariables: links,
      },
    };
    this.container.i18n.init();
  }
}
