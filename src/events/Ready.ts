import EventListener from "../modules/events/Event";
import Bot from "../Bot";

module.exports = class ReadyEventListener extends EventListener {
      constructor(client: Bot) {
            super(client, {
                  name: "ready",
                  once: true,
            });
      }
      
      async execute(client: Bot) {
            console.log(`${client.user?.tag} is online!`);

            client.commands.load().catch(err => console.error(err));
            client.commands.publish().catch(err => console.error(err));
            
            client.buttons.load().catch(err => console.error(err));
      }
}