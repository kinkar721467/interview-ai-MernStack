import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './layout.scss';

const Layout = ({ children, title }) => {

    // Controls whether the sidebar is open on mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const openSidebar  = () => setSidebarOpen(true);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="app-layout">

            {/* Dark overlay — only visible on mobile when sidebar is open */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            {/* Sidebar — gets isOpen so it can slide in/out on mobile */}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            {/* Right side: navbar + page content */}
            <div className="main-area">
                <Navbar title={title} onMenuClick={openSidebar} />
                <main className="page-content">
                    {children}
                </main>
            </div>

        </div>
    );
};

export default Layout;
