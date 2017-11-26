import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './style.css';

const normalizeString = s => {
  return s.trim().toLowerCase().replace(/ /, '_')
}

export default class Rooms extends Component {
  constructor(props, context){
    super(props, context)
    this.state = {
      rooms: [],
      newRoomName: '',
    }
    this.createRoom = this.createRoom.bind(this)
    this.handleNewRoomName = this.handleNewRoomName.bind(this)
    this.handleNewRoomEnter = this.handleNewRoomEnter.bind(this)
    this.listRender = this.listRender.bind(this)
  }

  componentDidMount(){
    this.context.socket.on('list rooms', data => {
      this.setState({rooms: data})
    })
    this.context.socket.emit('get rooms')
  }

  componentWillUnmount(){
    this.context.socket.off('list rooms')
  }

  createRoom(event){
    if(this.state.newRoomName.length){
      this.props.history.push(`/room/${this.state.newRoomName}/user/${this.context.username}/`)
    }
  }

  handleNewRoomName(event){
    this.setState({
      newRoomName: normalizeString(event.target.value)
    })
  }

  handleNewRoomEnter(event){
    if(event.which === 13 || event.keyCode === 13){
      this.createRoom(undefined)
    }
  }

  listRender(){
    let rooms = this.state.rooms.map((room) => {
      return (
        <li className="collection-item" key={room}>
          <div>
            <Link to={`/room/${room}/user/${this.context.username}/`}>
              {room}
            </Link>
            <Link to={`/room/${room}/status/`} className='secondary-content'>
              <i className="material-icons grey-text">help_outline</i>
            </Link>
          </div>
        </li>
      )
    })
    if (rooms.length === 0){
      rooms = ((
        <li className="collection-item">
          <div>
            There is no room. Be the first and create one!
          </div>
        </li>
      ))
    }
    return rooms
  }

  render() {
    return (
      <div className='row'>
        <div className='col s12 m6 offset-m3'>
          <div className="card">
            <div className="card-content">
              <span className="card-title center-align"><b>Rooms</b></span>
              <ul className="collection">
                {this.listRender()}
              </ul>
            </div>
            <div className="card-action">
              <div className='row center-align'>
                <div className='col s12 m8'>
                  <input type="text"
                         placeholder="Room name"
                         spellCheck='false'
                         onChange={this.handleNewRoomName}
                         onKeyPress={this.handleNewRoomEnter}/>
                </div>
                <button className='btn grey' onClick={this.createRoom}>
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
