import { TextChannel, User, MessageAttachment, ChannelLogsQueryOptions, Collection, Message, Role, GuildMember } from "discord.js";
import RoleUtils from "../utils/RoleUtils";
import Properties from "./Properties";

export default class QuickMute {

    public static quickMuteUser(moderator: User, authorId: string, duration: string, messageEvidence: string, commandsChannel: TextChannel, message:Message) {

        const member = commandsChannel.guild.members.fetch(authorId).then(member => {

            if (member != null) {
                //Check if the Author is a moderator.
                if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_TRIAL_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID, RoleUtils.ROLE_BOT_ID])) {

                    commandsChannel.send(`<@${moderator.id}> Oops! You can't Quick Mute another moderator. (Nice try though)`)
                } else {
                    message.delete().catch(e =>{ console.log(e)});
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

                        commandsChannel.guild.channels.fetch(Properties.MESSAGE_LOGS_CHANNEL_ID).then(messageLogsChannel => {

                            if (messageLogsChannel! != null) {

                                (messageLogsChannel as TextChannel).send({ files: [evidenceFile] }).then(message => {
                                    const attachment = message.attachments.first();
                                    if (attachment?.url != null) {
                                        commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${attachment.url}`)

                                    }
                                })
                            }
                        }
                        ).catch(e => {
                            (commandsChannel as TextChannel).send({ files: [evidenceFile] }).then(message => {
                                const attachment = message.attachments.first();
                                if (attachment?.url != null) {
                                    commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${attachment.url}`)
                                }
                            })
                        })
                    }
                }
            }
        }).catch(e => {
            message.delete().catch(e =>{ console.log(e)});
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

                channel.bulkDelete(messagesToBePurged)

                const currentTime = new Date().toISOString();

                const evidenceFile = new MessageAttachment(Buffer.from(evidenceString), `Evidence_against_${member.id}_on_${currentTime}}.txt`);

                channel.guild.channels.fetch(Properties.MESSAGE_LOGS_CHANNEL_ID).then(messageLogsChannel => {

                    (messageLogsChannel as TextChannel).send({ files: [evidenceFile] }).then(message => {

                        channel.guild.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                            const attachment = message.attachments.first();
                            if (attachment?.url != null) {
                                const sweepEmoji = channel.client.emojis.cache.get(Properties.SWEEP_EMOJI_ID);
                                (commandsChannel as TextChannel).send(`<@${moderator.id}> - You swept messages by <@${member.id}>`
                                    + `\n> ${sweepEmoji} ${messageAmount} messages deleted in <#${channel.id}>`
                                    + `\n\n**Message Evidence:** ${attachment.url}`)
                            }
                        })
                    })
                })
            })
        } else {
            channel.guild.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                (commandsChannel as TextChannel).send(`<@${moderator.id}> Oops! You can't Sweep another moderator. (Nice try though)`)
            }).catch(e => { console.log("channel not found") })
        }

    }
}
