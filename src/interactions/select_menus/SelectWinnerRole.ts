import SelectMenu from "../../modules/interactions/select_menus/SelectMenu";
import Bot from "../../Bot";

import {
    Collection,
    EmbedField,
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    SelectMenuInteraction
} from "discord.js";
import RoleUtils from "../../utils/RoleUtils";

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

        const temporaryRoleData = RoleUtils.temporaryWinnerRoles.find(role => role.id === roleId);
        const duration = temporaryRoleData?.duration;

        let winnerList = interaction.message.embeds[0].fields?.[0].value;

        if (!winnerList) {
            await interaction.reply({
                content: "Unable to fetch the list of winners!",
                ephemeral: true
            });
            return;
        }

        const winnerIds = winnerList?.match(/(?<=`)\d{17,19}(?=`)/g) as string[];
        const winners = await interaction.guild?.members.fetch({ user: winnerIds }) as Collection<string, GuildMember>;
        const failedWinners = [];

        for (const winnerId of winnerIds) {
            const winner = winners.find(winner => winner.id === winnerId);
            if (!winner) {
                const fetchedWinner = await interaction.guild?.members.fetch(winnerId);
                if (fetchedWinner) {
                    winners.set(winnerId, fetchedWinner);
                    continue;
                }

                const re = new RegExp(`<@${winnerId}> \\(\`${winnerId}\`\\)(\\n)?`, "gm");
                winnerList = winnerList.replace(re, "");
                failedWinners.push(winnerId);
            }
        }

        for (const [_, winner] of winners) {
            if (!winner) continue;
            const [winnerData] = this.client.winners.list.filter((value, key) => key.includes(winner.id) && value.roleId === roleId);

            if (winnerData && winnerData[1].roleId === roleId) {
                clearTimeout(winnerData[1].timeout);
                this.client.winners.list.delete(winner.id);
            }

            winner.roles.add(roleId).catch(console.error);
            if (duration) this.client.winners.add(winner, interaction.message.id, roleId, duration);
        }

        if (duration) {
            setTimeout(() => {
                const removedRoles = new MessageButton()
                    .setLabel("Automatically Removed Roles")
                    .setStyle("LINK")
                    .setURL("https://discord.com/")
                    .setDisabled(true)

                const deleteMessage = new MessageButton()
                    .setCustomId("deleteMessage")
                    .setLabel("Delete")
                    .setStyle("DANGER")

                const actionRow = new MessageActionRow().setComponents(removedRoles, deleteMessage);

                (interaction.message as Message).edit({
                    embeds: interaction.message.embeds,
                    components: [actionRow]
                })
            }, duration * 1000);
        }

        let timestamp = "";
        let removeRoles = new MessageButton()
            .setStyle("DANGER")
            .setLabel("Remove Roles")
            .setCustomId("removeWinnerRoles")

        if (duration) {
            timestamp = ` - Remove <t:${Math.trunc(Date.now() / 1000) + duration}:R>`;
            removeRoles
                .setLabel("Force Remove Roles")
                .setCustomId("forceRemoveWinnerRoles")
        }

        if (failedWinners.length > 0) {
            interaction.channel?.send(`${roleId} | ${(interaction.message as Message).url} | <@${failedWinners.join("> <@")}>`);
            if (!winnerList.match(/\S/g)) {
                await (interaction.message as Message).delete();
                return;
            }
        }

        const actionRow = new MessageActionRow().setComponents(removeRoles);
        const components = [];

        if (temporaryRoleData) components.push(actionRow);

        const editedEmbed = new MessageEmbed(interaction.message.embeds[0])
            .setColor(roleProperties.color)
            .setDescription(`Approved by ${interaction.user}`)
            .setFields([
                {
                    name: `${roleProperties.name}${timestamp}`,
                    value: winnerList
                }
            ]);


        if (interaction.message.components?.length === 2)
            actionRow.addComponents(interaction.message.components[1].components[0]);

        if (interaction.message.embeds[0].fields?.[1]?.name.includes("Note"))
            editedEmbed.fields.push(interaction.message.embeds[0].fields[1] as EmbedField)

        await interaction.update({
            content: `<@&${roleId}>`,
            embeds: [editedEmbed],
            components
        });
    }
}