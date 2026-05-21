import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import styles from '../styles/MyProfile.module.css';

const MyProfilePage = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    fatherName: '',
    husbandName: '',
    dateOfBirth: '',
    occupation: '',
    conveyanceType: [],
    conveyanceNumber: '',
    houseStatus: '',
    ownerName: '',
    ownerPhone: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    education: '',
    tajneedNumber: '',
    relationshipStatus: '',
    gender: '',
    title: '',
    profilePicture: ''
  });

  useEffect(() => {
    loadProfile();
  }, [user?._id, loadProfile]);

  const loadProfile = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await api.getMember(user._id);
      const data = response.data;
      setProfileData(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        fatherName: data.fatherName || '',
        husbandName: data.husbandName || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        occupation: data.occupation || '',
        conveyanceType: Array.isArray(data.conveyanceType) ? data.conveyanceType : [],
        conveyanceNumber: data.conveyanceNumber || '',
        houseStatus: data.houseStatus || '',
        ownerName: data.ownerName || '',
        ownerPhone: data.ownerPhone || '',
        password: '',
        confirmPassword: '',
        bloodGroup: data.bloodGroup || '',
        education: data.education || '',
        tajneedNumber: data.tajneedNumber || '',
        relationshipStatus: data.relationshipStatus || '',
        gender: data.gender || '',
        title: data.title || '',
        profilePicture: data.profilePicture || ''
      });
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let finalValue = value;
    if ((name === 'phone' || name === 'ownerPhone') && type !== 'tel') {
      finalValue = value.replace(/\D/g, '');
    }
    
    if (name === 'conveyanceType') {
      // Handle checkbox for conveyance type
      const updatedTypes = checked
        ? [...formData.conveyanceType, value]
        : formData.conveyanceType.filter(type => type !== value);
      setFormData(prev => ({ ...prev, conveyanceType: updatedTypes }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profilePicture: previewUrl }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSaveLoading(true);

      let finalProfilePicture = formData.profilePicture;
      if (selectedImageFile) {
        const uploadResult = await api.uploadImage(selectedImageFile);
        finalProfilePicture = uploadResult.url;
      }

      // Build update payload — everything except department
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        fatherName: formData.fatherName,
        husbandName: formData.husbandName,
        dateOfBirth: formData.dateOfBirth,
        occupation: formData.occupation,
        conveyanceType: formData.conveyanceType,
        conveyanceNumber: formData.conveyanceNumber,
        houseStatus: formData.houseStatus,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        bloodGroup: formData.bloodGroup,
        education: formData.education,
        tajneedNumber: formData.tajneedNumber,
        relationshipStatus: formData.relationshipStatus,
        gender: formData.gender,
        title: formData.title,
        profilePicture: finalProfilePicture,
      };

      // Clean up optional fields — remove ownerName and ownerPhone if houseStatus is not 'Rent'
      if (updateData.houseStatus !== 'Rent') {
        delete updateData.ownerName;
        delete updateData.ownerPhone;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }
      await api.updateMember(user._id, updateData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      loadProfile();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const quotes = [
    "The best among you are those who have the best manners and character.",
    "Strive for excellence, for Allah loves those who perfect their work.",
    "Be in this world as though you were a stranger or a traveller.",
    "Speak good or remain silent.",
    "The strong person is not the one who can wrestle someone else down. The strong person is the one who can control himself when he is angry.",
    "Make things easy and do not make them difficult.",
  ];


  const displayTitle = (!profileData?.title || profileData?.title === 'Member')
    ? profileData?.department
    : profileData?.title;

  if (loading || !profileData) {
    return (
      <Layout>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>

        {/* Page Header */}
        {!editing && (
          <div className={styles.pageHeader}>
            <div className={styles.headerText}>
              <h1 className={styles.pageTitle}>Welcome, {profileData?.firstName}!</h1>
              <p className={styles.pageSubtitle}>You can see and update your personal details here.</p>
            </div>
            <button className={styles.editBtn} onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && <div className={styles.alert + ' ' + styles.alertError}>{error}</div>}
        {success && <div className={styles.alert + ' ' + styles.alertSuccess}>✅ {success}</div>}

        {editing ? (
          /* ── Edit Form ── */
          <form onSubmit={handleSave} className={styles.editCard}>
          <h2 className={styles.sectionHeading}>Edit Your Profile</h2>

          {/* Profile Picture Upload */}
          <div className={styles.avatarUploadSection}>
            <div className={styles.avatarPreviewWrap}>
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Preview" className={styles.avatarPreviewImg} />
              ) : (
                <div className={styles.avatarPreviewPlaceholder}>
                  {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
                </div>
              )}
              <label htmlFor="profilePictureInput" className={styles.avatarEditOverlay}>
                📷
              </label>
            </div>
            <input
              id="profilePictureInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <p className={styles.avatarHint}>Click the camera icon to change photo</p>
          </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              {/* Show Father's Name for non-Lajna, Husband's Name for Lajna */}
              {profileData?.department !== 'Lajna' ? (
                <div className={styles.formGroup}>
                  <label>Father's Name</label>
                  <input name="fatherName" value={formData.fatherName} onChange={handleChange} />
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>Father/Husband Name</label>
                  <input name="husbandName" value={formData.husbandName} onChange={handleChange} />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Occupation</label>
                <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g. Software Engineer" />
              </div>
              <div className={styles.formGroup}>
                <label>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Education</label>
                <input name="education" value={formData.education} onChange={handleChange} placeholder="e.g. Masters in Science" />
              </div>
              <div className={styles.formGroup}>
                <label>Tajneed Number</label>
                <input type="number" name="tajneedNumber" value={formData.tajneedNumber} onChange={handleChange} placeholder="e.g. 2024001" />
              </div>
              <div className={styles.formGroup}>
                <label>Conveyance Type</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <input
                      type="checkbox"
                      name="conveyanceType"
                      value="car"
                      checked={formData.conveyanceType.includes('car')}
                      onChange={handleChange}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    Car
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <input
                      type="checkbox"
                      name="conveyanceType"
                      value="bike"
                      checked={formData.conveyanceType.includes('bike')}
                      onChange={handleChange}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    Bike
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <input
                      type="checkbox"
                      name="conveyanceType"
                      value="cycle"
                      checked={formData.conveyanceType.includes('cycle')}
                      onChange={handleChange}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    Cycle
                  </label>
                </div>
              </div>
              {formData.conveyanceType.length > 0 && (formData.conveyanceType.includes('car') || formData.conveyanceType.includes('bike')) && (
                <div className={styles.formGroup}>
                  <label>Vehicle Number</label>
                  <input name="conveyanceNumber" value={formData.conveyanceNumber} onChange={handleChange} placeholder="e.g. ABC-123" />
                </div>
              )}
              <div className={styles.formGroup}>
                <label>House Status</label>
                <select name="houseStatus" value={formData.houseStatus} onChange={handleChange}>
                  <option value="">Select Status</option>
                  <option value="Own">Own</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>
              {formData.houseStatus === 'Rent' && (
                <div className={styles.formGroup}>
                  <label>House Owner <span className={styles.optional}>(required if renting)</span></label>
                  <input name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="House owner's name" required={formData.houseStatus === 'Rent'} />
                </div>
              )}
              {formData.houseStatus === 'Rent' && (
                <div className={styles.formGroup}>
                  <label>Owner Phone Number <span className={styles.optional}>(required if renting)</span></label>
                  <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="Owner's phone number" required={formData.houseStatus === 'Rent'} />
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Relationship Status</label>
                <select name="relationshipStatus" value={formData.relationshipStatus} onChange={handleChange}>
                  <option value="">Select Status</option>
                  <option value="Married">Married</option>
                  <option value="Unmarried">Unmarried</option>
                </select>
              </div>

              {/* Read-only Department */}
              <div className={styles.formGroup}>
                <label>Department <span className={styles.optional}>(cannot be changed)</span></label>
                <input
                  value={profileData?.department || ''}
                  readOnly
                  style={{ background: 'var(--bg-secondary, #f3f4f6)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label>New Password <span className={styles.optional}>(leave blank to keep current)</span></label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => { setEditing(false); setError(''); }}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn} disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

        ) : (
          /* ── View Mode ── */
          <div className={styles.detailsCard}>
          {/* Profile Avatar */}
          <div className={styles.profileAvatarSection}>
            {profileData?.profilePicture ? (
              <img src={profileData.profilePicture} alt="Profile" className={styles.profileAvatarImg} />
            ) : (
              <div className={styles.profileAvatarFallback}>
                {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
              </div>
            )}
            <div>
              <h2 className={styles.profileAvatarName}>{profileData?.firstName} {profileData?.lastName}</h2>
              <span className={styles.profileAvatarDept}>{profileData?.department}</span>
            </div>
          </div>
            <div className={styles.detailsSection}>
              <h3 className={styles.sectionHeading}>Complete Profile Details</h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Full Name</span>
                  <span className={styles.detailValue}>{profileData?.firstName} {profileData?.lastName}</span>
                </div>
                {profileData?.fatherName && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Father's Name</span>
                    <span className={styles.detailValue}>{profileData.fatherName}</span>
                  </div>
                )}
                {profileData?.husbandName && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Father/Husband Name</span>
                    <span className={styles.detailValue}>{profileData.husbandName}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email Address</span>
                  <span className={styles.detailValue}>{profileData?.email || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone Number</span>
                  <span className={styles.detailValue}>{profileData?.phone || 'Not set'}</span>
                </div>
                {profileData?.dateOfBirth && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date of Birth</span>
                    <span className={styles.detailValue}>
                      {new Date(profileData.dateOfBirth).toLocaleDateString()}
                      <span className={styles.agePill}>{calculateAge(profileData.dateOfBirth)}</span>
                    </span>
                  </div>
                )}
                {profileData?.occupation && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Occupation</span>
                    <span className={styles.detailValue}>{profileData.occupation}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Blood Group</span>
                  <span className={styles.detailValue}>{profileData?.bloodGroup || 'Not set'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Education</span>
                  <span className={styles.detailValue}>{profileData?.education || 'Not set'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Tajneed Number</span>
                  <span className={styles.detailValue}>{profileData?.tajneedNumber || 'Not set'}</span>
                </div>
                {profileData?.conveyanceType && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Conveyance</span>
                    <span className={styles.detailValue}>
                      {Array.isArray(profileData.conveyanceType) ? profileData.conveyanceType.join(', ') : profileData.conveyanceType}
                      {profileData.conveyanceNumber ? ` (${profileData.conveyanceNumber})` : ''}
                    </span>
                  </div>
                )}
                <div className={styles.detailsGridThreeCol}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>House Status</span>
                    <span className={styles.detailValue}>{profileData?.houseStatus || 'Not set'}</span>
                  </div>
                  {profileData?.ownerName && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>House Owner</span>
                      <span className={styles.detailValue}>{profileData.ownerName}</span>
                    </div>
                  )}
                  {profileData?.ownerPhone && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>House Owner Phone</span>
                      <span className={styles.detailValue}>{profileData.ownerPhone}</span>
                    </div>
                  )}
                </div>
                {profileData?.relationshipStatus && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Relationship Status</span>
                    <span className={styles.detailValue}>{profileData.relationshipStatus}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Department</span>
                  <span className={styles.detailValue}>{profileData?.department || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Title / Role</span>
                  <span className={styles.detailValue}>{displayTitle || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Account Status</span>
                  <span className={styles.statusBadge}>Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProfilePage;
