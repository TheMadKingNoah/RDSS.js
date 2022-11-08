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
        let duration = Properties.defaultWinnerRoleDuration;

        switch (roleId) {
            case RoleUtils.roles.gameChampion: {
                isTemporary = true;
                break;
            }

            case RoleUtils.roles.triviaMaster: {
                duration = Properties.triviaMasterRoleDuration;
                isTemporary = true;
                break;
            }
        }

        const winnerList = interaction.message.embeds[0].fields?.[0].value;

        if (!winnerList) {
            await interaction.reply({
                content: "Unable to fetch the list of winners!",
                ephemeral: true
            });
            return;
        }

        const winnerIds = winnerList?.match(/(?<=`)\d{17,19}(?=`)/g) as string[];
        const winners = await interaction.guild?.members.fetch({ user: winnerIds }) as Collection<string, GuildMember>;

        for (const [_, winner] of winners) {
            if (!winner) continue;
            const [winnerData] = this.client.winners.list.filter((value, key) => key.includes(winner.id) && value.roleId === roleId);

            if (winnerData && winnerData[1].roleId === roleId) {
                clearTimeout(winnerData[1].timeout);
                this.client.winners.list.delete(winner.id);
            }

            winner.roles.add(roleId).catch(console.error);
            if (isTemporary) this.client.winners.add(winner, interaction.message.id, roleId, duration);
        }

        if (isTemporary) {
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

        if (isTemporary) {
            timestamp = ` - Remove <t:${Math.trunc(Date.now() / 1000) + duration}:R>`;
            removeRoles
                .setLabel("Force Remove Roles")
                .setCustomId("forceRemoveWinnerRoles")
        }

        const actionRow = new MessageActionRow().setComponents(removeRoles);
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
            components: [actionRow]
        });
    }
}