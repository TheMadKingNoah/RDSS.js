import { MessageEmbed, VoiceState } from "discord.js";

export default class EmbedBuilds {
    public static getOnVoiceChannelJoinEmbed(newState: VoiceState): MessageEmbed {
        const currentDate = new Date();
        const embed = new MessageEmbed()
        .setColor("#2ecc71")
        .setAuthor({
            name: `${newState.member?.user.tag} (${newState.member?.nickname})`,
            iconURL: newState.member?.displayAvatarURL().toString(),
            url: newState.member?.displayAvatarURL().toString()
        })
        .addFields(
            {name: 'Member joined voice channel', value: `**${newState.member?.user.tag}** joined #${newState.channel?.name} (<#${newState.channelId}>)`}
        )
        .setFooter({
            text:`ID: ${newState.member?.user.tag} • ${(currentDate.getMonth() + 1)}/${currentDate.getDate()}/${currentDate.getFullYear()}`
        })
    
        return embed;
    }

    public static getOnVoiceChannelChangeEmbed(oldState: VoiceState, newState: VoiceState): MessageEmbed {
        const currentDate = new Date();
        const embed = new MessageEmbed()
        .setColor("#7289da")
        .setAuthor({
            name: `${newState.member?.user.tag} (${newState.member?.nickname})`,
            iconURL: newState.member?.displayAvatarURL().toString(),
            url: newState.member?.displayAvatarURL().toString()
        })
        .addFields(
            {name:`Member changed voice channel`, value:`**Before** #${oldState.channel?.name} (<#${oldState.channelId}>) \n**+After** #${newState.channel?.name} (<#${newState.channelId}>)`}
        )
        .setFooter({
            text:`ID: ${newState.member?.user.tag} • ${(currentDate.getMonth() + 1)}/${currentDate.getDate()}/${currentDate.getFullYear()}`
        })
        return embed;
    }

    public static getOnVoiceChannelLeaveEmbed(oldState: VoiceState): MessageEmbed {
        const currentDate = new Date();
        const embed = new MessageEmbed()
        .setColor("#e74c3c")
        .setAuthor({
            name: `${oldState.member?.user.tag} (${oldState.member?.nickname})`,
            iconURL: oldState.member?.displayAvatarURL().toString(),
            url: oldState.member?.displayAvatarURL().toString()
        })
        .addFields(
            {name: 'Member left voice channel', value: `**${oldState.member?.user.tag}** left #${oldState.channel?.name} (<#${oldState.channelId}>)`}
        )
        .setFooter({
            text:`ID: ${oldState.member?.user.tag} • ${(currentDate.getMonth() + 1)}/${currentDate.getDate()}/${currentDate.getFullYear()}`
        })
        return embed;
    }
 }