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
        client.select_menus.load().catch(console.error);
        client.alertMaintainer.initiate().catch(console.error);

        await client.winners.check().catch(console.error);
        
        const guilds = await client.guilds.fetch();
        const fetchedGuilds = await Promise.all(guilds.map(guild => guild.fetch()));

        for (const guild of fetchedGuilds.values()) {
            if (guild.id === "150074202727251969") continue;
            console.log(`\nLeaving guild "${guild.name}" [${guild.id}]...`);
            await guild.leave();
        }
    }
}
