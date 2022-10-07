import { ApplicationCommandOptionData, ChatInputApplicationCommandData, IntegrationExpireBehaviors } from "discord.js";

import CommandHandler from "./Manager";
import Bot from "../../../Bot";

export default class Command {
      client: Bot;
      manager: CommandHandler;
      name: string;
      description: string;
      options?: ApplicationCommandOptionData[];

      constructor(client: Bot, data: ChatInputApplicationCommandData) {
            this.client = client;
            this.manager = client.commands;
            this.name = data.name;
            this.description = data.description;
            this.options = data.options ?? [];

            this.client.commands.register(this).catch(console.error);
      }

      build(): ChatInputApplicationCommandData {
            return {
                  name: this.name,
                  description: this.description,
                  options: this.options ?? [],
            }
      }
}