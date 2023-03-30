
import Bot from "../../Bot";

import {
    ApplicationCommandType,
    Message,
    MessageContextMenuCommandInteraction,
    TextChannel,
    Attachment
} from "discord.js";
import ContextMenu from "../../modules/interactions/contexts/ContextMenu";
import Properties from "../../utils/Properties";

export default class QuickMute30mCommand extends ContextMenu {
    constructor(client: Bot) {
        super(client, {
            name: "Store to Media Logs",
            type: ApplicationCommandType.Message,
        });
    }

    async execute(interaction: MessageContextMenuCommandInteraction) {
        let logChannel = interaction.guild?.channels.cache.get(Properties.channels.mediaLogs) as TextChannel;

        let message = interaction.targetMessage as Message;

        if(message.attachments.size > 0){
            let messageAttachments:Attachment[] = [];
            message.attachments.forEach(media => {
                console.log(media)
                messageAttachments.push(media);
            });

            logChannel.send({content: `Media-logs by ${interaction.user} (\`${interaction.user.id}\`) <t:${Math.trunc(message.createdTimestamp/1000)}:F>`, 
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
