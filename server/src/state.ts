export const kitchen = 'kitchen';
export const bedroom = 'bedroom';
export const cameras = [kitchen, bedroom];

export const CAMERA_PORTS = {
  [kitchen]: 9002,
  [bedroom]: 9003
}

export type CameraStatus = {
  recordingPath: string | null,
  name: string
}

export type CamerasStatus = {
  [cameraId: number]: CameraStatus
};

export type Status = {
  cameras: CamerasStatus
};

let currentStatus: Status = {
  cameras: cameras.reduce(
      (result, camera, id):
          CamerasStatus => {
            result[Number(id)] = {recordingPath: null, name: camera};
            return result;
          },
      {})
};

export const getStatus = () => currentStatus

export const setStatus = (status: Status) => {
  currentStatus = status;
};

export const setRecordingStatus =
    (cameraId: number, recordingPath: string|null) => {
      const newStatus: Status = {
        ...currentStatus,
        cameras: {
          ...currentStatus.cameras,
          [+cameraId]: {...currentStatus.cameras[+cameraId], recordingPath}
        }
      }

      setStatus(newStatus);
    }
