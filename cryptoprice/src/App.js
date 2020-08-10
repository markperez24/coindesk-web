import React, { Component } from 'react';
import './App.css';
import { Route } from 'react-router';
import { CoinbaseBTCHub } from './api/coinbase-api';

export default class App extends Component {

  render() {
    return (
      <div>
        <Route exact path='/' component={CoinbaseBTCHub} />
        <Route path="/chat" component={CoinbaseBTCHub} />
      </div>
    );
  }
}