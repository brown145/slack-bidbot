'use strict';

module.exports.process =  function process(intentData, messageData, callback){

  if (intentData.intent[0].value !== 'hand') {
    return callback(new Error(`Expected 'hand' intent got ${intentData.intent[0].value}`));
  }

  if (!intentData.action) {
    return callback(new Error('Missing action in hand intent.'));
  }

  let task = 'UNKNOWN TASK';
  if (intentData.task) {
    task = intentData.task[0].value || 'UNKNOWN TASK';
  }

  return callback(null, {
    type: 'hand',
    action: intentData.action[0].value,
    task,
  });
}
