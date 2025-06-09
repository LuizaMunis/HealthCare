import React from 'react';
import BloodPressureChart from './BloodPressureChart';
import HistoryList from './HistoryList';

// Este componente é puramente para apresentação. Ele recebe os dados e as funções como props.
const HistoryView = ({ records, onEdit, onDelete }) => {
  return (
    <>
      <BloodPressureChart records={records} />
      <HistoryList
        records={records}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
};

export default HistoryView;