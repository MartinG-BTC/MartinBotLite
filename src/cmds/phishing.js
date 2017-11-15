module.exports = {
    name: "phishing",

    exec: function(data){

        if(typeof data === "undefined") return;

        var username = data.username,
            channelName = data.channelName,
            parameters = data.parameters;

        if(parameters.length == 0) {
            return;
        }


        if(parameters[0] == '/warn') {

            isModerator(username, function(mod) {
                if(!mod) {
                    warn(channelName, username);
                }
            });

            return;
        }

        isModerator(username, function(mod) {

            if(!mod) {
                return;
            }

            if(parameters[1] == '/remove') {
                remove(parameters[0], channelName);
                return;
            }

            save(parameters[0], channelName);

        });
    }
};


function isModerator(username, callback) {
    require("../bot.js").dexonbot.getUser(onGetUserResult, function(err) { callback(false); }, username);


    function onGetUserResult(result) {
        if(result.hasOwnProperty('moderator') && result.moderator) {
            callback(true);
        } else {
            callback(false);
        }
    }
}


function warn(channelName, username) {
    var muteCommand = "/mute " + username + " " + 365 + "d";
    console.log(muteCommand);
    require("../bot.js").dexonbot.webClient.doSay(muteCommand, channelName);
    require("../bot.js").dexonbot.webClient.doSay("[Phishing] MALICIOUS LINK DETECTED - BustaBit does not offer free bits, and will never ask you for your username or password to receive a reward. If you click the link and sign in, you will loose your bits.", channelName);
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