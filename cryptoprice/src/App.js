import React, { Component } from 'react';
import './App.css';
import { Route } from 'react-router';
import { BitcoinPricelist } from './components/BitcoinPricelist';

export default class App extends Component {

  render() {
    return (
      <div>
        <h2 className="App">Real-Time Cryptocurrency Ticker</h2>
        <Route exact path='/' component={BitcoinPricelist} />
      </div>
    );
  }
}