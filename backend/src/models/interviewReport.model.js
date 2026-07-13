const mongoose = require("mongoose");


// ── Interview Report Schema ──
// This is the main schema that stores everything:
// 1. User inputs (job description, resume, self description)
// 2. AI-generated data (matchScore, questions, gaps, plans)


const interviewReportSchema = new mongoose.Schema({

    //user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },


    // Report title
    title: { type: String, default: "Untitled Report" },

    // ── User Inputs ──
    jobDescription: { type: String, required: true },
    resumeText:     { type: String, default: '' },     // optional — not always provided
    selfDescription:{ type: String, default: '' },     // optional — not always provided

    // ── AI Generated Data ──
    matchScore: { type: Number, min: 0, max: 100, required: true },

    technicalQuestions: [
        {
            question: { type: String, required: true },
            idealAnswer: { type: String, required: true },
            category: {
                type: String,
                enum: ["Algorithmic", "Conceptual", "System Design"],
                default: "Conceptual",
            },
            difficulty: {
                type: String,
                enum: ["Easy", "Medium", "Hard"],
                default: "Medium",
            },
            expectedKeyPoints: [String],
            _id: false,
        },
    ],

    behavioralQuestions: [
        {
            question: { type: String, required: true },
            targetCompetency: String,
            expectedStarPoints: {
                situation: String,
                task: String,
                action: String,
                result: String,
            },
            _id: false,
        },
    ],

    skillsGaps: [
        {
            skill: { type: String, required: true },
            gapDescription: { type: String, required: true },
            severity: {
                type: String,
                enum: ["Low", "Medium", "High"],
                default: "Medium",
            },
            _id: false,
        },
    ],

    preparationPlans: [
        {
            stepOrder: { type: Number, required: true },
            actionItem: { type: String, required: true },
            recommendedResources: [String],
            _id: false,
        },
    ],

}, { timestamps: true });


module.exports = mongoose.model("InterviewReport", interviewReportSchema);