"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const RoleUtils_1 = tslib_1.__importDefault(require("../utils/RoleUtils"));
const Properties_1 = tslib_1.__importDefault(require("./Properties"));
class QuickMute {
    static quickMuteUser(moderator, authorId, duration, messageEvidence, commandsChannel, message) {
        const member = commandsChannel.guild.members.fetch(authorId).then(member => {
            if (member != null) {
                if (RoleUtils_1.default.hasAnyRole(member, [RoleUtils_1.default.ROLE_TRIAL_MODERATOR_ID, RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID, RoleUtils_1.default.ROLE_BOT_ID])) {
                    commandsChannel.send(`<@${moderator.id}> Oops! You can't Quick Mute another moderator. (Nice try though)`);
                }
                else {
                    message.delete().catch(e => { console.log(e); });
                    if (messageEvidence.replace(/\r?\n|\r/g, " ").length < 120) {
                        const evidence = messageEvidence.replace(/\r?\n|\r/g, " ");
                        commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${evidence}`);
                    }
                    else {
                        let memberTitle = authorId;
                        if (member != null && member.nickname != null) {
                            memberTitle = `${member.nickname}_${authorId}`;
                        }
                        const currentTime = new Date().toISOString();
                        const evidenceFile = new discord_js_1.MessageAttachment(Buffer.from(messageEvidence), `Evidence_against_${memberTitle}_on_${currentTime}}.txt`);
                        commandsChannel.guild.channels.fetch(Properties_1.default.MESSAGE_LOGS_CHANNEL_ID).then(messageLogsChannel => {
                            if (messageLogsChannel != null) {
                                messageLogsChannel.send({ files: [evidenceFile] }).then(message => {
                                    const attachment = message.attachments.first();
                                    if (attachment?.url != null) {
                                        commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${attachment.url}`);
                                    }
                                });
                            }
                        }).catch(e => {
                            commandsChannel.send({ files: [evidenceFile] }).then(message => {
                                const attachment = message.attachments.first();
                                if (attachment?.url != null) {
                                    commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${attachment.url}`);
                                }
                            });
                        });
                    }
                }
            }
        }).catch(e => {
            message.delete().catch(e => { console.log(e); });
            commandsChannel.send(`<@${moderator.id}> user has left the server!`);
        });
    }
    static purgeMessagesFromUserInChannel(channel, member, moderator) {
        let theMember = member;
        if (RoleUtils_1.default.hasAnyRole(theMember, [RoleUtils_1.default.ROLE_BOT_ID, RoleUtils_1.default.ROLE_MODERATOR_ID, RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID]) == false) {
            let messagesToBePurged = [];
            let evidenceString = "";
            let messageAmount = 0;
            channel.messages.fetch({
                limit: 100,
            }).then((messages) => {
                messages.forEach(message => {
                    if (message.author.id == member.id) {
                        messagesToBePurged.push(message);
                        messageAmount++;
                        evidenceString += `[${message.createdAt.getFullYear()}-${message.createdAt.getMonth() + 1}-${message.createdAt.getDay()}`
                            + `-${String(message.createdAt.getHours()).padStart(2, '0')}:${String(message.createdAt.getMinutes()).padStart(2, '0')}:${String(message.createdAt.getSeconds()).padStart(2, '0')}]`
                            + `(${member.id})`
                            + `-${message.content} \n`;
                    }
                });
            }).then(e => {
                channel.bulkDelete(messagesToBePurged);
                const currentTime = new Date().toISOString();
                const evidenceFile = new discord_js_1.MessageAttachment(Buffer.from(evidenceString), `Evidence_against_${member.id}_on_${currentTime}}.txt`);
                channel.guild.channels.fetch(Properties_1.default.MESSAGE_LOGS_CHANNEL_ID).then(messageLogsChannel => {
                    messageLogsChannel.send({ files: [evidenceFile] }).then(message => {
                        channel.guild.channels.fetch(Properties_1.default.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                            const attachment = message.attachments.first();
                            if (attachment?.url != null) {
                                const sweepEmoji = channel.client.emojis.cache.get(Properties_1.default.SWEEP_EMOJI_ID);
                                commandsChannel.send(`<@${moderator.id}> - You swept messages by <@${member.id}>`
                                    + `\n> ${sweepEmoji} ${messageAmount} messages deleted in <#${channel.id}>`
                                    + `\n\n**Message Evidence:** ${attachment.url}`);
                            }
                        });
                    });
                });
            });
        }
        else {
            channel.guild.channels.fetch(Properties_1.default.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                commandsChannel.send(`<@${moderator.id}> Oops! You can't Sweep another moderator. (Nice try though)`);
            }).catch(e => { console.log("channel not found"); });
        }
    }
}
exports.default = QuickMute;
