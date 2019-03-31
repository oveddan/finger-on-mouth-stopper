import * as posenet from '@tensorflow-models/posenet';
import {OutputStride, Pose} from '@tensorflow-models/posenet';
import {getInputTensorDimensions, getValidResolution, toResizedInputTensor, toTensorBuffers3D} from '@tensorflow-models/posenet/dist/util';
import * as tf from '@tensorflow/tfjs';

export class BatchPoseNet {
  posenet: posenet.PoseNet;

  constructor(posenet: posenet.PoseNet) {
    this.posenet = posenet;
  }

  private performEstimation(
      input: tf.Tensor3D, imageScaleFactor = 0.5, flipHorizontal = false,
      outputStride: OutputStride = 16) {
    const [height, width] = getInputTensorDimensions(input);
    const resizedHeight =
        getValidResolution(imageScaleFactor, height, outputStride);
    const resizedWidth =
        getValidResolution(imageScaleFactor, width, outputStride);

    return tf.tidy(() => {
      const inputTensor = toResizedInputTensor(
          input, resizedHeight, resizedWidth, flipHorizontal);
      return this.posenet.predictForMultiPose(inputTensor, outputStride);
    });
  }

  async estimateMultiplePoses(
      tensors: tf.Tensor3D[], imageScaleFactor = 0.5, flipHorizontal = false,
      outputStride: OutputStride = 16, maxDetections = 5, scoreThreshold = .5,
      nmsRadius = 20): Promise<Pose[][]> {
    const estimationResults = tensors.map(
        tensor => this.performEstimation(
            tensor, imageScaleFactor, flipHorizontal, outputStride));

    const estimationResultsBuffers = await Promise.all(estimationResults.map(
        ({heatmapScores, offsets, displacementFwd, displacementBwd}) =>
            toTensorBuffers3D(
                [heatmapScores, offsets, displacementFwd, displacementBwd])));

    return estimationResultsBuffers.map(
        ([
          scoresBuffer, offsetsBuffer, displacementFwdBuffer,
          displacementBwdBuffer
        ]) =>
            posenet.decodeMultiplePoses(
                scoresBuffer, offsetsBuffer, displacementFwdBuffer,
                displacementBwdBuffer, outputStride, maxDetections,
                scoreThreshold, nmsRadius));
  }
}

export const load = async (multiplier: posenet.MobileNetMultiplier) => {
  const net = await posenet.load(multiplier);

  return new BatchPoseNet(net);
}
