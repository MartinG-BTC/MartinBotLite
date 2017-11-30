module.exports = {
    name: "phishing",

    exec: function(data){

        if(typeof data === "undefined") {
            return;
        }

        var username = data.username,
            channelName = data.channelName,
            parameters = data.parameters;

        isModerator(username, function(mod) {
            if(!mod) {

                if(parameters.length == 1 && parameters[0] == '/match') {
                    warn(channelName, username);
                    return;
                }

            } else {

                if(parameters.length == 0) {
                    warn(channelName);
                } else if (parameters.length == 1 && parameters[0] == '/match') {
                    informMatch(channelName);
                } else if (parameters.length == 1) {
                    save(parameters[0], channelName);
                } else if (parameters.length == 2 && parameters[1] == '/remove') {
                    remove(parameters[0], channelName);
                }

            }
        });
    }
};

var mods = {
    "ryan": true
};

function isModerator(username, callback) {

    if(mods.hasOwnProperty(username.toLowerCase())) {

        callback(true);

    } else {

        require("../bot.js").dexonbot.getUser(onGetUserResult, function (err) { callback(false); }, username);

    }

    function onGetUserResult(result) {
        if(result && result.moderator) {
            callback(true);
        } else {
            callback(false);
        }
    }
}

function informMatch(channelName) {
    require("../bot.js").dexonbot.webClient.doSay("[Phishing] That's a match.", channelName);
}

function warn(channelName, username) {
    if(username) {
        var muteCommand = "/mute " + username + " 365d";
        require("../bot.js").dexonbot.webClient.doSay(muteCommand, channelName);
    }

    var message;

    if(channelName == 'korean') {
        message = "[피싱] '씨부레링크가 감지되었습니다. - 부스타빗은 현재 무료비트를 제공하지 않으며 아이디 비밀번호를 요구하지않습니다. 저 쉐리가올린 시부레 링크를 클릭하시고 들어가서 로그인하시면 비트 탈탈 털림 시부레. 조심하세여.";
    } else {
        message = "[Phishing] " + (username ? 'MALICIOUS LINK DETECTED - ' : '')  + "BustaBit does not offer free bits, and will never ask you for your username or password to receive a reward. If you click on " + (username ? ("the link posted by @" + username + " ") : "a phishing link ") + "and sign in, you will loose your bits.";
    }

    require("../bot.js").dexonbot.webClient.doSay(message, channelName);
}

function save(regexString, channelName) {

    try {
        var flags = regexString.replace(/.*\/([gimy]*)$/, '$1');
        var pattern = regexString.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
        new RegExp(pattern, flags);

        console.log(flags, pattern);
    } catch (e) {
        require("../bot.js").dexonbot.webClient.doSay("[Phishing] Error: Unable to parse that RegEx.", channelName);
        return;
    }

    require("../bot.js").dexonbot.addPhish(regexString, function(err) {
        if(err) {
            require("../bot.js").dexonbot.webClient.doSay("[Phishing] Error: " + err, channelName);
        } else {
            require("../bot.js").dexonbot.webClient.doSay("[Phishing] Added", channelName);
        }
    })
}

function remove(regexString, channelName) {
    require("../bot.js").dexonbot.removePhish(regexString, function(err) {
        if(err) {
            require("../bot.js").dexonbot.webClient.doSay("[Phishing] Error: " + err, channelName);
        } else {
            require("../bot.js").dexonbot.webClient.doSay("[Phishing] Removed", channelName);
        }
    })
}