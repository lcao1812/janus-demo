import React from 'react';
import '../App.css';
import offline from "../images/offline.jpg";
import RoomClient from 'janus-room';
import {Container, Row, Col} from 'react-bootstrap'

const server = "http://localhost:8088/janus";

class Room extends React.Component {

    constructor(props) {
        super(props);

        let options = {
            server: server, 
            onLocalJoin: this.onLocalJoin,
            onRemoteJoin: this.onRemoteJoin,
            onRemoteUnjoin: this.onRemoteUnjoin,
            onError: this.onError,
        };
        this.roomClient = new RoomClient(options);
        this.state = {
            streams: []
        };
    }

    async componentDidMount() {
        await this.roomClient.init();
        try {
            this.roomClient.register({
                room: this.props.roomid, 
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
        // New remote stream, attach to 
    }

    onRemoteUnJoin(streamindex) {
        console.log(streamindex, 'indexed user left!');
    }

    onError(err) {
        console.error(err);
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
                    <Row>
                        <Col>
                            <div id="videoremote1" className="container">
                                <img src={offline} id="img1" className="card-media-image" style={{ width: "300px", height: "250px" }}></img>
                            </div>
                            <h3 id="callername">{'Participant 1'}</h3>
                        </Col>
                        <Col>
                            <div id="videoremote2" className="container">
                                <img src={offline} id="img1" className="card-media-image" style={{ width: "300px", height: "250px" }}></img>
                            </div>
                            <h3 id="callername">{'Participant 2'}</h3>
                        </Col>
                        <Col>
                            <div id="videoremote3" className="container">
                                <img src={offline} id="img1" className="card-media-image" style={{ width: "300px", height: "250px" }}></img>
                            </div>
                            <h3 id="callername">{'Participant 3'}</h3>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Room;
