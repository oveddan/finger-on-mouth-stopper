import React, { useState } from 'react';
import Pose from './Pose';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

type Props = {
  keypoints: [number, number][][],
  deleteExample: (exampleIndex: number) => void
}

type State = {
  example: number
}


const EditClassKeypoints = ({keypoints, deleteExample}: Props) => {
  const [{example}, setState] = useState<State>({
    example: 0
  });

  const exampleKeypoints = keypoints[example];

  return (
    <div>
      <Pose keypoints={exampleKeypoints} scaleToBox width={200} height={200} boxes={[]}/>
      <button className="btn btn-secondary" onClick={() => deleteExample(example)}>Remove Example</button>
      <Slider value={example} min={0} max={keypoints.length-1} step={1} onChange={value => setState({example: value})} />
    </div>
  )
}

export default EditClassKeypoints;