import { ButtonInteraction, Message, TextChannel, User, MessageAttachment, Collection, Options, Interaction, GuildMember } from "discord.js";
import RoleUtils from "../utils/RoleUtils";
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

function quickMuteUser(moderator: User, authorId: string, duration: string, messageEvidence: string, commandsChannel: TextChannel) {
    const member = commandsChannel.guild.members.cache.get(authorId);

    if (member != null) {
        if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_TRIAL_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID, RoleUtils.ROLE_BOT_ID])) {
            commandsChannel.send(`<@${moderator.id}> You cannot quick mute another moderator!`)
        } else {
            if (messageEvidence.replace(/\r?\n|\r/g, " ").length < 120) {
                const evidence = messageEvidence.replace(/\r?\n|\r/g, " ");
                commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${evidence}`)
            } else {
                let memberTitle = authorId;
        
                if (member != null && member.nickname != null) {
                    memberTitle = `${member.nickname}_${authorId}`
                }
        
                const currentTime = new Date().toISOString();
        
                const evidenceFile = new MessageAttachment(Buffer.from(messageEvidence), `Evidence_against_${memberTitle}_on_${currentTime}}.txt`)
        
                commandsChannel.send({ files: [evidenceFile] }).then(message => {
                    const attachment = message.attachments.first();
                    if (attachment?.url != null) {
                        commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${attachment.url}`)
                    }
                })
            }
        }
    }
}

function quickMuteFromButton(interaction: { isButton: () => any; customId: string; message: Message<boolean>; }, duration: string) {
    const button = (interaction as ButtonInteraction)

    const modAlertMessage = (interaction.message as Message);
    const authorId = modAlertMessage.content.split("`")[3];
    const channelId = modAlertMessage.content.split("/")[5];
    const messageId: string = modAlertMessage.content.split("/")[6];
    const commandsChannel = interaction.message.client.channels.cache.get(Properties.COMMANDS_CHANNEL_ID);

    const channel = interaction.message.client.channels.cache.get(channelId);

    if (channel != null) {
        (channel as TextChannel).messages.fetch(messageId, { force: true }).then(message => {
            (message as Message).delete();
            const messageEvidence = ModAlert.existingModAlerts.get(messageId);
            quickMuteUser(button.user, authorId, duration, messageEvidence, (commandsChannel as TextChannel));

            ModAlert.deleteModAlert(messageId, modAlertMessage);
        }).catch(error => {
            const messageEvidence = ModAlert.existingModAlerts.get(messageId);
            quickMuteUser(button.user, authorId, duration, messageEvidence, (commandsChannel as TextChannel));

            ModAlert.deleteModAlert(messageId, modAlertMessage);
        }).catch(error => {
            (commandsChannel as TextChannel).send("Something went wrong!")
            console.log(error)
            ModAlert.deleteModAlert(messageId, modAlertMessage);
        })
    }
}
