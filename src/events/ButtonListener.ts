import { ButtonInteraction, Message, TextChannel, GuildMember } from "discord.js";
import RoleUtils from "../utils/RoleUtils";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";
import QuickMute from "../utils/QuickMute";

const fs = require("fs");

module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction: { isButton: () => any; customId: string; message: Message<boolean>; }) {
      
        if (!interaction.isButton()) return;

        const button = interaction as ButtonInteraction;

        if (interaction.customId == "OK") {

            const modAlertMessage = (interaction.message as Message);
            const messageId: string = modAlertMessage.content.split("/")[6].replace(/\D/g, '');

            ModAlert.deleteModAlert(messageId, modAlertMessage, null);
        }

        if (interaction.customId == "Infractions") {

            const authorId = interaction.message.content.split("`")[3];

            interaction.message.client.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChhannel => {

                (commandsChhannel as TextChannel).send(

                    `;inf search ${authorId}`

                ).then(message => {

                    button.reply({ content: `view infractions here ${message.url}`, ephemeral: true, fetchReply:true }).then( message => {
                        // setTimeout(function() {
                        //     (message as Message).delete();
                        // }, 3000);
                    })
                });
            })
        }

        if (interaction.customId == "qm30") {

            if (RoleUtils.hasAnyRole((button.member as GuildMember), [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID]) == true) {

                quickMuteFromButton(interaction, "30m")
                
            } else {

                button.reply({ content: "Invalid permissions!", ephemeral: true })

            }
        }

        if (interaction.customId == "qm60") {

            if (RoleUtils.hasAnyRole((button.member as GuildMember), [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                quickMuteFromButton(interaction, "60m")

            } else {

                button.reply({ content: "Invalid permissions!", ephemeral: true })

            }
        }
    }
}

function quickMuteFromButton(interaction: { isButton: () => any; customId: string; message: Message<boolean>; }, duration: string) {
    const button = (interaction as ButtonInteraction)

    const modAlertMessage = (interaction.message as Message);
    const authorId = modAlertMessage.content.split("`")[3];
    const channelId = modAlertMessage.content.split("/")[5];
    const messageId: string = modAlertMessage.content.split("/")[6].replace(/\D/g, '');

    interaction.message.client.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {

        interaction.message.client.channels.fetch(channelId).then(channel => {

            (channel as TextChannel).messages.fetch(messageId).then(message => {
                const messageEvidence = ModAlert.existingModAlerts.get(messageId);

                if (messageEvidence != null) {
                    QuickMute.quickMuteUser(button.user, authorId, duration, messageEvidence, (commandsChannel as TextChannel), message);
                    ModAlert.deleteModAlert(messageId, modAlertMessage, null);
                } else {
                    QuickMute.quickMuteUser(button.user, authorId, duration, message.content, (commandsChannel as TextChannel), message);
                    (commandsChannel as TextChannel).send(`<@${button.user.id}> Please verify the following Quick Mute. The message was not cached; it could have been edited.`)
                    ModAlert.deleteModAlert(messageId, modAlertMessage, null);
                }

            }).catch(error => {
                const messageEvidence = ModAlert.existingModAlerts.get(messageId);

                if(messageEvidence != null){
                    QuickMute.quickMuteUser(button.user, authorId, duration, messageEvidence, (commandsChannel as TextChannel), null);
                    ModAlert.deleteModAlert(messageId, modAlertMessage, null);
                } else {
                    console.log(ModAlert.existingModAlerts)
                    console.log(error);
                    (commandsChannel as TextChannel).send(`<@${button.user.id}> The message was deleted and not cached! Please mute manually`)
                    ModAlert.deleteModAlert(messageId, modAlertMessage, null);
                }
            })
        })
    })
}
