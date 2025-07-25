import { Listener } from "@sapphire/framework";
import Links from "config/Links";
import i18next from "i18next";
import { emojiProcessor } from "libs/language/emoji";
import { generateDefaultVariable } from "libs/language/variable";
import humanizeDuration, { Unit } from "humanize-duration";
import { formatTimestamp, TIMESTAMP_TYPE } from "libs/discord";
import prettyBytes from "pretty-bytes";
export class I18nReadyListener extends Listener {
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
        ...((this.container.i18n.options.i18next as any)?.interpolation ?? {}),
        format: (value, format, lng) => {
          if (format === "timestamp") {
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
                const [key, value] = opt.split("=");
                if (key === "units") options.units = value.split("|") as Unit[];
                else if (key === "largest") options.largest = parseInt(value);
                else if (key === "round") options.round = value === "true";
                else if (key === "delimiter") options.delimiter = value;
                else if (key === "spacer") options.spacer = value;
                else options[key] = value;
              });
            return humanizeDuration(Math.round(parseInt(value)), options);
          }
          if (format === "bytes") {
            return prettyBytes(value);
          }
          if (format?.startsWith("bytes:")) {
            const options: Record<string, any> = {};
            format
              .slice(6)
              .split(",")
              .forEach((opt) => {
                const [key, value] = opt.split("=");
                if (key === "binary") options.binary = value === "true";
                else if (key === "bits") options.bits = value === "true";
                else if (key === "signed") options.signed = value === "true";
                else if (key === "minimumFractionDigits")
                  options.minimumFractionDigits = parseInt(value);
                else if (key === "maximumFractionDigits")
                  options.maximumFractionDigits = parseInt(value);
                else options[key] = value;
              });
            return prettyBytes(value, options);
          }
          return value;
        },
        defaultVariables: links,
      },
    };
    this.container.i18n.init();
  }
}
