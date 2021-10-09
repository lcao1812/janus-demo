import logo from "../images/logo.svg";
import React from 'react';

class Home extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<p>
						Welcome to Janus test app.
					</p>
					<button onClick={() => this.props.history.push('/room')}>
						Create new room
					</button>
					<button onClick={() => this.props.history.push('/create-room')}>
						Join Room
					</button>
				</header>
			</div>
		)
	}
}

export default Home;
