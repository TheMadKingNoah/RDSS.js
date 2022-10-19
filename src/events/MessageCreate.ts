import Properties from "../utils/Properties";
import EventListener from "../modules/events/Event";
import Bot from "../Bot";

import {
    TextChannel,
    GuildMember,
    Message,
    MessageButton,
    MessageActionRow, MessageEmbed, MessageSelectMenu, MessageAttachment
} from "discord.js";

module.exports = class MessageCreateEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "messageCreate",
            once: false
        });
    }

    async execute(message: Message) {
        if (message.channelId === Properties.channels.winnerQueue) {
            if (message.author.bot) return;

            const winnerQueue = await message.guild?.channels.fetch(Properties.channels.winnerQueue) as TextChannel;
            if (!winnerQueue) return;

            const mentions = message.mentions.members;

            if (mentions?.size === 0 || !mentions) {
                const deleteMessage = new MessageButton()
                    .setCustomId("deleteMessage")
                    .setLabel("Delete Reply")
                    .setStyle("DANGER");

                const actionRow = new MessageActionRow().setComponents(deleteMessage);

                message.reply({
                    content: "There are no mentions in your message!",
                    components: [actionRow]
                }).catch(console.error);
                return;
            }

            const memberList = mentions?.map((member: GuildMember) => `${member} (\`${member.id}\`)`).join("\n");
            let winnerRoles = await message.guild?.roles.fetch();

            if (!winnerRoles) return;
            const winnerRoleList: { label: string, value: string }[] = []

            winnerRoles = await winnerRoles.filter((role) => role.name.includes("Winner") || role.name.includes("Champion"));
            winnerRoles.forEach((role) => {
                const year = role.name.match(/\d{4}/g)?.[0];
                const winnerRole = {
                    label: role.name.replace(/\d+/g, "").trim(),
                    value: role.id
                }

                // @ts-ignore
                if (year) winnerRole.description = year;
                winnerRoleList.push(winnerRole);
            });

            const roleOptions = new MessageSelectMenu()
                .setCustomId("selectWinnerRole")
                .setPlaceholder("Select a role to award...")
                .setOptions(winnerRoleList);

            const actionRow = new MessageActionRow().setComponents(roleOptions);

            const embed = new MessageEmbed()
                .setAuthor({
                    name: `Requested by ${message.author.tag} (${message.member?.nickname})`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setFields([{
                    name: "Winners",
                    value: memberList as string
                }])
                .setFooter({ text: `ID: ${message.author.id}` })
                .setTimestamp()

            winnerQueue.send({
                embeds: [embed],
                components: [actionRow]
            }).catch(console.error);

            message.delete().catch(console.error);
        }

        if(message.channel.id === Properties.channels.commands){
            if (message.author.bot) return;
            let logChannel = message.guild?.channels.cache.get(Properties.channels.mediaLogs) as TextChannel;

            if(message.attachments.size > 0){
                let messageAttachments:MessageAttachment[] = [];
                message.attachments.forEach(media => {
                    console.log(media)
                    messageAttachments.push(new MessageAttachment(media.attachment));
                });

                logChannel.send({content: `Media-logs by ${message.author} (\`${message.author.id}\`) <t:${Math.trunc(message.createdTimestamp/1000)}:F>`,  
                files:messageAttachments,
                allowedMentions:undefined
            }).then(mediaLogMessage => {
                    let evidenceLinks = "";
                    mediaLogMessage.attachments.forEach( element => {
                        evidenceLinks += element.url + "\n"
                    })

                    message.channel.send(`${message.author} Your media links: \n ${evidenceLinks}`)

                    message.delete();
                })
            }
        }
    }
}