import React from 'react';
import Picker from 'react-month-picker';
import 'react-month-picker/css/month-picker.css';

let pickerLang = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    from: 'From',
    to: 'To'
  };

let makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month-1] + '. ' + m.year)
    return '?'
}

const style = {
  backgroundColor: '#ddd',
  border: '1px solid #ccc',
  cursor: 'pointer',
  padding: '4px',
};

const DateRangePicker = ({title, from, to, dateChanged, onDismiss}) => {
  let picker = null;
  return (
    <div
      style={{
        display: 'inline-block',  
      }}
    >
      <label>{title}</label>
      <div className="edit">
        <Picker
          ref={(input) => { picker = input; }}
          range={{ from, to }}
          lang={pickerLang}
          theme="light"
          onDismiss={onDismiss}
          onChange={(year, month, id) => { 
            dateChanged(year, month, id);
            // if (id > 0) {
              // picker.dismiss();
            // }
          }}
        >
          <div onClick={() => picker.show()} style={style}>
            {makeText(from) + ' ~ ' + makeText(to)}
          </div>
        </Picker>
      </div>
    </div>
  );
};

export default DateRangePicker;
