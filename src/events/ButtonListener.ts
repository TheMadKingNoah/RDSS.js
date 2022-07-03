import { ButtonInteraction, Message, TextChannel, User, MessageAttachment, Collection } from "discord.js";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";
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
            const modAlertMessage = (interaction.message as Message);
            const authorId = modAlertMessage.content.split("`")[3];
            const channelId = modAlertMessage.content.split("/")[5];
            const messageId: string = modAlertMessage.content.split("/")[6];
            const commandsChannel = interaction.message.client.channels.cache.get(Properties.COMMANDS_CHANNEL_ID);

            const channel = interaction.message.client.channels.cache.get(channelId);

            if (channel != null) {
                (channel as TextChannel).messages.fetch(messageId).then(message => {
                    quickMuteUser(button.user, authorId, "30m", message, (commandsChannel as TextChannel));

                    ModAlert.deleteModAlert(message.id, modAlertMessage);
                    (message as Message).delete();
                })
            }
        }

        if (interaction.customId == "qm60") {
            const modAlertMessage = (interaction.message as Message);
            const authorId = modAlertMessage.content.split("`")[3];
            const channelId = modAlertMessage.content.split("/")[5];
            const messageId: string = modAlertMessage.content.split("/")[6];
            const commandsChannel = interaction.message.client.channels.cache.get(Properties.COMMANDS_CHANNEL_ID);

            const channel = interaction.message.client.channels.cache.get(channelId);

            if (channel != null) {
                (channel as TextChannel).messages.fetch(messageId).then(message => {
                    quickMuteUser(button.user, authorId, "60m", message, (commandsChannel as TextChannel));

                    ModAlert.deleteModAlert(message.id, modAlertMessage);
                    (message as Message).delete();
                })
            }
        }
    }
}

function quickMuteUser(moderator: User, authorId: string, duration: string, message: Message, commandsChannel: TextChannel) {
    if (message.content.replace(/\r?\n|\r/g, " ").length < 120) {
        const evidence = message.content.replace(/\r?\n|\r/g, " ");
        commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${evidence}`)
    } else {
        const member = commandsChannel.guild.members.cache.get(authorId);
        let memberTitle = authorId;

        if(member != null && member.nickname != null){
            memberTitle = `${member.nickname}_${authorId}`
        }

        const currentTime = new Date().toISOString();

        const evidenceFile = new MessageAttachment(Buffer.from(message.content), `Evidence_against_${memberTitle}_on_${currentTime}}.txt`)

        commandsChannel.send({ files: [evidenceFile] }).then(message => {
            const attachment = message.attachments.first(); 
            if(attachment?.url != null){
                commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${attachment.url}`)
            }
        })
    }
}
