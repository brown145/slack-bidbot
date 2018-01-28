'use strict';

const request = require('superagent');

const handleWitResponse = function (res) {
  return res.entities;
}

module.exports = function witClient(token){
  const ask = function ask(message, callback){
    request.get('https://api.wit.ai/message')
      .set('Authorization', 'Bearer ' + token)
      .query({
        v: '20180127',
        q: message
      })
      .end((err, res) => {
        if (err) {
          return callback(err);
        }

        if (res.statusCode !== 200) {
          return callback('Expected status 200 but got ' + res.statusCode);
        }

        const witResponse = handleWitResponse(res.body);
        return callback(null, witResponse);
      });
  }

  return {
    ask: ask
  }
}
