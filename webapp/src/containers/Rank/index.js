import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './style.css';

export default class Rank extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      ranking: []
    }
    this.listRender = this.listRender.bind(this)
  }

  componentDidMount(){
    this.context.socket.on('rank update', data => {
      this.setState({
        ranking: data
      })
    })
  }

  componentWillUnmount(){
    this.context.socket.off('rank update')
  }

  listRender(){
    let users = this.state.ranking.map((user) => {
      return (
        <li className="collection-item" key={user[0]}>
          <div>{user[0]} - Score: {user[1]}</div>
        </li>
      )
    })
    if (users.length === 0){
      users = ((
        <li className="collection-item">
          <div>
            Something wrong is not right!!!
          </div>
        </li>
      ))
    }
    return users
  }

  render() {
    return (
      <div className="card">
        <div className="card-content">
          <span className="card-title center-align"><b>Rank</b></span>
          <ul className="collection">
            {this.listRender()}
          </ul>
        </div>
        <div className="card-action center-align">
          <Link to={`/room/${this.props.roomName}/status/`} className='btn grey white-text'>
            <b>Room status</b>
          </Link>
        </div>
      </div>
    );
  }
}

Rank.contextTypes = {
  socket: PropTypes.object,
}
