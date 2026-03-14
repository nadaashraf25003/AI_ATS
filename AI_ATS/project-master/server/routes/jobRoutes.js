import express from 'express'
import { getJobById, getJobs, deleteJob } from '../controllers/jobController.js'

const router = express.Router()

// هذا الخاص قبل العام


// جميع الوظائف
router.get('/', getJobs);

// وظيفة واحدة بالـ ID
router.get('/:id', getJobById);

// حذف وظيفة
router.delete('/:id', deleteJob);

export default router;
