import { BaseGuildTextChannel, Client, ClientOptions, Message, MessageActionRow, MessageButton, TextChannel } from "discord.js";
import Properties from "./utils/Properties";

require("dotenv").config();

console.log("Bot is starting...");

const client = new Client({
    intents: [ "GUILDS",'GUILD_MESSAGE_REACTIONS', "GUILD_MEMBERS"],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.on('messageReactionAdd', async (reaction, user) => {
    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('OK')
            .setLabel('OK')
            .setStyle('SUCCESS'),

        new MessageButton()
        .setCustomId("30m")
        .setLabel("30m")
        .setStyle("DANGER"),

        new MessageButton()
        .setCustomId("60m")
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

            const channel = client.channels.cache.get(Properties.ALERT_CHANNEL_ID);
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
  });

  client.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;
    console.log("test")
    console.log(interaction.id)
	if(interaction.customId == "OK"){
        console.log("test");
        (interaction.message as Message).delete();
    }
});

client.login(process.env.BOT_TOKEN);