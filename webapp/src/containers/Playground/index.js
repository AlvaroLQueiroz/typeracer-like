import React, { Component }  from 'react';
import Card from '../../components/Card';
import mIpsum from '../../scripts/mipsum.js';

import './style.css';

class Playground extends Component {
  constructor (props) {
    super(props);
      const text = mIpsum({pNum: 2, resultType: 'text'});
      this.state = {
        originalText: text,
        highlightedText: '',
        remainingText: text,
        status: 'success'
      }

      this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const typedText = event.target.value;
    let newHighlighted = '';
    let newRemaining = '';

    if( this.state.originalText.startsWith(typedText)){
      newHighlighted = typedText;
      newRemaining = this.state.originalText.substring(typedText.length, this.state.originalText.length)
      this.setState({
        highlightedText: newHighlighted,
        remainingText: newRemaining,
        status: 'success'
      })
    }else{
      this.setState({
        status: 'error'
      })
    }
  }

  render() {
    return (
      <Card title="Playground" >
        <div className="text">
          <span className={"highlightedText " + this.state.status }>
            { this.state.highlightedText }
          </span>
          <span className="remainingText">
            { this.state.remainingText }
          </span>
        </div>
        <textarea className="textInput" onChange={ this.handleChange } cols="30" rows="10"></textarea>
      </Card>
    );
  }
}

export default Playground;
