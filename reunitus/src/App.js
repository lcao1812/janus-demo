import React from 'react';

import './App.css';
import Room from './components/Room';
import Home from './components/Home';
import CreateRoom from './components/CreateRoom'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {username: '', roomid: ''};
  }

  handleSubmit(username, roomid) {
    this.setState({username, roomid});
  }

  render() {
    return (
        <Router>
          <div className="main-container">
            <React.Fragment>
              <Switch>
                <Route path="/" exact render={(p) => <Home {...p} onSubmit={this.handleSubmit} />} />
                <Route path="/room" render={(p) => <Room {...p} username={this.state.username} roomid={this.state.roomid} />} />
              </Switch>
            </React.Fragment>
          </div>
        </Router>)
  }
}

export default App;