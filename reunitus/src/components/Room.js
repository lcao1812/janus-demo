import React from 'react';
import '../App.css';
import offline from "../images/offline.jpg";
import { Janus as JanusClient } from 'janus-videoroom-client'
import {Container, Row, Col} from 'react-bootstrap'

const server = "ws://localhost:8088/janus";

class Room extends React.Component {

    constructor(props) {
        super(props);
        this.client = new JanusClient({url: server});
        this.registerEvents();
    }

    componentDidMount() {
        this.client.connect();
    }

    componentWillUnmount() {
        this.client.disconnect();
    }

    registerEvents() {
        // On connection
        this.client.onConnected(async () => {
            console.log(`Connected to Janus at: ${server}`);

            try {
                const session = await this.client.createSession();
                const videoRoomHandle = await session.videoRoom().defaultHandle();

            } catch (err) {
                console.log(err);
            } 
        });
        
        // On disconnection
        this.client.onDisconnected(() => {
            console.log("Disconnected");
        });

        // On error
        this.client.onError((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <p>
                        Welcome to your video room!
                    </p>
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
