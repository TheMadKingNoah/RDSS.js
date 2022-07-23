import { TextChannel, VoiceChannel, VoiceState } from "discord.js";
import Properties from "../utils/Properties";
import EmbedBuilds from "../utils/EmbedBuilds";
import EventListener from "../modules/events/Event";
import Bot from "../Bot";

module.exports = class VoiceStateUpdateEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "voiceStateUpdate",
            once: false
        });
    }

    async execute(oldState: VoiceState, newState: VoiceState) {
        oldState.client.channels.fetch(Properties.VOICE_LOGS_CHANNEL_ID).then(voiceLogsChannel => {
            let newVoiceChannel = (newState.channel as VoiceChannel)
            let oldVoiceChannel = (oldState.channel as VoiceChannel)

            if (voiceLogsChannel != null) {

                if (newVoiceChannel !== null && oldVoiceChannel === null) {

                    if (newState.member != null) {
                        if (newVoiceChannel.type == "GUILD_VOICE") {
                            (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelJoinEmbed(newState)] }).catch(err=> { console.log(err)})
                        }
                    }

                } else if (newVoiceChannel !== null && oldVoiceChannel !== null) {

                    if (newState.member != null && newState.member != null) {
                        if (newVoiceChannel.type == "GUILD_VOICE" && oldVoiceChannel.type == "GUILD_VOICE") {
                            (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelChangeEmbed(oldState, newState)] }).catch(err=> { })
                        }
                    }

                } else if (newVoiceChannel === null && oldVoiceChannel !== null) {

                    if (oldState.member != null) {
                        if (oldVoiceChannel.type == "GUILD_VOICE") {
                            (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelLeaveEmbed(oldState)] }).catch(err=> { })
                        }
                    }
                }
            }
        }).catch(err=> { })

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
                        .catch(err=> { });
                }
            }).catch(err=> { console.log(err) })
        } else {
            oldState.client.channels.fetch(Properties.MOD_CAST_TEXT_CHANNEL_ID).then(textChannel => {
                textChannel = textChannel as TextChannel;
                if (textChannel.permissionsFor(textChannel.guild.roles.everyone).has(["SEND_MESSAGES"]) == true) {
                    (textChannel as TextChannel).permissionOverwrites.create((textChannel as TextChannel).guild.roles.everyone, { SEND_MESSAGES: false })
                        .catch(err=> { });;
                }
            }).catch(err=> { console.log(err) })
        }
    }
}
