const Groq = require("groq-sdk");
const puppeteer = require("puppeteer");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * generateInterviewReport
 */
async function generateInterviewReport(jobDescription, resumeText, selfDescription) {
  const prompt = `
  You are an expert Technical Interviewer and Career Coach.

  Analyze the following information and generate an interview preparation report.

  --- JOB DESCRIPTION ---
  ${jobDescription}

  --- CANDIDATE RESUME ---
  ${resumeText}

  --- CANDIDATE SELF DESCRIPTION ---
  ${selfDescription}

  Return ONLY a valid JSON object with this EXACT structure:
  {
    "matchScore": <number between 0-100>,
    "title": "<string>",
    "technicalQuestions": [
      {
        "question": "<string>",
        "idealAnswer": "<string>",
        "category": "<one of: Algorithmic, Conceptual, System Design>",
        "difficulty": "<one of: Easy, Medium, Hard>",
        "expectedKeyPoints": ["<string>", "<string>"]
      }
    ],
    "behavioralQuestions": [
      {
        "question": "<string>",
        "targetCompetency": "<string>",
        "expectedStarPoints": {
          "situation": "<string>",
          "task": "<string>",
          "action": "<string>",
          "result": "<string>"
        }
      }
    ],
    "skillsGaps": [
      {
        "skill": "<string>",
        "gapDescription": "<string>",
        "severity": "<one of: Low, Medium, High>"
      }
    ],
    "preparationPlans": [
      {
        "stepOrder": <number starting from 1>,
        "actionItem": "<string>",
        "recommendedResources": ["<string>", "<string>"]
      }
    ]
  }

  Generate 5-6 items for each array. Return ONLY the JSON, no extra text.
  `;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an expert interview coach. Always respond with valid JSON only. No markdown, no extra text." },
        { role: "user", content: prompt },
      ],
    });
    const rawResponse = completion.choices[0].message.content;
    return JSON.parse(rawResponse);
  } catch (err) {
    console.error("Error generating interview report:", err.message);
    throw err;
  }
}

// Convert HTML string to PDF buffer via Puppeteer
async function generateHtmlToPdf(html) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  await browser.close();
  return pdf;
}

// Build a professional, ATS-optimised resume HTML from structured JSON
function buildResumeHtml(data) {
  const {
    name, email, phone, linkedin, github, summary,
    skills, projects, experience, training,
    certificates, achievements, education,
  } = data;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const esc = (s = "") =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const short = (url = "", pattern) =>
    esc(String(url).replace(pattern, ""));

  const shortLinkedin = (u) => short(u, /^https?:\/\/(www\.)?linkedin\.com\/in\//i);
  const shortGithub   = (u) => short(u, /^https?:\/\/(www\.)?github\.com\//i);

  // Bulleted list (accepts pre-escaped strings too)
  const bulletList = (arr = []) =>
    arr.length
      ? `<ul class="blist">${arr.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
      : "";

  // Title-row with right-aligned date
  const entryRow = (titleHtml, date) =>
    `<div class="e-row"><span class="e-title">${titleHtml}</span><span class="e-date">${esc(date)}</span></div>`;

  // Two-column row (used for certs, achievements, edu lines)
  const twoRow = (leftHtml, right) =>
    `<div class="tworow"><span>${leftHtml}</span><span class="e-date">${esc(right)}</span></div>`;

  // Section wrapper — omitted if empty
  const sec = (heading, html) =>
    (html || "").trim()
      ? `<div class="section"><div class="sec-head">${heading}</div>${html}</div>`
      : "";

  // ── Section renderers ────────────────────────────────────────────────────
  const skillsHtml = (skills || [])
    .map((s) => `<tr><td class="sk-cat">${esc(s.category)}:</td><td class="sk-val">${esc((s.items || []).join(", "))}</td></tr>`)
    .join("");

  const summaryHtml = summary
    ? `<p class="summary">${esc(summary)}</p>`
    : "";

  const experienceHtml = (experience || [])
    .map((e) => `<div class="entry">
      ${entryRow(`${esc(e.company)}${e.role ? ` &mdash; <span class="e-role">${esc(e.role)}</span>` : ""}`, e.date)}
      ${e.location ? `<div class="e-sub">${esc(e.location)}</div>` : ""}
      ${bulletList(e.bullets)}
    </div>`)
    .join("");

  const projectsHtml = (projects || [])
    .map((p) => {
      const bArr = [...(p.bullets || [])];
      if (p.techStack) bArr.push(`Tech Stack: ${p.techStack}`);
      return `<div class="entry">
        ${entryRow(`${esc(p.title)}${p.githubUrl ? ` &mdash; <a href="${esc(p.githubUrl)}">GitHub</a>` : ""}`, p.date)}
        ${bulletList(bArr)}
      </div>`;
    })
    .join("");

  const trainingHtml = (training || [])
    .map((t) => `<div class="entry">
      ${entryRow(`${esc(t.title)}${t.provider ? ` | <a href="#">${esc(t.provider)}</a>` : ""}`, t.date)}
      ${bulletList(t.bullets)}
    </div>`)
    .join("");

  const certificatesHtml = (certificates || [])
    .map((c) => twoRow(`${esc(c.title)}${c.issuer ? ` | <em>${esc(c.issuer)}</em>` : ""}`, c.date))
    .join("");

  const achievementsHtml = (achievements || [])
    .map((a) => twoRow(esc(a.text), a.date))
    .join("");

  const educationHtml = (education || [])
    .map((e) => `<div class="edu">
      ${twoRow(`<strong class="edu-inst">${esc(e.institution)}</strong>`, e.location)}
      ${twoRow(esc(e.degree), e.date)}
    </div>`)
    .join("");

  // Contact bar items (only non-empty)
  const contacts = [
    phone    && `<span><strong>&#128222;</strong> ${esc(phone)}</span>`,
    email    && `<span><strong>&#9993;</strong> ${esc(email)}</span>`,
    linkedin && `<span><strong>LinkedIn:</strong> <a href="${esc(linkedin)}">${shortLinkedin(linkedin)}</a></span>`,
    github   && `<span><strong>GitHub:</strong> <a href="${esc(github)}">${shortGithub(github)}</a></span>`,
  ].filter(Boolean).join('<span class="dot">&bull;</span>');

  // ── HTML Template ────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${esc(name)} - Resume</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4 portrait; margin: 0; }

  html, body {
    width: 210mm;
    font-family: 'Times New Roman', Times, serif;
    font-size: 9.8pt;
    line-height: 1.4;
    color: #111;
    background: #fff;
  }
  a { color: #0d3f6e; text-decoration: none; }

  .page { width: 210mm; padding: 10mm 14mm 10mm 14mm; }

  /* ── HEADER ── */
  .cv-name {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 20pt;
    font-weight: 700;
    color: #0d3f6e;
    text-align: center;
    letter-spacing: 0.5pt;
    line-height: 1;
    margin-bottom: 4pt;
  }

  .contact-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0;
    font-size: 8.4pt;
    border-top: 1.8pt solid #0d3f6e;
    border-bottom: 1.8pt solid #0d3f6e;
    padding: 2.5pt 0;
    margin-bottom: 4pt;
    line-height: 1.5;
    color: #111;
  }
  .contact-bar span { padding: 0 5pt; }
  .contact-bar .dot { color: #0d3f6e; font-weight: 700; padding: 0 1pt; }
  .contact-bar a { color: #111; }

  /* ── SUMMARY ── */
  .summary {
    font-size: 9.3pt;
    line-height: 1.45;
    color: #222;
    margin-bottom: 1pt;
    text-align: justify;
  }

  /* ── SECTIONS ── */
  .section { margin-top: 6pt; }
  .sec-head {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.6pt;
    font-weight: 700;
    color: #0d3f6e;
    text-transform: uppercase;
    letter-spacing: 0.6pt;
    border-bottom: 1pt solid #0d3f6e;
    padding-bottom: 1pt;
    margin-bottom: 4pt;
  }

  /* ── SKILLS ── */
  table.sk { width: 100%; border-collapse: collapse; }
  .sk-cat {
    font-weight: 700;
    color: #0d3f6e;
    white-space: nowrap;
    vertical-align: top;
    width: 110pt;
    padding-right: 8pt;
    padding-bottom: 2pt;
    font-size: 9.2pt;
  }
  .sk-val { font-size: 9.2pt; padding-bottom: 2pt; line-height: 1.4; }

  /* ── ENTRIES ── */
  .entry { margin-bottom: 5.5pt; }
  .entry:last-child { margin-bottom: 0; }

  .e-row { display: flex; justify-content: space-between; align-items: baseline; gap: 6pt; }
  .e-title { font-weight: 700; color: #0d3f6e; font-size: 9.5pt; flex: 1; }
  .e-title a { color: #0d3f6e; }
  .e-role { font-weight: 400; font-style: italic; color: #333; font-size: 9.2pt; }
  .e-date {
    font-size: 8.3pt;
    white-space: nowrap;
    color: #444;
    font-style: italic;
    flex-shrink: 0;
  }
  .e-sub { font-size: 8.4pt; color: #555; margin-top: 0.5pt; margin-bottom: 1pt; font-style: italic; }

  /* ── BULLETS ── */
  .blist { list-style: disc; padding-left: 14pt; margin-top: 2pt; }
  .blist li { font-size: 9.2pt; margin-bottom: 2pt; line-height: 1.35; }

  /* ── TWO-COLUMN ROWS ── */
  .tworow {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9.2pt;
    margin-bottom: 2pt;
    gap: 6pt;
  }
  .tworow:last-child { margin-bottom: 0; }

  /* ── EDUCATION ── */
  .edu { margin-bottom: 4pt; }
  .edu:last-child { margin-bottom: 0; }
  .edu-inst { font-size: 9.5pt; color: #0d3f6e; }
</style>
</head>
<body>
<div class="page">

  <div class="cv-name">${esc(name)}</div>
  <div class="contact-bar">${contacts}</div>

  ${sec("Professional Summary", summaryHtml)}
  ${sec("Skills", skillsHtml ? `<table class="sk"><tbody>${skillsHtml}</tbody></table>` : "")}
  ${sec("Experience", experienceHtml)}
  ${sec("Projects", projectsHtml)}
  ${sec("Training", trainingHtml)}
  ${sec("Certifications", certificatesHtml)}
  ${sec("Achievements", achievementsHtml)}
  ${sec("Education", educationHtml)}

</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Generate a tailored, ATS-optimised PDF resume
// ---------------------------------------------------------------------------
async function generateResumePdf({
  companyName = "the target company",
  jobDescription,
  resumeText,
  selfDescription,
  userData,
}) {
  const name  = userData?.username || "Candidate Name";
  const email = userData?.email    || "candidate@email.com";

  const prompt = `You are a senior ATS Resume Writer and Technical Recruiter with 15+ years of experience.
Your task: extract every detail from the candidate's resume, then rewrite and optimise the content to maximise ATS score and relevance for the target role.

━━━ CANDIDATE ━━━
Name : ${name}
Email: ${email}

━━━ TARGET COMPANY ━━━
${companyName}

━━━ JOB DESCRIPTION ━━━
${jobDescription}

━━━ EXISTING RESUME ━━━
${resumeText}

━━━ CANDIDATE SELF DESCRIPTION ━━━
${selfDescription}

━━━ STRICT RULES ━━━
1. EXTRACT — pull every section present: skills, experience, projects, training, certificates, achievements, education. Do NOT omit anything.
2. NO FABRICATION — only use facts explicitly stated in the resume or self description. Never invent metrics, dates, or roles.
3. TAILOR — rewrite bullet points to mirror keywords and phrases from the job description. Use exact terminology from the JD where truthful.
4. BULLET QUALITY — every bullet must: start with a strong past-tense action verb (Led, Built, Reduced, Designed…), include a quantifiable result or impact where available (e.g., "reduced latency by 30%"), and stay under 25 words.
5. SKILLS ORDER — list the most JD-relevant skill categories first.
6. SUMMARY — write a 2-sentence professional summary that mentions the candidate's strongest relevant skill, years of experience (if present), and the target company name.
7. TRAINING BULLETS — for each training entry, extract 2–4 specific technical skills or concepts learned, written as concise phrases.
8. LINKS — linkedin and github must be full URLs (https://…). Set to null if not found.
9. EMPTY FIELDS — use null for missing scalars, [] for missing arrays.

━━━ OUTPUT FORMAT ━━━
Return ONLY valid JSON — no markdown fences, no commentary:
{
  "name": "${name}",
  "email": "${email}",
  "phone": "<phone or null>",
  "linkedin": "<https://… or null>",
  "github": "<https://… or null>",
  "summary": "<2-sentence summary mentioning ${companyName}>",
  "skills": [
    { "category": "<category name>", "items": ["<skill>", "..."] }
  ],
  "experience": [
    {
      "company": "<company>",
      "role": "<job title>",
      "location": "<City, Country>",
      "date": "<Month YYYY – Month YYYY>",
      "bullets": ["<action verb + achievement + impact>"]
    }
  ],
  "projects": [
    {
      "title": "<project name>",
      "githubUrl": "<https://… or null>",
      "date": "<Month YYYY – Month YYYY or null>",
      "bullets": ["<concise achievement>"],
      "techStack": "<comma-separated technologies>"
    }
  ],
  "training": [
    {
      "title": "<course or program name>",
      "provider": "<provider or null>",
      "date": "<Month YYYY or YYYY or null>",
      "bullets": ["<specific skill/concept learned>"]
    }
  ],
  "certificates": [
    { "title": "<certificate name>", "issuer": "<issuing body>", "date": "<Month YYYY or YYYY>" }
  ],
  "achievements": [
    { "text": "<achievement description>", "date": "<date or empty string>" }
  ],
  "education": [
    {
      "institution": "<university / college name>",
      "location": "<City, Country>",
      "degree": "<Degree, Major — CGPA: X.XX / 4.0 (if available)>",
      "date": "<Month YYYY – Month YYYY>"
    }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a world-class ATS resume writer. Always respond with valid, complete JSON only — no markdown, no explanations. Every field must be present.",
        },
        { role: "user", content: prompt },
      ],
    });

    const resumeData = JSON.parse(completion.choices[0].message.content.trim());
    const html       = buildResumeHtml(resumeData);
    return await generateHtmlToPdf(html);

  } catch (err) {
    console.error("generateResumePdf error:", err.message);
    throw err;
  }
}

module.exports = { generateResumePdf, generateInterviewReport };
