import {spawn} from 'child_process';
import {promises as fs} from 'fs'
import {join} from 'path';

const baseFolderPath = '/Volumes/Samsung/recordings/';

const baseOutputFolder =
    '/Users/danoved/Source/thesis/pose-classifier/client/public';

export const createImageFileFromFolder =
    async (folderPath: string, fps: number) => {
  const folder = join(baseFolderPath, folderPath);

  if (!(await fs.lstat(folder)).isDirectory()) return;

  const outputFile = join(baseOutputFolder, folderPath) + '.mp4';
  console.log('folder, ouptut folder', folder, outputFile);
  const args = [
    '-r', fps.toString(), '-pattern_type', 'glob', '-i', `${folder}/*.jpg`,
    '-c:v', 'libx264', outputFile
  ];

  return await execPromise('ffmpeg', args);
};

const execPromise = (commandName: string, args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const proc = spawn(commandName, args);

    if (proc.stdout) {
      proc.stdout.on('data', function(data) {
        console.log(data.toString());
      });
    }

    if (proc.stderr)
      proc.stderr.on('data', function(data) {
        console.log(data.toString());
      });

    proc.on('close', function() {
      console.log('finished');
      resolve();
    });
  });
};

const getCameraRecordingFolders = (): Promise<string[]> =>
    fs.readdir(baseFolderPath);

const main =
    async () => {
  const cameraRecordingFolders = await getCameraRecordingFolders();

  for (let i = 0; i < cameraRecordingFolders.length; i++) {
    const recordingFolder = cameraRecordingFolders[i];
    if (recordingFolder === '.DS_STORE') continue;

    const folderPath = join(baseFolderPath, recordingFolder);

    if (!(await fs.lstat(folderPath)).isDirectory()) {
      continue;
    }

    const recordingFolders = await fs.readdir(folderPath);

    for (let j = 0; j < recordingFolders.length; j++) {
      const folder = recordingFolders[j];
      console.log('recording folder', folder);
      if (folder === 'DS_STORE') continue;

      const targetFolder = join(recordingFolder, folder);
      console.log('creating in folder', targetFolder)
          await createImageFileFromFolder(targetFolder, 8);
    }
  }

  // try {
  //   await createImageFileFromFolder('0', 8);
  // } catch (e) {
  //   console.error(e);
  // }
  // console.log('done')
}

main();
