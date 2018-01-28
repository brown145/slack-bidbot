'use strict';

function reducer(state, action){
  const { intent } = action;
  switch (intent) {
    case 'HAND':
      return {
        ...state,
        hand: handReducer(state.hand, action)
      };
      break;
    case 'BID':
      return {
        ...state,
        bids: bidsReducer(state.bids, action)
      };
      break;
  }
  return state;
}

function handReducer(state, action){
  const { task } = action.payload;
  switch (action.intentAction) {
    case 'START':
      return {
        ...state,
        currentTask: task,
        taskState: 'started' //TODO: maybe an Enum here
      }
      break;
  }
  return state;
}

function bidsReducer(state, action){
  const { bidAmount, bidTask, bidder } = action.payload;
  const newBidStateObj = {
    bidTask,
    bidder,
    bidAmount
  };
  switch (action.intentAction) {
    case 'ADD':
      return state.concat(newBidStateObj);
      break;
    case 'UPDATE':
      return state.map( (bid) => {
        if (bid.bidTask === bidTask && bid.bidder === bidder) {
          return newBidStateObj;
        }
        return bid;
      });
      break;
  }
  return state;
}


function createStore(reducer, emitter) {
  let state = {
    hand:{},
    bids: []
  };
  const listeners = [];

  const getState = () => (state);

  const subscribe = (listener) => (
    listeners.push(listener)
  );

  const dispatch = (action) => {
    const oldState = state;
    state = reducer(state, action);

    // DEV NOTE: maybe check for meaningful state change
    listeners.forEach(l => l('state-change', action, state));
  };

  return {
    getState,
    subscribe,
    dispatch,
  };
}

module.exports.createStore = createStore;
module.exports.reducer = reducer; // DEV NOTE: move reducers to own file?
