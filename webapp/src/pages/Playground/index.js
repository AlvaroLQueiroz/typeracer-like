import React, { Component }  from 'react';
import PropTypes from 'prop-types';

import './style.css';

import Rank from '../../containers/Rank';

export default class Playground extends Component {
  constructor (props, context) {
    super(props, context);
    this.state = {
      originalText: '',
      typedText: '',
      remainingText: 'Wainting round start!!',
      typingStatus: 'undefined',
      roundIsPlaying: false,
      score: 0,
      elapsedTime: 0,
    }
    this.goToHomeScreen = this.goToHomeScreen.bind(this)
    this.leaveRoom = this.leaveRoom.bind(this)
    this.machinePlayer = this.machinePlayer.bind(this)
    this.onTextTyped = this.onTextTyped.bind(this)
    this.roundFinish = this.roundFinish.bind(this)
    this.roundStart = this.roundStart.bind(this)
    this.roundUpdate = this.roundUpdate.bind(this)
    this.startStopwatch = this.startStopwatch.bind(this)
    this.stopStopwatch = this.stopStopwatch.bind(this)

    this.autoplay = false
    this.event = new Event('change')
    this.instantTypedWords = 0
    this.machinePlayerInterval = undefined
    this.machinePlayerSpeed = Math.random() * (100 - 10) + 10
    this.roundAnalizer = undefined
    this.stopwatch = undefined
  }

  componentDidMount(){
    this.context.socket.on('room is locked', this.goToHomeScreen )
    this.context.socket.on('round finished', this.roundFinish )
    this.context.socket.on('round start', this.roundStart )

    // When component is mounted, registers the user in the room
    this.context.socket.emit('enter room', {
      roomName: this.props.match.params.roomName,
      username: this.props.match.params.username
    })
  }

  componentWillUnmount() {
    if(this.autoplay) clearInterval(this.machinePlayerInterval)
    clearInterval(this.roundAnalizer)
    this.leaveRoom()
    this.stopStopwatch()
    this.context.socket.off('room is locked')
    this.context.socket.off('round finished')
    this.context.socket.off('round start')
  }

  startStopwatch(){
    this.stopwatch = setInterval(() => {
      this.setState(prevState => ({
        elapsedTime: prevState.elapsedTime + 1
      }))
    }, 1000)
  }

  stopStopwatch(){
    clearInterval(this.stopwatch)
  }

  roundStart(data) {
    // Reset playground state
    this.setState({
      originalText: data.text,
      remainingText: data.text,
      typedText: '',
      typingStatus: 'undefined',
      roundIsPlaying: true,
      score: 0,
      elapsedTime: 0,
    })

    this.roundAnalizer = setInterval(() => {
      let score = this.state.score
      // If the amount of words typed in the last interval is higher than higher score
      if(this.instantTypedWords > score){
        score = this.instantTypedWords
      }
      // Reset counter for the new interval
      this.instantTypedWords = 0
      // Update playground state
      this.setState({
        score: score
      })
      this.roundUpdate();
    }, data.roundAnalyzerTime)

    // Focuses on the text area so the user doesn't waste time
    this.textArea.value = ''
    this.textArea.focus()
    this.startStopwatch()

    // When the machine should play alone
    if(this.autoplay){
      this.machinePlayerInterval = setInterval(this.machinePlayer, this.machinePlayerSpeed)
    }
  }

  roundUpdate(score) {
    this.context.socket.emit('round update', {
      roomName: this.props.match.params.roomName,
      score: this.state.score,
      roundIsPlaying: this.state.roundIsPlaying
    });
  }

  roundFinish(){
    clearInterval(this.roundAnalizer)
    this.setState({
      roundIsPlaying: false
    })
    if(this.autoplay) clearInterval(this.machinePlayerInterval)
    this.stopStopwatch()
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

  machinePlayer(){
    this.textArea.value += this.state.remainingText[0]
    this.textArea.dispatchEvent(this.event)
    this.onTextTyped(this.event)
  }

  render() {
    return (
      <div className='row'>
        <div className='col s12 push-s12 m4'>
          <Rank roomName={this.props.match.params.roomName} />
        </div>
        <div className='col s12 m8'>
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
                            disabled={!this.state.roundIsPlaying}
                            placeholder={ this.state.roundIsPlaying ? 'Write Forrest, writeee!!' : 'Wait for it!!'}
                            ref={(input) => { this.textArea = input; }}></textarea>
                </div>
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
