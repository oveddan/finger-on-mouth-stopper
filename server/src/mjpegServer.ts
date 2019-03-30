import {ServerResponse} from 'http';

export const writeInitial =
    (res: ServerResponse) => {
      res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=myboundary',
        'Cache-Control': 'no-cache',
        'Connection': 'close',
        'Pragma': 'no-cache'
      });
    }

export const writeToResponse = (res: ServerResponse, jpeg: Buffer) => {
  res.write('--myboundary\r\n');
  res.write('Content-Type: image/jpeg\r\n');
  res.write('Content-Length: ' + jpeg.length + '\r\n');
  res.write('\r\n');
  res.write(jpeg, 'binary');
  res.write('\r\n');
}
