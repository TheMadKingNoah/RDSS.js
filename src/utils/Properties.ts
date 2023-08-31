export default class Properties {
    public static emojis = {
        alert: "625429388229345280",
        approve: "762388343253106688",
        reject: "764268551473070080",
        quickMute30: "760204798984454175",
        quickMute60: "452813334429827072",
        sweep: "783030737552670801",
        checkmark: "765068298004987904"
    }

    public static channels = {
        alerts: "785821764839669791",
        commands: "150250250471342080",
        moderators: "150255535927721984",
        seniorModerators: "678849276402466849",
        banRequestsQueue: "592580861543841802",
        messageLogs: "1024534308762947594",
        commandLogs : "366629978101514241",
        mediaLogs: "1028104917170258030",
        voiceLogs: "366624876544655360",
        modCastText: "933975893599211570",
        winnerQueue: "963136283633389668",
        trialModerators: "678671353473269799",
        muteRequestQueue: "912280762760454174",
        info: "701702989785858118",
        verifyLogs: "546528119281156106"
    }
    
    public static channelAutoReactions: { [channelId: string]: Array<string> } = {
        "150077608602632192": ["275832913025564682", "♥️", "😎"],   // creations
        "779975211063443456": ["275832913025564682", "♥️", "😎"],   // avatars
        "1129484475030581309": ["⭐", "1030206813909561404", "🏖️"] // summer-avatar-contest
    }

    public static threads = {
        trialLogs: "1133083040579604520"
    }

    public static categories = {
        internalChannels: "1132788405445599472",
        feed: "721914280878014524",
        info: "612589198834270228"
    }

    public static modAlertCooldown: number = 5;
    public static membersOnStage = new Map();
    public static guildId = "150074202727251969";
}