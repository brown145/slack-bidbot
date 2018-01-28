'use strict';

const slackToken = process.env.SLACK_TOKEN;
const slackLogLevel = process.env.SLACK_LOG_LEVEL;
const witToken = process.env.WIT_TOKEN;
const witClient = require('../server/witClient')(witToken);
const slackClient = require('../server/slackClient');

module.exports.init = function chatClient(props) {
  const handleBidMessage = (bidProps) => {
    // TODO: validate bidExists is workign correctly
    // TODO: default to current task if no task is set
    const bidExists = Boolean(props.store.getState().bids.filter((bid) => (bid.bidTask === bidProps.task && bid.bidder === bidProps.user)).length);
    const bidAction = {
      intent: 'BID',
      intentAction: (bidExists) ? 'UPDATE': 'ADD' ,
      payload: {
        bidAmount: bidProps.amount,
        bidTask: bidProps.task,
        bidder: bidProps.user
      }
    };
    props.store.dispatch(bidAction);
  }

  const handleHandMessage = (taskProps) => {
    const taskAction = {
      intent: 'HAND',
      intentAction: taskProps.action.toUpperCase(),
      payload: {
        task: taskProps.task
      }
    }
    props.store.dispatch(taskAction);
  }

  const parseIntent = (message) => {
    witClient.ask(message.text, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }

      try {
        if (!res.intent || !res.intent[0] || !res.intent[0].value ){
          throw new Error('Could not extract intent.');
        }

        // NOTE: something still smells about passing a prop and requiring by name...
        let intentProcessor = null;
        let intentEventHandler = null;
        switch (res.intent[0].value.toLowerCase()) {
          case 'bid':
            intentProcessor = require('./intents/bidIntent');
            intentEventHandler = handleBidMessage;
            break;
          case 'hand':
            intentProcessor = require('./intents/handIntent');
            intentEventHandler = handleHandMessage;
            break;
        }

        intentProcessor.process(res, message, function(error, response) {
          if (error) {
            console.log(error.message);
            return;
          }
          intentEventHandler(response);
        });
      } catch(err) {
        console.log(err);
        console.log(res);
        message.reply('Sorry, I don\'t know what yoru are talking about.');
      }
    });
  }

  slackClient.init(slackToken, slackLogLevel);
  slackClient.addAuthenticationHandler(props.onClientReady);
  slackClient.addAtMessageHandler(parseIntent);
}
