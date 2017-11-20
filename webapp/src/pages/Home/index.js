import React, { Component } from 'react';

import './style.css';

import Rooms from '../../containers/Rooms';
import Rank from '../../containers/Rank';
import Playground from '../../containers/Playground';

class App extends Component {
  render() {
    return (
      <div>
        <div className="columns">
          <Rank />
          <Rooms />
        </div>
        <div className="columns">
          <Playground />
        </div>
      </div>
    );
  }
}

export default App;
