import React, { Component } from 'react';
import Card from '../../components/Card';
import List from '../../components/List';

import './style.css';

class Rooms extends Component {
  constructor(props){
    super(props)
    this.state = {
      rooms: [],
    }
    this.handleClick = this.handleClick.bind(this)

    props.socket.on('new room', (data) => {
      this.setState({rooms: data});
    })

  }

  handleClick(event){
    const roomName = event.target.innerHTML
    this.props.socket.emit('enter room', {
      roomName: roomName,
      userName: this.props.userName
    })
    this.props.connectRoom(roomName)
  }

  render() {
    return (
      <Card title="Rooms" >
        <List objects={this.state.rooms} activeItem={this.props.connectedRoom} handleClick={this.handleClick}/>
        <fieldset>
          <legend>New room</legend>
          <input type="text" placeholder="Room name"/>
          <button >Create</button>
        </fieldset>
      </Card>
    );
  }
}

export default Rooms;
