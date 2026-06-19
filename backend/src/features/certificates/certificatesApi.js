import { Router } from 'express'
import { certificatesController } from './certificatesController.js'

const certificatesApi = Router();
certificatesApi.get('/my', certificatesController.getMyCertificates);
certificatesApi.get('/:code', certificatesController.getCertificateByCode);

export { certificatesApi };
