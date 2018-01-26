const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');

// Cache of data
let appData = {};
let rtm = null;

const handleOnAuthenticate = (connectData) => {
  // Cache the data necessary for this app in memory
  appData.selfId = connectData.self.id;
  console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
}

const handleConnectionOpen = () => {
  console.log(`Ready`);
}

const handleOnMessage = (message) => {
  console.log(message);
  rtm.sendMessage('i like the cut of your jib', message.channel, function messageSent() {
    console.log('i like the jib');
  });
}

const addAuthenticationHandler = function(rtm, handler) {
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}

const addConnectionOpenHandler = function(rtm, handler) {
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, handler);
}

const addOnMessageHandler = function(rtm, handler) {
  rtm.on(RTM_EVENTS.MESSAGE, handler);
}

module.exports.addAuthenticationHandler = addAuthenticationHandler;
module.exports.init = function slackClient(token, logLevel){
  // Initialize the RTM client with the recommended settings. Using the defaults for these
  // settings is deprecated.
  rtm = new RtmClient(token, {
    dataStore: false,
    useRtmConnect: true,
    logLevel,
  });

  addAuthenticationHandler(rtm, handleOnAuthenticate);
  addConnectionOpenHandler(rtm, handleConnectionOpen);
  addOnMessageHandler(rtm, handleOnMessage);
  return rtm;
}
