module.exports = {
    name: "hug",

    exec: function(data){

        var usernamePattern = /^@?[a-zA-Z0-9-_]{3,16}$/;

        if(typeof data === "undefined") return;

        var username = data.username,
            channelName = data.channelName,
            parameters = data.parameters;

        if(username.toLowerCase() != "marting"){
            return;
        }

        if(channelName == "english"){
            return;
        }

        var queryUsername;


        queryUsername = parameters[0].trim();

        if(!usernamePattern.test(queryUsername)) {
            onDumpError();
            return;
        }

        if(queryUsername.charAt(0) == '@') {
            queryUsername = queryUsername.substr(1, queryUsername.length - 1);
        }

        var limit;

        if(parameters.length == 2) {
            limit = parseInt(parameters[1].trim())
        }

        require("../bot.js").dexonbot.dumpChatLog(onDumpResult, onDumpError, queryUsername, limit);

        function onDumpResult() {
            console.log("onDumpResult");
            require("../bot.js").dexonbot.webClient.doSay("Hugs " + queryUsername + ".", channelName);
        }

        function onDumpError() {
            require("../bot.js").dexonbot.webClient.doSay("Unable to hug :(", channelName);
        }

    }
};