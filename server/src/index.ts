import * as cors from 'cors';
import * as dgram from 'dgram'
import * as express from 'express';
import * as http from 'http';
import {AddressInfo} from 'net';

import {writeInitial, writeToResponse} from './mjpegServer';

const HOST = '0.0.0.0'

const kitchen = 'kitchen';
const bedroom = 'bedroom';
const values = [kitchen, bedroom];

const PORTS = {
  [kitchen]: 9002,
  [bedroom]: 9003
}

const app = express();
app.use(cors());

values.forEach(camera => {
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
    console.log('got message with size', message.length)

    if (client) writeToResponse(client, message);
  });

  server.bind(PORTS[camera], HOST);

  return server;
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Listening on ' + port));
