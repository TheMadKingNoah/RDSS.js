import { MessageEmbed } from "discord.js";

export default class EmbedBuilds {
    public static getOnVoiceChannelJoinEmbed(): MessageEmbed {
        const embed = new MessageEmbed()
        //todo: Create an Embed for when a user joins a voice channel
        return embed;
    }

    public static getOnVoiceChannelChangeEmbed(): MessageEmbed {
        const embed = new MessageEmbed()
        //todo: Create an Embed for when a user changes voice channel
        return embed;
    }

    public static getOnVoiceChannelLeaveEmbed(): MessageEmbed {
        const embed = new MessageEmbed()
        //todo: Create an Embed for when a user leaves a voice channel
        return embed;
    }
 }