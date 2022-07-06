import { BaseGuildTextChannel, Client, ClientOptions, Emoji, GuildMember, Message, MessageActionRow, MessageAttachment, MessageButton, TextChannel, User } from "discord.js";
import RoleUtils from "../utils/RoleUtils";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";
import QuickMute from "../utils/QuickMute";
console.log("made it 2")
module.exports = {
    name: "messageReactionAdd",
    once: false,
    async execute(reaction: { emoji: Emoji; message: Message; client: Client }, user: User) {
      
        if (reaction.emoji.id == Properties.ALERT_EMOJI_ID) {

            reaction.message.fetch().then(message => {

                if (message.channel.id != Properties.ALERT_CHANNEL_ID) {

                    if (!ModAlert.existingModAlerts.has(message.id)) {

                        ModAlert.createModAlert(message, user);
                    }
                }
            }).catch(e => { })

            console.log(ModAlert.existingModAlerts)
        }

        if (reaction.emoji.id == Properties.QUICK_MUTE_30_MINUTES_EMOJI_ID) {

            const guild = reaction.message.guild;

            if (guild != null) {

                guild.members.fetch(user.id).then(member => {

                    if (RoleUtils.hasAnyRole(member, [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                        guild.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandsChannel => {

                            reaction.message.fetch().then(message => {

                                QuickMute.quickMuteUser(user, message.author.id, "30m", message.content, (commandsChannel as TextChannel), message)

                                guild.members.fetch(message.author.id).then( member => {
                                    QuickMute.purgeMessagesFromUserInChannel((message.channel as TextChannel), member, user)
                                })

                            }).catch(e => { })
                        }).catch(e => { })
                    }
                }).catch(e => { })
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

                                guild.members.fetch(message.author.id).then( member => {
                                    QuickMute.purgeMessagesFromUserInChannel((message.channel as TextChannel), member, user)
                                })

                            }).catch(e => { console.log(e)})
                        }).catch(e => { })
                    }
                }).catch(e => { })
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

                        }).catch(e => { })
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

                                }).catch(e => { })
                            }).catch(e => { })
                        }
                    }).catch(e => { })
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

                                }).catch(e => { })
                            }).catch(e => { })
                        }
                    }).catch(e => { })
                }
            }
        }
    }
}
