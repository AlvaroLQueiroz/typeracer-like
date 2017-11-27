import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.css';

export default class Rooms extends Component {
  constructor(props, context){
    super(props, context)
    this.state = {
      roomStatus: {},
    }
    this.updateStatus = this.updateStatus.bind(this)
  }

  componentDidMount(){
    this.context.socket.on('status', data => {
      this.setState({roomStatus: data})
    })
    this.updateStatus()
  }

  componentWillUnmount(){
    this.context.socket.off('status')
  }

  updateStatus(){
    this.context.socket.emit('get status', {
      roomName: this.props.match.params.roomName
    })
  }

  render() {
    return (
      <div className='row'>
        <div className='col s12 m6 offset-m3'>
          <div className="card">
            <div className="card-content">
              <span className="card-title center-align"><b>Room status: {this.props.match.params.roomName}</b></span>
              <code>
              {JSON.stringify(this.state.roomStatus, null, 2)}
              </code>
            </div>
            <div className="card-action center-align">
              <button className='btn grey' onClick={this.updateStatus}>
                update status
              </button>
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
