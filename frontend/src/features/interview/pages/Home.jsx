import React, { useState, useRef } from 'react';
import './home.scss';
import useInterview from '../hooks/useInterview';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const navigate = useNavigate();
    const { loading, generateReport } = useInterview();

    const [jobDescription, setJobDescription]   = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [fileName, setFileName]               = useState('');
    const [error, setError]                     = useState('');

    const fileInputRef = useRef(null);

    // ── Derived ───────────────────────────────────────────────────────────────
    const hasProfile = fileName || selfDescription.trim();
    const canSubmit  = jobDescription.trim() && hasProfile && !loading;

    // ── File handlers ─────────────────────────────────────────────────────────

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setFileName(file.name);
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setFileName('');
        fileInputRef.current.value = '';
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        setError('');
        const resumeFile = fileInputRef.current?.files[0] || null;

        console.log('[Home] Submitting...');
        console.log('[Home] jobDescription length:', jobDescription.length);
        console.log('[Home] selfDescription:', selfDescription);
        console.log('[Home] resumeFile:', resumeFile?.name ?? 'none');

        try {
            const report = await generateReport(jobDescription, selfDescription, resumeFile);
            console.log('[Home] Report received:', report);
            navigate(`/interview/${report._id}`);
        } catch (err) {
            console.error('[Home] Error:', err);
            setError('Something went wrong. Please try again.');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <main className="home-page">

            {/* Header */}
            <header className="home-header">
                <h1 className="home-title">
                    Create Your Custom <span className="accent">Interview Plan</span>
                </h1>
                <p className="home-subtitle">
                    Let our AI analyze the job requirements and your unique profile to build a winning strategy.
                </p>
                <div className="header-sparkle">✦</div>
            </header>

            {/* Error banner */}
            {error && (
                <div className="error-banner">
                    <span>⚠</span> {error}
                </div>
            )}

            {/* Two-Panel Card */}
            <section className="form-card">

                {/* Left — Job Description */}
                <div className="panel panel-left">
                    <div className="panel-header">
                        <span className="panel-icon">💼</span>
                        <h2 className="panel-title">Target Job Description</h2>
                        <span className="badge badge-required">Required</span>
                    </div>

                    <textarea
                        id="jobDescription"
                        className="jd-textarea"
                        placeholder="Paste the full job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />

                    <div className="char-count">{jobDescription.length} chars</div>
                </div>

                {/* Divider */}
                <div className="panel-divider" />

                {/* Right — Profile */}
                <div className="panel panel-right">
                    <div className="panel-header">
                        <span className="panel-icon">👤</span>
                        <h2 className="panel-title">Your Profile</h2>
                    </div>

                    {/* Resume Upload */}
                    <div className="upload-section">
                        <label className="upload-label">
                            Upload Resume
                            <span className="badge badge-recommended">Best Results</span>
                        </label>

                        <div className={`drop-zone ${fileName ? 'has-file' : ''}`}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            {fileName ? (
                                <>
                                    <div className="drop-icon success-icon">✓</div>
                                    <p className="drop-primary">{fileName}</p>
                                    <button className="remove-file-btn" onClick={removeFile}>Remove</button>
                                </>
                            ) : (
                                <>
                                    <div className="drop-icon upload-icon">↑</div>
                                    <p className="drop-primary">Click to upload</p>
                                    <p className="drop-secondary">PDF or DOCX (Max 5MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* OR divider */}
                    <div className="or-divider"><span>OR</span></div>

                    {/* Self Description */}
                    <div className="self-desc-section">
                        <label className="upload-label" htmlFor="selfDescription">
                            Quick Self-Description
                        </label>
                        <textarea
                            id="selfDescription"
                            className="self-desc-textarea"
                            placeholder="Briefly describe your experience and key skills..."
                            value={selfDescription}
                            onChange={(e) => setSelfDescription(e.target.value)}
                        />
                    </div>

                    {/* Info banner — shown when no profile provided */}
                    {!hasProfile && (
                        <div className="info-banner">
                            <span className="info-icon">ℹ</span>
                            <p>A <strong>Resume</strong> or <strong>Self Description</strong> is required.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="form-footer">
                <p className="footer-note">✦ AI-Powered Strategy Generation &nbsp;•&nbsp; Approx 30s</p>
                <button
                    id="generateBtn"
                    className={`generate-btn ${loading ? 'loading' : ''}`}
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <><span className="btn-spinner" /> Generating…</>
                    ) : (
                        <><span className="btn-sparkle">✦</span> Generate My Interview Strategy</>
                    )}
                </button>
            </footer>

        </main>
    );
};

export default Home;