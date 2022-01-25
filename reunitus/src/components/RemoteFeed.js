import React from 'react';
import { Row } from 'react-bootstrap';
import './RemoteFeed.css';

class RemoteFeed extends React.Component {
	componentDidMount() {
		// Attach video stream
		const video = document.getElementById(this.props.id + '_v');
		video.srcObject = this.props.stream;
	}

	render() {
		return (
			<Row>
				<div className="container">
					<video // returning the video
						id={this.props.id + '_v'}
						className="rounded centered"
						width="160"
						height="120"
						autoPlay
						playsInline
						muted
					></video>
				</div>
				<h3 className="centered-h3">{this.props.display}</h3>
			</Row>
		);
	}
}

export default RemoteFeed;
