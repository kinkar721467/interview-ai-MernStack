import { useState, useEffect } from 'react';
import { getAllInterviewReports, generateResumePdfBlob } from '../services/interviewReport.api';
import './aipdf.scss';

const AiPdfGenerator = () => {
    const [reports, setReports]       = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading]       = useState(false);
    const [fetching, setFetching]     = useState(true);
    const [success, setSuccess]       = useState(false);
    const [error, setError]           = useState('');

    useEffect(() => {
        getAllInterviewReports()
            .then(data => setReports(data.interviewReports || []))
            .catch(() => setError('Could not load your interview reports.'))
            .finally(() => setFetching(false));
    }, []);

    const selectedReport = reports.find(r => r._id === selectedId);

    const handleGenerate = async () => {
        if (!selectedId || loading) return;
        setError('');
        setSuccess(false);
        setLoading(true);
        try {
            const blob = await generateResumePdfBlob(selectedId);
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `resume-${selectedReport?.title || 'cv'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            console.error('[AiPdfGenerator]', err);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="aipdf-page">

            {/* Header */}
            <div className="aipdf-header">
                <div className="aipdf-header__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9"  y1="15" x2="15" y2="15"/>
                    </svg>
                </div>
                <h1 className="aipdf-header__title">
                    AI Resume <span className="accent">PDF Generator</span>
                </h1>
                <p className="aipdf-header__sub">
                    Select one of your interview reports and let AI craft a tailored,
                    ATS-optimised resume PDF — ready to download in seconds.
                </p>
            </div>

            {/* Card */}
            <div className="aipdf-card">

                {fetching ? (
                    <div className="aipdf-card__loading">
                        <span className="aipdf-spinner aipdf-spinner--lg" />
                        <p>Loading your reports…</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="aipdf-card__empty">
                        <span>📋</span>
                        <p>No interview reports found. Generate one from the Home page first.</p>
                    </div>
                ) : (
                    <>
                        {/* Report selector */}
                        <label className="aipdf-label">Choose an Interview Report</label>
                        <div className="aipdf-select-wrap">
                            <select
                                className="aipdf-select"
                                value={selectedId}
                                onChange={e => { setSelectedId(e.target.value); setError(''); setSuccess(false); }}
                            >
                                <option value="">-- select a report --</option>
                                {reports.map(r => (
                                    <option key={r._id} value={r._id}>
                                        {r.title || 'Untitled'} — {r.matchScore}% match
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selected report info chip */}
                        {selectedReport && (
                            <div className="aipdf-chip">
                                <span className="aipdf-chip__dot" />
                                <span className="aipdf-chip__text">{selectedReport.title || 'Untitled'}</span>
                                <span className="aipdf-chip__score">{selectedReport.matchScore}%</span>
                            </div>
                        )}

                        {/* What the AI will do */}
                        <ul className="aipdf-features">
                            <li><span>✦</span> Tailors bullet points to your job description</li>
                            <li><span>✦</span> Injects ATS keywords from the JD</li>
                            <li><span>✦</span> Formats as a clean, print-ready A4 PDF</li>
                            <li><span>✦</span> Uses action verbs + quantified achievements</li>
                        </ul>

                        {/* Generate button */}
                        <button
                            className={`aipdf-btn ${loading ? 'aipdf-btn--loading' : ''}`}
                            onClick={handleGenerate}
                            disabled={!selectedId || loading}
                        >
                            {loading ? (
                                <>
                                    <span className="aipdf-spinner" />
                                    Generating your resume…
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2.2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="7 10 12 15 17 10"/>
                                        <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                    Generate &amp; Download PDF
                                </>
                            )}
                        </button>

                        {/* Feedback */}
                        {success && (
                            <div className="aipdf-success">
                                ✅ Resume downloaded successfully!
                            </div>
                        )}
                        {error && (
                            <div className="aipdf-error">
                                ⚠️ {error}
                            </div>
                        )}
                    </>
                )}
            </div>

        </main>
    );
};

export default AiPdfGenerator;
