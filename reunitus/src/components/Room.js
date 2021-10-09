import React from 'react';
import '../App.css';

// import RoomClient from 'janus-room';
import {Janus as JanusClient} from 'janus-videoroom-client';
import {Container, Row, Col} from 'react-bootstrap'
import RemoteFeed from './RemoteFeed';

const server = "ws://localhost:8188/janus";
let client = null;

// DOCUMENTATION ON GENERAL VIDEOROOM API
// https://janus.conf.meetecho.com/docs/videoroom.html


class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            streams: []
        };
        this.onLocalJoin = this.onLocalJoin.bind(this);
        this.onRemoteJoin = this.onRemoteJoin.bind(this);
        this.onRemoteUnJoin = this.onRemoteUnJoin.bind(this);
        this.onError = this.onError.bind(this);
    }

    async componentDidMount() {
        // Connect to Janus using sockets interface (only used to issue commands)
        // (see node_modules/janus_videoroom_client/src/client.js)
        client = new JanusClient({
            url: server
        });

        client.onConnected(async () => {
            console.log('conencted');
            try {
                // Create new session with Janus, first step after connection
                // (see node_modules/janus_videoroom_client/src/session.js)
                let session = await client.createSession(); 

                // Object representing videoroom plugin
                // is used to attach handles to rooms, and get active feeds (publishers) of specified rooms
                // (see node_modules/.../src/plugins/videoroom/index.js)
                // (see node_modules/.../src/plugins/plugin.js)
                let videoroom = await session.videoRoom(); 
                
                // Get a session handle for the videoroom plugin
                // is used for joining a room, leaving a room, muting/unmuting, publishing, receiving events, and others
                // (see /.../plugins/videoroom/handle.js)
                let handle = await videoroom.defaultHandle(); 

                // console.log(await handle.list()); // List active rooms

                // Join a room with a publishing handle
                // results in a response with a list of active publishers (and passive attendees if notify_joining on the room is true)
                // the user is now able to receive notifs about several aspects of the room, but is still passive (no webrtc connection yet)
                // is also in the participant list 
                let result = await handle.joinPublisher({ 
                    room: this.props.roomid,
                    display: this.props.username
                });

                // **how to listen for joins?**

                // To publish media to a room, you need to send a publish request, accompanied by a jsep sdp offer
                // this negotiates a new rtc connection
                let result = await handle.publishFeed({
                    room: this.props.roomid,
                    jsep: jsep
                })


                // let publisherHandle = await session.videoRoom().publishFeed(roomid, offerSdp);
                
                

            } catch (err) {
                console.error(err);
            }
        });

        client.onDisconnected(() => {
            console.log("disconnected!");
        });

        client.onError((err) => {
            console.error(err);
        });

        client.onEvent(e => {
            console.log(e);
        })

        client.connect();
    }

    componentWillUnmount() {
        // this.roomClient.removeRoom();
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
