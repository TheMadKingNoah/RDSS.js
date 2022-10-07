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
           
            client.contexts.load().catch(console.error);
            client.commands.load().catch(console.error);
            client.commands.publish().catch(console.error);
            
            client.buttons.load().catch(console.error);
            client.alertMaintainer.initiate().catch(console.error);
      }
}