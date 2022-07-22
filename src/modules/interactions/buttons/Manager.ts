import { Collection, GuildMember, ButtonInteraction } from "discord.js";

import Button from "./Button";
import Bot from "../../../Bot";
import path from "path";
import fs from "fs";

export default class CommandHandler {
      client: Bot;
      buttons: Collection<string, any>;

      constructor(client: Bot) {
            this.client = client;
            this.buttons = new Collection();
      }

      public async load() {
            let buttonFiles;

            if (process.env.BOT_TOKEN == "Production") {
                  buttonFiles = fs.readdirSync(path.join(__dirname, "../../../interactions/buttons"))
                        .filter(file => file.endsWith(".js"));
            } else {
                  buttonFiles = fs.readdirSync(path.join(__dirname, "../../../interactions/buttons"))
                        .filter(file => file.endsWith(".ts"));
            }

            for (const file of buttonFiles) {
                  const button = require(path.join(__dirname, "../../../interactions/buttons", file)).default;
                  new button(this.client);
            }
      }

      public async register(button: Button) {
            this.buttons.set(button.name, button);
            console.log(`(BUTTONS) Registered button: "${button.name}"`);
      }

      public async handle(interaction: any) {
            const button = this.buttons.get(interaction.customId);

            if (!button) {
                  return;
            }
            
            try {
                  await button.execute(interaction, this.client);
                  console.log(`(BUTTONS) "${button.name}" executed by ${interaction.user.tag}`);
            } catch (err) {
                  console.log(`Failed to execute button: ${button.name}`);
                  console.error(err);
            }
      }
}