import React, { Component }  from 'react';
import Card from '../../components/Card';

import './style.css';

class Playground extends Component {
  constructor (props) {
    super(props);
    this.state = {
      originalText: '',
      typedText: '',
      remainingText: '',
      typingStatus: 'success',
    }
    this.onTextTyped = this.onTextTyped.bind(this)

    props.socket.on('room connected', (data) => {
      this.setState({
        originalText: data,
        remainingText: data
      })
    })
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
    const classes = this.props.connectionStatus === 'disconnected' ? 'hidden' : ''
    return (
      <Card title="Playground" classes={classes}>
        <div>
          <span className={this.state.typingStatus }>
            { this.state.typedText }
          </span>
          <span>
            { this.state.remainingText }
          </span>
        </div>
        <textarea className="textInput" onChange={ this.onTextTyped }></textarea>
      </Card>
    )
  }
}

export default Playground;
