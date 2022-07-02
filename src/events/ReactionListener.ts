import { BaseGuildTextChannel, Client, ClientOptions, Message, MessageActionRow, MessageButton, TextChannel } from "discord.js";
import Properties from "../utils/Properties";

module.exports = {
    name: "messageReactionAdd",
    once: false,
    async execute(reaction: { emoji: { id: string; }; message: { fetch: () => Promise<any>; }; client: { channels: { cache: { get: (arg0: string) => any; }; }; }; }, user: { id: any; }){
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('OK')
                .setLabel('OK')
                .setStyle('SUCCESS'),
    
            new MessageButton()
            .setCustomId("qm30")
            .setLabel("30m")
            .setStyle("DANGER"),
    
            new MessageButton()
            .setCustomId("qm60")
            .setLabel("60m")
            .setStyle("PRIMARY"),
    
            new MessageButton()
            .setCustomId("Infractions")
            .setLabel("Infractions")
            .setStyle("SECONDARY"),
        );
    
        if(reaction.emoji.id == "864251741711892501"){
            reaction.message.fetch().then( message => {
                if (message.content.length > 200) {
                    message.content = message.content.substring(0, 201) + "...";
                }
    
                const channel = reaction.client.channels.cache.get(Properties.ALERT_CHANNEL_ID);
                if(channel !=null) {
                    (channel as TextChannel).send({ content:
                        `\n**Reported by:** <@${user.id}> (ID: \`${user.id}\`)`
                        +`\n**Against:** <@${message.author.id}> (ID: \`${message.author.id}\`)`
                        +`\n ${message.url}` 
                        +`\n**Preview**:`
                        +`\n> ${message.content}`
                        +`\n(Access the jump URL to take action. Once finished, react to this message with one of the buttons)`
                        , components: [row] });
                    }
                }     
            )
        }
      }
}