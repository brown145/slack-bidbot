'use strict';

module.exports.process =  function process(intentData, messageData, callback){

  if (intentData.intent[0].value !== 'bid') {
    return callback(new Error(`Expected 'bid' intent got ${intentData.intent[0].value}`));
  }

  if (!intentData.amount) {
    return callback(new Error('Missing bid amount in bid intent'));
  }

  let task = '';
  if (intentData.task) {
    task = intentData.task[0].value;
  }

  return callback(null, {
    intent: 'BID',
    amount: intentData.amount[0].value,
    user: messageData.user,
    task: task
  });
}
