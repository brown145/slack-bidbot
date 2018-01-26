'use strict';

const dotenv = require('dotenv');
dotenv.load();

const slackClient = require('../server/slackClient');
const service = require('../server/service');
const http = require('http');
const server = http.createServer(service);

const slackToken = process.env.SLACK_TOKEN;
const slackLogLevel = 'verbose';

const rtm = slackClient.init(slackToken, slackLogLevel);
rtm.start();

slackClient.addAuthenticationHandler(rtm, () => server.listen(3000));

server.on('listening',  function(){
  console.log(`service is listening on ${server.address().port} in ${service.get('env')} mode`);
});
