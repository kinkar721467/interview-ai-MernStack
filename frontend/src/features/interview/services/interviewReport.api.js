// ── Interview Report API ──────────────────────────────────────────────────────

import api from '../../../lib/api';

/**
 * POST /api/interview/
 * Generates a new interview report.
 * Accepts a job description, optional resume file, and optional self-description.
 */
export const generateInterviewReport = async (jobDescription, selfDescription, resumeFile) => {
    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    formData.append('selfDescription', selfDescription);
    if (resumeFile) formData.append('resume', resumeFile);

    const response = await api.post('/api/interview/', formData);
    return response.data;
};

/**
 * GET /api/interview/report/:id
 * Returns a single interview report by its MongoDB _id.
 */
export const getInterviewReportById = async (reportId) => {
    const response = await api.get(`/api/interview/report/${reportId}`);
    return response.data;
};

/**
 * GET /api/interview/
 * Returns all interview reports for the logged-in user (title, matchScore, date only).
 */
export const getAllInterviewReports = async () => {
    const response = await api.get('/api/interview/');
    return response.data;
};

/**
 * GET /api/interview/resume/pdf/:interviewReportId
 * Asks the backend to generate a PDF resume and returns it as a Blob.
 * The caller can create an object URL and trigger a download.
 */
export const generateResumePdfBlob = async (interviewReportId) => {
    const response = await api.get(`/api/interview/resume/pdf/${interviewReportId}`, {
        responseType: 'blob',   // <-- tells axios to return raw binary data
    });
    return response.data;       // this is a Blob
};