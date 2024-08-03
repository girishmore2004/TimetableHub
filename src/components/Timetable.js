
import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
 
const generateTimeOptions = (start, end, interval) => {
  const options = [];
  for (let hour = start; hour <= end; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push(time);
    }
  }
  return options;
};

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [timings, setTimings] = useState({
    opening: '',
    closing: '',
    recessStart: '',
    recessEnd: '',
    classDuration: 60  
  });
 
  const timeOptions = useMemo(() => generateTimeOptions(0, 23, 15), []);
 
  const handleInputChange = (type, index, event) => {
    const value = event.target.value;
    const updatedData = [...(type === 'teacher' ? teacherData : classData)];
    const target = updatedData[index];

    if (event.target.name === 'subjects') {
      target.subjects = value.split(',').map(sub => sub.trim());
    } else {
      target[event.target.name] = value;
    }

    if (type === 'teacher') {
      setTeacherData(updatedData);
    } else {
      setClassData(updatedData);
    }
  };

  const addRow = (type) => {
    const newRow = type === 'teacher' ? { name: '', subjects: [] } : { name: '', subjects: [] };
    if (type === 'teacher') {
      setTeacherData([...teacherData, newRow]);
    } else {
      setClassData([...classData, newRow]);
    }
  };

  const handleGenerateTimetable = async () => {
    if (!timings.opening || !timings.closing || !timings.recessStart || !timings.recessEnd || !timings.classDuration) {
      alert('Please set all school timings before generating the timetable.');
      return;
    }

    try {
      const response = await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherData, classData, timings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error generating timetable: ${errorData.error}`);
      }

      const data = await response.json();
      const styledData = data.map(entry => ({
        ...entry,
        teacher: entry.teacher === 'Unscheduled' ? <span style={{ color: 'red' }}>Unscheduled</span> : entry.teacher
      }));
      setTimetable(styledData); 
    } catch (error) {
      console.error('Error generating timetable:', error.message);
    }
  };
 
  const groupedTimetable = useMemo(() => {
    const groupedByClass = timetable.reduce((acc, entry) => {
      if (!acc[entry.class]) {
        acc[entry.class] = [];
      }
      acc[entry.class].push(entry);
      return acc;
    }, {});

    for (const className in groupedByClass) {
      groupedByClass[className].sort((a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`));
    }

    return groupedByClass;
  }, [timetable]);
 
  const teacherSchedule = useMemo(() => {
    const schedule = teacherData.reduce((acc, teacher) => {
      acc[teacher.name] = timetable
        .filter(entry => entry.teacher === teacher.name)
        .sort((a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`));
      return acc;
    }, {});

    return schedule;
  }, [timetable, teacherData]);
 
  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours);
    endDate.setMinutes(minutes + duration);
    return endDate.toTimeString().substr(0, 5);
  };
 
  const isRecessTime = (time) => {
    const timeDate = new Date(`1970-01-01T${time}:00`);
    const recessStartDate = new Date(`1970-01-01T${timings.recessStart}:00`);
    const recessEndDate = new Date(`1970-01-01T${timings.recessEnd}:00`);
    return timeDate >= recessStartDate && timeDate < recessEndDate;
  };
 
  const isRecessStarting = (endTime) => {
    return endTime === timings.recessStart;
  };
  
   
  const downloadPDF = (data, filename) => {
    const doc = new jsPDF();
    const tableColumn = ["Time", "End Time", "Subject", "Teacher"];
    const tableRows = data.map(entry => [
      entry.time,
      calculateEndTime(entry.time, timings.classDuration),
      entry.subject,
      entry.teacher
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save(`${filename}.pdf`);
  };

  return (
    <div>
      <h2>Generate Timetable</h2>
 
      <div>
        <h3>School Timings</h3>
        {['opening', 'closing', 'recessStart', 'recessEnd'].map(timeType => (
          <div key={timeType} style={{padding:"10px"}}>
            <label>{`${timeType.replace(/([A-Z])/g, ' $1').toUpperCase()}:`}</label>
            <select
              value={timings[timeType]}
              onChange={(e) => setTimings({ ...timings, [timeType]: e.target.value })}
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <label>Class Duration (minutes):</label>
          <input
            type="number"
            name="classDuration"
            value={timings.classDuration}
            onChange={(e) => setTimings({ ...timings, classDuration: parseInt(e.target.value, 10) })}
          />
        </div>
      </div>

      <h3>Teacher Data</h3>
      {teacherData.map((teacher, index) => (
        <div key={index}>
          <input
            type="text"
            name="name"
            placeholder="Teacher Name"
            value={teacher.name}
            onChange={(event) => handleInputChange('teacher', index, event)}
          />
          <input
            type="text"
            name="subjects"
            placeholder="Subjects (comma separated)"
            value={teacher.subjects.join(', ')}
            onChange={(event) => handleInputChange('teacher', index, event)}
          />
        </div>
      ))}
      <button onClick={() => addRow('teacher')} style={{backgroundColor:"black", color:"white", borderRadius:"20px",marginTop:"10px",height:"2rem"}}>Add Teacher</button>

      <h3>Class Data</h3>
      {classData.map((classEntry, index) => (
        <div key={index}>
          <input
            type="text"
            name="name"
            placeholder="Class Name"
            value={classEntry.name}
            onChange={(event) => handleInputChange('class', index, event)}
          />
          <input
            type="text"
            name="subjects"
            placeholder="Subjects (comma separated)"
            value={classEntry.subjects.join(', ')}
            onChange={(event) => handleInputChange('class', index, event)}
          />
        </div>
      ))}
      <button onClick={() => addRow('class')} style={{backgroundColor:"black", color:"white", borderRadius:"20px",marginTop:"10px",height:"2rem"}}>Add Class</button>

      <button onClick={handleGenerateTimetable} style={{backgroundColor:"black", color:"white", borderRadius:"20px",marginTop:"10px", marginLeft:"10px",height:"2rem"}}>Generate Timetable</button>

      <h3 style={{textAlign:"center", backgroundColor:"gray"}}>Timetable</h3>
      {Object.keys(groupedTimetable).length > 0 ? (
        Object.keys(groupedTimetable).map((className) => (
          <div key={className} style={{textAlign:"center"}}>
            <h4 style={{backgroundColor:"#9386b9" , borderRadius:"100px"}}>{className}</h4>
            <table style={{
    border: "solid 2px",
    borderRadius: "10px",
    margin: "0 auto",
    width: "80%", 
    textAlign: "center"}}>
              <thead style={{ borderBottom: "5px solid black" }}>
                <tr >
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {groupedTimetable[className].map((entry, index) => {
                  const endTime = calculateEndTime(entry.time, timings.classDuration);
                  return (
                    <React.Fragment key={index}>
                      <tr style={{ backgroundColor: isRecessTime(entry.time) ? '#cce5ff' : 'transparent' }}>
                        <td>{entry.subject}</td>
                        <td>{entry.teacher}</td>
                        <td>{entry.time}</td>
                        <td>{endTime}</td>
                      </tr>
                      {isRecessStarting(endTime) && (
                        <tr style={{ backgroundColor: '#cce5ff' }}>
                          <td colSpan="4" style={{ textAlign: 'center' }}>Break</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              
            </table>
            <button onClick={() => downloadPDF(groupedTimetable[className], `Timetable_${className}`)} style={{backgroundColor:"black", color:"white", borderRadius:"20px",marginTop:"10px",height:"2rem"}}>Download {className} Timetable as PDF</button>
          </div>
        ))
      ) : (
        <p>No timetable generated yet.</p>
      )}
      <div style={{ borderBottom: '10px solid black', margin: '20px 0' }}></div>
      <h3 style={{textAlign:"center", backgroundColor:"gray"}}>Teacher Schedule</h3>
      {Object.keys(teacherSchedule).length > 0 ? (
        Object.keys(teacherSchedule).map((teacherName) => (
          <div key={teacherName} style={{textAlign:"center"}}>
            <h4 style={{backgroundColor:"#9386b9" , borderRadius:"100px"}}>{teacherName}</h4>
            <table  style={{
    border: "solid 2px",
    borderRadius: "10px",
    margin: "0 auto",
    width: "80%",  
    textAlign: "center"}}>
              <thead style={{ borderBottom: "5px solid black" }}>
                <tr>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {teacherSchedule[teacherName].map((entry, index) => {
                  const endTime = calculateEndTime(entry.time, timings.classDuration);
                  return (
                    <React.Fragment key={index}>
                      <tr style={{ backgroundColor: isRecessTime(entry.time) ? '#cce5ff' : 'transparent' }}>
                        <td>{entry.class}</td>
                        <td>{entry.subject}</td>
                        <td>{entry.time}</td>
                        <td>{endTime}</td>
                      </tr>
                      {isRecessStarting(endTime) && (
                        <tr style={{ backgroundColor: '#cce5ff' }}>
                          <td colSpan="4" style={{ textAlign: 'center' }}>Break</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <button onClick={() => downloadPDF(teacherSchedule[teacherName], `Schedule_${teacherName}`)} style={{backgroundColor:"black", color:"white", borderRadius:"20px",marginTop:"10px",height:"2rem"}}>Download {teacherName} Schedule as PDF</button>
          </div>
        ))
      ) : (
        <p>No schedule generated yet.</p>
      )}
      
    </div>
    
  );
};

export default Timetable;


