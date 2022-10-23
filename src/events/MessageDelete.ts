import { Activity, Channel, GuildMember, Message, Options, TextChannel, User } from "discord.js";
import EventListener from "../modules/events/Event";
import Bot from "../Bot";
import RoleUtils from "../utils/RoleUtils";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";
import EmbedBuilds from "../utils/EmbedBuilds";

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
                        if (RoleUtils.hasAnyRole(moderator, [RoleUtils.roles.trialModerator, RoleUtils.roles.moderator, RoleUtils.roles.seniorModerator, RoleUtils.roles.manager])) {
                            message.client.channels.fetch(Properties.channels.alerts).then(alertChannel => {
                                ModAlert.updateModAlert(message, moderator, alertChannel as TextChannel)
                            })
                        }
                    })
                }
            }

            if(message.content.length === null && message.stickers.size > 0){
                message.stickers.forEach( sticker => {
                    message.client.channels.fetch(Properties.channels.mediaLogs).then(mediaLogChannel =>{
                        let logChannel = mediaLogChannel as TextChannel;
                        logChannel.send({content: 
                            `[<t:${Math.trunc(new Date().getTime()/1000)}:F>] :wastebasket: ${message.author.username}#${message.author.discriminator} (\`${message.author.id}\`)` 
                        + ` sticker deleted in ${message.channel}`
                        + `\n\`\`\` Name: ${sticker.name} \n Image: <https://media.discordapp.net/stickers/${sticker.id}.webp?size=240>\`\`\``
                    })
                    })
                })
            }

            // if(message.activity !== null && message.activity.partyId.includes("spotify")){
            //     message.guild.members.fetch({withPresences: true, user:message.author.id}).then( member => {
            //         if(member.presence !== null){
            //             let presence = member.presence.activities.filter(x=>x.name === "Spotify")[0] as Activity;
            //             let embed = EmbedBuilds.getSpotifyPartyInviteDeletedEmbed(presence, member);
            //             message.client.channels.fetch(Properties.channels.mediaLogs).then(mediaLogChannel =>{
            //                 let logChannel = mediaLogChannel as TextChannel;
            //                 logChannel.send({embeds: [embed]})
            //             })
            //         }
            //     })
            // }
        }
    }
}
