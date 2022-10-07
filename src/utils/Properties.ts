export default class Properties {
    public static emojis = {
        alert: "625429388229345280",
        approve: "762388343253106688",
        reject: "764268551473070080",
        quickMute30: "760204798984454175",
        quickMute60: "452813334429827072",
        sweep: "783030737552670801"
    }
    
    public static channels = {
        alerts: "785821764839669791",
        commands: "150250250471342080",
        banRequestsQueue: "592580861543841802",
        messageLogs: "1024534308762947594",
        voiceLogs: "366624876544655360",
        modCastText: "933975893599211570"
    }

    public static categories = {
        internalChannels: "360904621524385792"
    }

    public static modAlertCooldown: number = 5;
    public static membersOnStage = new Map();
}
