# janus-test

A test app for the Janus WebRTC server. Contains a Fedora dockerfile for Janus. Source code for reunitus react app taken from 
https://github.com/agonza1/reunitus

## Setup 
Build the Janus docker image by running <code>docker build . -t janus</code>. Also be sure to run <code>npm install</code> in the reunitus project.

## Startup
Start the docker image, either with the docker desktop client or the docker cli. Either way, ensure that port <code>8088</code> is assigned to the container on your local machine. Start the react dev server with <code>npm start</code>.

The react app is hosted on <code>localhost:3000</code>.
