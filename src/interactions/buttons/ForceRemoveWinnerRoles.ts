import Button from "../../modules/interactions/buttons/Button";
import RoleUtils from "../../utils/RoleUtils";
import Bot from "../../Bot";

import {ButtonInteraction, GuildMember, Message} from "discord.js";

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

        const remainingTimesList = new Map();

        await interaction.channel?.messages.fetch({limit: 100})
        .then(async messages => {
            for (const message of messages.values()) {
                if (!message.author.bot) continue;
                if (message.embeds.length === 0) continue;
                if (!message.content) continue;
                if (message.id === interaction.message.id) continue;

                const roleId = message.content.replace(/\D/g, "");

                const currentTime = Math.trunc(Date.now() / 1000);
                const remainingTime = message.embeds[0].fields[0].name?.match(/\d{10,}/g)?.map(Number)[0] as number - currentTime;

                const winnerList = message.embeds[0].fields[0].value;
                const winnerIds = winnerList.match(/(?<=`)\d{17,19}(?=`)/g) as string[];

                for await (const winnerId of winnerIds) {
                    const roleTimer = remainingTimesList.get(`${winnerId}_${roleId}`);
                    if (!roleTimer || roleTimer < remainingTime) remainingTimesList.set(`${winnerId}_${roleId}`, { duration: remainingTime, messageId: message.id });
                }
            }
        })
        .catch(console.error);

        let removedRoles = 0;
        let winnerRole = "winner";
        const storedWinners = this.client.winners.list.filter(winner => winner.messageId === interaction.message.id);

        for (let [winnerId, data] of storedWinners.entries()) {
            winnerId = winnerId.split("_")[0];
            const member = await interaction.guild?.members.fetch(winnerId).catch(console.error) as GuildMember;

            clearTimeout(data.timeout);
            this.client.winners.list.delete(winnerId);

            const winner = remainingTimesList.get(`${winnerId}_${data.roleId}`);
            if (winner) {
                this.client.winners.add(member, winner.messageId, data.roleId, winner.duration);
                continue;
            }

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