import SelectMenu from "../../modules/interactions/select_menus/SelectMenu";
import Bot from "../../Bot";

import {GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, SelectMenuInteraction} from "discord.js";
import RoleUtils from "../../utils/RoleUtils";
import Properties from "../../utils/Properties";

export default class SelectWinnerRoleSelectMenu extends SelectMenu {
    constructor(client: Bot) {
        super(client, {
            name: "selectWinnerRole"
        });
    }

    async execute(interaction: SelectMenuInteraction) {
        if (!RoleUtils.hasAnyRole(interaction.member as GuildMember, [
            RoleUtils.roles.publicSectorPm,
            RoleUtils.roles.seniorModerator,
            RoleUtils.roles.manager
        ])) {
            await interaction.reply({
                content: "You don't have permission to use this interaction.",
                ephemeral: true
            });
            return;
        }

        const roleId = interaction.values[0];
        const roleProperties = await interaction.guild?.roles.fetch(roleId);

        if (!roleProperties) {
            await interaction.reply({
                content: "Unable to fetch the role.",
                ephemeral: true
            });
            return;
        }

        let isTemporary = false;
        if (roleId === RoleUtils.roles.gameChampion) isTemporary = true;

        const winnerList = interaction.message.embeds[0].fields?.[0].value;

        if (!winnerList) {
            await interaction.reply({
                content: "Unable to fetch the list of winners!",
                ephemeral: true
            });
            return;
        }

        const winnerIds = winnerList?.match(/(?<=`)\d{17,19}(?=`)/g) as string[];

        for (const winnerId of winnerIds) {
            const member = await interaction.guild?.members.fetch(winnerId).catch(console.error);

            if (!member) {
                winnerIds.splice(winnerIds.indexOf(winnerId), 1);
                continue;
            }

            if (this.client.winners.list.has(winnerId)) {
                winnerIds.splice(winnerIds.indexOf(winnerId), 1);

                clearTimeout(this.client.winners.list.get(winnerId)?.timeout);
                this.client.winners.list.delete(winnerId);
            }

            member.roles.add(roleId).catch(console.error);
            if (isTemporary) this.client.winners.add(member, interaction.message.id, roleId);
        }

        if (isTemporary) {
            setTimeout(() => {
                (interaction.message as Message).delete().catch(e => e);
            }, Properties.winnerRoleDuration * 1000);
        }

        let timestamp = "";
        let removeRoles = new MessageButton()
            .setStyle("DANGER")
            .setLabel("Remove Roles")
            .setCustomId("removeWinnerRoles")

        if (isTemporary) {
            timestamp = ` - Remove <t:${Math.trunc(Date.now() / 1000) + Properties.winnerRoleDuration}:R>`;
            removeRoles
                .setLabel("Force Remove Roles")
                .setCustomId("forceRemoveWinnerRoles")
        }

        const actionRow = new MessageActionRow().setComponents(removeRoles);
        const editedEmbed = new MessageEmbed(interaction.message.embeds[0])
            .setColor(roleProperties.color)
            .setFields([{
                name: `${roleProperties.name}${timestamp}`,
                value: winnerList
            }]);

        await interaction.update({
            content: `<@&${roleId}>`,
            embeds: [editedEmbed],
            components: [actionRow]
        });
    }
}