import { allHealthSchemes, allHospitals } from '../lib/demoContent';
import { Router, Response } from 'express';
export const healthcareRouter = Router();

healthcareRouter.get('/hospitals', (_req, res: Response) => {
  res.json({ success: true, data: allHospitals });
});

healthcareRouter.get('/schemes', (_req, res: Response) => {
  res.json({ success: true, data: allHealthSchemes });
});
