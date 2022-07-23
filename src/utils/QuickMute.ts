import { TextChannel, User, MessageAttachment, ChannelLogsQueryOptions, Collection, Message, Role, GuildMember, ButtonInteraction } from "discord.js";
import RoleUtils from "../utils/RoleUtils";
import ModAlert from "./ModAlert";
import Properties from "./Properties";

export default class QuickMute {

    public static quickMuteUser(moderator: User, authorId: string, duration: string, messageEvidence: string, commandsChannel: TextChannel, message: Message | null) {

        commandsChannel.guild.members.fetch(authorId).then(member => {

            if (member != null) {
                //Check if the Author is a moderator.
                if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_TRIAL_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID, RoleUtils.ROLE_BOT_ID])) {

                    commandsChannel.send(`<@${moderator.id}> Oops! You can't Quick Mute another moderator. (Nice try though)`)
                } else {
                    if (message != null) {
                        message.delete().catch(err => console.error(err));
                    }
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

                        const messagePreview = messageEvidence.substring(0, 25) + "...";

                        commandsChannel.guild.channels.fetch(Properties.MESSAGE_LOGS_CHANNEL_ID).then(messageLogsChannel => {

                            if (messageLogsChannel! != null) {

                                (messageLogsChannel as TextChannel).send({ files: [evidenceFile] }).then(message => {
                                    const attachment = message.attachments.first();
                                    if (attachment?.url != null) {
                                        commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${messagePreview} Full Evidence: ${attachment.url}`)
                                    }
                                }).catch(err => console.error(err))
                            }
                        }
                        ).catch(err => {
                            (commandsChannel as TextChannel).send({ files: [evidenceFile] }).then(message => {
                                const attachment = message.attachments.first();
                                if (attachment?.url != null) {
                                    commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${messagePreview} Full Evidence: ${attachment.url}`)
                                }
                            }).catch(err => console.error(err))
                        }).catch(err => console.error(err))
                    }
                }
            }
        }).catch(() => {
            if (message != null) {
                message.delete().catch(err => console.error(err));
            }
            commandsChannel.send(`<@${moderator.id}> user <@${authorId}> (${authorId}) has left the server!`)
        })
    }

    public static purgeMessagesFromUserInChannel(channel: TextChannel, member: GuildMember, moderator: User) {

        let theMember = (member as GuildMember)
        if (RoleUtils.hasAnyRole(theMember, [RoleUtils.ROLE_BOT_ID, RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID]) == false) {
            let messagesToBePurged: Message[] = [];
            let evidenceString: string = "";
            let messageAmount: number = 0;

            channel.messages.fetch({
                limit: 100,
            }).then((messages) => {
                messages.forEach(message => {
                    if (message.author.id == member.id) {
                        messagesToBePurged.push(message);
                        messageAmount++;
                        evidenceString += `[${message.createdAt.getFullYear()}-${message.createdAt.getMonth() + 1}-${message.createdAt.getDate()}`
                            + `-${String(message.createdAt.getHours()).padStart(2, '0')}:${String(message.createdAt.getMinutes()).padStart(2, '0')}:${String(message.createdAt.getSeconds()).padStart(2, '0')}]`
                            + `(${member.id})`
                            + `-${message.content} \n`;
                    }
                })
            }).then(e => {
                if (messageAmount != 0) {
                    channel.bulkDelete(messagesToBePurged).catch(err => console.error(err))

                    const currentTime = new Date().toISOString();

                    const evidenceFile = new MessageAttachment(Buffer.from(evidenceString), `Evidence_against_${member.id}_on_${currentTime}}.txt`);

                    channel.guild.channels.fetch(Properties.MESSAGE_LOGS_CHANNEL_ID).then(messageLogsChannel => {

                        (messageLogsChannel as TextChannel).send({ files: [evidenceFile] }).then(message => {

                            channel.guild.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                                const attachment = message.attachments.first();
                                if (attachment?.url != null) {
                                    const sweepEmoji = channel.client.emojis.cache.get(Properties.SWEEP_EMOJI_ID);
                                    (commandsChannel as TextChannel).send(`<@${moderator.id}> - You swept messages by <@${member.id}> (${member.id})`
                                        + `\n> ${sweepEmoji} ${messageAmount} messages deleted in <#${channel.id}>`
                                        + `\n\n**Message Evidence:** ${attachment.url}`)
                                }
                            }).catch(err => console.error(err))
                        }).catch(err => console.error(err))
                    }).catch(err => console.error(err))
                }
            }).catch(err => console.error(err))
        } else {
            channel.guild.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                (commandsChannel as TextChannel).send(`<@${moderator.id}> Oops! You can't Sweep another moderator. (Nice try though)`)
            }).catch(err => { console.log("channel not found") })
        }
    }

    public static quickMuteFromButton(interaction: ButtonInteraction, duration: string) {
        const modAlertMessage = (interaction.message as Message);
        const authorId = modAlertMessage.content.split("`")[3];
        const channelId = modAlertMessage.content.split("/")[5];
        const messageId: string = modAlertMessage.content.split("/")[6].replace(/\D/g, '');
    
        modAlertMessage.client.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {
            modAlertMessage.client.channels.fetch(channelId).then(channel => {
    
                (channel as TextChannel).messages.fetch(messageId).then(message => {
                    const messageEvidence = ModAlert.existingModAlerts.get(messageId);
    
                    if (messageEvidence != null) {
                        this.quickMuteUser(interaction.user, authorId, duration, messageEvidence, (commandsChannel as TextChannel), message);
                        ModAlert.deleteModAlert(messageId, modAlertMessage, null);
                    } else {
                        this.quickMuteUser(interaction.user, authorId, duration, message.content, (commandsChannel as TextChannel), message);
                        (commandsChannel as TextChannel).send(`<@${interaction.user.id}> Please verify the following Quick Mute. The message was not cached; it could have been edited.`)
                        ModAlert.deleteModAlert(messageId, modAlertMessage, null);
                    }
    
                }).catch(err => {
                    const messageEvidence = ModAlert.existingModAlerts.get(messageId);
    
                    if (messageEvidence != null) {
                        this.quickMuteUser(interaction.user, authorId, duration, messageEvidence, (commandsChannel as TextChannel), null);
                        ModAlert.deleteModAlert(messageId, modAlertMessage, null);
                    } else {
                        console.log(ModAlert.existingModAlerts)
                        console.error(err);

                        (commandsChannel as TextChannel).send(`<@${interaction.user.id}> The message was deleted and not cached! Please mute manually`)
                        ModAlert.deleteModAlert(messageId, modAlertMessage, null);
                    }
                }).catch(err => console.error(err));
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }
}

