import { allCourses, allScholarships } from '../lib/demoContent';
import { Router, Response } from 'express';
export const educationRouter = Router();

educationRouter.get('/courses', (_req, res: Response) => {
  res.json({ success: true, data: allCourses });
});

educationRouter.get('/scholarships', (_req, res: Response) => {
  res.json({ success: true, data: allScholarships });
});
