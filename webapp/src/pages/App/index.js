import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import $ from 'jquery';
import io from 'socket.io-client';

import Rooms from '../Rooms';
import Playground from '../Playground';

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      username: localStorage.getItem('username') || 'Guest',
      newUsername: localStorage.getItem('username') || 'Guest',
    }

    this.socket = io('http://localhost:3001/')
    this.saveUsername = this.saveUsername.bind(this)
    this.handleUsernameInput = this.handleUsernameInput.bind(this)
    this.openModal = this.openModal.bind(this)
  }

  componentDidMount(){
    $('#modal').modal()
    $('.dropdown-button').dropdown({
      gutter: 0,
      belowOrigin: true,
    })
  }

  getChildContext(){
    return {
      socket: this.socket,
      username: this.state.username
    }
  }

  openModal(){
    $('#modal').modal('open')
  }

  saveUsername(){
    this.setState({
      username: this.state.newUsername
    })
    localStorage.setItem('username', this.state.newUsername)
  }

  handleUsernameInput(event){
    this.setState({
      newUsername: event.target.value
    })
  }

  render() {
    return (
      <div>
        <nav>
          <div className="nav-wrapper grey darken-1">
            <a href="/" className="brand-logo green-text"><b>Type Racer</b></a>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li>
              <a onClick={this.openModal}>
                Hello, {this.state.username}
                <i className="material-icons right">settings</i>
              </a>
            </li>
          </ul>
          </div>
        </nav>
        <main>
          <BrowserRouter>
            <Route>
              <Switch>
              I <Route exact path='/' component={Rooms} />
                <Route path='/room/:roomName/user/:username/' component={Playground} />
              </Switch>
            </Route>
          </BrowserRouter>
        </main>

        <div id="modal" className="modal">
          <div className="modal-content">
            <h4>Define you username</h4>
            <div className="row">
              <div className="input-field col s6">
                <input type="text" value={this.state.newUsername} onChange={this.handleUsernameInput}/>
                <label htmlFor="first_name">Username</label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={this.saveUsername} className="modal-action modal-close waves-effect waves-green btn-flat">save</button>
          </div>
        </div>
      </div>
    )
  }
}

App.childContextTypes = {
  socket: PropTypes.object,
  username: PropTypes.string
}
