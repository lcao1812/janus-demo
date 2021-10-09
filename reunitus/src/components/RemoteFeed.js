import React from 'react';
import {Row} from 'react-bootstrap';

class RemoteFeed extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // Attach video stream
        const video = document.getElementById(this.props.feedid);
        this.props.client.attachStream(video, this.props.streamindex);
    }

    render() {
        return (
            <Row>
                <div className="container">
                    <video id={this.props.feedid} className="rounded centered" width="300px" height="250px" autoPlay playsInline></video>
                </div>
                <h3>{this.props.username}</h3>
            </Row>
        );
    }
}

export default RemoteFeed;
