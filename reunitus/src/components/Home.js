import logo from "../images/logo.svg";
import React from 'react';

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {username: '', roomid: ''};
		this.joinRoom = this.joinRoom.bind(this);
		this.handleChangeRoom = this.handleChangeRoom.bind(this);
		this.handleChangeUser = this.handleChangeUser.bind(this);
	}

	joinRoom(event) {
		event.preventDefault();
		this.props.onSubmit(this.state.username, this.state.roomid);
		this.props.history.push('/room');
	}

	handleChangeRoom(event) {
		this.setState({roomid: event.target.value});
	}

	handleChangeUser(event) {
		this.setState({username: event.target.value});
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<p>
						Welcome to Janus test app.
					</p>
					<form onSubmit={this.joinRoom}>
						<label>
							Username:
							<input type="text" value={this.state.username} onChange={this.handleChangeUser}></input>
						</label>
						<label>
							Join room: 
							<input type="text" value={this.state.roomid} onChange={this.handleChangeRoom}></input>
						</label>
						<input type="submit" value="Join room" />
					</form>
				</header>
				<div className="App-lower">
					<h3>Current rooms</h3>
					{this.props.rooms.map((r, i) => {
						return (
							<div key={i}>
								<p><b>Roomid:</b> {r.room} <b>Desc:</b> {r.description}</p>
							</div>
						)
					})}
				</div>
			</div>
		);
	}
}

export default Home;
