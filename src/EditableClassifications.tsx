import React, { useState } from 'react'
import EditClassKeypoints from './EditClassKeypoints'
import { DatasetObject } from './classifierStorage';

type State = {
  editingClassId?: number,
  editingLabel?: string,
  newLabel?: string,
  keypoints?: [number, number][][]
}

type Props = {
  labels: string[],
  getButtonClass: (id: number) => string,
  addExample: (id: number) => void,
  updateLabel: (id: number, label: string | undefined) => void,
  addLabel: (label: string) => void,
  getClassificationKeypoints: (id: number) => Promise<[number, number][][]>, 
  deleteExample: (id: number, exampleIndex: number) => void,
  dataset: DatasetObject
}

export type ClassExampleCount = {[classId: number]: number};

const ENTER = 'Enter';
const ESCAPE = 'Escape';

const EditableClassifications = ({
  labels, 
  getButtonClass, 
  addExample, 
  dataset,
  updateLabel, 
  addLabel, 
  getClassificationKeypoints,
  deleteExample,
}: Props) => {
  const [state, setState] = useState<State>({
  });
  const {keypoints, editingClassId, editingLabel, newLabel} = state;

  const saveLabel = async () => {
    if (typeof editingClassId !== 'undefined') {
      await updateLabel(editingClassId, editingLabel); 
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

  const setEditingClass = async (id: number, name: string) => {
    const newKeypoints = await getClassificationKeypoints(id);

    setState({...state, editingClassId: id, editingLabel: name, keypoints: newKeypoints})
  }

  return (
    <div>
      {labels.map((name, id) => {
        if(editingClassId === id)
          return (
            <input key={id}
              type='text' 
              value={editingLabel} 
              onChange={e => setState({...state, editingLabel: e.target.value})} 
              onBlur={saveLabel} 
              onKeyPress={keyPressed}
            />
          )
        else
          return (
            <div key={id} className="btn-group" role="group">
              <button type="button" className={`btn btn-light`} onClick={() => setEditingClass(id, name) }>
                <i className="far fa-edit"></i>
              </button>
              <button type="button" key={id}
                className={`btn ${getButtonClass(id)}`}
                onClick={() => addExample(id)} >
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
        <EditClassKeypoints keypoints={keypoints} deleteExample={exampleIndex => deleteExample(editingClassId, exampleIndex)} />
      )}
    </div>
  )
}

export default EditableClassifications