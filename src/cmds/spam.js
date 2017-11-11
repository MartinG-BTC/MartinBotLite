var timeago = require("../timeago");

var mods = {
    "ryan": true,
};

function spam(data) {
    var usernamePattern = /^@?[a-zA-Z0-9-_]{3,16}$/;

    if(typeof data === "undefined") return;

    var username = data.username,
        channelName = data.channelName,
        parameters = data.parameters;

    var queryUsername;
    var command;
    var language = "english";
    var silent = false;
    var silentCount = 0;
    var noMute = false;
    var remove = false;
    var removeCount = 0;
    var list = false;
    var help = false;
    var quiet = false;

    for(var i=0; i<parameters.length; i++) {
        var remMatch = (parameters[i] + '').match(/^-r(\d*)$/);
        var silMatch = (parameters[i] + '').match(/^-s(\d*)$/);

        //console.log(remMatch, silMatch);

        if(remMatch) {
            remove = true;
            removeCount = parseFloat(remMatch[1]);
            if(isNaN(removeCount) || removeCount < 1) removeCount = 1;
        } else if(silMatch) {
            silent = true;
            silentCount = parseFloat(silMatch[1]);
            if(isNaN(silentCount) || silentCount < 1) silentCount = 1;
            if(silentCount > 20) silentCount = 20;
        } else if(parameters[i].toLowerCase() == "help" || parameters[i].toLowerCase() == "-help" || parameters[i].toLowerCase() == "-h") {
            help = true;
        } else if(parameters[i] == "/trading") {
            command = "trading";
        } else if(parameters[i] == "/begging") {
            command = "begging";
        } else if(parameters[i] == "/rambling") {
            command = "rambling";
        } else if(parameters[i] == "#korean") {
            language = "korean";
        } else if(parameters[i] == "#filipino") {
            language = "filipino";
        } else if(parameters[i] == "-0") {
            noMute = true;
        } else if(parameters[i] == "-l") {
            list = true;
        } else if(parameters[i] == "-q") {
            quiet = true;
        } else if (isUsername(parameters[i])) {
            queryUsername = parameters[i];
        }
    }

    if(command && help) {
        require("../bot.js").dexonbot.webClient.doSay("[help] !begging, !trading and !rambling issues warnings and mutes repeat offenders automatically, each have separate counters. Options: -s[count] Increment counter silently without muting. -r[count] Decrement counter. -l Display warning count for user. -0 Display warning message without incrementing counter. Usage: !<begging|trading|rambling> [username [-l|-0|-r[count]|-s[count]]]", channelName);
        return;
    } else if (help) {
        require("../bot.js").dexonbot.webClient.doSay("[help] !spam notifies users how to go to the SPAM room and does not keep a counter. Usage: !spam [username]", channelName);
        return;
    }

    if(queryUsername) {
        require("../bot.js").dexonbot.getUser(onGetUserResult, onGetUserResult, queryUsername);
    } else {
        onGetUserResult();
    }

    var correctedUsername;

    function getGetOrdinal(n) {
        var s=["th","st","nd","rd"],
            v=n%100;
        return n+(s[(v-20)%10]||s[v]||s[0]);
    }

    function buildMessage(count) {

        var spam_msg;
        var begging_msg;
        var trading_msg;
        var rambling_msg;
        var mute_warning_msg;

        if(language == 'korean') {
            spam_msg = "\uCC44\uB110\uC124\uC815 \uB9E8 \uCCAB\uBC88\uC9F8 \uCC44\uB110\uC774 \uC2A4\uD338\uCC44\uB110\uC785\uB2C8\uB2E4. \uACF5\uC2DD\uC801\uC778 \uCC44\uB110\uB4E4 \uB9D0\uACE0 \uC2A4\uD338\uCC44\uB110\uAC00\uC11C \uB9D0\uC500\uD574\uC8FC\uC138\uC694. (i.imgur.com/iBGsGTY.png). ";
            begging_msg = "\uB3C8\uC744 \uAD6C\uAC78\uD558\uAC70\uB098 \uB2EC\uB77C\uACE0\uD558\uB294 \uD589\uC704\uB294  " + channelName + "(\uD55C\uAD6D) \uCC44\uB110\uC5D0\uC11C\uB294 \uAE08\uC9C0\uC785\uB2C8\uB2E4. ";
            trading_msg = "\uC2A4\uD06C\uB9BD\uD2B8 \uD639\uC740 \uBE44\uD2B8\uB97C \uD30C\uAC70\uB098 \uC0AC\uB294 \uD589\uC704\uB294  " + channelName + "(\uD55C\uAD6D) \uCC44\uB110\uC5D0\uC11C\uB294 \uAE08\uC9C0\uC785\uB2C8\uB2E4.";
            rambling_msg  = "\uC695\uD558\uAC70\uB098 \uBE44\uB09C\uD558\uB294 \uD589\uC704\uB294 " + channelName + "(\uD55C\uAD6D) \uCC44\uB110\uC5D0\uC11C \uC790\uC81C\uD574\uC8FC\uC138\uC694. Please tone it down. ";
            mute_warning_msg  = "\uACC4\uC18D\uD574\uC11C \uAC19\uC740 \uD589\uC704\uB97C \uBC18\uBCF5\uD558\uC2E4\uACBD\uC6B0 \uCC44\uAE08 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4.";
        } else if(language == 'filipino') {
            spam_msg = "Maaari kang pumunta sa channel ng SPAM sa pamamagitan ng pag-click sa icon ng bandila sa kanan ng chat box, pagkatapos ay piliin ang pulang bandila na may kabaligtaran pentagram (i.imgur.com/iBGsGTY.png). ";
            begging_msg = "Ang paghingi ng pera o mga pautang, kahit na bilang joke, ay hindi pinahihintulutan sa " + channelName + " na channel. ";
            trading_msg = "Hindi pinapayagan ang pagbili, pagbebenta at pangangalakal sa " + channelName + " channel. ";
            rambling_msg = "Ang iyong nakakainis na pag-uusap ay dominado ang " + channelName + " na channel. Maging tahimik ka lang. ";
            mute_warning_msg = "Ang pagpapatuloy sa gawaing ito ay magreresulta sa isang mute.";
        } else {
            spam_msg = "You can go to the SPAM channel by clicking the flag icon to the right of the chat box, then selecting the red flag with an inverse pentagram (i.imgur.com/iBGsGTY.png). ";
            begging_msg = "Asking for money or loans, even as a joke, is not allowed in the " + channelName + " channel. ";
            trading_msg = "Buying, selling and trading is not allowed in the " + channelName + " channel. ";
            rambling_msg = "Your annoying rambling is dominating the " + channelName + " channel. Please tone it down. ";
            mute_warning_msg = "Continuing to do so will result in a mute.";
        }

        var msg = '';

        if (command == "begging") {
            msg += begging_msg;
        } else if (command == "trading") {
            msg += trading_msg;
        } else if (command == "rambling") {
            msg += rambling_msg;
        }

        msg += spam_msg;

        if (correctedUsername) {
            msg = "@" + correctedUsername + ", " + msg.substr(0, 1).toLowerCase() + msg.substr(1);
        }

        if(count == 1) {
            msg += mute_warning_msg;
        } else if(count > 1) {
            msg += ("This is your " + getGetOrdinal(count) + " warning.");
        }

        return msg;

    }

    function onGetUserResult(usernameResult) {

        if(usernameResult) usernameResult = usernameResult[USERNAME];

        correctedUsername = usernameResult ? usernameResult : queryUsername;

        if(remove && correctedUsername && command) {
            removeLastWarningMessages();
            return;
        }

        if(silent && correctedUsername && command) {
            silentlySaveWarningMessages();
            return;
        }

        if((!correctedUsername || !command) && !(list || quiet)) {
            require("../bot.js").dexonbot.webClient.doSay(buildMessage(), channelName);
        }

        if(quiet) {
            require("../bot.js").dexonbot.webClient.doSay("Added warning for " + correctedUsername + ".", channelName);
        }

        if (!noMute && correctedUsername && command) {
            require("../bot.js").dexonbot.listWarningsMessages(onListWarningsResult, onListWarningsError, correctedUsername);
        }
    }

    function removeLastWarningMessages() {
        require("../bot.js").dexonbot.removeLastWarningMessages(correctedUsername, removeCount, function (err, res) {
            if(!err && res > 0) {
                require("../bot.js").dexonbot.webClient.doSay("Removed " + res + " " + (res == 1 ? "warning" : "warnings" ) + " for " + correctedUsername + ".", channelName);
            } else {
                require("../bot.js").dexonbot.webClient.doSay("Unable to remove warnings for " + correctedUsername + ".", channelName);
            }
        });
    }

    function silentlySaveWarningMessages() {

        for(var i=0; i<silentCount; i++) {
            require("../bot.js").dexonbot.saveWarningMessage(correctedUsername, Date.now()+i, command, username, channelName);
        }

        require("../bot.js").dexonbot.webClient.doSay("Added " + silentCount + " " + (silentCount == 1 ? "warning" : "warnings" ) + " for " + correctedUsername + ".", channelName);

    }

    function onListWarningsResult(result) {

        console.log(result);

        var daysAgo = Date.now() - 1000*60*60*24*180;
        var secondsAgo = Date.now() - 1000*20;

        var count = list ? 0 : 1;

        for(var i=0; i<result.length; i++) {
            if((result[i][TIMESTAMP] > secondsAgo) && (result[i].hasOwnProperty('mod')) && (result[i].mod != username.toLowerCase()) && !list) {
                return;
            }

            if(result[i].type != command) {
                continue;
            }

            if(result[i][TIMESTAMP] > daysAgo) {
                count++;
            }
        }

        if(list) {

            var details = '';
            var c = 0;

            for(var i=0; i<result.length; i++) {

                var r = result[i];

                if(r.type != command) {
                    continue;
                }

                if(r[TIMESTAMP] <= daysAgo) {
                    continue;
                }

                if(c > 0) details += ", ";
                c++;


                if(!r.hasOwnProperty(TIMESTAMP) || !r.hasOwnProperty('mod')) continue;

                details += (r['mod'] + " " + new timeago().format(r[TIMESTAMP]));
            }

            require("../bot.js").dexonbot.webClient.doSay(correctedUsername + " has " + count + " " + (count == 1 ? "warning" : "warnings" ) + " for " + command + ". " + details, channelName);

            return;
        }

        if(!quiet) {
            require("../bot.js").dexonbot.webClient.doSay(buildMessage(count), channelName);
        }

        require("../bot.js").dexonbot.saveWarningMessage(correctedUsername, Date.now(), command, username, channelName);

        var duration = 0;

        if(count > 1 && count < 14) {

            duration = Math.pow(2, count-1);

        } else if (count >= 14) {

            duration = 8760;

        }

        console.log("duration: " +  duration);

        if(duration > 0) {
            var muteCommand = "/mute " + correctedUsername + " " + duration + "h";
            console.log(muteCommand);
            require("../bot.js").dexonbot.webClient.doSay(muteCommand, channelName);
        }
    }

    function onListWarningsError(err) {
        console.log("onListWarningsError:" + err);
    }

    var TIMESTAMP = 'ts';
    var USERNAME = 'u';
    var TYPE = 'type';

    function isUsername(u) {
        return /^@?[a-zA-Z0-9-_]{3,16}$/.test(u);
    }
}

module.exports = {
    name: "spam",

    exec: function(data){
        var username = data.username;

        if(mods.hasOwnProperty(username.toLowerCase())) {
            spam(data);
        } else {
            require("../bot.js").dexonbot.getUser(onGetUserResult, function(err) { console.log(err) }, username);
        }

        function onGetUserResult(result) {
            if(result.hasOwnProperty('moderator') && result.moderator) {
                spam(data);
            }
        }
    }
};