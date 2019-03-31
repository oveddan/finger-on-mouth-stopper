import React, { useState } from 'react'
import { DatasetObject, Labels } from '../types';

type Props = {
  activities: Labels,
  addExample: (id: number) => void,
  dataset?: DatasetObject,
  classifiedPose: number | null
}

type State = {
  addingExample?: number,
  addingExampleTimeout?: number
}

export type ClassExampleCount = {[classId: number]: number};

const ViewableClassifications = ({activities = {}, classifiedPose, addExample, dataset = {}}: Props) => {
  const [{addingExample, addingExampleTimeout}, setState] = useState<State>({});

  const addExampleFn = (classId: number) => {
    if (typeof addingExampleTimeout !== 'undefined') {
      window.clearTimeout(addingExampleTimeout);
    }

    const endAddingExampleTimeout = window.setTimeout(() => {
      setState({
        addingExample: undefined,
        addingExampleTimeout: undefined
      });
    }, 200);

    addExample(classId);

    setState({
      addingExample: classId,
      addingExampleTimeout: endAddingExampleTimeout
    });
  }

  return (
    <div>
      {Object.keys(activities).map(id => (
        <button type="button" key={+id}
          className={`btn ${getButtonClass(+id, classifiedPose, addingExample)}`}
          onClick={() => addExampleFn(+id)}
        >
          {`${activities[+id]} (${dataset[+id] ? dataset[+id].length : 0})`}
        </button>
     ))}
    </div>
  )
}

const getButtonClass = (classId: number, poseClassIndex: number | null, addingExample?: number) => {
  if (typeof addingExample !== 'undefined') {
    if (poseClassIndex === addingExample) {
      return "btn-success"
    } else {
      return "btn-light"
    }
  }

  if (classId === poseClassIndex) {
    return "btn-primary"
  };

  return "btn-light";
};

export default ViewableClassifications
