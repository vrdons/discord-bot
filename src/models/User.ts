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
  Default,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy";
import { Locale } from "discord.js";

@Table({
  underscored: true,
  timestamps: true,
  tableName: "users",
})
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Attribute(DataTypes.STRING)
  @NotNull
  @PrimaryKey
  declare id: string;

  @Attribute(DataTypes.STRING)
  declare locale: Locale | null;

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare acceptedRules: boolean;

  async acceptRules() {
    this.acceptedRules = true;
    await this.save();
  }

  async declineRules() {
    this.acceptedRules = false;
    await this.save();
  }
  static get totalAccepted() {
    return new Promise<number>(async (a) => {
      const users = await User.count({
        where: { acceptedRules: true },
      });
      a(users);
    });
  }

  async setLocale(locale: Locale) {
    this.locale = locale;
    await this.save();
  }
  static async getUserById(
    id: string,
    options?: FindOrCreateOptions<
      InferAttributes<User, { omit: never }>,
      CreationAttributes<User>
    >,
  ) {
    const [user, created] = await User.findOrCreate({
      where: { id },
      ...options,
    });
    if (created) await User.sync(options);
    return user;
  }
}
