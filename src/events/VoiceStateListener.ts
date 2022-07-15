import { StageChannel, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import Properties from "../utils/Properties";
import EmbedBuilds from "../utils/EmbedBuilds";

module.exports = {
    name: "voiceStateUpdate",
    once: false,

    async execute(oldState: VoiceState, newState: VoiceState) {
        oldState.client.channels.fetch(Properties.VOICE_LOGS_CHANNEL_ID).then(voiceLogsChannel => {
            let newVoiceChannel = (newState.channel as VoiceChannel)
            let oldVoiceChannel = (oldState.channel as VoiceChannel)

            if (voiceLogsChannel != null) {

                if (newVoiceChannel !== null && oldVoiceChannel === null) {

                    if (newState.member != null) {
                        if (newVoiceChannel.type == "GUILD_VOICE") {
                            (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelJoinEmbed(newState)] }).catch(e => { console.log(e)})
                        }
                    }

                } else if (newVoiceChannel !== null && oldVoiceChannel !== null) {

                    if (newState.member != null && newState.member != null) {
                        if (newVoiceChannel.type == "GUILD_VOICE" && oldVoiceChannel.type == "GUILD_VOICE") {
                            (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelChangeEmbed(oldState, newState)] }).catch(e => { })
                        }
                    }

                } else if (newVoiceChannel === null && oldVoiceChannel !== null) {

                    if (oldState.member != null) {
                        if (oldVoiceChannel.type == "GUILD_VOICE") {
                            (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelLeaveEmbed(oldState)] }).catch(e => { })
                        }
                    }
                }
            }
        }).catch(e => { })

        if (newState != null) {
            if (newState.suppress == false) {
                if (!Properties.membersOnStage.has(newState.member?.id)) {
                    Properties.membersOnStage.set(newState.member?.id, new Date())
                }
            }


            if (newState.suppress == true) {
                if (Properties.membersOnStage.has(newState.member?.id)) {
                    Properties.membersOnStage.delete(newState.member?.id)
                }
            }
        }

        if (newState.channel == null || newState.channel?.type == "GUILD_VOICE") {
            if (Properties.membersOnStage.has(newState.member?.id)) {
                Properties.membersOnStage.delete(newState.member?.id)
            }
        }

        if (Properties.membersOnStage.size > 0) {
            oldState.client.channels.fetch(Properties.MOD_CAST_TEXT_CHANNEL_ID).then(textChannel => {
                textChannel = textChannel as TextChannel;
                if (textChannel.permissionsFor(textChannel.guild.roles.everyone).has(["SEND_MESSAGES"]) == false) {
                    textChannel.permissionOverwrites.create((textChannel as TextChannel).guild.roles.everyone, { SEND_MESSAGES: true })
                        .catch(e => { });
                }
            })
        } else {
            oldState.client.channels.fetch(Properties.MOD_CAST_TEXT_CHANNEL_ID).then(textChannel => {
                textChannel = textChannel as TextChannel;
                if (textChannel.permissionsFor(textChannel.guild.roles.everyone).has(["SEND_MESSAGES"]) == true) {
                    (textChannel as TextChannel).permissionOverwrites.create((textChannel as TextChannel).guild.roles.everyone, { SEND_MESSAGES: false })
                        .catch(e => { });;
                }
            })
        }
    }
}
