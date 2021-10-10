import React from 'react';
import {Row} from 'react-bootstrap';
import './RemoteFeed.css';

class RemoteFeed extends React.Component {
    componentDidMount() {
        // Attach video stream
        const video = document.getElementById(this.props.id);
        video.srcObject = this.props.stream;
    }

    render() {
        return (
            <Row>
                <div className="container">
                    <video id={this.props.id} className="rounded centered" width="300px" height="250px" autoPlay playsInline></video>
                </div>
                <h3 className="centered-h3">{this.props.display}</h3>
            </Row>
        );
    }
}

export default RemoteFeed;
