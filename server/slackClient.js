const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');

let slackData = {};
let rtm = null;

const doLog = (logLevel) => (
  logLevel === 'debug' || logLevel === 'verbose'
);

const handleOnAuthenticate = (connectData) => {
  slackData.selfId = connectData.self.id;
  if ( doLog(slackData.logLevel) ) {
    console.log(`Slack Client: Logged in as ${slackData.selfId} of team ${connectData.team.id}`);
  }
}

const handleConnectionOpen = () => {
  if ( doLog(slackData.logLevel) ) {
    console.log(`Slack Client: Connection open.`);
  }
}

const handleAtMessage = (message) => {
  if ( doLog(slackData.logLevel) ) {
    console.log(`Slack Client: ${message.text}.`);
  }
}

const addAuthenticationHandler = function(handler) {
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}

const addConnectionOpenHandler = function(handler) {
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, handler);
}

const addOnMessageHandler = function(handler) {
  rtm.on(RTM_EVENTS.MESSAGE, handler);
}

const addAtMessageHandler = function(handler) {
  rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    const { text, user, channel } = message;
    if (text.includes(slackData.selfId)) {
      handler({
        text,
        user,
        reply: (response) => ( rtm.sendMessage(response, channel) ) //TODO: do we want/need this?
      });
    }
  });
}

module.exports.addAuthenticationHandler = addAuthenticationHandler;
module.exports.addAtMessageHandler = addAtMessageHandler;
module.exports.init = function slackClient(token, logLevel){
  slackData.logLevel = logLevel;
  rtm = new RtmClient(token, {
    dataStore: false,
    useRtmConnect: true,
    logLevel,
  });
  rtm.start();

  addAuthenticationHandler(handleOnAuthenticate);
  addConnectionOpenHandler(handleConnectionOpen);
  addAtMessageHandler(handleAtMessage);
}
