import React, { Component } from 'react';
import io from 'socket.io-client';

import './style.css';

import Rooms from '../../containers/Rooms';
import Rank from '../../containers/Rank';
import Playground from '../../containers/Playground';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userName: undefined,
      connectionStatus: 'disconnected',
      roomName: undefined
    }

    localStorage.debug = '';
    this.socket = io('http://localhost:3001/');
    this.roomConnect = this.roomConnect
  }

  roomConnect(event){
    this.setState({
      roomName: event.target.innerHTML
    })
  }

  render() {
    return (
      <div>
        <div className="col3">
          <Rank socket={this.socket} />
          <Rooms socket={this.socket} connet={this.roomConnect} handleClick={this.roomConnect.bind(this)}/>
        </div>
        <div className="col7">
          <Playground socket={this.socket} connectionStatus={this.state.connectionStatus}/>
        </div>
      </div>
    );
  }
}

export default App;
