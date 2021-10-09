import React from 'react';
import '../App.css';

import RoomClient from 'janus-room';
import {Container, Row, Col} from 'react-bootstrap'
import RemoteFeed from './RemoteFeed';

const server = "http://localhost:8088/janus";

class Room extends React.Component {

    constructor(props) {
        super(props);

        let options = {
            server: server, 
            onLocalJoin: this.onLocalJoin,
            onRemoteJoin: this.onRemoteJoin,
            onRemoteUnjoin: this.onRemoteUnjoin,
            onError: this.onError
        };
        this.roomClient = new RoomClient(options);
        this.state = {
            streams: []
        };
    }

    async componentDidMount() {
        try {
            await this.roomClient.init();
            this.roomClient.register({
                room: parseInt(this.props.roomid), 
                username: this.props.username
            });
        } catch (err) {
            console.error(err);
        }
    }

    onLocalJoin() {
        console.log('joined the room!');
        // Attach local stream 
        let localVideo = document.getElementById('localvideo');
        this.roomClient.attachStream(localVideo, 0);
    }

    onRemoteJoin(streamindex, username, feedid) {
        console.log(username, `(${streamindex})`, 'joined the room!');
        // New remote stream, add to state for render
        let joined = this.state.streams.concat({streamindex, username, feedid});
        this.setState({streams: joined});
    }

    onRemoteUnJoin(streamindex) {
        console.log(streamindex, 'indexed user left!');
        let left = this.state.streams.filter((v, i) => i != streamindex);
        this.setState({streams: left});
    }

    onError(err) {
        alert(err);
    }
    
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Room: {this.props.roomid} | {this.props.username}</h1>
                    <div>
                        <div id="myvideo" className="container shorter">
                            <video id="localvideo" className="rounded centered" width="100%" height="100%" autoPlay playsInline muted="muted"></video>
                        </div>
                        {/*<div className="panel-body" id="videolocal"></div>*/}
                    </div>
                </header>
                <h3 id="title"></h3>
                <Container>
                    {this.state.streams.map((v, i) => {
                        if (i > 0) {
                            const s = v.streamindex; 
                            const u = v.username;
                            const f = v.feedid;
                            return <RemoteFeed key={i} streamindex={s} username={u} feedid={f} client={this.roomClient} />
                        }
                    })}
                    {/* <Row>
                        <Col>
                            <div id="videoremote1" className="container">
                                <img src={offline} id="img1" className="card-media-image" style={{ width: "300px", height: "250px" }}></img>
                            </div>
                            <h3 id="callername">{'Participant 1'}</h3>
                        </Col>
                    </Row> */}
                </Container>
            </div>
        );
    }
}

export default Room;
