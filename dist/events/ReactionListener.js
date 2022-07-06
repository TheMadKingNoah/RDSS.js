"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const RoleUtils_1 = tslib_1.__importDefault(require("../utils/RoleUtils"));
const ModAlert_1 = tslib_1.__importDefault(require("../utils/ModAlert"));
const Properties_1 = tslib_1.__importDefault(require("../utils/Properties"));
const QuickMute_1 = tslib_1.__importDefault(require("../utils/QuickMute"));
console.log("made it 2");
module.exports = {
    name: "messageReactionAdd",
    once: false,
    async execute(reaction, user) {
        console.log("made it 1");
        if (reaction.emoji.id == Properties_1.default.ALERT_EMOJI_ID) {
            reaction.message.fetch().then(message => {
                if (message.channel.id != Properties_1.default.ALERT_CHANNEL_ID) {
                    if (!ModAlert_1.default.existingModAlerts.has(message.id)) {
                        ModAlert_1.default.createModAlert(message, user);
                    }
                }
            }).catch(e => { });
            console.log(ModAlert_1.default.existingModAlerts);
        }
        if (reaction.emoji.id == Properties_1.default.QUICK_MUTE_30_MINUTES_EMOJI_ID) {
            const guild = reaction.message.guild;
            if (guild != null) {
                guild.members.fetch(user.id).then(member => {
                    if (RoleUtils_1.default.hasAnyRole(member, [RoleUtils_1.default.ROLE_MODERATOR_ID, RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID])) {
                        guild.channels.fetch(Properties_1.default.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                            reaction.message.fetch().then(message => {
                                QuickMute_1.default.quickMuteUser(user, message.author.id, "30m", message.content, commandsChannel, message);
                                guild.members.fetch(message.author.id).then(member => {
                                    QuickMute_1.default.purgeMessagesFromUserInChannel(message.channel, member, user);
                                });
                            }).catch(e => { });
                        }).catch(e => { });
                    }
                }).catch(e => { });
            }
        }
        if (reaction.emoji.id == Properties_1.default.QUICK_MUTE_60_MINUTES_EMOJI_ID) {
            const guild = reaction.message.guild;
            if (guild != null) {
                guild.members.fetch(user.id).then(member => {
                    if (RoleUtils_1.default.hasAnyRole(member, [RoleUtils_1.default.ROLE_MODERATOR_ID, RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID])) {
                        guild.channels.fetch(Properties_1.default.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                            reaction.message.fetch().then(message => {
                                QuickMute_1.default.quickMuteUser(user, message.author.id, "60m", message.content, commandsChannel, message);
                                guild.members.fetch(message.author.id).then(member => {
                                    QuickMute_1.default.purgeMessagesFromUserInChannel(message.channel, member, user);
                                });
                            }).catch(e => { console.log(e); });
                        }).catch(e => { });
                    }
                }).catch(e => { });
            }
        }
        if (reaction.emoji.id == Properties_1.default.SWEEP_EMOJI_ID) {
            const guild = reaction.message.guild;
            if (guild != null) {
                guild.members.fetch(user.id).then(member => {
                    if (RoleUtils_1.default.hasAnyRole(member, [RoleUtils_1.default.ROLE_MODERATOR_ID, RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID])) {
                        reaction.message.fetch().then(message => {
                            if (message.member != null) {
                                QuickMute_1.default.purgeMessagesFromUserInChannel(message.channel, message.member, user);
                            }
                        }).catch(e => { });
                    }
                });
            }
        }
        if (reaction.emoji.id == Properties_1.default.APPROVE_EMOJI_ID) {
            if (reaction.message.channel.id == Properties_1.default.BAN_REQUESTS_QUEUE_CHANNEL_ID) {
                const guild = reaction.message.guild;
                if (guild != null) {
                    guild.members.fetch(user.id).then(member => {
                        if (RoleUtils_1.default.hasAnyRole(member, [RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID])) {
                            reaction.client.channels.fetch(Properties_1.default.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                                reaction.message.fetch().then(message => {
                                    ModAlert_1.default.approveBanRequest(message, commandsChannel, member);
                                }).catch(e => { });
                            }).catch(e => { });
                        }
                    }).catch(e => { });
                }
            }
        }
        if (reaction.emoji.id == Properties_1.default.REJECT_EMOJI_ID) {
            if (reaction.message.channel.id == Properties_1.default.BAN_REQUESTS_QUEUE_CHANNEL_ID) {
                const guild = reaction.message.guild;
                if (guild != null) {
                    guild.members.fetch(user.id).then(member => {
                        if (RoleUtils_1.default.hasAnyRole(member, [RoleUtils_1.default.ROLE_SENIOR_MODERATOR_ID, RoleUtils_1.default.ROLE_MANAGER_ID])) {
                            reaction.client.channels.fetch(Properties_1.default.COMMANDS_CHANNEL_ID).then(commandsChannel => {
                                reaction.message.fetch().then(message => {
                                    ModAlert_1.default.rejectBanRequest(message, commandsChannel, member);
                                }).catch(e => { });
                            }).catch(e => { });
                        }
                    }).catch(e => { });
                }
            }
        }
    }
};
