import React from 'react';
import '../App.css';

import {Container, Row, Col} from 'react-bootstrap'
import RemoteFeed from './RemoteFeed';
import Janus from './Janus.js';

const server = "ws://localhost:8188/janus";
const opaqueId = Janus.randomString();
let janus = null; // The main object for interaction with Janus
let vrHandle = null; // The main object for interaction with VideoRoom plugin
let myid, mypvtid = null;

// DOCUMENTATION ON GENERAL VIDEOROOM API
// https://janus.conf.meetecho.com/docs/videoroom.html

// EXAMPLE APP USING JS API
// https://github.com/Deanfost/janus-test/blob/main/reunitus/src/components/Room.js

// NOTE: due to the nature of the Janus JS API, publisher code is orgnized in 
// this file in several top level functions, while subscriber handle code is within its
// own function newRemoteFeed(), invoked for every new subscription to a remote publisher

class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            remoteStreamObjs: [],
            myStream: null
        };

        this.createSession = this.createSession.bind(this);
        this.attachToVideoRoomPlugin = this.attachToVideoRoomPlugin.bind(this);
        this.onPublisherAttachment = this.onPublisherAttachment.bind(this);
        this.onMediaDialog = this.onMediaDialog.bind(this);
        this.onRtcStateChange = this.onRtcStateChange.bind(this);
        this.onPublisherMessage = this.onPublisherMessage.bind(this);
        this.onLocalStream = this.onLocalStream.bind(this);
        this.onCleanUp = this.onCleanUp.bind(this);
        this.onJanusDestroyed = this.onJanusDestroyed.bind(this);
        this.newRemoteFeed = this.newRemoteFeed.bind(this);
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
            opaqueId,
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
            "room": parseInt(this.props.roomid),
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
        if (event) {
            if (event === 'joined') {
                // --- STEP 4 ---
                // Publisher/manager created, negotiate WebRTC and attach to existing feeds if any
                myid = msg['id'];
                mypvtid = msg['private_id'];
                console.log(`JOINED room ${msg['room']} with id ${myid}`);
                
                // Create WebRTC compliant offer for publishing own feed
                vrHandle.createOffer({
                    media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },
                    success: (jsep) => {
                        // Got publisher SDP response, send publish request with jsep
                        console.log('RECEIVED publisher SDP response');
                        const publish = { "request": "configure", "audio": true, "video": true };
                        vrHandle.send({"message": publish, "jsep": jsep});
                        // See jsep if statement at bottom for step 5
                    },
                    error: this.onError
                });

                // Can we attach to any existing feeds?
                let publishers = msg['publishers'];
                if (publishers) {
                    console.log(`RECEIVED a list of ${publishers.length} active publishers in the room:`);
                    publishers.forEach(publisher => {
                        // Attach to the feeds
                        let id = publisher['id'];
                        let displayName = publisher['display'];
                        let audio = publisher['audio_codec'];
                        let video = publisher['video_codec'];
                        console.log(`Id: ${id} username: ${displayName} audiocodec: ${audio} videocodec: ${video}`);   
                        this.newRemoteFeed(id, displayName, audio, video);
                    });
                }
            } else if(event === 'destroyed') {
                console.error("The room has been destroyed");
            } else if (event === 'event') {
                if (msg["publishers"]) {
                    // Attach to new feed(s)
                    console.log('New publishers!')
                    let publishers = msg["publishers"];
                    publishers.forEach(publisher => {
                        // Attach to the feeds
                        let id = publisher['id'];
                        let displayName = publisher['display'];
                        let audio = publisher['audio_codec'];
                        let video = publisher['video_codec'];
                        console.log(`Id: ${id} username: ${displayName} audiocodec: ${audio} videocodec: ${video}`);   
                        this.newRemoteFeed(id, displayName, audio, video);
                    });
                } else if(msg['leaving']) {
                    // One of the publishers is leaving
                    console.log('A publisher is leaving!');
                } else if (msg['unpublished']) {
                    // One of the publishers has unpublished
                    let leftPublisher = msg['unpublished'];
                    console.log(`Publisher left: ${leftPublisher}`);
                }
            }
        }
        if (jsep) {
            // --- STEP 5 --- 
            // Janus sent us an SDP answer for our publish request
            // begin sending local audio and video
            vrHandle.handleRemoteJsep({jsep});
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

    // Called when the rtc connection was closed with Janus
    // (but handle is still active)
    onCleanUp() {
        console.log('RTC connection closed with Janus');
        this.setState({myStream: null});
    }

    // Generic error handler for several points
    // here it is only used for the publishing handle
    onError(err) {
        console.error(err);
    }

    // Called when the janus connection has been destroyed
    onJanusDestroyed() {
        console.log('Janus has been destroyed');
    }

    // Attach and create a new handle for a remote stream
    // NOTE: contains custom callbacks, used for each new remote stream
    // also note that there is one less step here bc we are reusing the 
    // connection already created above
    newRemoteFeed(id, display, audiocodec, videocodec) {
        // Attach to the videoroom plugin to get subscriber handle
        let remoteFeed = null;
        // --- Subscriber step 1 ---
        janus.attach({
            plugin: 'janus.plugin.videoroom',
            opaqueId,
            success: subHandle => {
                // --- Subscriber step 2 ---
                remoteFeed = subHandle;
                console.log('--- NEW SUBSCRIBE HANDLE ---');
                console.log(`Attached to ${remoteFeed.getPlugin()} | feedid=${id}`);
                console.log('--- NEW SUBSCRIBE HANDLE ---');
                // Join the correct room and sub to the feed; initiate RTC negotations
                let subRequest = {
                    request: 'join',
                    room: parseInt(this.props.roomid),
                    ptype: 'subscriber',
                    feed: id,
                    private_id: mypvtid
                };
                remoteFeed.videoCodec = videocodec;
                remoteFeed.audioCodec = audiocodec;
                remoteFeed.send({message: subRequest});
            },
            error: (err) => {
                console.error('Could not attach subscriber handle:', err);
            },
            onmessage: (msg, jsep) => {
                let event = msg['videoroom'];
                if (event) {
                    if (event === 'attached') {
                        console.log(`Subscriber ${id} created and attached!`);
                        // Subscriber attached, we have received a list of streams from the publisher
                    }
                } 
                if (jsep) {
                    // --- Subscriber step 3 ---
                    // Janus has sent us a subscriber SDP offer (compared to answer, which we got when trying to publish)
                    remoteFeed.createAnswer({
                        jsep,
                        media: { audioSend: false, videoSend: false }, // We only want to receive audio / video 
                        success: jsep => {
                            // Answer with jsep, and request for the stream to start
                            console.log(`SDP received for subscriber ${id}`);
                            let body = { request: 'start', room: this.props.roomid };
                            remoteFeed.send({message: body, jsep});
                        },
                        error: err => {
                            console.error('Could not establish subscriber connection:', err);
                        }
                    })
                }
            },
            onremotestream: (stream) => {
                // --- Subscriber step 4 ---
                console.log('REMOTE STREAM:', stream);
                // We have received the stream requested, catalog it and do UI housekeeping
                const newObj = {id, display, stream};
                let concat = this.state.remoteStreamObjs.concat(newObj);
                this.setState({remoteStreamObjs: concat});
            },
            oncleanup: () => {
                // The rtc sub connection has been closed
                console.log(`Subscription connection closed! id: ${id}, display: ${display}`);
                const newList = this.state.remoteStreamObjs.filter(o => o.id != id);
                this.setState({remoteStreamObjs: newList});
            }
        });
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
                    </div>
                </header>
                <h3 id="title"></h3>
                <Container>
                    {this.state.remoteStreamObjs.map((v, i) => <RemoteFeed key={i} {...v} />)}
                </Container>
            </div>
        );
    }
}

export default Room;
