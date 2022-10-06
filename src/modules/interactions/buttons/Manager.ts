import { Collection } from "discord.js";

import Button from "./Button";
import Bot from "../../../Bot";
import path from "path";
import fs from "fs";

export default class CommandHandler {
      client: Bot;
      buttons: Collection<string | { startsWith: string } | { endsWith: string } | { includes: string }, Button>;

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

            const buttonName = typeof button.name === "string" ?
                button.name :
                Object.values(button.name)[0];

            console.log(`(BUTTONS) Registered button: "${buttonName}"`);
      }

      public async handle(interaction: any) {
            const button = this.buttons.find(b => {
                  if (typeof b.name === "string") return b.name === interaction.customId;

                  if ((b.name as { startsWith: string }).startsWith) return interaction.customId.startsWith((b.name as { startsWith: string }).startsWith);
                  if ((b.name as { endsWith: string }).endsWith) return interaction.customId.endsWith((b.name as { endsWith: string }).endsWith);
                  if ((b.name as { includes: string }).includes) return interaction.customId.includes((b.name as { includes: string }).includes);

                  return false;
            });

            if (!button) return;

            const buttonName = typeof button.name === "string" ?
                button.name :
                Object.values(button.name)[0];
            
            // @ts-ignore
            button.execute(interaction, this.client)
                  .then(() => console.log(`(BUTTONS) "${buttonName}" executed by ${interaction.user.tag}`))
                  .catch((err: any) => {
                        console.log(`Failed to execute button: ${buttonName}`);
                        console.error(err);
                  });
      }
}