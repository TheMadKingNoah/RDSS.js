import Button from "../../modules/interactions/buttons/Button";
import Properties from "../../utils/Properties";
import Bot from "../../Bot";

import { ButtonInteraction, GuildMember, TextChannel, User } from "discord.js";
import EmbedBuilds from "../../utils/EmbedBuilds";

export default class InfractionsButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "Userinfo"
        });
    }

    async execute(interaction: ButtonInteraction) {
        const authorId = interaction.message.content.split("`")[3].replace(" ","");
        const commandsChannel = await this.client.channels.fetch(Properties.channels.commands) as TextChannel;

        if (!commandsChannel) {
            await interaction.reply({
                content: "Unable to fetch the commands channel.",
                ephemeral: true
            });
            return;
        }

        const member = await interaction.guild?.members.fetch(authorId) as GuildMember;
        const user = await interaction.client.users.fetch(authorId);

        interaction.guild?.bans.fetch(user.id).then( isBanned => { 
            commandsChannel.send({embeds: [EmbedBuilds.getUserInfoEmbed(user, member, isBanned)]}).then(message => {
                interaction.reply({
                    content: `view user-info here ${message.url}`,
                    ephemeral: true
                }).catch(console.error);
            }).catch(console.error);
        }).catch(e => {
            commandsChannel.send({embeds: [EmbedBuilds.getUserInfoEmbed(user, member, null)]}).then(message => {
                interaction.reply({
                    content: `view user-info here ${message.url}`,
                    ephemeral: true
                }).catch(console.error);
            }).catch(console.error);
        });
    }
}