import { certificatesRepository } from './certificatesRepository.js';

const getUserCertificates = async userId => {
  const certs = await certificatesRepository.getCertificatesByUserId(userId);
  return certs.map(c => ({
    id: c.verification_code,
    dbId: c.id,
    courseSlug: c.courses?.slug,
    courseTitle: c.courses?.title,
    studentName: c.studentName,
    date: c.issued_at
  }));
};

const getCertificateDetail = async code => {
  const cert = await certificatesRepository.getCertificateByCode(code);
  if (!cert) return null;
  return {
    id: cert.verification_code,
    studentName: cert.users?.full_name || cert.users?.email?.split('@')[0] || 'Student',
    courseTitle: cert.courses?.title,
    courseSlug: cert.courses?.slug,
    date: cert.issued_at
  };
};

export const certificatesService = {
  getUserCertificates,
  getCertificateDetail
};