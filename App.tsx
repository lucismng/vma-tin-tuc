import React from 'react';
import { AppProvider } from './context/AppContext';
import { AppUI } from './components/AppUI';

const App = () => {
  return (
    <AppProvider>
      <AppUI />
    </AppProvider>
  );
};

export default App;
