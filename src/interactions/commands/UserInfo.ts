import Command from "../../modules/interactions/commands/Command";
import Bot from "../../Bot";

import { CommandInteraction, GuildMember, ApplicationCommandOptionType, User, GuildChannel } from "discord.js";
import EmbedBuilds from "../../utils/EmbedBuilds";
import Properties from "../../utils/Properties";

export default class UserInfoCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "user-info",
            description: "Get info of a user",
            options: [
                {
                      name: "user",
                      description: "The user to view information about.",
                      type: ApplicationCommandOptionType.User,
                      required: true
                }
          ]
        });
    }

    async execute(interaction: CommandInteraction) {
        const member = interaction.options.getMember("user") as GuildMember;
        const user = interaction.options.getUser("user") as User;

        let channel = interaction.channel as GuildChannel;
        let isInternal = channel.parentId == Properties.categories.internalChannels
            || channel.parentId == Properties.categories.internalCommands;

        interaction.guild?.bans.fetch({ user: user.id, force: true}).then( isBanned => { 
            let embed = EmbedBuilds.getUserInfoEmbed(user, member, isBanned )

            interaction.reply({embeds: [embed], ephemeral:!isInternal}).catch(console.error);
        }).catch(e => {
            let embed = EmbedBuilds.getUserInfoEmbed(user, member, null );

            interaction.reply({embeds: [embed], ephemeral:!isInternal}).catch(console.error);
        });
    }
}
