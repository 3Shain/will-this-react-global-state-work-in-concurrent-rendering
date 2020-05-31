import React, { useCallback, unstable_useTransition as useTransition } from 'react';
import { createContext, useContext } from 'use-context-selector';

import {
  syncBlock,
  useRegisterIncrementDispatcher,
  initialState,
  reducer,
  ids,
  useCheckTearing,
} from '../common';

const context = createContext(null);

const Provider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <context.Provider value={[state, dispatch]}>
      {children}
    </context.Provider>
  );
};

const Counter = React.memo(() => {
  const count = useContext(context, useCallback((v) => v[0].count, []));
  syncBlock();
  return <div className="count">{count}</div>;
});

const Main = () => {
  const dispatch = useContext(context, useCallback((v) => v[1], []));
  const count = useContext(context, useCallback((v) => v[0].count, []));
  useCheckTearing();
  useRegisterIncrementDispatcher(useCallback(() => {
    dispatch({ type: 'increment' });
  }, [dispatch]));
  const [localCount, localIncrement] = React.useReducer((c) => c + 1, 0);
  const normalIncrement = () => {
    dispatch({ type: 'increment' });
  };
  const [startTransition, isPending] = useTransition();
  const transitionIncrement = () => {
    startTransition(() => {
      dispatch({ type: 'increment' });
    });
  };
  return (
    <div>
      <button type="button" id="normalIncrement" onClick={normalIncrement}>Increment shared count normally (two clicks to increment one)</button>
      <button type="button" id="transitionIncrement" onClick={transitionIncrement}>Increment shared count in transition (two clicks to increment one)</button>
      <span id="pending">{isPending && 'Pending...'}</span>
      <h1>Shared Count</h1>
      {ids.map((id) => <Counter key={id} />)}
      <div className="count">{count}</div>
      <h1>Local Count</h1>
      {localCount}
      <button type="button" id="localIncrement" onClick={localIncrement}>Increment local count</button>
    </div>
  );
};

const App = () => (
  <Provider>
    <Main />
  </Provider>
);

export default App;
