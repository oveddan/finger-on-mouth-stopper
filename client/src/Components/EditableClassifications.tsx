import React, { useState } from 'react'
import EditClassKeypoints from './EditClassKeypoints'
import { DatasetObject, Activities } from '../types';
import { activationOptions } from '@tensorflow/tfjs-layers/dist/keras_format/activation_config';
import * as actions from '../actions';

type State = {
  editingClassId?: number,
  keypoints?: [number, number][][]
}

type Props = {
  activities: Activities,
  getButtonClass: (id: number) => string,
  getClassificationKeypoints: (id: number) => Promise<[number, number][][]>,
  deleteExample: (classId: number, example: number) => void,
  dataset: DatasetObject
}

export type ClassExampleCount = {[classId: number]: number};

const ENTER = 'Enter';
const ESCAPE = 'Escape';

const EditableClassifications = ({
  activities,
  getButtonClass,
  dataset,
  getClassificationKeypoints,
  deleteExample,
}: Props) => {
  const [state, setState] = useState<State>({
  });
  const {keypoints, editingClassId} = state;

  const setEditingClass = async (id: number, name: string) => {
    const newKeypoints = await getClassificationKeypoints(id);

    setState({...state, editingClassId: id, keypoints: newKeypoints})
  }

  return (
    <div>
      {Object.entries(activities).map(([name, id]) => (
        <div key={id} className="btn-group" role="group">
          <button type="button" key={id}
            className={`btn ${getButtonClass(+id)}`}
            onClick={() => setEditingClass(+id, name)} >
            {`${name} (${dataset[+id] ? dataset[+id].length : 0})`}
          </button>
        </div>
      ))}
      <br/>

     {keypoints && typeof editingClassId !== 'undefined' && (
        <EditClassKeypoints
          keypoints={keypoints}
          deleteExample={exampleIndex => deleteExample(editingClassId, exampleIndex)}
        />
      )}
    </div>
  )
}

export default EditableClassifications
