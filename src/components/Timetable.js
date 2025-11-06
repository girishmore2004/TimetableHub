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

// Convert HH:MM to total minutes
const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Convert total minutes to HH:MM and ADD 5:30 hrs offset
const minutesToTime = (totalMinutes) => {
  totalMinutes = (totalMinutes + 330) % (24 * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Calculate end time (adding offset)
const calculateEndTime = (startTime, duration) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration;
  return minutesToTime(endMinutes);
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
    classDuration: 30,
  });
  const [loading, setLoading] = useState(false);

  const timeOptions = useMemo(() => generateTimeOptions(0, 23, 15), []);

  // Handle input changes for teacher/class
  const handleInputChange = (type, index, event) => {
    const value = event.target.value;
    const updatedData = [...(type === 'teacher' ? teacherData : classData)];
    const target = updatedData[index];

    if (event.target.name === 'subjects') {
      target.subjects = value.split(',').map(sub => sub.trim());
    } else {
      target[event.target.name] = value;
    }

    if (type === 'teacher') setTeacherData(updatedData);
    else setClassData(updatedData);
  };

  // Delete a row
  const deleteRow = (type, index) => {
    if (type === 'teacher') {
      setTeacherData(teacherData.filter((_, i) => i !== index));
    } else {
      setClassData(classData.filter((_, i) => i !== index));
    }
  };

  // Add a new row for teacher or class
  const addRow = (type) => {
    const newRow = { name: '', subjects: [] };
    if (type === 'teacher') setTeacherData([...teacherData, newRow]);
    else setClassData([...classData, newRow]);
  };

  // Generate timetable via backend API
  const handleGenerateTimetable = async () => {
    if (!timings.opening || !timings.closing || !timings.recessStart || !timings.recessEnd) {
      alert('Please set all school timings before generating the timetable.');
      return;
    }

    setLoading(true);
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

      const styledData = data.map(entry => ({
        ...entry,
        teacher:
          entry.teacher === 'Unscheduled'
            ? <span style={{ color: '#ef4444', fontWeight: '600' }}>Unscheduled</span>
            : entry.teacher,
      }));

      setTimetable(styledData);
    } catch (error) {
      console.error('Error generating timetable:', error.message);
      alert('Failed to generate timetable. Please try again.');
    } finally {
      setLoading(false);
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
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
      );
    }

    return groupedByClass;
  }, [timetable]);

  // Teacher schedule
  const teacherSchedule = useMemo(() => {
    const schedule = teacherData.reduce((acc, teacher) => {
      acc[teacher.name] = timetable
        .filter(entry => entry.teacher === teacher.name)
        .sort(
          (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
        );
      return acc;
    }, {});
    return schedule;
  }, [timetable, teacherData]);

  // Check recess period
  const isRecessTime = (time) => {
    const t = timeToMinutes(time);
    const recessStart = timeToMinutes(timings.recessStart);
    const recessEnd = timeToMinutes(timings.recessEnd);
    return t >= recessStart && t < recessEnd;
  };

  const isRecessStarting = (endTime) => endTime === timings.recessStart;

  // Download PDF (placeholder - requires jsPDF)
  const downloadPDF = (data, filename) => {
    alert('PDF download feature requires jsPDF library to be installed.');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>📚 Timetable Generator</h1>
        <p style={styles.subtitle}>Create and manage school schedules effortlessly</p>
      </div>

      {/* SCHOOL TIMINGS */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⏰ School Timings</h2>
        <div style={styles.timingsGrid}>
          {[
            { key: 'opening', label: 'Opening Time' },
            { key: 'closing', label: 'Closing Time' },
            { key: 'recessStart', label: 'Recess Start' },
            { key: 'recessEnd', label: 'Recess End' }
          ].map(({ key, label }) => (
            <div key={key} style={styles.inputGroup}>
              <label style={styles.label}>{label}</label>
              <select
                style={styles.select}
                value={timings[key]}
                onChange={(e) => setTimings({ ...timings, [key]: e.target.value })}
              >
                <option value="">Select time</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          ))}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Class Duration (min)</label>
            <input
              style={styles.input}
              type="number"
              value={timings.classDuration}
              onChange={(e) =>
                setTimings({
                  ...timings,
                  classDuration: parseInt(e.target.value, 10) || 0,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* TEACHER DATA */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>👨‍🏫 Teacher Information</h2>
        {teacherData.map((teacher, index) => (
          <div key={index} style={styles.dataRow}>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Teacher Name"
              value={teacher.name}
              onChange={(event) => handleInputChange('teacher', index, event)}
            />
            <input
              style={{...styles.input, flex: 2}}
              type="text"
              name="subjects"
              placeholder="Subjects (comma separated)"
              value={teacher.subjects.join(', ')}
              onChange={(event) => handleInputChange('teacher', index, event)}
            />
            <button 
              onClick={() => deleteRow('teacher', index)}
              style={styles.deleteBtn}
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
        <button onClick={() => addRow('teacher')} style={styles.addBtn}>
          ➕ Add Teacher
        </button>
      </div>

      {/* CLASS DATA */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🎓 Class Information</h2>
        {classData.map((classEntry, index) => (
          <div key={index} style={styles.dataRow}>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Class Name"
              value={classEntry.name}
              onChange={(event) => handleInputChange('class', index, event)}
            />
            <input
              style={{...styles.input, flex: 2}}
              type="text"
              name="subjects"
              placeholder="Subjects (comma separated)"
              value={classEntry.subjects.join(', ')}
              onChange={(event) => handleInputChange('class', index, event)}
            />
            <button 
              onClick={() => deleteRow('class', index)}
              style={styles.deleteBtn}
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
        <button onClick={() => addRow('class')} style={styles.addBtn}>
          ➕ Add Class
        </button>
      </div>

      {/* GENERATE BUTTON */}
      <div style={styles.generateSection}>
        <button 
          onClick={handleGenerateTimetable} 
          style={{...styles.generateBtn, opacity: loading ? 0.7 : 1}}
          disabled={loading}
        >
          {loading ? '⏳ Generating...' : '✨ Generate Timetable'}
        </button>
      </div>

      {/* CLASS TIMETABLE DISPLAY */}
      {Object.keys(groupedTimetable).length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📅 Class Timetables</h2>
          {Object.keys(groupedTimetable).map((className) => (
            <div key={className} style={styles.timetableSection}>
              <h3 style={styles.className}>{className}</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Teacher</th>
                      <th style={styles.th}>Start Time</th>
                      <th style={styles.th}>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedTimetable[className].map((entry, index) => {
                      const endTime = calculateEndTime(entry.time, timings.classDuration);
                      return (
                        <React.Fragment key={index}>
                          <tr
                            style={{
                              ...styles.tableRow,
                              backgroundColor: isRecessTime(entry.time)
                                ? '#dbeafe'
                                : index % 2 === 0 ? '#f9fafb' : 'white',
                            }}
                          >
                            <td style={styles.td}>{entry.subject}</td>
                            <td style={styles.td}>{entry.teacher}</td>
                            <td style={styles.td}>{minutesToTime(timeToMinutes(entry.time))}</td>
                            <td style={styles.td}>{endTime}</td>
                          </tr>
                          {isRecessStarting(endTime) && (
                            <tr style={styles.recessRow}>
                              <td colSpan="4" style={styles.recessCell}>
                                ☕ Break Time
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => downloadPDF(groupedTimetable[className], `Timetable_${className}`)}
                style={styles.downloadBtn}
              >
                📥 Download {className} Timetable
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TEACHER SCHEDULE DISPLAY */}
      {Object.keys(teacherSchedule).length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>👥 Teacher Schedules</h2>
          {Object.keys(teacherSchedule).map((teacherName) => (
            teacherSchedule[teacherName].length > 0 && (
              <div key={teacherName} style={styles.timetableSection}>
                <h3 style={styles.teacherName}>{teacherName}</h3>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>Class</th>
                        <th style={styles.th}>Subject</th>
                        <th style={styles.th}>Start Time</th>
                        <th style={styles.th}>End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherSchedule[teacherName].map((entry, index) => {
                        const endTime = calculateEndTime(entry.time, timings.classDuration);
                        return (
                          <React.Fragment key={index}>
                            <tr
                              style={{
                                ...styles.tableRow,
                                backgroundColor: isRecessTime(entry.time)
                                  ? '#dbeafe'
                                  : index % 2 === 0 ? '#f9fafb' : 'white',
                              }}
                            >
                              <td style={styles.td}>{entry.class}</td>
                              <td style={styles.td}>{entry.subject}</td>
                              <td style={styles.td}>{minutesToTime(timeToMinutes(entry.time))}</td>
                              <td style={styles.td}>{endTime}</td>
                            </tr>
                            {isRecessStarting(endTime) && (
                              <tr style={styles.recessRow}>
                                <td colSpan="4" style={styles.recessCell}>
                                  ☕ Break Time
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={() => downloadPDF(teacherSchedule[teacherName], `Schedule_${teacherName}`)}
                  style={styles.downloadBtn}
                >
                  📥 Download {teacherName} Schedule
                </button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '30px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
  },
  mainTitle: {
    fontSize: '2.5rem',
    margin: '0 0 10px 0',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '1.1rem',
    margin: 0,
    opacity: 0.95,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    color: '#1f2937',
    borderBottom: '3px solid #667eea',
    paddingBottom: '10px',
    fontWeight: '600',
  },
  timingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    flex: 1,
  },
  dataRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  addBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '8px',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  generateSection: {
    textAlign: 'center',
    margin: '40px 0',
  },
  generateBtn: {
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 48px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    transition: 'all 0.2s',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    marginBottom: '30px',
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '700',
  },
  timetableSection: {
    marginBottom: '40px',
  },
  className: {
    fontSize: '1.3rem',
    color: '#667eea',
    marginBottom: '16px',
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#ede9fe',
    padding: '12px',
    borderRadius: '8px',
  },
  teacherName: {
    fontSize: '1.3rem',
    color: '#764ba2',
    marginBottom: '16px',
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#fce7f3',
    padding: '12px',
    borderRadius: '8px',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tableHeader: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  tableRow: {
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.95rem',
    color: '#374151',
  },
  recessRow: {
    backgroundColor: '#bfdbfe',
  },
  recessCell: {
    padding: '12px',
    textAlign: 'center',
    fontWeight: '700',
    color: '#1e40af',
    fontSize: '1rem',
  },
  downloadBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'block',
    margin: '0 auto',
    transition: 'background-color 0.2s',
  },
};

export default Timetable;
