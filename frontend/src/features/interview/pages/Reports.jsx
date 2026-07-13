import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useInterview from '../hooks/useInterview';
import './reports.scss';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'mid';
    return 'low';
};

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

// ─── Reports List Page ────────────────────────────────────────────────────────

const Reports = () => {
    const { reports, fetchAllReports, loading } = useInterview();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllReports();
    }, []);

    return (
        <main className="reports-page">

            {/* Header */}
            <header className="reports-header">
                <h1 className="reports-title">
                    Your <span className="accent">Interview Reports</span>
                </h1>
                <p className="reports-subtitle">
                    Click any report to view your full interview preparation analysis.
                </p>
            </header>

            {/* Loading */}
            {loading && (
                <div className="reports-loading">Loading reports…</div>
            )}

            {/* Empty state */}
            {!loading && reports.length === 0 && (
                <div className="reports-empty">
                    <div className="empty-icon">📋</div>
                    <p className="empty-title">No reports yet</p>
                    <p className="empty-desc">
                        Generate your first interview report from the home page.
                    </p>
                    <Link to="/" className="empty-cta">
                        ✦ Get Started
                    </Link>
                </div>
            )}

            {/* Reports grid */}
            {!loading && reports.length > 0 && (
                <>
                    <p className="reports-count">{reports.length} report{reports.length !== 1 ? 's' : ''} found</p>
                    <div className="reports-grid">
                        {reports.map((r) => (
                            <Link
                                key={r._id}
                                to={`/interview/${r._id}`}
                                className="report-card"
                            >
                                <div className="report-card-left">
                                    <div className="report-card-icon">📊</div>
                                    <div className="report-card-info">
                                        <div className="report-card-title">
                                            {r.title || 'Untitled Report'}
                                        </div>
                                        {r.createdAt && (
                                            <div className="report-card-date">
                                                {formatDate(r.createdAt)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="report-card-right">
                                    <span className={`score-badge ${scoreClass(r.matchScore)}`}>
                                        {r.matchScore}%
                                    </span>
                                    <span className="card-arrow">›</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}

        </main>
    );
};

export default Reports;
