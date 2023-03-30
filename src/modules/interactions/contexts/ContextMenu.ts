import { ApplicationCommandType, MessageApplicationCommandData } from "discord.js";

import ContextMenuHandler from "./Manager";
import Bot from "../../../Bot";

export default class ContextMenu {
      client: Bot;
      manager: ContextMenuHandler;
      name: string;
      type: ApplicationCommandType | string;

      constructor(client: Bot, data: MessageApplicationCommandData) {
            this.client = client;
            this.manager = client.contexts;
            this.name = data.name;
            this.type = data.type
       
            this.client.contexts.register(this).catch(console.error);
      }

      build(): MessageApplicationCommandData {
            return {
                  name: this.name,
                  type: ApplicationCommandType.Message
            }
      }
}