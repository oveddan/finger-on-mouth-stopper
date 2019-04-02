import React, {Component, ChangeEvent} from 'react'
import { CameraStatus } from '../../serverApi';
import StreamVideo from './StreamVideo';
import ExistingVideo from './ExistingVideo';
import WebcamVideo from './WebcamVideo';
import { CameraVideoSource, VideoSource, CameraFrameType } from '../../types';
import * as actions from '../../actions/activityActions';

type Props = {
  frameChanged: typeof actions.frameUpdated,
  videoSourceChanged: typeof actions.videoSourceChanged,
  camera?: CameraStatus,
  cameraId: number,
  cameraVideoSource?: CameraVideoSource
};


export const VideoPlayer = ({frameChanged, camera, cameraId, cameraVideoSource, videoSourceChanged} : Props) =>  {
  const cameraFrameChanged = (frame: CameraFrameType) => frameChanged(cameraId, frame, new Date().getTime())

  const { source, videoUrl } = cameraVideoSource || { source: VideoSource.EXISTING_VIDEO, videoUrl: process.env.PUBLIC_URL + '/captureDay2.mp4'}

  return (
    <div>
      <div className="input-group mb-3">
        <div className="input-group-prepend" id="button-addon3">
          <button key={1}
            className={`btn ${buttonClass(source === VideoSource.WEBCAM)}`}
            type="button"
            onClick={() => videoSourceChanged(cameraId, VideoSource.WEBCAM)}>
            Webcam
          </button>
          <button
            key={2}
            className={`btn ${buttonClass(source === VideoSource.STREAM)}`}
            type="button"
            onClick={() => videoSourceChanged(cameraId, VideoSource.STREAM)}>Stream</button>
          <button key={3}
            className={`btn ${buttonClass(source === VideoSource.EXISTING_VIDEO)}`}
            type="button"
            onClick={() => videoSourceChanged(cameraId, VideoSource.EXISTING_VIDEO, videoUrl)}>Existing Video</button>
        </div>
        <input type="text"
          className="form-control"
          placeholder=""
          aria-describedby="button-addon3"
          disabled={source !== VideoSource.EXISTING_VIDEO}
          value={videoUrl}
          onChange={({target}) => videoSourceChanged(cameraId, VideoSource.EXISTING_VIDEO, target.value)}
          />
      </div>
      {source === VideoSource.EXISTING_VIDEO && videoUrl && (
        <ExistingVideo url={videoUrl} frameChanged={cameraFrameChanged} />
      )}
      {source === VideoSource.STREAM && camera && (
        <StreamVideo
          cameraId={cameraId}
          camera={camera}
          frameChanged={cameraFrameChanged}
        />
      )}
      {source === VideoSource.WEBCAM && (
        <WebcamVideo frameChanged={cameraFrameChanged}/>
      )}
    </div>
  )
}

export default VideoPlayer;
const buttonClass = (isActive: boolean) => isActive ? "btn-outline-primary" : "btn-outline-secondary"


