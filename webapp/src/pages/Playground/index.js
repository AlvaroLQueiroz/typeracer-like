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
      typingStatus: 'undefined',
      roundIsStarted: false,
      score: 0,
      elapsedTime: 0,
    }
    this.onTextTyped = this.onTextTyped.bind(this)
    this.leaveRoom = this.leaveRoom.bind(this)
    this.goToHomeScreen = this.goToHomeScreen.bind(this)
    this.machinePlayerFactory = this.machinePlayerFactory.bind(this)
    this.roundStart = this.roundStart.bind(this)
    this.roundFinish = this.roundFinish.bind(this)
    this.setRoundConfigs = this.setRoundConfigs.bind(this)

    this.machinePlayerSpeed = Math.random() * (100 - 10) + 10
    this.machinePlayer = undefined
    this.stopwatch = undefined
    this.stopwatchInterval = 1000
    this.instantTypedWords = 0
    this.autoplay = true
  }

  componentDidMount(){
    this.context.socket.on('round configs', this.setRoundConfigs )
    this.context.socket.on('round start', this.roundStart )

    // When component is mounted, registers the user in the room
    this.context.socket.emit('enter room', {
      roomName: this.props.match.params.roomName,
      username: this.props.match.params.username
    })
  }

  componentWillUnmount() {
    this.context.socket.off('round configs')
    this.context.socket.off('round start')
    this.leaveRoom()
  }

  setRoundConfigs(data) {
    this.setState({
      originalText: data,
      remainingText: data
    })
  }

  roundStart() {
    // Reset playground state
    this.setState({
      score: 0,
      elapsedTime: 0,
      roundIsStarted: true,
    })

    // When the machine should play alone
    if(this.autoplay){
      this.machinePlayer = setInterval(this.machinePlayerFactory, this.machinePlayerSpeed)
    }

    this.stopwatch = setInterval(() => {
      let oldScore = this.state.score
      // If the amount of words typed in the last interval is higher than higher score
      if(this.instantTypedWords > oldScore){
        oldScore = this.instantTypedWords
      }
      // Reset counter for the new interval
      this.instantTypedWords = 0

      // Update playground state
      this.setState(prevState => ({
        score: oldScore,
        elapsedTime: prevState.elapsedTime + 1
      }))
    }, this.stopwatchInterval)

    // Focuses on the text area so the user doesn't waste time
    this.textArea.focus()
  }

  roundFinish(){
    clearInterval(this.stopwatch)
    this.setState({
      roundIsStarted: false
    })
    if(this.autoplay){
      clearInterval(this.machinePlayer)
    }
  }

  leaveRoom(){
    this.context.socket.emit('living room', {
      roomName: this.props.match.params.roomName,
      socketId: this.context.socket.id
    })
  }

  goToHomeScreen(){
    this.props.history.push('/')
  }

  onTextTyped(event) {
    const typedText = event.target.value
    let remainingText = ''

    if( this.state.originalText.startsWith(typedText)){
      // Split the original text in two parts.
      // In the first, the text entered by the user
      // and in the second the text that has not yet been typed
      remainingText = this.state.originalText.substring(typedText.length, this.state.originalText.length)
      // If the last typed character  is a space,
      // then the user just entered another word.
      // TODO remove the cheat when user repeats space and backspace repeatedly after a word
      if(typedText[typedText.length - 1] === ' '){
        this.instantTypedWords += 1
      }
      if(remainingText.length === 0){
        this.roundFinish()
      }
      this.setState({
        typedText: typedText,
        remainingText: remainingText,
        typingStatus: 'valid'
      })
    }else{
      this.setState({
        typingStatus: 'invalid'
      })
    }
  }

  machinePlayerFactory(){
    let event = new Event('change')
    this.textArea.value += this.state.remainingText[0]
    this.textArea.dispatchEvent(event)
    this.onTextTyped(event)
    if (this.state.remainingText.length === 0){
      clearInterval(this.machinePlayer)
    }
  }

  render() {
    return (
      <div className='row'>
        <div className='col s12 m8 offset-m2'>
          <div className="card">
            <div className="card-content">
              <div className='row'>
                <div className='col s12 center-align'>
                  <span className="card-title"><b>Playground</b><i className='secondary-content material-icons black-text' onClick={this.goToHomeScreen}>close</i></span>
                </div>
                <div className='col s12 m6'>
                  <h6><b>Elapsed time:</b> {this.state.elapsedTime} sec</h6>
                </div>
                <div className='col s12 m6'>
                  <h6 className='right'><b>Score:</b> {this.state.score}</h6>
                </div>
              </div>
              <div className='row'>
                <div className='col s12'>
                  <div className='text'>
                    <span className={this.state.typingStatus }>
                      { this.state.typedText }
                    </span>
                    <span>
                      { this.state.remainingText }
                    </span>
                  </div>
                  <br/>
                  <textarea className={"materialize-textarea " + this.state.typingStatus}
                            spellCheck='false'
                            onChange={ this.onTextTyped }
                            disabled={!this.state.roundIsStarted}
                            placeholder={ this.state.roundIsStarted ? 'Write Forrest, writeee!!' : 'Wait for it!!'}
                            ref={(input) => { this.textArea = input; }}></textarea>
                </div>
              </div>
            </div>
            <div className="card-action">

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
