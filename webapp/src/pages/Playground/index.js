import React, { Component }  from 'react';
import PropTypes from 'prop-types';

import './style.css';

export default class Playground extends Component {
  constructor (props, context) {
    super(props, context);
    this.state = {
      originalText: '',
      typedText: '',
      remainingText: '',
      typingStatus: 'success',
      gameIsStarted: false,
    }
    this.onTextTyped = this.onTextTyped.bind(this)
    console.log(props)
    // props.socket.on('room connected', (data) => {
    //   this.setState({
    //     originalText: data,
    //     remainingText: data
    //   })
    // })

    // props.socket.on('game start', (data) => {
    //   this.setState({
    //     gameIsStarted: true
    //   })
    // })

    // props.socket.on('game finish', (data) => {
    //   this.setState({
    //     gameIsStarted: false
    //   })
    // })
  }

  onTextTyped(event) {
    const typedText = event.target.value
    let newRemaining = ''

    if( this.state.originalText.startsWith(typedText)){
      newRemaining = this.state.originalText.substring(typedText.length, this.state.originalText.length)
      this.setState({
        typedText: typedText,
        remainingText: newRemaining,
        typingStatus: 'success'
      })
    }else{
      this.setState({
        typingStatus: 'error'
      })
    }
  }

  render() {
    console.log('ola')
    // const classes = this.props.connectionStatus === 'disconnected' ? 'hidden' : ''
    return (
      <div className='row'>
        <div className='col s12 m8 offset-m2'>
          <div className="card">
            <div className="card-content">
              <span className="card-title">Playground</span>
              <div>
                <span className={this.state.typingStatus }>
                  { this.state.typedText }
                </span>
                <span>
                  { this.state.remainingText }
                </span>
              </div>
              <textarea className="textInput" onChange={ this.onTextTyped } disabled={!this.state.gameIsStarted}></textarea>
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
    )
  }
}

Playground.contextTypes = {
  socket: PropTypes.object,
  username: PropTypes.string
}
