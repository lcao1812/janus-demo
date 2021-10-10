import React from 'react';
import '../App.css';

// import RoomClient from 'janus-room';
import {Container, Row, Col} from 'react-bootstrap'
import RemoteFeed from './RemoteFeed';
import Janus from './Janus.js';

const server = "ws://localhost:8188/janus";
let janus = null; // The main object for interaction with Janus
let vrHandle = null; // The main object for interaction with VideoRoom plugin

// DOCUMENTATION ON GENERAL VIDEOROOM API
// https://janus.conf.meetecho.com/docs/videoroom.html

// NOTE: due to the nature of the Janus JS API, code is orgnized in 
// this file in several top level functions

class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            streams: []
        };

        this.createSession = this.createSession.bind(this);
        this.attachToVideoRoomPlugin = this.attachToVideoRoomPlugin.bind(this);
        this.negotiateRTCConnection = this.negotiateRTCConnection.bind(this);
        this.sendSDPOffer = this.sendSDPOffer.bind(this);
        this.onMediaDialog = this.onMediaDialog.bind(this);
        this.onRtcStateChange = this.onRtcStateChange.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.onLocalTrack = this.onLocalTrack.bind(this);
        this.onRemoteTrack = this.onRemoteTrack.bind(this);
        this.onCleanUp = this.onCleanUp.bind(this);
        this.onJanusDestroyed = this.onJanusDestroyed.bind(this);

        this.onLocalJoin = this.onLocalJoin.bind(this);
        this.onRemoteJoin = this.onRemoteJoin.bind(this);
        this.onRemoteUnJoin = this.onRemoteUnJoin.bind(this);
        this.onError = this.onError.bind(this);
    }

    // STEP 0
    async componentDidMount() {
        // Initialize the client library 
        Janus.init({
            debug: true, 
            dependencies: Janus.UseDefaultDependencies(),
            callback: this.createSession});
    }

    componentWillUnmount() {
        // this.roomClient.removeRoom();
    }

    // STEP 1
    createSession() {
        // Create a session with Janus 
        janus = new Janus({
            server, 
            success: this.attachToVideoRoomPlugin,
            error: this.onError,
            destroyed: this.onJanusDestroyed
        });
    }

    // STEP 2
    attachToVideoRoomPlugin() {
        console.log('CONNECTED to Janus at:', janus.getServer());

        // Attach to Janus VideoRoom plugin 
        janus.attach({
            plugin: 'janus.plugin.videoroom',
            success: this.negotiateRTCConnection,
            error: this.onError, 
            consentDialog: this.onMediaDialog, 
            webrtcState: this.onRtcStateChange,
            onMessage: this.onMessage, 
            onlocaltrack: this.onLocalTrack,
            oncleanup: this.onCleanUp
        });
    }

    // STEP 3
    negotiateRTCConnection(handle) {
        vrHandle = handle;
        console.log('ATTACHED handle to', handle.getPlugin());

        // Create WebRTC compliant offer
        vrHandle.createOffer({
            success: this.sendSDPOffer,
            error: this.onError
        });
    }

    // STEP 4
    sendSDPOffer(jsep) {
        let body = {"audio": true, "video": true};
        vrHandle.send({"message": body, "jsep": jsep});
    }

    onMediaDialog() {
        console.log('Acquiring user media...');
    }

    // Called with true when peer connection is ready, false when it goes down
    onRtcStateChange(state) {

    }

    // Called when Janus sends a message or event (or used for rtc negotation)
    onMessage(msg, jsep) {
        if (jsep !== undefined && jsep !== null) {
            // Handle rtc negotation answer
            vrHandle.handleRemoteJsep({jsep});
        }
    }

    // Called when local media stream is available for display
    onLocalTrack(track, added) {

    }

    // Called when remote media stream is avilable for display
    onRemoteTrack(track, mid, added) {

    }

    // Called when the rtc connection was closed with Janus
    onCleanUp() {

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

    onJanusDestroyed() {
        console.log('Janus has been destroyed');
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
