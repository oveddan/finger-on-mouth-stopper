import {KNNClassifier} from '@tensorflow-models/knn-classifier';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import {Tensor3D} from '@tensorflow/tfjs';

import * as batchPoseNet from './batchPoseNet';
import {CameraFrames, CameraKeypoints, DatasetObject, Keypoints} from './types';
import {toExample} from './util';

export const extractAndNormalizeKeypoints =
    (poses: posenet.Pose[], input: tf.Tensor3D): Keypoints|undefined => {
      if (poses.length === 0) {
        return undefined;
      }

      const [height, width] = input.shape;

      return poses[0].keypoints.map(
          ({position: {x, y}}): [number, number] => ([x / width, y / height]));
    };

export const classify = async (
    classifier: KNNClassifier, dataset: DatasetObject,
    keypoints: Keypoints) => {
  if (Object.keys(dataset).length === 0) return null;

  const keypointsTensor = toExample(keypoints);

  const prediction = await classifier.predictClass(keypointsTensor);

  keypointsTensor.dispose();

  // debugger;

  return prediction.classIndex;
};

const imageScaleFactor = 1;
const outputStride = 16;
export const performPoseEstimation =
    async(posenetModel: batchPoseNet.BatchPoseNet, frames: CameraFrames):
        Promise<CameraKeypoints> => {
          const results: CameraKeypoints = {};

          if (posenetModel) {
            const tensors: {[cameraId: number]: Tensor3D} = {};

            Object.keys(frames).forEach(id => {
              const frame = frames[+id];

              if (frame) {
                tensors[+id] = tf.browser.fromPixels(frame.frame);
              }
            })

            const allFramesPoses = await posenetModel.estimateMultiplePoses(
                Object.values(tensors), 1, false, 8)

            Object.keys(tensors).forEach((id, index) => {
              results[+id] = extractAndNormalizeKeypoints(
                  allFramesPoses[index], tensors[+id]);
            })

            Object.values(tensors).forEach(tensor => tensor.dispose());
          }

          return results;
        };
