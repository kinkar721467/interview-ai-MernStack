const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interViewReportModel = require("../models/interviewReport.model");
const userModel = require("../models/user.model");

/**
 * @route POST /api/interview/
 * @description Generates an interview report.
 *              Resume is optional — selfDescription alone is also accepted.
 * @access private
 */
async function interviewReportController(req, res) {
    const { selfDescription, jobDescription } = req.body;
    const resumeFile = req.file; // may be undefined if no file was uploaded

    try {
        // Parse resume PDF if provided, otherwise use empty string
        let resumeContent = '';
        if (resumeFile && resumeFile.buffer) {
            const parsed = await pdfParse(resumeFile.buffer);
            resumeContent = parsed.text || '';
        }

        // Call AI service
        const interviewReportByAi = await generateInterviewReport(
            jobDescription,
            resumeContent,
            selfDescription
        );

        // Save to database
        const interViewReport = await interViewReportModel.create({
            userId: req.user.id,
            jobDescription,
            selfDescription: selfDescription || '',
            resumeText: resumeContent || 'N/A',
            ...interviewReportByAi
        });

        return res.status(200).json({
            message: "Interview report generated successfully",
            interViewReport
        });

    } catch (err) {
        console.error('[interviewReportController] Error:', err);
        return res.status(500).json({ message: "Failed to generate interview report", error: err.message });
    }
}

/**
 * @route GET /api/interview/report/:id
 * @description Retrieves an interview report by its ID.
 * @access private
 */
async function getInterviewReportById(req, res) {
    try {
        const { id } = req.params;
        const interViewReport = await interViewReportModel.findById(id);

        if (!interViewReport) {
            return res.status(404).json({ message: "Interview report not found" });
        }

        return res.status(200).json({ interViewReport });
    } catch (err) {
        console.error('[getInterviewReportById] Error:', err);
        return res.status(500).json({ message: "Failed to fetch report" });
    }
}

/**
 * @route GET /api/interview/
 * @description Retrieves all interview reports for the logged-in user.
 * @access private
 */
async function getAllInterviewReports(req, res) {
    try {
        const interviewReports = await interViewReportModel
            .find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select("title matchScore createdAt");   // only what the sidebar needs

        return res.status(200).json({ interviewReports });
    } catch (err) {
        console.error('[getAllInterviewReports] Error:', err);
        return res.status(500).json({ message: "Failed to fetch reports" });
    }
}

/**
 * @description Generates a PDF from the provided HTML content.
 */

async function generatePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await interViewReportModel.findById(interviewReportId);
    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    // Use authenticated user first, fall back to the report's owner
    const userId = req.user?.id || interviewReport.userId;
    const user   = userId ? await userModel.findById(userId).lean() : null;
    const userData = user ? { username: user.username, email: user.email } : null;

    const { resumeText, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resumeText,
      jobDescription,
      selfDescription,
      userData,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="resume.pdf"');
    return res.send(pdfBuffer);

  } catch (err) {
    console.error("[generatePdfController]", err.message);
    return res.status(500).json({ message: "Failed to generate CV PDF", error: err.message });
  }
}

module.exports = { interviewReportController, getInterviewReportById, getAllInterviewReports, generatePdfController };
