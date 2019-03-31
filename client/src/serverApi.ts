import axios from 'axios';

const baseUrl = 'http://localhost:5000'
const fetchStatusUrl = baseUrl + '/status';
const setRecordingUrl = baseUrl + '/record';

export type CameraStatus = {
  recordingPath: string|null,
  name: string
}

export type CamerasStatus = {
  [cameraId: number]: CameraStatus
};

export type ServerStatus = {
  cameras: CamerasStatus
}

export type RecordPost = {
  cameraId: number,
  record: boolean
};

export const getServerState = async () => {
  const result = await axios.get<ServerStatus>(fetchStatusUrl);

  return result.data;
};

export const setRecording = async (cameraId: number, record: boolean) => {
  const toPost: RecordPost = {cameraId, record};

  const result = await axios.post<ServerStatus>(setRecordingUrl, toPost);

  return result.data;
}
