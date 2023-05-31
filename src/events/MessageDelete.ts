import {AuditLogEvent, Channel, Message, TextChannel, ThreadChannel} from "discord.js";
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

    async execute(message: Message, channel: Channel) {
        if (!message.guild) return;

        const fetchedLogs = await message.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MessageDelete,
        });

        // Since there's only 1 audit log entry in this collection, grab the first one
        const deletionLog = fetchedLogs.entries.first();

        // Perform a coherence check to make sure that there's *something*
        if (!deletionLog) return console.log(`A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`);

        // Now grab the user object of the person who deleted the message
        // Also grab the target of this action to double-check things
        const {executor, target} = deletionLog;

        // Update the output with a bit more information
        // Also run a check to make sure that the log returned was for the same author's message

        if (message.author && target.id === message.author.id && executor) {
            const moderator = await message.guild.members.fetch(executor.id);

            if (RoleUtils.hasAnyRole(moderator, [RoleUtils.roles.trialModerator, RoleUtils.roles.moderator, RoleUtils.roles.seniorModerator, RoleUtils.roles.manager])) {
                message.client.channels.fetch(Properties.channels.alerts).then(alertChannel => {
                    ModAlert.updateModAlert(message, moderator, alertChannel as TextChannel)
                })
            }

            // Trial phase
//             if (RoleUtils.hasRole(moderator, RoleUtils.roles.trialModerator)) {
//                 const parentLogChannel = await message.guild?.channels.fetch(Properties.channels.moderators) as TextChannel;
//                 const logChannel = await parentLogChannel.threads.fetch(Properties.threads.trialLogs) as ThreadChannel;
//                 logChannel.send(`:wastebasket: **${moderator.user.tag}** (\`${moderator.id}\`) has deleted a message by **${message.author.tag}** (\`${message.author.id}\`):\n\`\`\`${message.content}\`\`\``);
//             }
        }

        if (message.content.length === 0 && message.stickers.size > 0) {
            message.stickers.forEach(sticker => {
                message.client.channels.fetch(Properties.channels.mediaLogs).then(mediaLogChannel => {
                    let logChannel = mediaLogChannel as TextChannel;
                    logChannel.send({
                        content:
                            `[<t:${Math.trunc(new Date().getTime() / 1000)}:F>] :wastebasket: ${message.author.username}#${message.author.discriminator} (\`${message.author.id}\`)`
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
