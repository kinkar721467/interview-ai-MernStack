import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../features/auth/auth.context';
import { logout } from '../../features/auth/services/auth.api';
import useInterview from '../../features/interview/hooks/useInterview';
import './sidebar.scss';

const Sidebar = ({ isOpen, onClose }) => {
    const { setuser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { reports, fetchAllReports } = useInterview();

    useEffect(() => {
        fetchAllReports();
    }, []);

    const handleLogout = async () => {
        await logout();
        setuser(null);
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>

            {/* Logo */}
            <div className="sidebar-logo">
                <span className="logo-icon">🧠</span>
                <span className="logo-text">InterviewAI</span>
            </div>

            {/* Main Nav */}
            <nav className="sidebar-nav">
                <NavLink to="/" end onClick={onClose}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Home</span>
                </NavLink>

                <NavLink to="/report" onClick={onClose}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-label">Reports</span>
                </NavLink>

                {/* AI PDF Generator — dedicated page */}
                <NavLink to="/ai-pdf" onClick={onClose}
                    className={({ isActive }) => `nav-item nav-item--pdf ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="12" y1="18" x2="12" y2="12"/>
                            <line x1="9"  y1="15" x2="15" y2="15"/>
                        </svg>
                    </span>
                    <span className="nav-label">AI PDF Generator</span>
                </NavLink>
            </nav>

            {/* Interview History */}
            <div className="sidebar-history">
                <p className="history-label">Recent Interviews</p>

                {reports.length === 0 && (
                    <p className="history-empty">No interviews yet</p>
                )}

                {reports.map((r) => (
                    <NavLink
                        key={r._id}
                        to={`/interview/${r._id}`}
                        onClick={onClose}
                        className={({ isActive }) => `history-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="history-title">{r.title || 'Untitled'}</span>
                        <span className="history-score">{r.matchScore}%</span>
                    </NavLink>
                ))}
            </div>

            {/* Logout */}
            <div className="sidebar-bottom">
                <button className="logout-btn" onClick={handleLogout}>
                    <span className="nav-icon">🚪</span>
                    <span className="nav-label">Logout</span>
                </button>
            </div>

        </aside>
    );
};

export default Sidebar;
