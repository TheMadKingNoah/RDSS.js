import Button from "../../modules/interactions/buttons/Button";
import QuickMute from "../../utils/QuickMute";
import RoleUtils from "../../utils/RoleUtils";
import Bot from "../../Bot";

import {ButtonInteraction, GuildMember} from "discord.js";

export default class QuickMuteButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: { startsWith: "qm" }
        });
    }

    async execute(interaction: ButtonInteraction) {
        if (!RoleUtils.hasAnyRole((interaction.member as GuildMember), [
            RoleUtils.roles.moderator,
            RoleUtils.roles.seniorModerator,
            RoleUtils.roles.manager
        ])) {
            interaction.reply({
                content: "Invalid permissions!",
                ephemeral: true
            }).catch(console.error);

            return;
        }

        const duration = interaction.customId.replace("qm", "");
        await QuickMute.quickMuteFromButton(interaction, `${duration}m`);
    }
}