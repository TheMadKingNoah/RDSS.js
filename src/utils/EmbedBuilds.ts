import { MessageEmbed, VoiceState, TextChannel } from "discord.js";

export default class EmbedBuilds {
    public static getOnVoiceChannelJoinEmbed(newState: VoiceState): MessageEmbed {
        return new MessageEmbed()
            .setColor(0x2ecc71)
            .setAuthor({
                name: `${newState.member?.user.tag} (${newState.member?.nickname})`,
                iconURL: newState.member?.displayAvatarURL(),
                url: newState.member?.displayAvatarURL()
            })
            .setDescription(`Member joined \`#${newState.channel?.name}\` (${newState.channel})`)
            .setFooter({ text:`ID: ${newState.member?.id}` })
            .setTimestamp();
    }

    public static getOnVoiceChannelChangeEmbed(oldState: VoiceState, newState: VoiceState): MessageEmbed {
        return new MessageEmbed()
            .setColor(0x7289da)
            .setAuthor({
                name: `${newState.member?.user.tag} (${newState.member?.nickname})`,
                iconURL: newState.member?.displayAvatarURL(),
                url: newState.member?.displayAvatarURL()
            })
            .setDescription("Member changed voice channel")
            .addFields(
                {
                    name:`Old Channel`,
                    value:`\`#${oldState.channel?.name}\` (${oldState.channel})`
                },
                {
                    name:`New Channel`,
                    value:`\`#${newState.channel?.name}\` (${newState.channel})`
                }
            )
            .setFooter({ text:`ID: ${newState.member?.id}` })
            .setTimestamp();
    }

    public static getOnVoiceChannelLeaveEmbed(oldState: VoiceState): MessageEmbed {
        return new MessageEmbed()
            .setColor(0xe74c3c)
            .setAuthor({
                name: `${oldState.member?.user.tag} (${oldState.member?.nickname})`,
                iconURL: oldState.member?.displayAvatarURL(),
                url: oldState.member?.displayAvatarURL()
            })
            .setDescription(`Member left \`#${oldState.channel?.name}\` (${oldState.channel})`)
            .setFooter({ text:`ID: ${oldState.member?.id}` })
            .setTimestamp();
    }

    public static getPendingAlertsEmbed(modAlertsChannel: TextChannel): MessageEmbed {
        return new MessageEmbed()
            .setColor(0x748bd8)
            .setTitle("Moderation Alerts")
            .setDescription(
                `There are pending moderation alerts in ${modAlertsChannel.toString()}`
                + `\n\nPlease remember to monitor moderation alerts frequently in order to avoid`
                + ` an accumulation of messages (and untreated reports) in the channel`
            )
            .setFooter({
                text: "This message appears whenever there are alerts that are over 2 hours old"
            })
    }
 }