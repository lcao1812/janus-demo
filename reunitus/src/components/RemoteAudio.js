import React from 'react';
import { Row } from 'react-bootstrap';
import './RemoteFeed.css';

class RemoteAudio extends React.Component {
	componentDidMount() {
		// Attach video stream
		const audio = document.getElementById(this.props.id + '_a');
		audio.srcObject = this.props.stream;
	}

	render() {
		return (
			<Row>
				<div className="container">
					<audio // returning the audio
						id={this.props.id + '_a'}
						autoPlay
					></audio>
				</div>
			</Row>
		);
	}
}

export default RemoteAudio;
