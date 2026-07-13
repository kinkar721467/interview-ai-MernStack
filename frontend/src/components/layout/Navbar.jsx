import { useContext } from 'react';
import { AuthContext } from '../../features/auth/auth.context';
import './navbar.scss';

// onMenuClick — opens the sidebar on mobile (hamburger button)

const Navbar = ({ title, onMenuClick }) => {
    const { user } = useContext(AuthContext);

    return (
        <header className="navbar">

            {/* Hamburger — only shows on mobile */}
            <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">
                <span />
                <span />
                <span />
            </button>

            {/* Page Title */}
            <h2 className="navbar-title">{title || 'Dashboard'}</h2>

            {/* User badge */}
            <div className="user-badge">
                <span className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="user-name">{user?.username || 'User'}</span>
            </div>

        </header>
    );
};

export default Navbar;
