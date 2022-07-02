import { BaseGuildTextChannel, Client, ClientOptions, Message, MessageActionRow, MessageButton, TextChannel } from "discord.js";
import Properties from "../utils/Properties";

module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction: { isButton: () => any; customId: string; message: Message<boolean>; }) {
    if (!interaction.isButton()) return;
	if(interaction.customId == "OK"){
        console.log("test");
        (interaction.message as Message).delete();
    } 

    if(interaction.customId == "Infractions") {
        (interaction.message as Message)
        const channel = interaction.message.client.channels.cache.get(Properties.COMMANDS_CHANNEL_ID);

        const authorId = interaction.message.content.split("`")[3];

        if(channel !=null) {
            (channel as TextChannel).send(
                `;inf search ${authorId}`
            
            )
        }
    }

    if(interaction.customId == "qm30") {
        (interaction.message as Message)
        const channel = interaction.message.client.channels.cache.get(Properties.COMMANDS_CHANNEL_ID);
    }
}
}