import { Channel, Message, TextChannel } from "discord.js";
import EventListener from "../modules/events/Event";
import Bot from "../Bot";
import RoleUtils from "../utils/RoleUtils";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";

module.exports = class MessageDeleteEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "messageDelete",
            once: false
        });
    }
    
    async execute(message: Message, channel: Channel){
        if(message.guild){
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: "MESSAGE_DELETE",
            });

            // Since there's only 1 audit log entry in this collection, grab the first one
            const deletionLog = fetchedLogs.entries.first();
        
            // Perform a coherence check to make sure that there's *something*
            if (!deletionLog) return console.log(`A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`);
        
            // Now grab the user object of the person who deleted the message
            // Also grab the target of this action to double-check things
            const { executor, target } = deletionLog;
        
            // Update the output with a bit more information
            // Also run a check to make sure that the log returned was for the same author's message

            if (message.author && target.id === message.author.id && message.author.username) {
                if(executor){
                    message.guild.members.fetch(executor.id).then(moderator => {
                        console.log( "test")
                        if (RoleUtils.hasAnyRole(moderator, [RoleUtils.ROLE_SENIOR_MODERATOR_ID, RoleUtils.ROLE_MANAGER_ID])) {
                            console.log("yergh")
                            message.client.channels.fetch(Properties.ALERT_CHANNEL_ID).then(alertChannel => {
                                ModAlert.updateModAlert(message, moderator, alertChannel as TextChannel)
                            })
                        }
                    })
                }
            } else {
                if(message.author && message.author.id){
                console.log(`A message by <@${message.author.id}> was deleted, but we don't know by who.`)
                }
            }
        }
    }
}