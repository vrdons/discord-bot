import {
  CreationAttributes,
  DataTypes,
  FindOrCreateOptions,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "@sequelize/core";
import {
  Attribute,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy";
import { Locale } from "discord.js";

@Table({
  underscored: true,
  timestamps: true,
  tableName: "guilds",
})
export class Guild extends Model<
  InferAttributes<Guild>,
  InferCreationAttributes<Guild>
> {
  @Attribute(DataTypes.STRING)
  @NotNull
  @PrimaryKey
  declare id: string;

  @Attribute(DataTypes.STRING)
  declare locale: Locale | null;

  @Attribute(DataTypes.STRING)
  declare prefix: string | null;

  async setPrefix(prefix: string) {
    this.prefix = prefix;
    await this.save();
  }
  async setLocale(locale: Locale) {
    this.locale = locale;
    await this.save();
  }
  static async getGuildById(
    id: string,
    options?: FindOrCreateOptions<
      InferAttributes<Guild, { omit: never }>,
      CreationAttributes<Guild>
    >,
  ) {
    const [user, created] = await Guild.findOrCreate({
      where: { id },
      ...options,
    });
    if (created) await Guild.sync(options);
    return user;
  }
}
