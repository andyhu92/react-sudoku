import React, { Component } from 'react';
import './App.css';
import Game from './Game'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Sudoku</h1>
        </header>
        <Game/>
      </div>
    );
  }
}

export default App;
