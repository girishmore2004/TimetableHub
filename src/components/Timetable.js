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
            ? <span style={{ color: '#ef4444' }}>Unscheduled</span>
            : entry.teacher,
      }));

      setTimetable(styledData);
    } catch (error) {
      console.error('Error generating timetable:', error.message);
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

  // Download PDF (placeholder - jsPDF not available)
  const downloadPDF = (data, filename) => {
    alert(`PDF download functionality requires jsPDF library. Filename: ${filename}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl">🏫</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Timetable Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Create organized schedules for teachers and classes</p>
        </div>

        {/* School Timings Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🕐</span>
            <h2 className="text-2xl font-bold text-gray-800">School Timings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['opening', 'closing', 'recessStart', 'recessEnd'].map(timeType => (
              <div key={timeType}>
                <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                  {timeType.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  value={timings[timeType]}
                  onChange={(e) => setTimings({ ...timings, [timeType]: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                >
                  <option value="">Select time</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class Duration (minutes)
              </label>
              <input
                type="number"
                name="classDuration"
                value={timings.classDuration}
                onChange={(e) =>
                  setTimings({
                    ...timings,
                    classDuration: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Teacher Data Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">👨‍🏫</span>
            <h2 className="text-2xl font-bold text-gray-800">Teacher Data</h2>
          </div>
          <div className="space-y-4">
            {teacherData.map((teacher, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-2xl">
                <input
                  type="text"
                  name="name"
                  placeholder="Teacher Name"
                  value={teacher.name}
                  onChange={(event) => handleInputChange('teacher', index, event)}
                  className="px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                />
                <input
                  type="text"
                  name="subjects"
                  placeholder="Subjects (comma separated)"
                  value={teacher.subjects.join(', ')}
                  onChange={(event) => handleInputChange('teacher', index, event)}
                  className="px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => addRow('teacher')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            <span className="text-xl">➕</span>
            Add Teacher
          </button>
        </div>

        {/* Class Data Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-pink-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📚</span>
            <h2 className="text-2xl font-bold text-gray-800">Class Data</h2>
          </div>
          <div className="space-y-4">
            {classData.map((classEntry, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-pink-50 rounded-2xl">
                <input
                  type="text"
                  name="name"
                  placeholder="Class Name"
                  value={classEntry.name}
                  onChange={(event) => handleInputChange('class', index, event)}
                  className="px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                />
                <input
                  type="text"
                  name="subjects"
                  placeholder="Subjects (comma separated)"
                  value={classEntry.subjects.join(', ')}
                  onChange={(event) => handleInputChange('class', index, event)}
                  className="px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => addRow('class')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            <span className="text-xl">➕</span>
            Add Class
          </button>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleGenerateTimetable}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-lg font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all"
          >
            <span className="text-2xl">📅</span>
            Generate Timetable
          </button>
        </div>

        {/* Class Timetable Display */}
        {Object.keys(groupedTimetable).length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Class Timetables</h2>
            <div className="space-y-8">
              {Object.keys(groupedTimetable).map((className) => (
                <div key={className} className="bg-white rounded-3xl shadow-xl p-8 border border-indigo-100">
                  <h3 className="text-2xl font-bold text-center mb-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full inline-block">
                    {className}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-100 to-purple-100">
                          <th className="px-6 py-4 text-left font-bold text-gray-700 rounded-tl-2xl">Subject</th>
                          <th className="px-6 py-4 text-left font-bold text-gray-700">Teacher</th>
                          <th className="px-6 py-4 text-left font-bold text-gray-700">Start Time</th>
                          <th className="px-6 py-4 text-left font-bold text-gray-700 rounded-tr-2xl">End Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedTimetable[className].map((entry, index) => {
                          const endTime = calculateEndTime(entry.time, timings.classDuration);
                          return (
                            <React.Fragment key={index}>
                              <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isRecessTime(entry.time) ? 'bg-blue-50' : ''}`}>
                                <td className="px-6 py-4 font-medium text-gray-800">{entry.subject}</td>
                                <td className="px-6 py-4 text-gray-700">{entry.teacher}</td>
                                <td className="px-6 py-4 text-gray-700">{minutesToTime(timeToMinutes(entry.time))}</td>
                                <td className="px-6 py-4 text-gray-700">{endTime}</td>
                              </tr>
                              {isRecessStarting(endTime) && (
                                <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                                  <td colSpan="4" className="px-6 py-4 text-center font-bold text-blue-800">
                                    🍽️ Break Time
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
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all mx-auto"
                  >
                    <span className="text-xl">📥</span>
                    Download {className} Timetable
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Schedule Display */}
        {Object.keys(teacherSchedule).length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Teacher Schedules</h2>
            <div className="space-y-8">
              {Object.keys(teacherSchedule).map((teacherName) => (
                <div key={teacherName} className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
                  <h3 className="text-2xl font-bold text-center mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full inline-block">
                    {teacherName}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-100 to-pink-100">
                          <th className="px-6 py-4 text-left font-bold text-gray-700 rounded-tl-2xl">Class</th>
                          <th className="px-6 py-4 text-left font-bold text-gray-700">Subject</th>
                          <th className="px-6 py-4 text-left font-bold text-gray-700">Start Time</th>
                          <th className="px-6 py-4 text-left font-bold text-gray-700 rounded-tr-2xl">End Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherSchedule[teacherName].map((entry, index) => {
                          const endTime = calculateEndTime(entry.time, timings.classDuration);
                          return (
                            <React.Fragment key={index}>
                              <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isRecessTime(entry.time) ? 'bg-blue-50' : ''}`}>
                                <td className="px-6 py-4 font-medium text-gray-800">{entry.class}</td>
                                <td className="px-6 py-4 text-gray-700">{entry.subject}</td>
                                <td className="px-6 py-4 text-gray-700">{minutesToTime(timeToMinutes(entry.time))}</td>
                                <td className="px-6 py-4 text-gray-700">{endTime}</td>
                              </tr>
                              {isRecessStarting(endTime) && (
                                <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                                  <td colSpan="4" className="px-6 py-4 text-center font-bold text-blue-800">
                                    🍽️ Break Time
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
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all mx-auto"
                  >
                    <span className="text-xl">📥</span>
                    Download {teacherName} Schedule
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(groupedTimetable).length === 0 && (
          <div className="text-center py-16">
            <span className="text-9xl block mb-4">📅</span>
            <p className="text-xl text-gray-500">No timetable generated yet. Fill in the details and click Generate!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
