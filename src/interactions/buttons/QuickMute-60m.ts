import Button from "../../modules/interactions/buttons/Button";
import QuickMute from "../../utils/QuickMute";
import RoleUtils from "../../utils/RoleUtils";
import Bot from "../../Bot";

import { ButtonInteraction, GuildMember } from "discord.js";

export default class QuickMute60mButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "qm60"
        });
    }

    async execute(interaction: ButtonInteraction) {
      if (RoleUtils.hasAnyRole((interaction.member as GuildMember), [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID]) == true) { 
            QuickMute.quickMuteFromButton(interaction, "60m")
      } else {
            interaction.reply({ 
                  content: "Invalid permissions!", 
                  ephemeral: true 
            }).catch(err => console.error(err));
      }
    }
}