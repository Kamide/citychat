import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { StoreProvider } from './components/store';
import App from './components/app';
import reportWebVitals from './reportWebVitals';

import './styles/index.css';

ReactDOM.render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
