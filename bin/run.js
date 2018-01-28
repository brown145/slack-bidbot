'use strict';

const dotenv = require('dotenv');
dotenv.load();

const chatClient = require('../server/chatClient');
const BidStore = require('../server/bidStore');
const service = require('../server/service');
const http = require('http');
const server = http.createServer(service);


/*
    TODO LIST
    ---------
    1. reply on task started
    2. accept bids in im/private
    3. reply on bid
    4. get outstandingBidCount when task starts
    5. update task started reply to contain outstandingBidCount
    6. on each bid reply to channel
    7. when outstandingBidCount is 0 -> reply bid values to channel

    Out of Scope
    ------------
    * get list of things that bot can do
    * re-start or stop bid
    * get update on bids
    * get list of all tasks/bids in session
    * start/end/clear bidding sessions
    * get/set/use timer for bids; end bidding early if time expires
    * allow concurrent task bids
*/

const bidStore = BidStore.createStore(BidStore.reducer);
bidStore.subscribe((eventName, action, state) => {
  console.log('something happened with state');
  console.log('new state', state);
  console.log('action', action);
});
const onClientReady = () => server.listen(3000);

chatClient.init({
  store: bidStore,
  onClientReady
});

server.on('listening',  function(){
  console.log(`service is listening on ${server.address().port} in ${service.get('env')} mode`);
});
