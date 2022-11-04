import Button from "../../modules/interactions/buttons/Button";
import Bot from "../../Bot";

import {ButtonInteraction, GuildMember, Message} from "discord.js";
import RoleUtils from "../../utils/RoleUtils";

export default class ForceRemoveWinnerRolesButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "removeWinnerRoles"
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

        const winnerList = interaction.message.embeds[0].fields?.[0].value;
        const winnerIds = winnerList?.match(/(?<=`)\d{17,19}(?=`)/g) as string[];
        const roleId = interaction.message.content.replace(/\D/g, "");

        const allWinners = new Set();

        await interaction.channel?.messages.fetch({limit: 100}).then(messages => {
            for (const message of messages.values()) {
                const winners = message.embeds[0].fields[0].value?.match(/(?<=`)\d{17,19}(?=`)/g) as string[];
                if (
                    message.content.includes(roleId) &&
                    message.components[0].components[0].customId &&
                    message.id !== interaction.message.id
                ) winners.forEach(allWinners.add, allWinners);
            }
        });

        for (const winnerId of winnerIds) {
            if (allWinners.has(winnerId)) continue;

            const member = await interaction.guild?.members.fetch(winnerId).catch(console.error) as GuildMember;
            if (!member) continue;

            member.roles.remove(roleId).catch(console.error);
            removedRoles++;
        }

        await interaction.reply({
            content: `Removed **${removedRoles}** <@&${roleId}> roles!`,
            ephemeral: true
        }).catch(console.error);

        (interaction.message as Message).delete().catch(console.error);
    }
}