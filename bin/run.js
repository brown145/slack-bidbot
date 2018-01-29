'use strict';

const dotenv = require('dotenv');
dotenv.load();

const chatClient = require('../server/chatClient');
const BidStore = require('../server/bidStore');
const service = require('../server/service');
const http = require('http');
const server = http.createServer(service);

const bidStore = BidStore.createStore(BidStore.reducer);
bidStore.subscribe((action, state, oldState) => {
  // console.log(action, state);
});
bidStore.subscribe(chatClient.handleStateChange);
const onClientReady = () => server.listen(3000);

chatClient.init({
  store: bidStore,
  onClientReady
});

server.on('listening',  function(){
  console.log(`service is listening on ${server.address().port} in ${service.get('env')} mode`);
});
