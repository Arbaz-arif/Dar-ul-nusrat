import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import styles from '../styles/MemberDetails.module.css';

const MemberDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await api.getMember(id);
        setMember(response.data);
      } catch (err) {
        setError('Failed to load member details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

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

  if (loading) return <Layout><div className={styles.loading}>Loading member details...</div></Layout>;
  if (error) return <Layout><div className={styles.error}>{error}</div></Layout>;
  if (!member) return <Layout><div className={styles.error}>Member not found</div></Layout>;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Member Details</h1>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back to List
          </button>
        </div>

        <div className={styles.detailsCard}>
          <div className={styles.cardHeader}>
            {member.profilePicture ? (
              <img
                src={member.profilePicture}
                alt={`${member.firstName} ${member.lastName}`}
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatar}>
                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
              </div>
            )}
            <div className={styles.mainInfo}>
              <h2>{member.firstName} {member.lastName}</h2>
              <span className={styles.roleBadge}>{member.role}</span>
            </div>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.infoSection}>
              <h3>Personal Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>
                    {member.department === 'Lajna' ? 'Father/Husband Name' : 'Father Name'}
                  </span>
                  <span className={styles.value}>{member.husbandName || member.fatherName || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Date of Birth</span>
                  <span className={styles.value}>
                    {new Date(member.dateOfBirth).toLocaleDateString()} 
                    <span style={{ marginLeft: '8px', color: 'var(--primary)', fontWeight: '600' }}>
                      ({calculateAge(member.dateOfBirth)})
                    </span>
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Occupation</span>
                  <span className={styles.value}>{member.occupation || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Blood Group</span>
                  <span className={styles.value}>{member.bloodGroup || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Education</span>
                  <span className={styles.value}>{member.education || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Tajneed Number</span>
                  <span className={styles.value}>{member.tajneedNumber || 'N/A'}</span>
                </div>
                {member.gender && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Gender</span>
                    <span className={styles.value}>{member.gender}</span>
                  </div>
                )}
                {member.relationshipStatus && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Relationship Status</span>
                    <span className={styles.value}>{member.relationshipStatus}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3>Contact Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Email Address</span>
                  <span className={styles.value}>{member.email || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Phone Number</span>
                  <span className={styles.value}>{member.phone}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3>Department & Assignment</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Department</span>
                  <span className={styles.value}>
                    {member.department === 'Ansar' ? 'Ansaar Ullah' : (member.department === 'Atfal' ? 'Itfal' : member.department)}
                  </span>
                </div>
                {member.title && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Title</span>
                    <span className={styles.value}>{member.title}</span>
                  </div>
                )}
                {member.department === 'Khuddam' && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Muntazim Assignment</span>
                    <span className={styles.value}>{member.muntazimAssignment || 'Unassigned'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3>Conveyance Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Conveyance Type</span>
                  <span className={styles.value}>{member.conveyanceType || 'None'}</span>
                </div>
                {member.conveyanceNumber && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Conveyance Number</span>
                    <span className={styles.value}>{member.conveyanceNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3>Housing Information</h3>
              <div className={styles.infoGridThreeCol}>
                {member.houseStatus && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>House Status</span>
                    <span className={styles.value}>{member.houseStatus}</span>
                  </div>
                )}
                {member.ownerName && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>House Owner Name</span>
                    <span className={styles.value}>{member.ownerName}</span>
                  </div>
                )}
                {member.ownerPhone && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>House Owner Phone Number</span>
                    <span className={styles.value}>{member.ownerPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemberDetailsPage;
