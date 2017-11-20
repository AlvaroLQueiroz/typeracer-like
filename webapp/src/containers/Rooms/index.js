import React, { Component } from 'react';
import Card from '../../components/Card';
import List from '../../components/List';

import './style.css';

const rooms = [
  {name: "room 1", link: "/room1/"},
  {name: "room 2", link: "/room2/"},
  {name: "room 3", link: "/room3/"},
  {name: "room 4", link: "/room4/"},
  {name: "room 5", link: "/room5/"},
]
class Rooms extends Component {
  newRoom(){
    console.log('ola');
  }
  render() {
    return (
      <Card title="Rooms" >
        <List objects={rooms} />
        <button onClick={this.newRoom}>New room</button>
      </Card>
    );
  }
}

export default Rooms;
