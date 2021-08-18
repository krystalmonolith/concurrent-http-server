//
// From "How To Build and Test a Node.js REST API with Express on Ubuntu 18.04"
// URL: https://www.section.io/engineering-education/building-a-basic-api-with-nodejs/
//

const port = 3000
const filesPath = './testimages/100x100/16BIT/RED_GREEN_BLUE/';

const express = require('express')
const dirTree = require("directory-tree");

const app = express()
const cors = require('cors');

const filesList = dirTree(filesPath).children.map(a => a.name);

let fileDelayMsec = 50;
let fileFailPercent = 0;

function sendAFile(req, res) {
    if (Math.random() < fileFailPercent / 100) {
        res.status(503).json({error: 'RandomFail'}).end();
    } else {
        const options = {
            root: filesPath,
            dotfiles: 'deny'
        }

        setTimeout(() => {
            res.setHeader('Cache-Control', 'no-store');
            res.sendFile(req.params.filename, options, function (err) {
                if (err) {
                    res.status(500).json(err).end();
                }
            })
        }, fileDelayMsec);
    }
}

app.use(cors());

app.get('/filedelaymsec', (req, res) => {
    res.json({ fileDelayMsec: fileDelayMsec });
});

app.put('/filedelaymsec/:delay', (req, res) => {
    let delay = parseInt(req.params['delay'], 10);
    if (isNaN(delay)) delay = 0;
    fileDelayMsec = delay;
    res.json({ fileDelayMsec: fileDelayMsec });
});

app.get('/filefailpercent', (req, res) => {
    res.json({ fileFailPercent: fileFailPercent });
});

app.put('/filefailpercent/:percent', (req, res) => {
    let percent = parseInt(req.params['percent'], 10);
    if (isNaN(percent)) percent = 0;
    fileFailPercent = Math.max(Math.min(percent, 100), 0);
    res.json({ fileFailPercent: fileFailPercent });
});

app.get('/filelist', (req, res) => {
    res.json(filesList);
});

app.get('/file/:filename', (req, res) => {
    sendAFile(req, res);
});

app.listen(port, () => {
    console.log(`concurrent-http-server listening at http://localhost:${port}`)
});

