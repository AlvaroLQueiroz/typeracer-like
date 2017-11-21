import React, { Component } from 'react';
import Card from '../../components/Card';
import List from '../../components/List';

import './style.css';

class Rooms extends Component {
  constructor(props){
    super(props)
    this.state = {
      rooms: [],
      connectedRoom:  'room 1'
    }

    props.socket.on('new room', (data) => {
      this.setState({rooms: data});
    })
  }

  newRoom(){
    console.log('ola');
  }

  render() {
    return (
      <Card title="Rooms" >
        <List objects={this.state.rooms} activeItem={this.state.connectedRoom} handleClick={this.props.handleClick}/>
        <button onClick={this.newRoom}>New room</button>
      </Card>
    );
  }
}

export default Rooms;
