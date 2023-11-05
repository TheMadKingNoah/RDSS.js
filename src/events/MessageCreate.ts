import Properties from "../utils/Properties";
import EventListener from "../modules/events/Event";
import Bot from "../Bot";

import {
    ActionRow,
    ActionRowBuilder,
    Attachment,
    ButtonBuilder,
    ButtonComponent,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
    Message,
    SelectMenuBuilder,
    TextChannel,
    User
} from "discord.js";
import RoleUtils from "../utils/RoleUtils";
import Requests, {RequestType} from "../utils/Requests";

module.exports = class MessageCreateEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "messageCreate",
            once: false
        });
    }

    async execute(message: Message) {
        if (message.channelId === Properties.channels.winnerQueue) {
            if (message.reference) {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId as string);

                if (!referencedMessage.author.bot) return;
                if (referencedMessage.embeds.length === 0) return;

                const note = message.content;
                const hasNote = referencedMessage.embeds[0].fields[1]?.name.includes("Note");

                let actionRow = referencedMessage.components[0]
                    ? ActionRowBuilder.from(referencedMessage.components[0])
                    : new ActionRowBuilder();

                if (hasNote) {
                    referencedMessage.embeds[0].fields[1] = {
                        name: `Note (By ${message.author.tag})`,
                        value: note,
                        inline: false
                    };
                }
                else {
                    referencedMessage.embeds[0].fields.push({ name: `Note (By ${message.author.tag})`, value: note, inline: false });

                    const removeNote = new ButtonBuilder()
                        .setCustomId("removeWinnerRequestNote")
                        .setLabel("Remove Note")
                        .setStyle(ButtonStyle.Secondary)

                    actionRow = actionRow.addComponents(removeNote);
                }

                referencedMessage.edit({
                    embeds: referencedMessage.embeds,
                    components: [actionRow as ActionRowBuilder<ButtonBuilder>]
                })
                    .then(() => message.delete().catch(e => e))
                    .catch(console.error);

                return;
            }

            const winnerQueue = await message.guild?.channels.fetch(Properties.channels.winnerQueue) as TextChannel;
            if (!winnerQueue) return;

            const members = await message.guild?.members.fetch({ user: message.content.match(/\b\d{17,19}\b/g) || [] });

            if (members?.size === 0 || !members) {
                if (message.author.bot) return;

                const deleteMessage = new ButtonBuilder()
                    .setCustomId("deleteMessage")
                    .setLabel("Delete Reply")
                    .setStyle(ButtonStyle.Danger);

                const actionRow = new ActionRowBuilder().setComponents(deleteMessage);

                message.reply({
                    content: "There are no members in your message!",
                    components: [actionRow as ActionRowBuilder<ButtonBuilder>]
                }).catch(console.error);
                return;
            }

            const memberList = members?.map((member: GuildMember) => `${member} (\`${member.id}\`)`).join("\n");
            let winnerRoles = await message.guild?.roles.fetch();

            if (!winnerRoles) return;
            const winnerRoleList: { label: string, value: string }[] = []

            winnerRoles = await winnerRoles.filter((role) => role.name.includes("Winner") || role.name.includes("Champion") || role.name.includes("Master"));
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

            const roleOptions = new SelectMenuBuilder()
                .setCustomId("selectWinnerRole")
                .setPlaceholder("Select a role to award...")
                .setOptions(winnerRoleList);

            const actionRow = new ActionRowBuilder().setComponents(roleOptions);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Requested by ${message.author.tag} (${message.member?.displayName})`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setFields([{
                    name: "Winners",
                    value: memberList as string
                }])
                .setFooter({ text: `ID: ${message.author.id}` })
                .setTimestamp()

            if (message.author.id === this.client.user?.id) {
                const [roleId, messageUrl] = message.content.split(" | ");

                embed.data.fields?.push({
                    name: `Note (By ${this.client.user?.tag})`,
                    value: `Members that were unable to receive the <@&${roleId}> role in [another request](${messageUrl}).`,
                    inline: false
                })
            }

            winnerQueue.send({
                embeds: [embed],
                components: [actionRow as ActionRowBuilder<ButtonBuilder>]
            }).catch(console.error);

            message.delete().catch(console.error);
        }

        // if(message.channel.id === Properties.channels.commands){
        //     if (message.author.bot) return;
        //     let logChannel = message.guild?.channels.cache.get(Properties.channels.mediaLogs) as TextChannel;

        //     if(message.attachments.size > 0){
        //         const attachments: Attachment[] = [];

        //         message.attachments.forEach(media => {
        //             console.log(media)
        //             attachments.push(media);
        //         });

        //         logChannel.send({content:`<t:${Math.trunc(message.createdTimestamp/1000)}:F> :park: ${message.author.username}#${message.author.discriminator} (\`${message.author.id}\`)`,  
        //         files: attachments,
        //         allowedMentions: undefined
        //     }).then(mediaLogMessage => {
        //             let evidenceLinks = "";
        //             mediaLogMessage.attachments.forEach( element => {
        //                 evidenceLinks += element.url + "\n"
        //             })

        //             message.channel.send(`${message.author} Your media links: \n ${evidenceLinks}`)

        //             message.delete();
        //         })
        //     }
        // }

        if(message.channel.id in Properties.channelAutoReactions) {
            if (message.author.bot) return;
            const reactions = Properties.channelAutoReactions[message.channel.id];
            if (reactions.length === 0) return;

            let promise = message.react(reactions[0]);
            for (let i = 1; i < reactions.length; i++) {
                promise = promise.then(() => message.react(reactions[i]));
            }

            promise.catch(() => {});
        }

        if(message.activity?.partyId?.includes("spotify")){
            if (message.guild === null) return;
            message.guild.members.fetch(message.author.id).then(member => {
                if (!RoleUtils.hasAnyRole(member, [RoleUtils.roles.trialModerator, RoleUtils.roles.moderator, RoleUtils.roles.seniorModerator, RoleUtils.roles.manager])) {
                    message.delete();
                }
            })
        }

        if (message.channel.id === Properties.channels.banRequestsQueue) await Requests.validateRequest(message, RequestType.Ban);
        if (message.channel.id === Properties.channels.muteRequestQueue) await Requests.validateRequest(message, RequestType.Mute);
    }
}
