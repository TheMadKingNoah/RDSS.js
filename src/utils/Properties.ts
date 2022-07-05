import { Collection } from "discord.js";

export default class Properties {   
    public static ALERT_EMOJI_ID: string = "625429388229345280";

    public static QUICK_MUTE_30_MINUTES_EMOJI_ID = "";

    public static QUICK_MUTE_60_MINUTES_EMOJI_ID = "";

    public static SWEEP_EMOJI_ID = "";

    public static ALERT_CHANNEL_ID: string = "785821764839669791";

    public static COMMANDS_CHANNEL_ID: string = "150250250471342080";

    public static MESSAGE_LOGS_CHANNEL_ID = "366624514651717663";

    public static ALERT_MODS_COOLDOWN: number = 5;

    public static COMMANDS: Collection<unknown, unknown>;
}