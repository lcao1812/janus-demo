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

	async componentDidMount() {
		try {
			let result = await fetch('http://localhost:3001/list-rooms', {
			method: 'GET'
			});
			let body = await result.json();
			this.rooms = body;
			console.log(body);
		} catch (err) {
			console.error(err);
		}
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
			</div>
		);
	}
}

export default Home;
