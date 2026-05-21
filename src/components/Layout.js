import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Layout.module.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const navItems = [
    { 
      label: user?.role === 'Member' ? 'My Profile' : 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      label: 'My Profile', 
      path: '/profile',
      roles: ['Super Admin', 'Ansar Admin', 'Lajna Admin', 'Khuddam Zaeem', 'Khuddam Muntazim', 'Sadar', 'Atfal Admin', 'Bachgan Admin']
    },
    { 
      label: 'Manage Members', 
      path: '/members', 
      roles: ['Super Admin', 'Ansar Admin', 'Lajna Admin', 'Khuddam Zaeem', 'Khuddam Muntazim', 'Sadar', 'Atfal Admin', 'Bachgan Admin'] 
    },
  ];

  return (
    <div className={styles.layout}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.logoMobile}>
          <span style={{ color: 'var(--primary)' }}>Darul</span> Nusrat
        </div>
        <button className={styles.hamburgerBtn} onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div className={styles.sidebarOverlay} onClick={toggleMobileMenu}></div>
      )}

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <span style={{ color: 'var(--primary)' }}>Darul</span> Nusrat
        </div>
        
        <nav className={styles.navList}>
          <ul>
            {navItems.map((item) => {
              if (item.roles && !item.roles.some(role => user?.role?.includes(role))) return null;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className={isActive ? 'active' : ''}>
                  <Link to={item.path} onClick={() => setIsMobileMenuOpen(false)}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {user && (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              {/* Avatar thumbnail */}
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className={styles.sidebarAvatar}
                />
              ) : (
                <div className={styles.sidebarAvatarFallback}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              )}
              <span className={styles.userName}>{user.firstName} {user.lastName}</span>
              <span className={styles.userRole}>
                {((!user.title || user.title === 'Member') ? user.department : user.title)?.toUpperCase()}
              </span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        )}
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <h2>{navItems.find(i => i.path === location.pathname)?.label || 'Overview'}</h2>
          <div className={styles.headerActions}>
            {/* Additional header actions can go here */}
          </div>
        </header>

        <main className={styles.content}>
          <div className="animate-fade">
            {children}
          </div>
        </main>
      </div>

      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Confirm Logout</h3>
            <p className={styles.modalText}>Are you sure you want to log out of Darul Nusrat?</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalBtnCancel} 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.modalBtnConfirm} 
                onClick={async () => {
                  await logout();
                  window.location.href = '/login';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
