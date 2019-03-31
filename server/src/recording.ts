import {promises as fs} from 'fs'
import * as mkdirp from 'mkdirp'
import {join} from 'path'

import {cameras, getStatus, setRecordingStatus} from './state'

const recordingFolder = '/Volumes/Samsung/recordings';


export const startRecording = async (cameraId: number) => {
  const {cameras} = getStatus();
  if (!cameras[cameraId].recordingPath) {
    const cameraDirectory = await getNewRecordingDirectory(cameraId);

    setRecordingStatus(cameraId, cameraDirectory);
  }
};

export const stopRecording = async (cameraId: number) => {
  setRecordingStatus(cameraId, null);
};

const getNewRecordingDirectory = async(cameraId: number): Promise<string> => {
  const cameraName = cameras[cameraId];

  const cameraFolder = join(recordingFolder, cameraName);

  await mkdirpPromise(cameraFolder);

  const existingDirectories = await fs.readdir(cameraFolder);

  const lastDirectory =
      +(existingDirectories[existingDirectories.length - 1] || '-1');

  const nextDirectory = (lastDirectory + 1).toString();

  const nextFolder = join(cameraFolder, nextDirectory);

  await mkdirpPromise(nextFolder);

  return nextFolder;
};

const mkdirpPromise = (folder: string): Promise<void> =>
    (new Promise((resolve, reject) => {
      mkdirp(folder, (err, success) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }));
