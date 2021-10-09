# janus-test

A test app for the Janus WebRTC server. Contains a Fedora dockerfile for a Janus container, and a simple express api server. In addition, source code for reunitus react app taken from 
https://github.com/agonza1/reunitus.

## Setup 
Build the Janus docker image by running <code>docker build . -t janus</code> within the janus folder. Also be sure to run <code>npm install</code> in the reunitus and express projects.

## Startup
Start the docker image, either with the docker desktop client or the docker cli. Either way, ensure that port <code>8088</code> is assigned to the container on your local machine. Start the react dev server and express server with <code>npm start</code>. 

The react app is hosted on <code>localhost:3000</code>. The express server is hosted on <code>localhost:3001</code>. The Janus container should now be hosted on port <code>8088</code> (see above).

## Helpful Links
https://janus.conf.meetecho.com/docs/deploy.html
https://webrtc.ventures/2020/12/janus-webrtc-media-server-video-conference-app/
https://janus.conf.meetecho.com/docs/videoroom.html
https://github.com/meetecho/janus-gateway
https://janus.conf.meetecho.com/docs/JS.html
