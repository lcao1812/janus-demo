import React from 'react';
import { Janus as JanusClient } from 'janus-videoroom-client';

const server = 'ws://localhost:8088/janus';

class CreateRoom extends React.Component {
	constructor(props) {
		super(props);
		this.state = { value: null };
		this.client = new JanusClient({
			url: server
		});
		this.handle = null;

		this.registerEvents();
	}

	componentDidMount() {
		this.client.connect();
	}

	registerEvents() {
		// On connection
		this.client.onConnected(async () => {
			console.log(`Connected to Janus at: ${server}`);

			try {
				const session = await this.client.createSession();
				const videoRoomHandle = await session
					.videoRoom()
					.defaultHandle();
				this.handle = videoRoomHandle;
			} catch (err) {
				console.log(err);
			}
		});

		// On disconnection
		this.client.onDisconnected(() => {
			console.log('Disconnected');
		});

		// On error
		this.client.onError((err) => {
			console.log(err);
		});
	}

	async createRoom() {
		let result = await this.handle.create({
			publishers: 3,
			is_private: false,
			pin: '1234',
			audiocodec: 'opus',
			videocodec: 'vp8',
			record: false
		});
		console.log(`Created new room ${result}`);
	}

	render() {
		return (
			<form onSubmit={this.createRoom}>
				<label>Room name:</label>
				<input type="text" value={this.state.value}></input>
			</form>
		);
	}
}

export default CreateRoom;
