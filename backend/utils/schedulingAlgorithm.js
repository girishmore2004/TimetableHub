const Timetable = require('../models/Timetable');
 
const istToUtc = (date) => {
  const istOffset = 5.5 * 60 * 60 * 1000; 
  return new Date(date.getTime() - istOffset);
};
 
const utcToIst = (date) => {
  const istOffset = 5.5 * 60 * 60 * 1000;  
  return new Date(date.getTime() + istOffset);
};

const generateTimetable = async (teacherData, classData, timings) => {
  if (!teacherData || !classData || !timings) {
    throw new Error('Missing required input data');
  }

  const timetable = [];
  const teacherSchedule = new Map();  
  const classSchedule = new Map();  

  const { opening, closing, recessStart, recessEnd, classDuration } = timings;
 
  const schoolStart = new Date(`1970-01-01T${opening}:00+05:30`);
  const schoolEnd = new Date(`1970-01-01T${closing}:00+05:30`);
  const recessStartTime = new Date(`1970-01-01T${recessStart}:00+05:30`);
  const recessEndTime = new Date(`1970-01-01T${recessEnd}:00+05:30`);
 
  const schoolStartUtc = istToUtc(schoolStart);
  const schoolEndUtc = istToUtc(schoolEnd);
  const recessStartTimeUtc = istToUtc(recessStartTime);
  const recessEndTimeUtc = istToUtc(recessEndTime);
 
  const timeSlots = [];
  let currentTime = new Date(schoolStartUtc);

  while (currentTime < schoolEndUtc) { 
    if (currentTime >= recessStartTimeUtc && currentTime < recessEndTimeUtc) { 
      currentTime = new Date(recessEndTimeUtc);
    } else { 
      timeSlots.push(utcToIst(currentTime).toTimeString().substring(0, 5)); 
      currentTime.setMinutes(currentTime.getMinutes() + classDuration);
    }
  }
 
  teacherData.forEach(teacher => {
    teacherSchedule.set(teacher.name, new Set());  
  });

  classData.forEach(classEntry => {
    classSchedule.set(classEntry.name, new Set());  
  });

  const scheduleClass = (classEntry, subject) => {
    for (const time of timeSlots) {
      const availableTeacher = teacherData.find(teacher =>
        teacher.subjects.includes(subject) &&
        !teacherSchedule.get(teacher.name).has(time)
      );

      const isClassAvailable = !classSchedule.get(classEntry.name).has(time);

      if (availableTeacher && isClassAvailable) {
        timetable.push({
          subject,
          class: classEntry.name,
          teacher: availableTeacher.name,
          time
        });
 
        teacherSchedule.get(availableTeacher.name).add(time);
        classSchedule.get(classEntry.name).add(time);

        return true;
      }
    }
 
    timetable.push({
      subject,
      class: classEntry.name,
      teacher: 'Unscheduled',
      time: 'N/A'
    });

    return false;
  };
 
  for (const classEntry of classData) {
    for (const subject of classEntry.subjects) {
      if (!scheduleClass(classEntry, subject)) {
        console.warn(`Unable to schedule ${subject} for ${classEntry.name}`);
      }
    }
  }
 
  await Timetable.insertMany(timetable);

  return timetable;
};

module.exports = generateTimetable;
