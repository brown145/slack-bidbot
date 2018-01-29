const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
const request = require('superagent');

let slackData = {
  selfId: null,
  teamChannel: null,
  teamMemberChannel:[]
};
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
      // Code smells
      // Fragile assumption that channel starting with C is global
      // and channel starting with D is direct messages
      // see: https://stackoverflow.com/questions/41111227/how-can-a-slack-bot-detect-a-direct-message-vs-a-message-in-a-channel
      if (channel.indexOf('D') === 0) {
        slackData.teamMemberChannel[user] = channel;
      } else if (channel.indexOf('C') === 0) {
        slackData.teamChannel = channel;
      }

      handler({
        text,
        user,
        reply: (response) => ( rtm.sendMessage(response, channel) ) //TODO: do we want/need this?
      });
    }
  });
}

const messageTeam = function(messageText) {
  rtm.sendMessage(messageText, slackData.teamChannel);
}

const messageTeamMember = function(messageText, member) {
  rtm.sendMessage(messageText, slackData.teamMemberChannel[member]);
}

const requestTeamMembers = function(){
  return new Promise((resolve, reject) => {
    request.get('https://slack.com/api/conversations.members')
      .query({
        token: slackData.token,
        channel: slackData.teamChannel
      }).end((err, res) => {
        // TODO: error handling
        resolve(res.body.members.filter(memberId => memberId !== slackData.selfId));
      });
  });
}

module.exports.addAuthenticationHandler = addAuthenticationHandler;
module.exports.addAtMessageHandler = addAtMessageHandler;
module.exports.messageTeam = messageTeam;
module.exports.messageTeamMember = messageTeamMember;
module.exports.requestTeamMembers = requestTeamMembers;
module.exports.init = function slackClient(token, logLevel) {
  slackData.token = token;
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
