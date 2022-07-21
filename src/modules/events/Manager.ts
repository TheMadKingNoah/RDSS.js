import Bot from "../../Bot";
import path from "path";
import fs from "fs";

export default class EventHandler {
      client: Bot;

      constructor(client: Bot) {
            this.client = client;
      }

      public async load() {
            let eventFiles;
            
            if (process.env.BOT_TOKEN == "Production") {
                  eventFiles = fs.readdirSync(path.join(__dirname, "../../events")).filter(file => file.endsWith(".js"));
            } else {
                  eventFiles = fs.readdirSync(path.join(__dirname, "../../events")).filter(file => file.endsWith(".ts"));
            }

            for (const file of eventFiles) {
                  const EventListener = require(path.join(__dirname, "../../events", file));
                  const event = new EventListener(this.client);

                  if (event.once) {
                        this.client.once(event.name, (...args) => event.execute(...args));
                  } else {
                        this.client.on(event.name, (...args) => event.execute(...args));
                  }
            }
      }
}