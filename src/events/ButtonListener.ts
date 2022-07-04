import { ButtonInteraction, Message, TextChannel, User, MessageAttachment, Collection, Options, Interaction, GuildMember } from "discord.js";
import RoleUtils from "../utils/RoleUtils";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";
import QuickMute from "../utils/QuickMute";
import { channel } from "diagnostics_channel";
import { deflate } from "zlib";
const fs = require("fs");

module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction: { isButton: () => any; customId: string; message: Message<boolean>; }) {
        if (!interaction.isButton()) return;

        const button = interaction as ButtonInteraction;

        if (interaction.customId == "OK") {
            const modAlertMessage = (interaction.message as Message);
            const channelId = modAlertMessage.content.split("/")[5];
            const messageId: string = modAlertMessage.content.split("/")[6];
            const channel = interaction.message.client.channels.cache.get(channelId);

            if (channel != null) {
                (channel as TextChannel).messages.fetch(messageId).then(message => {
                    ModAlert.deleteModAlert(message.id, modAlertMessage);
                }).catch(error => {
                    ModAlert.deleteModAlert(null, modAlertMessage);
                })
            }
        }

        if (interaction.customId == "Infractions") {
            (interaction.message as Message)
            const channel = interaction.message.client.channels.cache.get(Properties.COMMANDS_CHANNEL_ID);

            const authorId = interaction.message.content.split("`")[3];

            if (channel != null) {
                (channel as TextChannel).send(
                    `;inf search ${authorId}`
                );
                (interaction as ButtonInteraction).deferUpdate();
            }
        }

        if (interaction.customId == "qm30") {

            if (RoleUtils.hasAnyRole((button.member as GuildMember), [RoleUtils.ROLE_TRIAL_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID]) == true) {
                quickMuteFromButton(interaction, "30m")
            } else {
                button.reply({ content: "Invalid permissions!", ephemeral: true })
            }
        }

        if (interaction.customId == "qm60") {

            if (RoleUtils.hasAnyRole((button.member as GuildMember), [RoleUtils.ROLE_TRIAL_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {
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
    const messageId: string = modAlertMessage.content.split("/")[6].replace(/\D/g,'');;
    const commandsChannel = interaction.message.client.channels.cache.get(Properties.COMMANDS_CHANNEL_ID);

    interaction.message.client.channels.fetch(channelId).then(channel => {

        (channel as TextChannel).messages.fetch(messageId).then(message => {

            const messageEvidence = ModAlert.existingModAlerts.get(messageId);
    
            if (messageEvidence != null) {
                console.log(ModAlert.existingModAlerts)
                QuickMute.quickMuteUser(button.user, authorId, duration, messageEvidence, (commandsChannel as TextChannel));
            } else {
                console.log("message not cached!")
                QuickMute.quickMuteUser(button.user, authorId, duration, message.content, (commandsChannel as TextChannel));
                (commandsChannel as TextChannel).send(`<@${button.user.id}> Message was not cached. Therefore it could have been edited. Please verify this Quick-Mute! ^`)
            }

            ModAlert.deleteModAlert(messageId, modAlertMessage);

            (message as Message).delete();
        }).catch(error => {
            (commandsChannel as TextChannel).send(`<@${button.user.id}> The message was deleted and not cached! Please mute manually`)
            ModAlert.deleteModAlert(messageId, modAlertMessage);
        })
    })
}
