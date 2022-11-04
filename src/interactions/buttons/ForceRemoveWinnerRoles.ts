import Button from "../../modules/interactions/buttons/Button";
import Bot from "../../Bot";

import {ButtonInteraction, GuildMember, Message} from "discord.js";
import RoleUtils from "../../utils/RoleUtils";

export default class ForceRemoveWinnerRolesButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "forceRemoveWinnerRoles"
        });
    }

    async execute(interaction: ButtonInteraction) {
        if (!RoleUtils.hasAnyRole(interaction.member as GuildMember, [
            RoleUtils.roles.publicSectorPm,
            RoleUtils.roles.seniorModerator,
            RoleUtils.roles.manager
        ])) {
            interaction.reply({
                content: "You do not have permission to use this button!",
                ephemeral: true
            }).catch(console.error);
            return;
        }

        let removedRoles = 0;
        const winners = this.client.winners.list.filter(winner => winner.messageId === interaction.message.id);
        let winnerRole = "winner";

        for (let [winnerId, data] of winners.entries()) {
            winnerId = winnerId.split("_")[0];

            const member = await interaction.guild?.members.fetch(winnerId).catch(console.error) as GuildMember;
            clearTimeout(data.timeout);

            this.client.winners.list.delete(winnerId);
            member.roles.remove(data.roleId).catch(console.error);
            winnerRole = `<@&${data.roleId}>`;
            removedRoles++;
        }

        (interaction.message as Message).delete().catch(console.error);

        await interaction.reply({
            content: `Removed **${removedRoles}** ${winnerRole} roles!`,
            ephemeral: true
        });
    }
}