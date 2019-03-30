import * as cors from 'cors';
import * as dgram from 'dgram'
import * as express from 'express';
import * as http from 'http';
import {AddressInfo} from 'net';

import {writeInitial, writeToResponse} from './mjpegServer';

const HOST = '0.0.0.0'
const PORT = 9002

const server = dgram.createSocket('udp4');

let client: http.ServerResponse;

server.on('listening', () => {
  const address = server.address() as AddressInfo;
  console.log('UDP Server listning on ' + address.address + ':' + address.port);
})

server.on('message', (message) => {
  console.log('got message with size', message.length)

  if (client) writeToResponse(client, message);
  // const data = jpeg.decode(message);

  // console.log('data', data);
});

server.bind(PORT, HOST);


const app = express();
app.use(cors());

app.get('/stream.mjpeg', (req, res) => {
  writeInitial(res);

  client = res;
})

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Listening on ' + port));
