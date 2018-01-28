'use strict';

let emitter = null;
let ledger = {
  currentTask: null,
  bids: []
};

const acceptBid = (userId, taskId, bidValue) => {
  // default to current task
  if (!taskId) {
    taskId = ledger.currentTask;
  }

  // sanity checks
  if (!userId || !bidValue) {
    emitter.emit('ledger-reject-bid', ledger, {message: 'Invalid bid.'});
    return;
  }

  const bidObj = {
    userId,
    taskId,
    bidValue
  };
  // bids must be unique on userId/taskId
  ledger.bids = ledger.bids.filter((bid) => (bid.userId !== userId || bid.taskId !== taskId));
  ledger.bids.push(bidObj);
  emitter.emit('ledger-accept-bid', ledger, {userId, taskId, bidValue});
}

const updateTask = (taskId, action) => {
  switch (action.toLowerCase()) {
    case 'start':
    case 'restart':
      ledger.currentTask = taskId;
      break;
    case 'stop':
      ledger.currentTask = null;
      break;
  }
  emitter.emit('ledger-update-task', ledger, {taskId, action});
}

module.exports.init = (emitUtil) => {
  emitter = emitUtil;

  emitter.on('intent-bid', (payload) => {
    acceptBid(payload.user, payload.task, payload.amount);
  });
  emitter.on('intent-hand', (payload) => {
        console.log(payload);
    updateTask(payload.task, payload.action);
  });
}
