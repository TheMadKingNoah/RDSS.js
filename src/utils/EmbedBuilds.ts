import { Guild, GuildBan, GuildMember, MessageEmbed, Role, TextChannel, User, VoiceState } from "discord.js";
import Properties from "./Properties";

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

    public static getUserInfoEmbed(user: User, member:GuildMember|null, isBanned:GuildBan|null): MessageEmbed {
        const embed = new MessageEmbed()

        const avatar = member ? member.displayAvatarURL() : user.displayAvatarURL();
        embed.setAuthor({
            name: (user.username + "#" + user.discriminator),
            iconURL: avatar,
            url: avatar
        })

        if(member){
            if(member.nickname){
                embed.setDescription(`This user is verified as \`${member.nickname}\``)
            } else {
                embed.setDescription(`This user is not verified!`)
                embed.setColor(0xFFFFFF)
            }

            let roles = "";
            
            member.roles.cache.sort((a,b)=>b.position-a.position).forEach(element => {
                if (element.name != "@everyone"){ 
                    roles += `<@&${element.id}> `;
                }
            });

            if (roles.length === 0){
                roles = "**None**"
            }

            embed.addField("**Roles**", roles, true,)
            
            if(member.joinedTimestamp){
                embed.addField(
                    "**Joined at**",
                    `<t:${Math.trunc(member.joinedTimestamp/1000)}:F>\n (<t:${Math.trunc(member.joinedTimestamp/1000)}:R>)`,
                    true
                )
            }
        } else {
            if(isBanned !== null){
                embed.setDescription(`This user has been banned from this Guild: \n ${isBanned.reason}`);
                embed.setColor(0xFF0000)
            } else {
                embed.setDescription("This user is not in this Guild!")
                embed.setColor(0xFF0000)
            }               
        }

        embed.addField(
            "**Created at**",
            `<t:${Math.trunc(user.createdTimestamp/1000)}:F>\n (<t:${Math.trunc(user.createdTimestamp/1000)}:R>)`,
            true
        )

        embed.setFooter({text:`ID: ${user.id}`})

        return embed;

    }

    public static getPendingAlertsEmbed(modAlertsChannel: TextChannel, intervalText: string): MessageEmbed {
        return new MessageEmbed()
            .setColor(0x748bd8)
            .setTitle("Moderation Alerts")
            .setDescription(
              `There are pending moderation alerts in ${modAlertsChannel.toString()}`
                + `\n\nPlease remember to monitor moderation alerts frequently in order to avoid`
                + ` an accumulation of messages (and untreated reports) in the channel`
            )
            .setFooter({
                text: `This message appears whenever there are alerts that are over ${intervalText}`
            })
    }
 }
