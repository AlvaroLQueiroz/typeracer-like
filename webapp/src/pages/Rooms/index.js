import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './style.css';

export default class Rooms extends Component {
  constructor(props, context){
    super(props, context)
    this.state = {
      rooms: [],
      newRoomName: '',
    }
    this.createRoom = this.createRoom.bind(this)
    this.handleNewRoomName = this.handleNewRoomName.bind(this)
    this.listRender = this.listRender.bind(this)
  }

  componentDidMount(){
    this.context.socket.on('list rooms', data => {
      this.setState({rooms: data})
    })
  }

  createRoom(event){
    this.props.history.push(`/room/${this.state.newRoomName}/username/${this.context.username}/`)
  }

  handleNewRoomName(event){
    this.setState({
      newRoomName: event.target.value
    })
  }

  listRender(){
    return this.state.rooms.map((room) => {
      return (
        <li className="collection-item" key={room.name}>
          <div>
            {room.name}
            <Link to={`/room/${room.name}/username/${this.context.username}/`} className='secondary-content'>
              <i className="material-icons">play_arrow</i>
            </Link>
          </div>
        </li>
      )
    })
  }

  render() {
    return (
      <div className='row'>
        <div className='col s12 m6 offset-m3'>
          <div className="card">
            <div className="card-content">
              <span className="card-title">Rooms</span>
              <ul className="collection">
                {this.listRender()}
              </ul>
            </div>
            <div className="card-action">
              <div className='row center-align'>
                <div className='col s12 m8'>
                  <input type="text" placeholder="Room name" onChange={this.handleNewRoomName}/>
                </div>
                <button className='btn' onClick={this.createRoom}>
                  <i className='material-icons'>forward</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Rooms.contextTypes = {
  socket: PropTypes.object,
  username: PropTypes.string
}
