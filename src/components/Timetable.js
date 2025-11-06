// import React, { useState, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// // Generate selectable time options
// const generateTimeOptions = (start, end, interval) => {
//   const options = [];
//   for (let hour = start; hour <= end; hour++) {
//     for (let minute = 0; minute < 60; minute += interval) {
//       const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
//       options.push(time);
//     }
//   }
//   return options;
// };

// const Timetable = () => {
//   const [timetable, setTimetable] = useState([]);
//   const [teacherData, setTeacherData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [timings, setTimings] = useState({
//     opening: '',
//     closing: '',
//     recessStart: '',
//     recessEnd: '',
//     classDuration: 60
//   });

//   const timeOptions = useMemo(() => generateTimeOptions(0, 23, 15), []);

//   // Handle input changes for teacher/class
//   const handleInputChange = (type, index, event) => {
//     const value = event.target.value;
//     const updatedData = [...(type === 'teacher' ? teacherData : classData)];
//     const target = updatedData[index];

//     if (event.target.name === 'subjects') {
//       target.subjects = value.split(',').map(sub => sub.trim());
//     } else {
//       target[event.target.name] = value;
//     }

//     if (type === 'teacher') {
//       setTeacherData(updatedData);
//     } else {
//       setClassData(updatedData);
//     }
//   };

//   // Add a new row for teacher or class
//   const addRow = (type) => {
//     const newRow = { name: '', subjects: [] };
//     if (type === 'teacher') {
//       setTeacherData([...teacherData, newRow]);
//     } else {
//       setClassData([...classData, newRow]);
//     }
//   };

//   // Generate timetable via backend API
//   const handleGenerateTimetable = async () => {
//     if (!timings.opening || !timings.closing || !timings.recessStart || !timings.recessEnd || !timings.classDuration) {
//       alert('Please set all school timings before generating the timetable.');
//       return;
//     }

//     try {
//       const response = await fetch('https://timetablehub-backend-production.up.railway.app/api/timetable/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ teacherData, classData, timings }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(`Error generating timetable: ${errorData.error}`);
//       }

//       const data = await response.json();
//       const styledData = data.map(entry => ({
//         ...entry,
//         teacher: entry.teacher === 'Unscheduled' ? (
//           <span style={{ color: 'red' }}>Unscheduled</span>
//         ) : entry.teacher
//       }));

//       setTimetable(styledData);
//     } catch (error) {
//       console.error('Error generating timetable:', error.message);
//     }
//   };

//   // Group timetable by class
//   const groupedTimetable = useMemo(() => {
//     const groupedByClass = timetable.reduce((acc, entry) => {
//       if (!acc[entry.class]) acc[entry.class] = [];
//       acc[entry.class].push(entry);
//       return acc;
//     }, {});

//     for (const className in groupedByClass) {
//       groupedByClass[className].sort(
//         (a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`)
//       );
//     }

//     return groupedByClass;
//   }, [timetable]);

//   // Generate teacher schedule
//   const teacherSchedule = useMemo(() => {
//     const schedule = teacherData.reduce((acc, teacher) => {
//       acc[teacher.name] = timetable
//         .filter(entry => entry.teacher === teacher.name)
//         .sort(
//           (a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`)
//         );
//       return acc;
//     }, {});
//     return schedule;
//   }, [timetable, teacherData]);

//   // Helper to calculate end time
//   const calculateEndTime = (startTime, duration) => {
//     const [hours, minutes] = startTime.split(':').map(Number);
//     const validDuration = isNaN(duration) || duration === '' ? 0 : duration;
//     const endDate = new Date();
//     endDate.setHours(hours);
//     endDate.setMinutes(minutes + validDuration);
//     return endDate.toTimeString().substr(0, 5);
//   };

//   // Check recess period
//   const isRecessTime = (time) => {
//     const timeDate = new Date(`1970-01-01T${time}:00`);
//     const recessStartDate = new Date(`1970-01-01T${timings.recessStart}:00`);
//     const recessEndDate = new Date(`1970-01-01T${timings.recessEnd}:00`);
//     return timeDate >= recessStartDate && timeDate < recessEndDate;
//   };

//   const isRecessStarting = (endTime) => endTime === timings.recessStart;

//   // Download PDF
//   const downloadPDF = (data, filename) => {
//     const doc = new jsPDF();
//     const tableColumn = ["Time", "End Time", "Subject", "Teacher"];
//     const tableRows = data.map(entry => [
//       entry.time,
//       calculateEndTime(entry.time, timings.classDuration),
//       entry.subject,
//       entry.teacher
//     ]);

//     doc.autoTable(tableColumn, tableRows, { startY: 20 });
//     doc.save(`${filename}.pdf`);
//   };

//   // JSX UI
//   return (
//     <div>
//       <h2>Generate Timetable</h2>

//       {/* SCHOOL TIMINGS */}
//       <div>
//         <h3>School Timings</h3>
//         {['opening', 'closing', 'recessStart', 'recessEnd'].map(timeType => (
//           <div key={timeType} style={{ padding: "10px" }}>
//             <label>{`${timeType.replace(/([A-Z])/g, ' $1').toUpperCase()}:`}</label>
//             <select
//               value={timings[timeType]}
//               onChange={(e) => setTimings({ ...timings, [timeType]: e.target.value })}
//             >
//               {timeOptions.map(time => (
//                 <option key={time} value={time}>{time}</option>
//               ))}
//             </select>
//           </div>
//         ))}

//         <div>
//           <label>Class Duration (minutes):</label>
//           <input
//             type="number"
//             name="classDuration"
//             value={
//               isNaN(timings.classDuration) || timings.classDuration === null
//                 ? ''
//                 : timings.classDuration
//             }
//             onChange={(e) => {
//               const value = e.target.value;
//               setTimings({
//                 ...timings,
//                 classDuration:
//                   value === '' ? '' : Math.max(0, parseInt(value, 10) || 0),
//               });
//             }}
//           />
//         </div>
//       </div>

//       {/* TEACHER DATA */}
//       <h3>Teacher Data</h3>
//       {teacherData.map((teacher, index) => (
//         <div key={index}>
//           <input
//             type="text"
//             name="name"
//             placeholder="Teacher Name"
//             value={teacher.name}
//             onChange={(event) => handleInputChange('teacher', index, event)}
//           />
//           <input
//             type="text"
//             name="subjects"
//             placeholder="Subjects (comma separated)"
//             value={teacher.subjects.join(', ')}
//             onChange={(event) => handleInputChange('teacher', index, event)}
//           />
//         </div>
//       ))}
//       <button onClick={() => addRow('teacher')} style={{ backgroundColor: "black", color: "white", borderRadius: "20px", marginTop: "10px", height: "2rem" }}>Add Teacher</button>

//       {/* CLASS DATA */}
//       <h3>Class Data</h3>
//       {classData.map((classEntry, index) => (
//         <div key={index}>
//           <input
//             type="text"
//             name="name"
//             placeholder="Class Name"
//             value={classEntry.name}
//             onChange={(event) => handleInputChange('class', index, event)}
//           />
//           <input
//             type="text"
//             name="subjects"
//             placeholder="Subjects (comma separated)"
//             value={classEntry.subjects.join(', ')}
//             onChange={(event) => handleInputChange('class', index, event)}
//           />
//         </div>
//       ))}
//       <button onClick={() => addRow('class')} style={{ backgroundColor: "black", color: "white", borderRadius: "20px", marginTop: "10px", height: "2rem" }}>Add Class</button>

//       {/* GENERATE BUTTON */}
//       <button onClick={handleGenerateTimetable} style={{ backgroundColor: "black", color: "white", borderRadius: "20px", marginTop: "10px", marginLeft: "10px", height: "2rem" }}>Generate Timetable</button>

//       {/* CLASS TIMETABLE DISPLAY */}
//       <h3 style={{ textAlign: "center", backgroundColor: "gray" }}>Timetable</h3>
//       {Object.keys(groupedTimetable).length > 0 ? (
//         Object.keys(groupedTimetable).map((className) => (
//           <div key={className} style={{ textAlign: "center" }}>
//             <h4 style={{ backgroundColor: "#9386b9", borderRadius: "100px" }}>{className}</h4>
//             <table style={{
//               border: "solid 2px",
//               borderRadius: "10px",
//               margin: "0 auto",
//               width: "80%",
//               textAlign: "center"
//             }}>
//               <thead style={{ borderBottom: "5px solid black" }}>
//                 <tr>
//                   <th>Subject</th>
//                   <th>Teacher</th>
//                   <th>Start Time</th>
//                   <th>End Time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {groupedTimetable[className].map((entry, index) => {
//                   const endTime = calculateEndTime(entry.time, timings.classDuration);
//                   return (
//                     <React.Fragment key={index}>
//                       <tr style={{ backgroundColor: isRecessTime(entry.time) ? '#cce5ff' : 'transparent' }}>
//                         <td>{entry.subject}</td>
//                         <td>{entry.teacher}</td>
//                         <td>{entry.time}</td>
//                         <td>{endTime}</td>
//                       </tr>
//                       {isRecessStarting(endTime) && (
//                         <tr style={{ backgroundColor: '#cce5ff' }}>
//                           <td colSpan="4" style={{ textAlign: 'center' }}>Break</td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   );
//                 })}
//               </tbody>
//             </table>
//             <button onClick={() => downloadPDF(groupedTimetable[className], `Timetable_${className}`)} style={{ backgroundColor: "black", color: "white", borderRadius: "20px", marginTop: "10px", height: "2rem" }}>Download {className} Timetable as PDF</button>
//           </div>
//         ))
//       ) : (
//         <p>No timetable generated yet.</p>
//       )}

//       <div style={{ borderBottom: '10px solid black', margin: '20px 0' }}></div>

//       {/* TEACHER SCHEDULE DISPLAY */}
//       <h3 style={{ textAlign: "center", backgroundColor: "gray" }}>Teacher Schedule</h3>
//       {Object.keys(teacherSchedule).length > 0 ? (
//         Object.keys(teacherSchedule).map((teacherName) => (
//           <div key={teacherName} style={{ textAlign: "center" }}>
//             <h4 style={{ backgroundColor: "#9386b9", borderRadius: "100px" }}>{teacherName}</h4>
//             <table style={{
//               border: "solid 2px",
//               borderRadius: "10px",
//               margin: "0 auto",
//               width: "80%",
//               textAlign: "center"
//             }}>
//               <thead style={{ borderBottom: "5px solid black" }}>
//                 <tr>
//                   <th>Class</th>
//                   <th>Subject</th>
//                   <th>Start Time</th>
//                   <th>End Time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {teacherSchedule[teacherName].map((entry, index) => {
//                   const endTime = calculateEndTime(entry.time, timings.classDuration);
//                   return (
//                     <React.Fragment key={index}>
//                       <tr style={{ backgroundColor: isRecessTime(entry.time) ? '#cce5ff' : 'transparent' }}>
//                         <td>{entry.class}</td>
//                         <td>{entry.subject}</td>
//                         <td>{entry.time}</td>
//                         <td>{endTime}</td>
//                       </tr>
//                       {isRecessStarting(endTime) && (
//                         <tr style={{ backgroundColor: '#cce5ff' }}>
//                           <td colSpan="4" style={{ textAlign: 'center' }}>Break</td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   );
//                 })}
//               </tbody>
//             </table>
//             <button onClick={() => downloadPDF(teacherSchedule[teacherName], `Schedule_${teacherName}`)} style={{ backgroundColor: "black", color: "white", borderRadius: "20px", marginTop: "10px", height: "2rem" }}>Download {teacherName} Schedule as PDF</button>
//           </div>
//         ))
//       ) : (
//         <p>No schedule generated yet.</p>
//       )}
//     </div>
//   );
// };

// export default Timetable;

import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generate selectable time options
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
    opening: '01:00',
    closing: '04:00',
    recessStart: '02:00',
    recessEnd: '02:30',
    classDuration: 30
  });

  const timeOptions = useMemo(() => generateTimeOptions(0, 23, 15), []);

  // Validate timings
  const validateTimings = () => {
    const { opening, closing, recessStart, recessEnd, classDuration } = timings;
    
    if (!opening || !closing || !recessStart || !recessEnd || !classDuration) {
      return 'Please set all school timings before generating the timetable.';
    }

    const openTime = new Date(`1970-01-01T${opening}:00`);
    const closeTime = new Date(`1970-01-01T${closing}:00`);
    const rStartTime = new Date(`1970-01-01T${recessStart}:00`);
    const rEndTime = new Date(`1970-01-01T${recessEnd}:00`);

    if (closeTime <= openTime) {
      return 'Closing time must be after opening time.';
    }

    if (rStartTime < openTime || rEndTime > closeTime) {
      return 'Recess time must be within school hours.';
    }

    if (rEndTime <= rStartTime) {
      return 'Recess end time must be after recess start time.';
    }

    if (classDuration <= 0 || classDuration > 180) {
      return 'Class duration must be between 1 and 180 minutes.';
    }

    return null;
  };

  // Handle input changes for teacher/class
  const handleInputChange = (type, index, event) => {
    const value = event.target.value;
    const updatedData = [...(type === 'teacher' ? teacherData : classData)];
    const target = updatedData[index];

    if (event.target.name === 'subjects') {
      target.subjects = value.split(',').map(sub => sub.trim()).filter(sub => sub);
    } else {
      target[event.target.name] = value;
    }

    if (type === 'teacher') {
      setTeacherData(updatedData);
    } else {
      setClassData(updatedData);
    }
  };

  // Add a new row for teacher or class
  const addRow = (type) => {
    const newRow = { name: '', subjects: [] };
    if (type === 'teacher') {
      setTeacherData([...teacherData, newRow]);
    } else {
      setClassData([...classData, newRow]);
    }
  };

  // Generate timetable via backend API
  const handleGenerateTimetable = async () => {
    const validationError = validateTimings();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (teacherData.length === 0 || classData.length === 0) {
      alert('Please add at least one teacher and one class.');
      return;
    }

    try {
      const response = await fetch('https://timetablehub-backend-production.up.railway.app/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherData, classData, timings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error generating timetable: ${errorData.error}`);
      }

      const data = await response.json();
      console.log('Backend returned:', data); // Debug log
      
      const styledData = data.map(entry => ({
        ...entry,
        teacher: entry.teacher === 'Unscheduled' ? (
          <span style={{ color: 'red' }}>Unscheduled</span>
        ) : entry.teacher
      }));

      setTimetable(styledData);
    } catch (error) {
      console.error('Error generating timetable:', error.message);
      alert('Failed to generate timetable. Check console for details.');
    }
  };

  // Group timetable by class
  const groupedTimetable = useMemo(() => {
    const groupedByClass = timetable.reduce((acc, entry) => {
      if (!acc[entry.class]) acc[entry.class] = [];
      acc[entry.class].push(entry);
      return acc;
    }, {});

    for (const className in groupedByClass) {
      groupedByClass[className].sort(
        (a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`)
      );
    }

    return groupedByClass;
  }, [timetable]);

  // Generate teacher schedule
  const teacherSchedule = useMemo(() => {
    const schedule = teacherData.reduce((acc, teacher) => {
      acc[teacher.name] = timetable
        .filter(entry => entry.teacher === teacher.name)
        .sort(
          (a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`)
        );
      return acc;
    }, {});
    return schedule;
  }, [timetable, teacherData]);

  // Helper to calculate end time
  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const validDuration = isNaN(duration) || duration === '' ? 0 : duration;
    const endDate = new Date();
    endDate.setHours(hours);
    endDate.setMinutes(minutes + validDuration);
    return endDate.toTimeString().substr(0, 5);
  };

  // Check recess period
  const isRecessTime = (time) => {
    const timeDate = new Date(`1970-01-01T${time}:00`);
    const recessStartDate = new Date(`1970-01-01T${timings.recessStart}:00`);
    const recessEndDate = new Date(`1970-01-01T${timings.recessEnd}:00`);
    return timeDate >= recessStartDate && timeDate < recessEndDate;
  };

  const isRecessStarting = (endTime) => endTime === timings.recessStart;

  // Download PDF
  const downloadPDF = (data, filename) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${filename}`, 14, 15);
    
    const tableColumn = ["Start Time", "End Time", "Subject", "Teacher"];
    const tableRows = data.map(entry => [
      entry.time,
      calculateEndTime(entry.time, timings.classDuration),
      entry.subject,
      typeof entry.teacher === 'object' ? 'Unscheduled' : entry.teacher
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save(`${filename}.pdf`);
  };

  // JSX UI
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Generate Timetable</h2>

      {/* SCHOOL TIMINGS */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>School Timings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            { key: 'opening', label: 'OPENING' },
            { key: 'closing', label: 'CLOSING' },
            { key: 'recessStart', label: 'RECESS START' },
            { key: 'recessEnd', label: 'RECESS END' }
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{label}:</label>
              <select
                value={timings[key]}
                onChange={(e) => setTimings({ ...timings, [key]: e.target.value })}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Select time</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Class Duration (minutes):</label>
          <input
            type="number"
            name="classDuration"
            value={timings.classDuration}
            onChange={(e) => {
              const value = e.target.value;
              setTimings({
                ...timings,
                classDuration: value === '' ? '' : Math.max(0, parseInt(value, 10) || 0),
              });
            }}
            style={{ width: '200px', padding: '5px', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* TEACHER DATA */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Teacher Data</h3>
        {teacherData.map((teacher, index) => (
          <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="name"
              placeholder="Teacher Name"
              value={teacher.name}
              onChange={(event) => handleInputChange('teacher', index, event)}
              style={{ flex: 1, padding: '8px' }}
            />
            <input
              type="text"
              name="subjects"
              placeholder="Subjects (comma separated)"
              value={teacher.subjects.join(', ')}
              onChange={(event) => handleInputChange('teacher', index, event)}
              style={{ flex: 2, padding: '8px' }}
            />
          </div>
        ))}
        <button 
          onClick={() => addRow('teacher')} 
          style={{ backgroundColor: "black", color: "white", borderRadius: "20px", padding: '10px 20px', cursor: 'pointer', border: 'none' }}
        >
          Add Teacher
        </button>
      </div>

      {/* CLASS DATA */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Class Data</h3>
        {classData.map((classEntry, index) => (
          <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="name"
              placeholder="Class Name"
              value={classEntry.name}
              onChange={(event) => handleInputChange('class', index, event)}
              style={{ flex: 1, padding: '8px' }}
            />
            <input
              type="text"
              name="subjects"
              placeholder="Subjects (comma separated)"
              value={classEntry.subjects.join(', ')}
              onChange={(event) => handleInputChange('class', index, event)}
              style={{ flex: 2, padding: '8px' }}
            />
          </div>
        ))}
        <button 
          onClick={() => addRow('class')} 
          style={{ backgroundColor: "black", color: "white", borderRadius: "20px", padding: '10px 20px', cursor: 'pointer', border: 'none' }}
        >
          Add Class
        </button>
      </div>

      {/* GENERATE BUTTON */}
      <button 
        onClick={handleGenerateTimetable} 
        style={{ backgroundColor: "#4CAF50", color: "white", borderRadius: "20px", padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: 'none', marginBottom: '20px' }}
      >
        Generate Timetable
      </button>

      {/* CLASS TIMETABLE DISPLAY */}
      <h3 style={{ textAlign: "center", backgroundColor: "#333", color: 'white', padding: '10px', borderRadius: '5px' }}>Timetable</h3>
      {Object.keys(groupedTimetable).length > 0 ? (
        Object.keys(groupedTimetable).map((className) => (
          <div key={className} style={{ marginBottom: '30px' }}>
            <h4 style={{ backgroundColor: "#9386b9", color: 'white', padding: '10px', borderRadius: '100px', textAlign: 'center' }}>{className}</h4>
            <table style={{
              border: "solid 2px #333",
              borderRadius: "10px",
              margin: "0 auto",
              width: "90%",
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: "2px solid black" }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Subject</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Teacher</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Start Time</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>End Time</th>
                </tr>
              </thead>
              <tbody>
                {groupedTimetable[className].map((entry, index) => {
                  const endTime = calculateEndTime(entry.time, timings.classDuration);
                  return (
                    <React.Fragment key={index}>
                      <tr style={{ backgroundColor: isRecessTime(entry.time) ? '#cce5ff' : 'transparent' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{entry.subject}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{entry.teacher}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{entry.time}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{endTime}</td>
                      </tr>
                      {isRecessStarting(endTime) && (
                        <tr style={{ backgroundColor: '#fff3cd' }}>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold', border: '1px solid #ddd' }}>🍽️ RECESS / BREAK</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <button 
              onClick={() => downloadPDF(groupedTimetable[className], `Timetable_${className}`)} 
              style={{ backgroundColor: "black", color: "white", borderRadius: "20px", padding: '10px 20px', cursor: 'pointer', border: 'none', display: 'block', margin: '10px auto' }}
            >
              Download {className} Timetable as PDF
            </button>
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>No timetable generated yet.</p>
      )}

      <div style={{ borderBottom: '5px solid #333', margin: '30px 0' }}></div>

      {/* TEACHER SCHEDULE DISPLAY */}
      <h3 style={{ textAlign: "center", backgroundColor: "#333", color: 'white', padding: '10px', borderRadius: '5px' }}>Teacher Schedule</h3>
      {Object.keys(teacherSchedule).length > 0 ? (
        Object.keys(teacherSchedule).map((teacherName) => (
          teacherSchedule[teacherName].length > 0 && (
            <div key={teacherName} style={{ marginBottom: '30px' }}>
              <h4 style={{ backgroundColor: "#9386b9", color: 'white', padding: '10px', borderRadius: '100px', textAlign: 'center' }}>{teacherName}</h4>
              <table style={{
                border: "solid 2px #333",
                borderRadius: "10px",
                margin: "0 auto",
                width: "90%",
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0', borderBottom: "2px solid black" }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Class</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Subject</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Start Time</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherSchedule[teacherName].map((entry, index) => {
                    const endTime = calculateEndTime(entry.time, timings.classDuration);
                    return (
                      <React.Fragment key={index}>
                        <tr style={{ backgroundColor: isRecessTime(entry.time) ? '#cce5ff' : 'transparent' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{entry.class}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{entry.subject}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{entry.time}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{endTime}</td>
                        </tr>
                        {isRecessStarting(endTime) && (
                          <tr style={{ backgroundColor: '#fff3cd' }}>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold', border: '1px solid #ddd' }}>🍽️ RECESS / BREAK</td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              <button 
                onClick={() => downloadPDF(teacherSchedule[teacherName], `Schedule_${teacherName}`)} 
                style={{ backgroundColor: "black", color: "white", borderRadius: "20px", padding: '10px 20px', cursor: 'pointer', border: 'none', display: 'block', margin: '10px auto' }}
              >
                Download {teacherName} Schedule as PDF
              </button>
            </div>
          )
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>No schedule generated yet.</p>
      )}

      <div style={{ textAlign: 'center', marginTop: '40px', color: '#666', fontSize: '14px' }}>
        © 2025 Designed and Developed by Girish More.
      </div>
    </div>
  );
};

export default Timetable;
