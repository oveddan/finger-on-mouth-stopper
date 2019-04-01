import React, { useState } from 'react'
import EditClassKeypoints from './EditClassKeypoints';
import { Keypoints, DatasetObject, Activities } from '../types';

type State = {
  editingClassId?: number,
  editingLabel?: string,
  newLabel?: string
}

type Props = {
  labels?: Activities,
  getButtonClass: (id: number) => string,
  updateLabel: (id: number, label: string) => void,
  addLabel: (label: string) => void,
  deleteExample: (classId: number, example: number) => void,
  dataset?: DatasetObject
}

export type ClassExampleCount = {[classId: number]: number};

const ENTER = 'Enter';

const EditableClassifications = ({labels, getButtonClass, dataset = {}, updateLabel, addLabel, deleteExample}: Props) => {
  const [{editingClassId, editingLabel, newLabel}, setState] = useState<State>({
  });

  const keypoints = typeof editingClassId !== 'undefined' ? dataset[editingClassId] : null;

  const saveLabel = async () => {
    if (typeof editingClassId !== 'undefined') {
      await updateLabel(editingClassId, editingLabel as string);
      setState({});
    } else if (newLabel) {
      await addLabel(newLabel);
      setState({});
    }
  }

  const keyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ENTER) {
      saveLabel();
    }
  }

  return (
    <div>
      {labels && Object.keys(labels).map(idString => {
        const id = +idString;
        const name = labels[id];
        if(editingClassId === id && editingLabel)
          return (
            <input type='text'
              value={editingLabel}
              onChange={e => setState({editingClassId, editingLabel: e.target.value})}
              onBlur={saveLabel}
              onKeyPress={keyPressed}
            />
          )
        else
          return (
            <div key={id} className="btn-group" role="group">
              <button type="button" className={`btn btn-light`} onClick={() => setState({editingClassId: id, editingLabel: name})}>
                <i className="far fa-edit"></i>
              </button>
              <button type="button" key={id}
                className={`btn btn-light`}
                onClick={() => setState({editingClassId: id})} >
                {`${name} (${dataset[id] ? dataset[id].length : 0})`}
              </button>
            </div>
         )
      })}
      <br/>
      {!newLabel && (
        <button type="button" className="btn btn-light" onClick={() => setState({newLabel: 'label'})}>
          <i className="fas fa-plus"></i>
        </button>
      )}
      {newLabel && (
        <input type='text'
          value={newLabel}
          onChange={e => setState({newLabel: e.target.value})}
          onKeyPress={keyPressed}
        />
      )}
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


