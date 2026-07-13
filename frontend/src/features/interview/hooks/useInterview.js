// ── useInterview Hook ─────────────────────────────────────────────────────────
// This hook is the bridge between the UI and the API.
// Components import THIS — they never import API functions directly.

import { useContext } from 'react';
import { InterviewContext } from '../interview.context';
import {
    generateInterviewReport,
    getInterviewReportById,
    getAllInterviewReports,
    generateResumePdfBlob,
} from '../services/interviewReport.api';

const useInterview = () => {
    const context = useContext(InterviewContext);

    if (!context) {
        throw new Error('useInterview must be used within an InterviewProvider');
    }

    const { interviewReport, setInterviewReport, loading, setLoading, reports, setReports } = context;

    // ── Generate Interview Report ─────────────────────────────────────────────
    // Called from Home.jsx when the user submits the form.

    const generateReport = async (jobDescription, selfDescription, resumeFile) => {
        setLoading(true);
        try {
            const data = await generateInterviewReport(jobDescription, selfDescription, resumeFile);
            setInterviewReport(data.interViewReport);

            // Refresh sidebar history so the new report appears right away
            const all = await getAllInterviewReports();
            setReports(all.interviewReports || []);

            return data.interViewReport;
        } catch (err) {
            console.error('[useInterview] generateReport error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch Single Report ───────────────────────────────────────────────────
    // Called from Interviewreport.jsx on mount to load the report for :id.

    const fetchReportById = async (reportId) => {
        setLoading(true);
        try {
            const data = await getInterviewReportById(reportId);
            setInterviewReport(data.interViewReport);
        } catch (err) {
            console.error('[useInterview] fetchReportById error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch All Reports ─────────────────────────────────────────────────────
    // Called from Sidebar and Reports.jsx to populate the history list.

    const fetchAllReports = async () => {
        try {
            const data = await getAllInterviewReports();
            setReports(data.interviewReports || []);
        } catch (err) {
            console.error('[useInterview] fetchAllReports error:', err);
        }
    };

    // ── Download Resume PDF ───────────────────────────────────────────────────
    // Calls the backend, receives a PDF blob, and triggers a browser download.
    // Returns true on success, false on failure.

    const downloadResumePdf = async (reportId) => {
        setLoading(true);
        try {
            const blob = await generateResumePdfBlob(reportId);

            // Create a temporary link to trigger the download
            const url  = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href     = url;
            link.download = 'resume.pdf';
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            window.URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            console.error('[useInterview] downloadResumePdf error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        interviewReport,
        setInterviewReport,
        loading,
        setLoading,
        reports,
        setReports,
        generateReport,
        fetchReportById,
        fetchAllReports,
        downloadResumePdf,
    };
};

export default useInterview;