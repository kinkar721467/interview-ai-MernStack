import React, { useState, useEffect } from 'react';
import './interviewreport.scss';
import { useParams } from 'react-router-dom';
import useInterview from '../hooks/useInterview';

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_COLOR = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#22c55e',
};

const TABS = [
    { key: 'technical', label: '💻 Technical' },
    { key: 'behavioral', label: '🤝 Behavioral' },
    { key: 'gaps', label: '⚡ Skill Gaps' },
    { key: 'plan', label: '📋 Prep Plan' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScoreRing = ({ score }) => {
    const r = 52;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <svg className="score-ring-svg" viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
                cx="60" cy="60" r={r} fill="none"
                stroke={color} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x="60" y="56" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700">{score}</text>
            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">/ 100</text>
        </svg>
    );
};

const TechCard = ({ item }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`q-card ${open ? 'expanded' : ''}`} onClick={() => setOpen(!open)}>
            <div className="q-card-top">
                <span className="q-label">Q</span>
                <p className="q-text">{item.question}</p>
                <span className="q-chevron">{open ? '▲' : '▼'}</span>
            </div>
            {open && (
                <div className="q-card-body fade-in">
                    <p className="q-answer">{item.idealAnswer}</p>
                    {item.expectedKeyPoints?.length > 0 && (
                        <ul className="key-points">
                            {item.expectedKeyPoints.map((kp, i) => (
                                <li key={i}><span className="kp-dot" /> {kp}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

const BehavCard = ({ item }) => {
    const [open, setOpen] = useState(false);
    const { situation, task, action, result } = item.expectedStarPoints || {};
    return (
        <div className={`q-card ${open ? 'expanded' : ''}`} onClick={() => setOpen(!open)}>
            <div className="q-card-top">
                <span className="q-label beh">B</span>
                <p className="q-text">{item.question}</p>
                <span className="q-chevron">{open ? '▲' : '▼'}</span>
            </div>
            {open && (
                <div className="q-card-body fade-in">
                    <div className="star-grid">
                        {[['S', 'Situation', situation], ['T', 'Task', task], ['A', 'Action', action], ['R', 'Result', result]].map(([letter, label, text]) => (
                            <div key={letter} className="star-item">
                                <span className="star-letter">{letter}</span>
                                <div>
                                    <strong>{label}</strong>
                                    <p>{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Interviewreport = () => {

    const { id } = useParams();  // Get report ID from URL: /interview/:id
    const { interviewReport, fetchReportById, loading } = useInterview();

    const [tab, setTab] = useState('technical');

    // Fetch the report by ID when the page loads
    useEffect(() => {
        if (id) {
            console.log('[Interviewreport] Fetching report for id:', id);
            fetchReportById(id);
        }
    }, [id]);

    // Log the report data for checking
    useEffect(() => {
        if (interviewReport) {
            console.log('[Interviewreport] Report data:', interviewReport);
        }
    }, [interviewReport]);

    // ── Loading state ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <main className="report-page">
                <div style={{ textAlign: 'center', paddingTop: '6rem', color: 'rgba(255,255,255,0.5)' }}>
                    Loading report...
                </div>
            </main>
        );
    }

    // ── No data yet ───────────────────────────────────────────────────────────

    if (!interviewReport) {
        return (
            <main className="report-page">
                <div style={{ textAlign: 'center', paddingTop: '6rem', color: 'rgba(255,255,255,0.5)' }}>
                    No report found.
                </div>
            </main>
        );
    }

    // ── Destructure real data from context ────────────────────────────────────

    const {
        title,
        createdAt,
        matchScore,
        technicalQuestions = [],
        behavioralQuestions = [],
        skillsGaps = [],
        preparationPlans = [],
    } = interviewReport;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <main className="report-page">

            {/* Header */}
            <header className="report-header">
                <div className="report-meta">
                    <span className="report-badge">✦ AI Report</span>
                    {createdAt && (
                        <span className="report-date">
                            {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    )}
                </div>
                <h1 className="report-title">Your <span className="accent">Interview Strategy</span></h1>
                {title && <p className="report-job">{title}</p>}
            </header>

            {/* Score Hero */}
            <section className="score-hero">
                <div className="score-hero-ring">
                    <ScoreRing score={matchScore} />
                    <div className="score-hero-text">
                        <h2>Profile Match Score</h2>
                        <p>
                            {matchScore >= 80
                                ? 'Strong match! Focus on depth and storytelling.'
                                : matchScore >= 60
                                    ? 'Good foundation. Address the gaps below.'
                                    : 'Gap exists. Follow the prep plan carefully.'}
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="quick-stats">
                    <div className="stat-pill">
                        <span className="stat-num">{technicalQuestions.length}</span>
                        <span className="stat-name">Technical Qs</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">{behavioralQuestions.length}</span>
                        <span className="stat-name">Behavioral Qs</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">{skillsGaps.length}</span>
                        <span className="stat-name">Skills Gaps</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">{preparationPlans.length}</span>
                        <span className="stat-name">Prep Steps</span>
                    </div>
                </div>
            </section>

            {/* Tab Bar */}
            <nav className="report-tabs">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            {/* Tab Panels */}
            <div className="tab-content">

                {tab === 'technical' && (
                    <div className="tab-panel fade-in">
                        <p className="panel-hint">Click any question to reveal the ideal answer and key points.</p>
                        <div className="q-list">
                            {technicalQuestions.map((q, i) => (
                                <TechCard key={i} item={q} />
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'behavioral' && (
                    <div className="tab-panel fade-in">
                        <p className="panel-hint">Each question includes a STAR framework guide.</p>
                        <div className="q-list">
                            {behavioralQuestions.map((q, i) => (
                                <BehavCard key={i} item={q} />
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'gaps' && (
                    <div className="tab-panel fade-in">
                        <p className="panel-hint">Areas where your profile diverges from the job requirements.</p>
                        <div className="gaps-list">
                            {skillsGaps.map((g, i) => (
                                <div key={i} className="gap-card">
                                    <div className="gap-severity-bar" style={{ background: SEVERITY_COLOR[g.severity] }} />
                                    <div className="gap-body">
                                        <div className="gap-header">
                                            <span className="gap-skill">{g.skill}</span>
                                            <span
                                                className="gap-severity-badge"
                                                style={{
                                                    color: SEVERITY_COLOR[g.severity],
                                                    borderColor: SEVERITY_COLOR[g.severity],
                                                    background: SEVERITY_COLOR[g.severity] + '18',
                                                }}
                                            >
                                                {g.severity} Severity
                                            </span>
                                        </div>
                                        <p className="gap-desc">{g.gapDescription}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'plan' && (
                    <div className="tab-panel fade-in">
                        <p className="panel-hint">Follow these steps in order to maximise your preparation.</p>
                        <div className="plan-list">
                            {[...preparationPlans]
                                .sort((a, b) => a.stepOrder - b.stepOrder)
                                .map((step, i) => (
                                    <div key={i} className="plan-step">
                                        <div className="step-number">{step.stepOrder}</div>
                                        <div className="step-body">
                                            <p className="step-action">{step.actionItem}</p>
                                            {step.recommendedResources?.length > 0 && (
                                                <div className="step-resources">
                                                    {step.recommendedResources.map((r, j) => (
                                                        <span key={j} className="resource-chip">{r}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="report-footer">
                <p className="footer-note">✦ Powered by AI &nbsp;•&nbsp; Personalized just for you</p>
            </footer>

        </main>
    );
};

export default Interviewreport;
