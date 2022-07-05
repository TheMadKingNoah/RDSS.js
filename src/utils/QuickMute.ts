import { TextChannel, User, MessageAttachment, ChannelLogsQueryOptions, Collection, Message } from "discord.js";
import RoleUtils from "../utils/RoleUtils";
import Properties from "./Properties";

export default class QuickMute {

    public static quickMuteUser(moderator: User, authorId:string, duration: string, messageEvidence:string, commandsChannel: TextChannel) {

        const member = commandsChannel.guild.members.fetch(authorId).then(member => {

            if (member != null) {
                //Check if the Author is a moderator.
                if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_TRIAL_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                    commandsChannel.send(`<@${moderator.id}> You cannot Quick mute another moderator`)
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
            commandsChannel.send(`<@${moderator.id}> user has left the server!`)
        })
    }

    public static purgeMessagesFromUserInChannel(channel: TextChannel, user: User, moderator: User) {
        const messagesToBePurged: Message[] = [];
        let evidenceString: string = "";

        channel.messages.fetch({
            limit: 100,
        }).then((messages) => {
            messages.forEach(message => {
                if (message.author.id == user.id) {
                    messagesToBePurged.push(message);
                    evidenceString += message.content;
                }
            })
        })

        console.log(messagesToBePurged)
        console.log(evidenceString);

        channel.bulkDelete(messagesToBePurged)
    }
}
