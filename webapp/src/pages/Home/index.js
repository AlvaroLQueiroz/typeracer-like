import React, { Component } from 'react';
import io from 'socket.io-client';
import Card from '../../components/Card';
import './style.css';

import Rooms from '../../containers/Rooms';
import Rank from '../../containers/Rank';
import Playground from '../../containers/Playground';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userName: 'alvaro',
      connectionStatus: 'disconnected',
      roomName: undefined
    }

    localStorage.debug = ''
    this.socket = io('http://localhost:3001/')
    this.connectRoom = this.connectRoom.bind(this)
  }

  connectRoom(roomName){
    this.setState({
      roomName: roomName,
      connectionStatus: 'connected'
    })
  }

  disconnectRoom(roomName){
    this.setState({
      roomName: undefined,
      connectionStatus: 'disconnected'
    })
  }

  render() {
    return (
      <div>
        <div className="col3">
          <Card title="Username">
            <input type="text"/>
            <button>Save</button>
          </Card>
          <Rank socket={this.socket} />
          <Rooms
            socket={this.socket}
            userName={this.state.userName}
            connectedRoom={this.state.roomName}
            connectRoom={this.connectRoom}
          />
        </div>
        <div className="col7">
          <Playground
            socket={this.socket}
            connectionStatus={this.state.connectionStatus}
            connectedRoom={this.state.roomName}
          />
        </div>
      </div>
    );
  }
}

export default App;
