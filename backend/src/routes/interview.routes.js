const express = require("express");
const {authUser} = require("../middlewares/auth.middleware");
const {interviewReportController,getInterviewReportById,getAllInterviewReports,generatePdfController} = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interViewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description Generates an interview report based on job description, resume, and self description.
 * @access private
 */

interViewRouter.post('/',authUser,upload.single("resume"),interviewReportController);

/**
 * @route GET /api/interview/report/:id
 * @description Retrieves an interview report by its ID.
 * @access private
 */

interViewRouter.get('/report/:id',authUser,getInterviewReportById);

/**
 * @route GET /api/interview/
 * @description Retrieves all interview reports for the authenticated user.
 * @access private
 */

interViewRouter.get('/',authUser,getAllInterviewReports);

/**
 * @route GET /api/interview/resume/pdf/:interviewReportId
 * @route GET /api/interview/resume/pdf/:interviewReportId/:userId
 * @description Generates a PDF from the provided HTML content.
 * @access private
 */

interViewRouter.get('/resume/pdf/:interviewReportId', authUser, generatePdfController);


module.exports = interViewRouter;
