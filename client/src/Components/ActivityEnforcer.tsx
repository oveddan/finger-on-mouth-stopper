import React from 'react';
import { ScheduleEntry, CameraClassifications, ComplianceStatus } from '../types';
import { connect } from 'react-redux';
import { State } from '../reducers';
import { currentScheduledEntry, highestConfidenceClassification, classificationsWithLabels, ClassificationWithLabel, ScheduledEntryAndActivity, currentScheduledEntryAndActivityName, scheduledEntryTimeRemaining, complianceStatus } from '../selectors';
import * as moment from 'moment';
// import moment = require('moment');

type Props = {
  scheduledEntry?: ScheduledEntryAndActivity,
  currentClassification?: ClassificationWithLabel|null
  timeRemaining?: moment.Duration,
  complianceStatus: ComplianceStatus
}

const ActivityEnforcer = ({ scheduledEntry, currentClassification, complianceStatus }: Props) => (
  <div>
    <div className='row'>
      <div className='col'>
        {scheduledEntry && (
          <div>
            <h4>You should be {scheduledEntry.activity}
              <small className="text-muted">
                &nbsp;&nbsp;activity will end&nbsp;
                  {scheduledEntry.scheduleEntry.end.fromNow()}
              </small>
            </h4>

          </div>
        )}
      </div>
    </div>
    <div className='row'>
      <div className='col'>
        {scheduledEntry && (
          <ComplianceNotifier scheduledEntry={scheduledEntry} currentClassification={currentClassification} complianceStatus={complianceStatus} />
        )}
      </div>
    </div>
  </div>
);

type ComplianceNotifierProps = {
  scheduledEntry: ScheduledEntryAndActivity,
  complianceStatus: ComplianceStatus,
  currentClassification?: ClassificationWithLabel|null
}

const ComplianceNotifier = ({scheduledEntry, complianceStatus, currentClassification}: ComplianceNotifierProps) => (
  <div>
    {complianceStatus === ComplianceStatus.COMPLYING && (
      <div className="alert alert-success" role="alert">
        {`Thank you for ${scheduledEntry.activity}`}
      </div>
    )}
    {complianceStatus === ComplianceStatus.NOT_COMPLYING && (
      <div className="alert alert-danger" role="alert">
        {`You should be ${scheduledEntry.activity} but instead you are ${currentClassification && currentClassification.label}!`}
      </div>
    )}
    {complianceStatus === ComplianceStatus.NOT_SURE && (
      <div className="alert alert-warning" role="alert">
        {`I can't see you...where are you hiding?`}
      </div>
    )}
  </div>
)


const mapStateToProps = (state: State) => ({
  scheduledEntry: currentScheduledEntryAndActivityName(state),
  currentClassification: highestConfidenceClassification(state),
  timeRemaining: scheduledEntryTimeRemaining(state),
  complianceStatus: complianceStatus(state)
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityEnforcer);


