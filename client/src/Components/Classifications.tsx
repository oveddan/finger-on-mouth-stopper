import React, { useState } from 'react';
import { DatasetObject, Activities, CameraClassification } from '../types';
import EditableClassifications from './EditableClassifications';
import ViewableClassifications from './ViewableClassifications';

interface Props {
  cameraId: number,
  classification: CameraClassification | null,
  dataset?: DatasetObject,
  activities?: Activities,
  clearDataset: () => void,
  addLabel: (text: string) => void,
  updateLabel: (id: number, text: string) => void,
  addExample: (clasId: number) => void,
  deleteExample: (classId: number, example: number) => void
};

type State = {
  editingClassifications: boolean
};

const Classifications = (props: Props) => {
  const [{editingClassifications}, setState] = useState<State>({editingClassifications: false});

  const toggleEditClassifications = () => setState({editingClassifications: !editingClassifications})


  return (
    <div>
      <h5>
        Classifications:
        {!editingClassifications && (
          <a href="#" onClick={toggleEditClassifications}> edit</a>
        )}
       </h5>
      {editingClassifications && (
        <div>
          <EditableClassifications
            dataset={props.dataset}
            getButtonClass={() => 'btn btn-primary'}
            labels={props.activities}
            updateLabel={props.updateLabel}
            addLabel={props.addLabel}
            deleteExample={props.deleteExample}
          />
        </div>
      )}
      {!editingClassifications && (
        <ViewableClassifications
          activities={props.activities}
          dataset={props.dataset}
          addExample={props.addExample}
          classifiedPose={props.classification ? props.classification.classId : null}
        />

      )}
      {editingClassifications && (
        <a href="#" onClick={toggleEditClassifications}>done editing</a>
      )}
      <br /><br/>
      <button className='btn btn-light' onClick={props.clearDataset}>Reset classifier</button>
    </div>
  );
}

export default Classifications;
