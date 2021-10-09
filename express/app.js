import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import Janus from 'janus-room/janus.js';
import fetch from 'node-fetch';
import cors from 'cors';

const janusURL = 'http://localhost:8088/janus';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// API routes
app.post('/create-room/:room', async function(req, res) {
    // Create new room
    const roomid = req.params['room'];
    
});

app.get('/list-rooms', async function(req, res, next) {
    try {
        let endpoint = janusURL;
        // Find existing rooms; create new session
        let result = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({
                "janus": "Create",
                "transaction": Janus.randomString()
            })
        });
        let body = await result.json();
        if (body["janus"] != "success") return next(body);
        const sessionId = body["data"]["id"];
        endpoint += '/' + sessionId; // http://localhost:8088/janus/<sessionid>

        // Attach session to videoroom plugin
        result = await fetch(endpoint, {
            method: 'POST', 
            body: JSON.stringify({
                "janus": "attach", 
                "plugin": "janus.plugin.videoroom",
                "transaction": Janus.randomString()
            })
        });
        body = await result.json();
        if (body["janus"] != 'success') return next(body);
        const pluginId = body["data"]["id"];
        endpoint += '/' + pluginId; // http://localhost:8088/janus/<session>/<pluginid>

        // List created rooms; talk to video room plugin
        result = await fetch(endpoint, {
            method: "POST", 
            body: JSON.stringify({
                "janus": "message", 
                "transaction": Janus.randomString(),
                body: {
                    "request": "list"
                }
            })
        });
        body = await result.json();
        if (body["janus"] != 'success') return next(body);
        const rooms = body["plugindata"]["data"]["list"];
        
        // Send response
        res.json(rooms);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

export default app;
