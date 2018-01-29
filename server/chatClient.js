'use strict';

const slackToken = process.env.SLACK_TOKEN;
const slackLogLevel = process.env.SLACK_LOG_LEVEL;
const witToken = process.env.WIT_TOKEN;
const witClient = require('../server/witClient')(witToken);
const slackClient = require('../server/slackClient');

module.exports.handleStateChange = function(action, state, oldState) {
  if ((state.hand !== oldState.hand) && state.hand.currentTask) {
    slackClient.messageTeam(`Now bidding on ${state.hand.currentTask}, expecting ${state.hand.bidders.length} bids.`);
  }

  if (state.bids !== oldState.bids) {
    let newBids = state.bids.filter(bid => !oldState.bids.includes(bid));
    const countBidsOnCurrentTask = state.bids.filter(bid => bid.bidTask === state.hand.currentTask).length;

    newBids.forEach(bid => {
      slackClient.messageTeamMember(`Accepted bid ${bid.bidAmount} for ${bid.bidTask}.`, bid.bidder);
    });

    if (countBidsOnCurrentTask >= state.hand.bidders.length) {
      let bidsString = state.bids
        .filter(bid => bid.bidTask === state.hand.currentTask)
        .map(bid => `<@${bid.bidder}> bid: ${bid.bidAmount}`)
        .join();

      slackClient.messageTeam(`${state.hand.currentTask}: bidding complete. ${bidsString}`);
    } else {
      slackClient.messageTeam(`${state.hand.currentTask}: ${countBidsOnCurrentTask} of ${state.hand.bidders.length} bids.`);
    }
  }
}

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
    let request = slackClient.requestTeamMembers();
    request.then((teamMembers) => {
      taskAction.payload.bidders = teamMembers;
      props.store.dispatch(taskAction);
    });
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
