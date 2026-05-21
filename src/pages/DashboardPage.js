import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import styles from '../styles/Dashboard.module.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return `${years} years ${months} months ${days} days`;
  };

  const loadDashboardData = async () => {
    try {
      let data;

      if (user?.role === 'Super Admin') {
        const response = await api.getSuperAdminDashboard();
        data = response.data;
      } else if (user?.role === 'Khuddam Zaeem') {
        const response = await api.getZaeemDashboard();
        data = response.data;
      } else if (user?.role === 'Khuddam Muntazim') {
        const response = await api.getMuntazimHeadDashboard(user.muntazimFor);
        data = response.data;
      } else if (user?.role === 'Lajna Admin') {
        const response = await api.getLajnaAdminDashboard();
        data = response.data;
      } else if (user?.role === 'Sadar') {
        const response = await api.getSadarDashboard();
        data = response.data;
      } else if (user?.role?.includes('Admin')) {
        const response = await api.getDepartmentAdminDashboard(user.adminDepartment);
        data = response.data;
      } else if (user?.role === 'Member') {
        data = { userProfile: user };
      }

      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (dept) => {
    navigate(`/members?department=${dept}`);
  };

  if (loading) {
    return <Layout><div className={styles.loading}>Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className={styles.dashboard}>
        
        {user?.role === 'Super Admin' && (
          <div className={styles.section}>
            <h2>System Overview</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard} onClick={() => handleCardClick('All')}>
                <h3>Total User</h3>
                <p className={styles.statValue}>{stats?.totalMembers || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Ansar')}>
                <h3>Ansaar Ullah</h3>
                <p className={styles.statValue}>{stats?.Ansar || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Khuddam')}>
                <h3>Khuddam</h3>
                <p className={styles.statValue}>{stats?.Khuddam || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Lajna')}>
                <h3>Lajna</h3>
                <p className={styles.statValue}>{stats?.Lajna || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Atfal')}>
                <h3>Itfal</h3>
                <p className={styles.statValue}>{stats?.Atfal || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Bachgan')}>
                <h3>Bachgan</h3>
                <p className={styles.statValue}>{stats?.Bachgan || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Nasirat')}>
                <h3>Nasirat</h3>
                <p className={styles.statValue}>{stats?.Nasirat || 0}</p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'Khuddam Zaeem' && (
          <div className={styles.section}>
            <h2>Khuddam Zaeem Overview</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard} onClick={() => handleCardClick('Khuddam')}>
                <h3>Khuddam</h3>
                <p className={styles.statValue}>{stats?.totalKhuddam || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Atfal')}>
                <h3>Itfal</h3>
                <p className={styles.statValue}>{stats?.totalAtfal || 0}</p>
              </div>
            </div>
          </div>
        )}

        {user?.role?.includes('Admin') && user?.role !== 'Super Admin' && user?.role !== 'Lajna Admin' && (
          <div className={styles.section}>
            <h2>{user?.adminDepartment} Department</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total User</h3>
                <p className={styles.statValue}>{stats?.totalMembers || 0}</p>
              </div>
            </div>
            {stats?.recentMembers && (
              <div className={styles.recentMembers}>
                <h3>Recent Additions</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentMembers.map(member => (
                      <tr key={member._id}>
                        <td>{member.firstName} {member.lastName}</td>
                        <td>{member.email}</td>
                        <td>{member.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {user?.role === 'Lajna Admin' && (
          <div className={styles.section}>
            <h2>Lajna, Nasirat & Bachgan Overview</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard} onClick={() => handleCardClick('Lajna')}>
                <h3>Lajna</h3>
                <p className={styles.statValue}>{stats?.totalLajna || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Nasirat')}>
                <h3>Nasirat</h3>
                <p className={styles.statValue}>{stats?.totalNasirat || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Bachgan')}>
                <h3>Bachgan</h3>
                <p className={styles.statValue}>{stats?.totalBachgan || 0}</p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'Sadar' && (
          <div className={styles.section}>
            <h2>Sadar Overview</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard} onClick={() => handleCardClick('Ansar')}>
                <h3>Ansaar Ullah</h3>
                <p className={styles.statValue}>{stats?.totalAnsar || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Khuddam')}>
                <h3>Khuddam</h3>
                <p className={styles.statValue}>{stats?.totalKhuddam || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Lajna')}>
                <h3>Lajna</h3>
                <p className={styles.statValue}>{stats?.totalLajna || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Atfal')}>
                <h3>Itfal</h3>
                <p className={styles.statValue}>{stats?.totalAtfal || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Bachgan')}>
                <h3>Bachgan</h3>
                <p className={styles.statValue}>{stats?.totalBachgan || 0}</p>
              </div>
              <div className={styles.statCard} onClick={() => handleCardClick('Nasirat')}>
                <h3>Nasirat</h3>
                <p className={styles.statValue}>{stats?.totalNasirat || 0}</p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'Member' && (
          <div className={styles.memberDashboard}>
            <div className={styles.welcomeSection}>
              <div className={styles.welcomeInfo}>
                <h2 className={styles.welcomeTitle}>Welcome back, {user?.firstName}!</h2>
                <p className={styles.welcomeSubtitle}>Manage your profile and view your membership details here.</p>
              </div>
              <button className={styles.btn} onClick={() => navigate('/profile')}>
                Update Profile
              </button>
            </div>

            <div className={styles.singleProfileCard}>
              <div className={styles.profileContent}>
                <div className={styles.infoGroup}>
                  <h3 className={styles.groupTitle}>Complete Profile Details</h3>
                  <div className={styles.detailsGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Full Name</span>
                      <span className={styles.value}>{user?.firstName} {user?.lastName}</span>
                    </div>
                    {user?.fatherName && (
                      <div className={styles.infoItem}>
                        <span className={styles.label}>Father's Name</span>
                        <span className={styles.value}>{user.fatherName}</span>
                      </div>
                    )}
                    {user?.husbandName && (
                      <div className={styles.infoItem}>
                        <span className={styles.label}>Father/Husband Name</span>
                        <span className={styles.value}>{user.husbandName}</span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Email Address</span>
                      <span className={styles.value}>{user?.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Phone Number</span>
                      <span className={styles.value}>{user?.phone || 'Not set'}</span>
                    </div>
                    {user?.dateOfBirth && (
                      <div className={styles.infoItem}>
                        <span className={styles.label}>Date of Birth</span>
                        <span className={styles.value}>
                          {new Date(user.dateOfBirth).toLocaleDateString()}
                          <span className={styles.ageLabel}>({calculateAge(user.dateOfBirth)})</span>
                        </span>
                      </div>
                    )}
                    {user?.occupation && (
                      <div className={styles.infoItem}>
                        <span className={styles.label}>Occupation</span>
                        <span className={styles.value}>{user.occupation}</span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Blood Group</span>
                      <span className={styles.value}>{user?.bloodGroup || 'Not set'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Education</span>
                      <span className={styles.value}>{user?.education || 'Not set'}</span>
                    </div>
                    {user?.conveyanceType && (
                      <div className={styles.infoItem}>
                        <span className={styles.label}>Conveyance</span>
                        <span className={styles.value}>
                          {Array.isArray(user.conveyanceType) ? user.conveyanceType.join(', ') : user.conveyanceType}
                          {user.conveyanceNumber ? ` (${user.conveyanceNumber})` : ''}
                        </span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <span className={styles.label}>House Status</span>
                      <span className={styles.value}>{user?.houseStatus || 'Not set'}</span>
                    </div>
                    {user?.ownerName && (
                      <div className={styles.infoItem}>
                        <span className={styles.label}>House Owner</span>
                        <span className={styles.value}>{user.ownerName}</span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Department</span>
                      <span className={styles.value}>{user?.department || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Title / Role</span>
                      <span className={styles.value}>
                        {(!user?.title || user?.title === 'Member') ? user?.department : user?.title}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Account Status</span>
                      <span className={styles.statusBadge}>Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
