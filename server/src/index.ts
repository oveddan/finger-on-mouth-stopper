import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dgram from 'dgram'
import * as express from 'express';
import * as http from 'http';
import {AddressInfo} from 'net';
import {join} from 'path';

import {writeInitial, writeToResponse} from './mjpegServer';
import {startRecording, stopRecording} from './recording';
import {CAMERA_PORTS, cameras, getStatus} from './state';
import {saveImage} from './util';

const HOST = '0.0.0.0'

const app = express();
app.use(cors());

app.use(bodyParser());

cameras.forEach((camera, cameraId) => {
  const server = dgram.createSocket('udp4');

  server.on('listening', () => {
    const address = server.address() as AddressInfo;
    console.log(
        'UDP Server listning on ' + address.address + ':' + address.port);
  })

  let client: http.ServerResponse;

  app.get(`/${camera}.mjpeg`, (req, res) => {
    writeInitial(res);

    client = res;
  })

  server.on('message', (message) => {
    // console.log(`${camera} camera sent ${message.length} bytes`)

    const status = getStatus();
    if (status.cameras[cameraId].recordingPath) {
      const fileName = (new Date().getTime()) + '.jpg';
      saveImage(
          message, status.cameras[cameraId].recordingPath as string, fileName);
    }

    if (client) writeToResponse(client, message);
  });

  server.bind(CAMERA_PORTS[camera], HOST);

  return server;
});

const clientFolder = join(__dirname, '../../', 'client')

// Static file declaration
app.use(express.static(join(clientFolder, 'build')));

app.get('/status', (_, res) => {
  res.json(getStatus());
});

type RecordPost = {
  cameraId: number,
  record: boolean
};

app.post('/record', async (req, res) => {
  try {
    const {body}: {body: RecordPost} = req;

    if (body.record) {
      await startRecording(body.cameraId);
    } else {
      await stopRecording(body.cameraId);
    }

    res.json(getStatus());
  } catch (e) {
    console.error(e);
    res.status(500).send(e.stack);
  }
})

// app.use((err, req, res, _next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Listening on ' + port));
