import { ApplicationCommandDataResolvable, Collection, CommandInteraction } from "discord.js";

import ContextMenu from "./ContextMenu";
import Bot from "../../../Bot";
import path from "path";
import fs from "fs";

export default class ContextMenuHandler {
      client: Bot;
      contexts: Collection<string, any>;

      constructor(client: Bot) {
            this.client = client;
            this.contexts = new Collection();
      }

      public async load() {
            let commandFiles;
            
            if (process.env.BOT_TOKEN == "Production") {
                  commandFiles = fs.readdirSync(path.join(__dirname, "../../../interactions/contexts"))
                        .filter(file => file.endsWith(".js"));
            } else {
                  commandFiles = fs.readdirSync(path.join(__dirname, "../../../interactions/contexts"))
                        .filter(file => file.endsWith(".ts"));
            }

            for (const file of commandFiles) {
                  const command = require(path.join(__dirname, "../../../interactions/contexts", file)).default;
                  new command(this.client);
            }
      }

      public async register(command: ContextMenu) {
            this.contexts.set(command.name, command);
            console.log(`Registered context menu command: "${command.name}"`);
      }

      public async publish() {
            const contexts: ApplicationCommandDataResolvable[] = await Promise.all(
                  this.client.contexts.contexts.map(command => command.build())
            );

            this.client.application?.commands.set(contexts)
                  .then(() => console.log(`(COMMANDS) Successfully loaded ${this.client.contexts.contexts.size} context menu commands!`))
                  .catch(console.error);
      }

      public async handle(interaction: any) {
            const command = this.contexts.get(interaction.commandName);

            if (!command) {
                  return;
            }
            
            command.execute(interaction, this.client)
                  .then(() => console.log(`"${command.name}" executed by ${interaction.user.tag} ("${interaction.guild?.name}" • ${interaction.guildId})`))
                  .catch((err: any) => {
                        console.log(`Failed to execute command: ${command.name}`);
                        console.error(err);
                  });
      }
}