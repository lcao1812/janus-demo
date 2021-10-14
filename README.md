# janus-test

A test app for the Janus WebRTC server. Contains a Fedora dockerfile for a Janus container, and a simple express api server. In addition, original source code for reunitus react app taken from 
https://github.com/agonza1/reunitus.

The purpose of this project is to serve as a proof of concept for how communication works with clients between Janus and clients, and how a server might make a call to Janus using the barebones HTTP API.

## Setup 
Run <code>npm install</code> in the reunitus and express projects.

## Startup
Build and start the docker image by using <code>docker compose up</code> in the janus directory. Start the react dev server and express server with <code>npm start</code>. 

The react app is hosted on <code>localhost:3000</code>. The express server is hosted on <code>localhost:3001</code>. The Janus container should now be hosted on port <code>8088</code>.

## Helpful Links
- https://janus.conf.meetecho.com/docs/deploy.html
- https://webrtc.ventures/2020/12/janus-webrtc-media-server-video-conference-app/
- https://janus.conf.meetecho.com/docs/videoroom.html
- https://github.com/meetecho/janus-gateway
- https://janus.conf.meetecho.com/docs/JS.html
