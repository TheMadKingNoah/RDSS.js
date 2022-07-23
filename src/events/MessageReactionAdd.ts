import { Client, Emoji, Message, TextChannel, User } from "discord.js";

import RoleUtils from "../utils/RoleUtils";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";
import QuickMute from "../utils/QuickMute";
import EventListener from "../modules/events/Event";
import Bot from "../Bot";

module.exports = class MessageReactionAddEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "messageReactionAdd",
            once: false
        });
    }
    
    async execute(reaction: { emoji: Emoji; message: Message; client: Client }, user: User) {

        if (reaction.emoji.id == Properties.ALERT_EMOJI_ID) {

            reaction.message.fetch().then(message => {

                if (message.channel.id != Properties.ALERT_CHANNEL_ID) {

                    if (!ModAlert.existingModAlerts.has(message.id)) {

                        ModAlert.createModAlert(message, user);
                    }
                }
            }).catch(err => { })
        }

        if (reaction.emoji.id == Properties.QUICK_MUTE_30_MINUTES_EMOJI_ID) {

            const guild = reaction.message.guild;

            if (guild != null) {

                guild.members.fetch(user.id).then(member => {

                    if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                        guild.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {

                            reaction.message.fetch().then(message => {

                                QuickMute.quickMuteUser(user, message.author.id, "30m", message.content, (commandsChannel as TextChannel), message)

                                guild.members.fetch(message.author.id).then(member => {
                                    QuickMute.purgeMessagesFromUserInChannel((message.channel as TextChannel), member, user)
                                }).catch(err => console.error(err))

                                guild.channels.fetch(Properties.ALERT_CHANNEL_ID).then(modAlertChannel => {
                                    if (modAlertChannel != null) {
                                        ModAlert.deleteModAlert(message.id, null, (modAlertChannel as TextChannel));
                                    }
                                }).catch(err => console.error(err))

                            }).catch(err => { })
                        }).catch(err => { })
                    }
                }).catch(err => { })
            }
        }

        if (reaction.emoji.id == Properties.QUICK_MUTE_60_MINUTES_EMOJI_ID) {

            const guild = reaction.message.guild;

            if (guild != null) {

                guild.members.fetch(user.id).then(member => {

                    if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                        guild.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {

                            reaction.message.fetch().then(message => {

                                QuickMute.quickMuteUser(user, message.author.id, "60m", message.content, (commandsChannel as TextChannel), message)

                                guild.members.fetch(message.author.id).then(member => {
                                    QuickMute.purgeMessagesFromUserInChannel((message.channel as TextChannel), member, user)
                                })

                                guild.channels.fetch(Properties.ALERT_CHANNEL_ID).then(modAlertChannel => {
                                    if (modAlertChannel != null) {
                                        ModAlert.deleteModAlert(message.id, null, (modAlertChannel as TextChannel));
                                    }
                                })

                            }).catch(err => console.error(err))
                        }).catch(err => { })
                    }
                }).catch(err => { })
            }
        }

        if (reaction.emoji.id == Properties.SWEEP_EMOJI_ID) {

            const guild = reaction.message.guild;

            if (guild != null) {

                guild.members.fetch(user.id).then(member => {

                    if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                        reaction.message.fetch().then(message => {

                            if (message.member != null) {

                                QuickMute.purgeMessagesFromUserInChannel((message.channel as TextChannel), message.member, user)

                            }

                        }).catch(err => { })
                    }
                })
            }
        }

        if (reaction.emoji.id == Properties.APPROVE_EMOJI_ID) {

            if (reaction.message.channel.id == Properties.BAN_REQUESTS_QUEUE_CHANNEL_ID) {

                const guild = reaction.message.guild;

                if (guild != null) {

                    guild.members.fetch(user.id).then(member => {

                        if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                            reaction.client.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {

                                reaction.message.fetch().then(message => {

                                    ModAlert.approveBanRequest(message, (commandsChannel as TextChannel), member)

                                }).catch(err => { })
                            }).catch(err => { })
                        }
                    }).catch(err => { })
                }
            }
        }

        if (reaction.emoji.id == Properties.REJECT_EMOJI_ID) {

            if (reaction.message.channel.id == Properties.BAN_REQUESTS_QUEUE_CHANNEL_ID) {

                const guild = reaction.message.guild;

                if (guild != null) {

                    guild.members.fetch(user.id).then(member => {

                        if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                            reaction.client.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {

                                reaction.message.fetch().then(message => {

                                    ModAlert.rejectBanRequest(message, (commandsChannel as TextChannel), member)

                                }).catch(err => { })
                            }).catch(err => { })
                        }
                    }).catch(err => { })
                }
            }
        }
    }
}
