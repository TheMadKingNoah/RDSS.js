import { BaseGuildTextChannel, Client, ClientOptions, Emoji, GuildMember, Message, MessageActionRow, MessageAttachment, MessageButton, TextChannel, User } from "discord.js";
import RoleUtils from "../utils/RoleUtils";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";
import QuickMute from "../utils/QuickMute";

module.exports = {
    name: "messageReactionAdd",
    once: false,
    async execute(reaction: { emoji: Emoji; message: { fetch: () => Promise<any>; }; client: { channels: { cache: { get: (arg0: string) => any; }; }; }; }, user: User) {

        if (reaction.emoji.id == Properties.ALERT_EMOJI_ID) {
   
            reaction.message.fetch().then(message => {
 
                if (message.channel.id != Properties.ALERT_CHANNEL_ID) {

                    if (!ModAlert.existingModAlerts.has(message.id)) { 
                        ModAlert.createModAlert(message, user);
                    }
                }
            }).catch( e => {})
        }

        const commandsChannel = reaction.client.channels.cache.get(Properties.COMMANDS_CHANNEL_ID);

        if (commandsChannel != null) {
 
            if (reaction.emoji.id == Properties.QUICK_MUTE_30_MINUTES_EMOJI_ID) {
     
                reaction.message.fetch().then(message => {
        
                    if (!RoleUtils.hasAnyRole((message.member as GuildMember), [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                        QuickMute.quickMuteUser(user, message.author.id, "30m", message.content,commandsChannel)

                        message.delete();
                    }
                }).catch( e => {})
            }

            if (reaction.emoji.id == Properties.QUICK_MUTE_60_MINUTES_EMOJI_ID) {

                reaction.message.fetch().then(message => {
        
                    if (!RoleUtils.hasAnyRole((message.member as GuildMember), [RoleUtils.ROLE_MODERATOR_ID, RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {

                        QuickMute.quickMuteUser(user, message.author.id, "60m", message.content,commandsChannel)

                        message.delete();
                    }
                })
            }

            if (reaction.emoji.id == Properties.SWEEP_EMOJI_ID) {

                if(user.id =="245908839554088960"){

                    reaction.message.fetch().then(message => {

                        QuickMute.purgeMessagesFromUserInChannel((message.channel as TextChannel), message.author, user)
                    }).catch( e => {})
                }
            }
        }
    }
}
