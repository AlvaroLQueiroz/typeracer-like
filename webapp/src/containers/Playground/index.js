import React, { Component }  from 'react';
import Card from '../../components/Card';

import './style.css';

class Playground extends Component {
  constructor (props) {
    super(props);
      this.state = {
        originalText: undefined,
        highlightedText: '',
        remainingText: undefined,
        typeStatus: 'success',
        connectionStatus: props.connectionStatus
      }
      props.socket.on('room connected', (data) => {
        this.setState({
          originalText: data,
          remainingText: data
        })
      })
      this.onTextTyped = this.onTextTyped.bind(this);
  }

  onTextTyped(event) {
    const typedText = event.target.value;
    let newHighlighted = '';
    let newRemaining = '';

    if( this.state.originalText.startsWith(typedText)){
      newHighlighted = typedText;
      newRemaining = this.state.originalText.substring(typedText.length, this.state.originalText.length)
      this.setState({
        highlightedText: newHighlighted,
        remainingText: newRemaining,
        typeStatus: 'success'
      })
    }else{
      this.setState({
        typeStatus: 'error'
      })
    }
    this.props.socket.emit('enter room', 'bla');
  }

  render() {
    const classes = this.state.connectionStatus === 'disconnected' ? 'hidden' : ''
    return (
      <Card title="Playground" classes={classes}>
        <div>
          <span className={this.state.typeStatus }>
            { this.state.highlightedText }
          </span>
          <span>
            { this.state.remainingText }
          </span>
        </div>
        <textarea className="textInput" onChange={ this.onTextTyped }></textarea>
      </Card>
    );
  }
}

export default Playground;
