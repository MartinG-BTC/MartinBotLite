'use strict';

var EventEmitter =  require('events').EventEmitter,
    inherits     =  require('util').inherits;

module.exports = WebClient;

function WebClient(config) {
    EventEmitter.call(this);

    this.config = config;

    this.socket = require('socket.io-client')(config.WEBSERVER);
    this.socket.on('event', this.onEvent.bind(this));
    this.socket.on('error', this.onError.bind(this));
    this.socket.on('err', this.onErr.bind(this));
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('msg', this.onMsg.bind(this));


    this.sayQueue = [];
    this.lastSaidTimestamp = 0;
    this.sayQueueTimeout = null;
    this.sayTimestamps = [];
}

inherits(WebClient, EventEmitter);

WebClient.prototype.onMsg = function(msg) {
    //console.log(msg);
    this.emit('msg', msg);
};

WebClient.prototype.onError = function(err) {
    console.error('('+(new Date()).getTime()+') webclient onError: ', err);
};

WebClient.prototype.onEvent = function(data) {
    console.error('('+(new Date()).getTime()+') webclient onEvent: ', data);
};

WebClient.prototype.onErr = function(err) {
    console.error('webclient onErr: ', err);
};

WebClient.prototype.onConnect = function(data) {
    this.socket.emit('join', 'all', this.onJoin.bind(this));
};

WebClient.prototype.onJoin = function(err, data) { //{ data.username, data.moderator, data.channels }
    console.log('Connected to WebServer', data.username);

    var allChanData = {
        history: data.channels.all,
        username: data.username,
        channel: 'all'
    };

    this.emit('join', allChanData);

    this.doSay("Hello", 'adfasdfasdfasdf');
};

WebClient.prototype.doSay = function(line, channelName) {
    console.log(line, channelName);

    this.sayQueue.push({line: line, channelName: channelName});
    this.processSayQueue();
};

WebClient.prototype.processSayQueue = function() {

    var msPerSay = 500;

    var sayCount = 10;
    var sayPeriod = 5000;

    var me = this;

    if(me.sayQueueTimeout != null) {
        clearTimeout(me.sayQueueTimeout);
        me.sayQueueTimeout = null;
    }

    if(me.sayQueue.length == 0) {
        return;
    }

    if(me.sayTimestamps.length >= sayCount && me.sayTimestamps[sayCount-1] + sayPeriod > Date.now()) {

        console.log("limiting say rate by period");

        me.sayQueueTimeout = setTimeout(function() {
            me.processSayQueue();
        }, (me.sayTimestamps[sayCount-1] + sayPeriod - Date.now()));

        return;

    } else if (me.lastSaidTimestamp + msPerSay > Date.now()) {

        console.log("limiting say rate");

        me.sayQueueTimeout = setTimeout(function() {
            me.processSayQueue();
        }, (me.lastSaidTimestamp + msPerSay - Date.now()));

        return;

    }

    me.lastSaidTimestamp = Date.now();
    me.sayTimestamps.unshift(me.lastSaidTimestamp);
    if(me.sayTimestamps.length > sayCount) {
        me.sayTimestamps.splice(sayCount, me.sayTimestamps.length - sayCount);
    }

    var say = me.sayQueue.shift();

    me.socket.emit('say', say.line, say.channelName, true, function(err, data) {
        if(err) console.error('[doSay Error] ', err);
    });

    if(me.sayQueue.length > 0) {
        me.sayQueueTimeout = setTimeout(function() {
            me.processSayQueue();
        }, msPerSay);
    }
};



WebClient.prototype.onDisconnect = function(data) {
    console.log('Disconnected from Web server |', data, '|', typeof data);
    this.emit('disconnect');
};