
import Bot from "../../Bot";

import { GuildMember, Message, MessageAttachment, MessageContextMenuInteraction, TextChannel, User } from "discord.js";
import ContextMenu from "../../modules/interactions/contexts/ContextMenu";
import QuickMute from "../../utils/QuickMute";
import Properties from "../../utils/Properties";
import RoleUtils from "../..//utils/RoleUtils";
import ModAlert from "../../utils/ModAlert";

export default class QuickMute30mCommand extends ContextMenu {
    constructor(client: Bot) {
        super(client, {
            name: "Store to Media Logs",
            type: "MESSAGE",
        });
    }

    async execute(interaction: MessageContextMenuInteraction) {
        let logChannel = interaction.guild?.channels.cache.get(Properties.channels.mediaLogs) as TextChannel;

        let message = interaction.targetMessage as Message;

        if(message.attachments.size > 0){
            let messageAttachments:MessageAttachment[] = [];
            message.attachments.forEach(media => {
                console.log(media)
                messageAttachments.push(new MessageAttachment(media.attachment));
            });

            logChannel.send({content: `Media-logs by ${interaction.user}(\`${interaction.user.username}#${interaction.user.discriminator}\`) <t:${Math.trunc(message.createdTimestamp/1000)}:F>`, 
            files:messageAttachments,
            allowedMentions:undefined
        }).then(mediaLogMessage => {
                let evidenceLinks = "";
                mediaLogMessage.attachments.forEach( element => {
                    evidenceLinks += element.url + "\n"
                })

                interaction.reply({content:`${message.author} Your media links: \n\n ${evidenceLinks}`, ephemeral:true})
            })
        }
    }
}