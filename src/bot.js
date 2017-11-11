/* MODULES
-----------------*/

/* TEMP. VARS
-----------------*/


/* EVENTS
-----------------*/

/* BOT
-----------------*/
function DexonBot(){
    DEBUG='';

    var self = this;
    var me = self;

    var chat = true;

    var USERNAME = 'u';

    self.Config = require('./Config');

    self.repHistory = [];
    self.repLeaderboard = null;
    self.repLoserboard = null;
    self.playerStarted = false;

    self.betting = false;

    var levelup = require('levelup');
    var WebClient = require('./WebClient');

    var fs = require('fs');

    var newXhr = require('socket.io-client-cookies-headers');
    newXhr.setCookies('id=' + self.Config.SESSION);
    
    // Connect to the web server.
    self.webClient = new WebClient(self.Config);
    
    // New message in chat.
    self.webClient.on('msg', function(msg) {


        if(chat) {

            if (msg.message != null && msg.message != "" && msg.message[0] == "!") { // User calling a bot command
                msg.message = msg.message.replace(/\s\s+/g, ' ');
                var cmd = msg.message.split(" ")[0].replace("!", ""),
                    username = msg.username,
                    channelName = msg.channelName,
                    parameters = [];
                for (var i = 1; i < msg.message.split(" ").length; i++) {
                    var parameter = msg.message.split(" ")[i];
                    parameters.push(parameter);
                }
                self.onCmd(cmd, {
                    username: username,
                    channelName: channelName,
                    msg: msg,
                    parameters: parameters
                });
            }
        }

        me.saveChatMessage(msg);
    });

    // Use this website for conversion of unicode strings https://r12a.github.io/apps/conversion/

    self.onCmd = function(cmd, data){

        try{
            console.log('cmd', cmd);

            switch(cmd.toLowerCase()) {

                case "spam":
                    require("./cmds/spam.js").exec(data);
                    break;
                case "begging":
                    data.parameters.push('/begging');
                    require("./cmds/spam.js").exec(data);
                    break;
                case "trading":
                    data.parameters.push('/trading');
                    require("./cmds/spam.js").exec(data);
                    break;
                case "rambling":
                    data.parameters.push('/rambling');
                    require("./cmds/spam.js").exec(data);
                    break;


                case "nagmamakaawa":
                    data.parameters.push('#filipino');
                    data.parameters.push('/begging');
                    require("./cmds/spam.js").exec(data);
                    break;
                case "kalakalan":
                    data.parameters.push('#filipino');
                    data.parameters.push('/trading');
                    require("./cmds/spam.js").exec(data);
                    break;
                case "maingay":
                    data.parameters.push('#filipino');
                    data.parameters.push('/rambling');
                    require("./cmds/spam.js").exec(data);
                    break;


                case "\uC2A4\uD338":
                    console.log('case', "\uC2A4\uD338");
                    data.parameters.push('#korean');
                    require("./cmds/spam.js").exec(data);
                    break;
                case "\uAD6C\uAC78":
                    console.log('case', "\uAD6C\uAC78");
                    data.parameters.push('#korean');
                    data.parameters.push('/begging');
                    require("./cmds/spam.js").exec(data);
                    break;
                case "\uAC70\uB798":
                    console.log('case', "\uAC70\uB798");
                    data.parameters.push('#korean');
                    data.parameters.push('/trading');
                    require("./cmds/spam.js").exec(data);
                    break;
                case "\uC5B4\uB9AC\uBC84\uB9AC":
                    console.log('case', "\uC5B4\uB9AC\uBC84\uB9AC");
                    data.parameters.push('#korean');
                    data.parameters.push('/rambling');
                    require("./cmds/spam.js").exec(data);
                    break;
                case "hug":
                    require("./cmds/hug.js").exec(data);
                    break;
            }
        }catch(e){
            console.error("[onCMD Error] ", e.message);
        }

    };

    var usersDBFileName = "users.db";
    var chatDBFileName = "chat.db";
    var warningDBFileName = "warning.db";

    me.usersDB = null;
    me.chatDB = null;
    me.warningDB = null;

    me.databaseOpened = false;

    me.openDatabase = function() {
        me.usersDB = levelup(usersDBFileName);
        me.chatDB = levelup(chatDBFileName);
        me.warningDB = levelup(warningDBFileName);
        me.databaseOpened = true;
    };

    me.updateUserUsage = function(username, usage, callback) {
        if(!me.databaseOpened) return;

        if(!username || username.length == 0) return;

        var key = username.toLowerCase();

        console.log('updateUserUsage', usage);

        me.getUser(onGetUserResult, onError, key);

        function onGetUserResult(result) {
            var data = result ? result : {};
            data['usage'] = usage;
            me.usersDB.put(key, JSON.stringify(data), callback ? callback : undefined);
        }

        function onError(err) {
            if(callback) {
                callback(err ? err : {message: "Unknown Error"});
            }
        }
    };

    me.putUser = function(username, moderator) {
        if(!me.databaseOpened) return;

        if(!username || username.length == 0) return;

        if(moderator) {
            console.log("[putUser] *SAVING MODERATOR* ", username);
        } else {
            console.log("[putUser]", username);
        }


        var key = username.toLowerCase();

        var data = {};

        data[USERNAME] = username;
        if(moderator) data['moderator'] = true;

        me.usersDB.put(key, JSON.stringify(data));
    };

    me.getUser = function(onResult, onError, username){
        if(!me.databaseOpened) return;

        if(!username || username.length == 0) {
            onError();
            return;
        }

        var key = username.toLowerCase();

        me.usersDB.get(key, function (err, data) {
            if(err) {
                if(err.notFound) {
                    onResult(null);

                } else {
                    onError();

                }
            } else {

                var d = null;

                    try {
                        d = JSON.parse(data);
                    } catch (e) {
                        console.error("[getUser Error]", data);
                        onResult(null);
                        return;
                    }

                onResult(d);

            }
        });
    };

    me.getUsers = function(onResult, onError, usernames) {
        var result = [];

        if(!usernames || usernames.length == 0) {
            onResult(result);
            return;
        }

        nextUser(0);

        function nextUser(index) {
            if(index >= usernames.length) {
                onResult(result);
                return;
            }

            me.getUser(onGetUserResult, onError, usernames[index]);

            function onGetUserResult(user) {
                result.push(user);
                nextUser(index+1);
            }
        }

    };

    me.exportUsernames = function() {
        if(!me.databaseOpened) return;

        console.log("[exportUsernames]");

        var usernames = [];

        me.usersDB.createReadStream()
            .on('data', function (data) {
                try {
                    var user = JSON.parse(data.value);
                    var username = user[USERNAME];
                    usernames.push(username);
                } catch (e) {}
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
            })
            .on('end', function () {
                console.log('Stream ended');
                fs.writeFile('usernames_export.json', JSON.stringify(usernames), function(err) {
                    console.error('[Error Exporting Database]', err);
                });
            })
    };

    self.removeLastWarningMessages = function(username, count, callback) {
        if(!me.databaseOpened) return;

        if(!username || username.length == 0) return;

        console.log("[removeLastWarningMessage]", username);

        username = username.toLowerCase();

        self.getLastWarningMessages(username, count, function (err, res) {

            if(!res || res.length == 0) {
                callback("No Warnings");
                return;
            }

            var deleted = 0;

            for(var i=0; i<res.length; i++) {
                var k = {};
                k[USERNAME] = res[i][USERNAME];
                k[TIMESTAMP] = res[i][TIMESTAMP];
                var key = warningKeyToString(k);

                deleted++;

                me.warningDB.del(key, function (err) {
                    deleted--;
                });
            }

            callback(null, deleted);
        });
    };

    self.getLastWarningMessages = function(username, count, callback) {
        if(!me.databaseOpened) return;

        if(!username || username.length == 0) return;

        console.log("[getLastWarningMessage]", username);

        username = username.toLowerCase();

        var result = [];

        me.warningDB.createReadStream({
            gte: username + " 0",
            lte: username + " 9",
            reverse: true,
            limit: count
        })
            .on('data', function (data) {
                try {
                    var r = JSON.parse(data.value);
                    var key = warningStringToKey(data.key);

                    r[USERNAME] = key[USERNAME];
                    r[TIMESTAMP] = key[TIMESTAMP];

                    result.push(r);
                } catch (e) {
                    //console.log(e.message);
                }
            })
            .on('error', function (err) {
                console.error('[listWarningsMessages Error]', err);
                callback(err);
            })
            .on('end', function () {
                callback(null, result);
            });

    };

    self.saveWarningMessage = function(username, time, type, moderator, channel) {
        console.log("[saveWarningMessage]", username);

        var k = {};
        k[USERNAME] = username.toLowerCase();
        k[TIMESTAMP] = time;

        var key = warningKeyToString(k);
        var content = JSON.stringify({type: type, mod: moderator, chan: channel});

        me.warningDB.put(key, content);

    };

    self.listWarningsMessages = function(onResult, onError, username) {
        if(!me.databaseOpened) return;

        if(!username || username.length == 0) return;

        console.log("[listWarningsMessages]", username);

        username = username.toLowerCase();

        var result = [];

        me.warningDB.createReadStream({
            gte: username + " 0",
            lte: username + " 9"
        })
            .on('data', function (data) {
                try {
                    var o = JSON.parse(data.value);
                    var key = warningStringToKey(data.key);

                    o[USERNAME] = key[USERNAME];
                    o[TIMESTAMP] = key[TIMESTAMP];

                    result.push(o);
                } catch (e) {
                    //console.log(e.message);
                }
            })
            .on('error', function (err) {
                console.error('[listWarningsMessages Error]', err);
                onError();
            })
            .on('end', function () {
                onResult(result);
            });
    };

    self.saveChatMessage = function(msg) {

        var k = {};
        k[USERNAME] = msg.username.toLowerCase();
        k[TIMESTAMP] = Date.now();
        k[CHANNEL] = msg.channelName;

        var key = chatKeyToString(k);
        var content = JSON.stringify({msg: msg.message});

        //console.log(JSON.stringify(msg));

        var moderator = msg.hasOwnProperty('role') && msg.role == "moderator";

        me.chatDB.put(key, content);

        me.getUser(onGetUserResult, onGetUserError, msg.username);

        function onGetUserResult(u) {
            if(!u || moderator != (u.hasOwnProperty('moderator') && u.moderator)) {
                me.putUser(msg.username, moderator);
            }
        }

        function onGetUserError() {
            console.log("[onGetUserError]");
        }
    };

    me.dumpChatLog = function(onResult, onError, username, limit) {
        if(!me.databaseOpened) return;

        if(!username || username.length == 0) return;

        console.log("[dumpChatLog]", username);

        username = username.toLowerCase();

        var params = {
            gte: username + " 0",
            lte: username + " 9"
        };

        if(limit) {
            params.limit = limit;
        }

        var wstream = fs.createWriteStream(username + '_export.json');

        me.chatDB.createReadStream(params)
            .on('data', function (data) {
                try {

                    var key = chatStringToKey(data.key);
                    var o = JSON.parse(data.value);
                    o.key = key;
                    wstream.write(JSON.stringify(o) + '\n');

                } catch (e) {
                    console.error('[dumpChatLog Error]', e.message);
                }
            })
            .on('error', function (err) {
                wstream.end();
                console.error('[dumpChatLog Error]', err);
                onError();
            })
            .on('end', function () {
                console.error('[dumpChatLog End]');
                wstream.end();
                onResult();
            });
    };

    me.openDatabase();


    var TIMESTAMP = 'ts';
    var CHANNEL = 'ch';

    function warningKeyToString(key) {
        return key[USERNAME] + " " + key[TIMESTAMP];
    }

    function warningStringToKey(str) {
        var key = {};
        var s = str.split(' ');
        key[USERNAME] = s[0];
        key[TIMESTAMP] = parseInt(s[1]);
        return key;
    }

    function chatKeyToString(key) {
        return key[USERNAME] + " " + key[TIMESTAMP] + " " + key[CHANNEL];
    }

    function chatStringToKey(str) {
        var key = {};
        var s = str.split(' ');
        key[USERNAME] = s[0];
        key[TIMESTAMP] = parseInt(s[1]);
        key[CHANNEL] = s[2];
        return key;
    }

}

module.exports.dexonbot = new DexonBot();

/* UNCAUGHT EXCEPTIONS
-----------------*/
process.on('uncaughtException', function(err) {
    console.log((new Date).toUTCString() + ' uncaughtException:', err.message);
    console.log(err.stack);
    process.exit(1);
});
