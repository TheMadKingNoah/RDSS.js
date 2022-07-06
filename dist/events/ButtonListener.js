"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const RoleUtils_1 = tslib_1.__importDefault(require("../utils/RoleUtils"));
const ModAlert_1 = tslib_1.__importDefault(require("../utils/ModAlert"));
const Properties_1 = tslib_1.__importDefault(require("../utils/Properties"));
const QuickMute_1 = tslib_1.__importDefault(require("../utils/QuickMute"));
const fs = require("fs");
module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction) {
        console.log("made it 1");
        if (!interaction.isButton())
            return;
        const button = interaction;
        if (interaction.customId == "OK") {
            const modAlertMessage = interaction.message;
            const messageId = modAlertMessage.content.split("/")[6].replace(/\D/g, '');
            ModAlert_1.default.deleteModAlert(messageId, modAlertMessage);
        }
        if (interaction.customId == "Infractions") {
            const authorId = interaction.message.content.split("`")[3];
            interaction.message.client.channels.fetch(Properties_1.default.COMMANDS_CHANNEL_ID).then(commandsChhannel => {
                commandsChhannel.send(`;inf search ${authorId}`).then(message => {
                    button.reply({ content: `view infractions here ${message.url}`, ephemeral: true });
                });
            });
        }
        if (interaction.customId == "qm30") {
            if (RoleUtils_1.default.hasAnyRole(button.member, [RoleUtils_1.default.ROLE_TRIAL_MODERATOR_ID, RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID]) == true) {
                quickMuteFromButton(interaction, "30m");
            }
            else {
                button.reply({ content: "Invalid permissions!", ephemeral: true });
            }
        }
        if (interaction.customId == "qm60") {
            if (RoleUtils_1.default.hasAnyRole(button.member, [RoleUtils_1.default.ROLE_TRIAL_MODERATOR_ID, RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID])) {
                quickMuteFromButton(interaction, "60m");
            }
            else {
                button.reply({ content: "Invalid permissions!", ephemeral: true });
            }
        }
    }
};
function quickMuteFromButton(interaction, duration) {
    const button = interaction;
    const modAlertMessage = interaction.message;
    const authorId = modAlertMessage.content.split("`")[3];
    const channelId = modAlertMessage.content.split("/")[5];
    const messageId = modAlertMessage.content.split("/")[6].replace(/\D/g, '');
    interaction.message.client.channels.fetch(Properties_1.default.COMMANDS_CHANNEL_ID).then(commandsChannel => {
        interaction.message.client.channels.fetch(channelId).then(channel => {
            channel.messages.fetch(messageId).then(message => {
                const messageEvidence = ModAlert_1.default.existingModAlerts.get(messageId);
                if (messageEvidence != null) {
                    QuickMute_1.default.quickMuteUser(button.user, authorId, duration, messageEvidence, commandsChannel, message);
                }
                else {
                    QuickMute_1.default.quickMuteUser(button.user, authorId, duration, message.content, commandsChannel, message);
                    commandsChannel.send(`<@${button.user.id}> Please verify the following Quick Mute. The message was not cached; it could have been edited.`);
                }
                ModAlert_1.default.deleteModAlert(messageId, modAlertMessage);
            }).catch(error => {
                commandsChannel.send(`<@${button.user.id}> The message was deleted and not cached! Please mute manually`);
                ModAlert_1.default.deleteModAlert(messageId, modAlertMessage);
            });
        });
    });
}
