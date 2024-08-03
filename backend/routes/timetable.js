const express = require('express');
const generateTimetable = require('../utils/schedulingAlgorithm');
const Timetable = require('../models/Timetable');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

const router = express.Router();
 
router.post('/generate', async (req, res) => {
  try {
    const { teacherData, classData, timings } = req.body;
 
    if (!teacherData || !Array.isArray(teacherData)) {
      return res.status(400).json({ error: 'Invalid teacherData' });
    }
    if (!classData || !Array.isArray(classData)) {
      return res.status(400).json({ error: 'Invalid classData' });
    }
    if (!timings || typeof timings !== 'object') {
      return res.status(400).json({ error: 'Invalid timings' });
    }

    const timetable = await generateTimetable(teacherData, classData, timings);
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 
router.get('/', async (req, res) => {
  try {
    const timetable = await Timetable.find({});
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve timetable' });
  }
});

module.exports = router;
