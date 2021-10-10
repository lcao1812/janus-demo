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

// EXAMPLE APP USING JS API
// https://github.com/Deanfost/janus-test/blob/main/reunitus/src/components/Room.js

// NOTE: due to the nature of the Janus JS API, code is orgnized in 
// this file in several top level functions

class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            remoteStreams: [],
            myStream: null
        };

        this.createSession = this.createSession.bind(this);
        this.attachToVideoRoomPlugin = this.attachToVideoRoomPlugin.bind(this);
        this.onPublisherAttachment = this.onPublisherAttachment.bind(this);
        this.onMediaDialog = this.onMediaDialog.bind(this);
        this.onRtcStateChange = this.onRtcStateChange.bind(this);
        this.onPublisherMessage = this.onPublisherMessage.bind(this);
        this.onLocalStream = this.onLocalStream.bind(this);
        this.onRemoteStream = this.onRemoteStream.bind(this);
        this.onCleanUp = this.onCleanUp.bind(this);
        this.onJanusDestroyed = this.onJanusDestroyed.bind(this);
        this.onError = this.onError.bind(this);
    }

    // --- STEP 0 ---
    async componentDidMount() {
        // Initialize the client library 
        Janus.init({
            debug: true, 
            dependencies: Janus.UseDefaultDependencies(),
            callback: this.createSession});
    }

    componentWillUnmount() {
        if (janus) janus.destroy();
    }

    // --- STEP 1 ---
    createSession() {
        // Create a session with Janus 
        janus = new Janus({
            server, 
            success: this.attachToVideoRoomPlugin,
            error: this.onError,
            destroyed: this.onJanusDestroyed
        });
    }

    // --- STEP 2 ---
    attachToVideoRoomPlugin() {
        console.log('CONNECTED to Janus at:', janus.getServer());

        // Attach to Janus VideoRoom plugin to get publishing handle
        janus.attach({
            plugin: 'janus.plugin.videoroom',
            success: this.onPublisherAttachment,
            error: this.onError, 
            consentDialog: this.onMediaDialog, 
            webrtcState: this.onRtcStateChange,
            onmessage: this.onPublisherMessage, 
            onlocalstream: this.onLocalStream,
            oncleanup: this.onCleanUp
        });
    }

    // --- STEP 3 ---
    // See onPublisherAttachment() for step 4
    onPublisherAttachment(handle) {
        vrHandle = handle;
        console.log('ATTACHED handle to', handle.getPlugin());
        // Prepare username registration
        const register = {
            "request": "join", 
            "room": this.props.roomid,
            "ptype": "publisher", 
            "display": this.props.username
        };
        vrHandle.send({"message": register});
    }
    // TODO: YOU NEED TWO VERSIONS OF JANUS.ATTACH(), ONE FOR INITIAL HANDLE, ONE FOR EACH NEW REMOTE FEED
    // TODO: ALSO NEED ONMESSAGE FOR THE SAME REASON, CHECK THE FUNCTION newRemoteFeed() in the github

    onMediaDialog() {
        console.log('Acquiring user media...');
    }

    // Called with true when peer connection is ready, false when it goes down
    onRtcStateChange(state) {
        console.log('RTC state change', state);
    }

    // Called when Janus sends a message or event to the PUBLISHER handle 
    // (and used for rtc negotation)
    onPublisherMessage(msg, jsep) {
        let event = msg['videoroom'];
        if (event !== undefined && event !== null ) {
            if (event === 'joined') {
                console.log('JOINED room!');
                // Create WebRTC compliant offer for publishing own feed
                vrHandle.createOffer({
                    media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },
                    success: function (jsep) {
                        // --- STEP 4 ---
                        // Got publisher SDP response, send publish request with jsep
                        console.log('RECEIVED publisher SDP response');
                        const publish = { "request": "configure", "audio": true, "video": true };
                        vrHandle.send({"message": publish, "jsep": jsep});
                        // See jsep if statement at bottom for step 5
                    },
                    error: this.onError
                });
            }
        }
        if (jsep !== undefined && jsep !== null) {
            // --- STEP 5 --- Handle publish answer
            vrHandle.handleRemoteJsep({jsep}); // NOTE: See onRemoteStream()
            // Check if any media we wanted to publish has been rejected
            let audio = msg["audio_codec"];
            let myStream = this.state.myStream;
            if (myStream && myStream.getAudioTracks() && myStream.getAudioTracks().length > 0 && !audio) {
                // Audio has been rejected
                alert("Our audio stream has been rejected, viewers won't hear us");
                console.error('Our audio stream has been rejected!');
            }
            let video = msg['video_codec'];
            if (myStream && myStream.getVideoTracks() && myStream.getVideoTracks().length > 0 && !video) {
                // Video has been rejected
                alert("Our video stream has been rejected, viewers won't see us");
                console.error('Our video stream has been rejected!');
            }
        }
    }

    // Called when local media stream is available for display
    // this is ONLY used in the publishing handle
    onLocalStream(stream) {
        console.log('ACQUIRED local stream');
        // Update the UI
        this.setState({myStream: stream});
    }

    // Called when remote media stream is avilable for display
    // this is ONLY used in subscribing handles, invoked AFTER vrHandle.handleRemoteJsep()
    onRemoteStream(stream) {

    }

    // Called when the rtc connection was closed with Janus
    onCleanUp() {
        console.log('RTC connection closed with Janus');
        this.setState({myStream: null});
    }

    onError(err) {
        console.error(err);
    }

    onJanusDestroyed() {
        console.log('Janus has been destroyed');
    }
    
    render() {
        // Setup local video feed
        const localVideo = document.getElementById('localvideo');
        if (localVideo) localVideo.srcObject = this.state.myStream;
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
                    {this.state.remoteStreams.map((v, i) => {
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
