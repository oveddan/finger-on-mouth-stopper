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
  <div className='row'>
    <div className='col-sm'>
      {scheduledEntry && (
        <div>
          <h4>Current scheduled activity: {scheduledEntry.activity}</h4>
          Activity will end&nbsp;
          {scheduledEntry.scheduleEntry.end.fromNow()}
        </div>
      )}
      {!currentClassification && 'No current activity...'}
      {currentClassification && (
        `Current Activity: ${currentClassification.label}`
      )}
      {scheduledEntry && (
        <ComplianceNotifier scheduledEntry={scheduledEntry} currentClassification={currentClassification} complianceStatus={complianceStatus} />
      )}
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
      'Thank you for doing what I asked :)'
    )}
    {complianceStatus === ComplianceStatus.NOT_COMPLYING && (
      `You're not ${scheduledEntry.activity}!`
    )}
    {complianceStatus === ComplianceStatus.NOT_SURE && (
      `I can't see you...where are you hiding?`
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


