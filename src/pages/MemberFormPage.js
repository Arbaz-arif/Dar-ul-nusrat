import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import styles from '../styles/MemberForm.module.css';

const MemberFormPage = ({ isProfileEdit = false }) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { user } = useAuth();
  
  // Use paramId if it's a regular edit, otherwise use current user's ID if it's a profile edit
  const id = isProfileEdit ? user?._id : paramId;
  const isEdit = !!id;
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    department: user?.role === 'Khuddam Zaeem' ? 'Khuddam' : (user?.role === 'Lajna Admin' ? 'Lajna' : (user?.role === 'Sadar' ? 'Ansar' : (user?.adminDepartment || 'Ansar'))),
    fatherName: '',
    husbandName: '',
    conveyanceType: [],
    conveyanceNumber: '',
    houseStatus: '',
    ownerName: '',
    ownerPhone: '',
    muntazimAssignment: null,
    password: '',
    occupation: '',
    gender: '',
    title: '',
    bloodGroup: '',
    education: '',
    tajneedNumber: '',
    relationshipStatus: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [muntazims, setMuntazims] = useState([]);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [showConveyanceDropdown, setShowConveyanceDropdown] = useState(false);

  React.useEffect(() => {
    if (formData.department === 'Khuddam') {
      loadMuntazims();
    }
  }, [formData.department]);

  React.useEffect(() => {
    if (!isEdit && !formData.department) {
      if (user?.role === 'Khuddam Zaeem') {
        setFormData(prev => ({ ...prev, department: 'Khuddam' }));
      } else if (user?.role === 'Lajna Admin') {
        setFormData(prev => ({ ...prev, department: 'Lajna' }));
      } else if (user?.role === 'Sadar') {
        setFormData(prev => ({ ...prev, department: 'Ansar' }));
      }
    }
  }, [user, isEdit]);

  React.useEffect(() => {
    if (isEdit) {
      loadMemberData();
    }
  }, [id, isEdit]);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showConveyanceDropdown && !e.target.closest('[data-conveyance-dropdown]')) {
        setShowConveyanceDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showConveyanceDropdown]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      const response = await api.getMember(id);
      const member = response.data;
      
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : null,
        department: member.department || '',
        fatherName: member.fatherName || '',
        husbandName: member.husbandName || '',
        conveyanceType: Array.isArray(member.conveyanceType) ? member.conveyanceType : [],
        conveyanceNumber: member.conveyanceNumber || '',
        houseStatus: member.houseStatus || '',
        ownerName: member.ownerName || '',
        ownerPhone: member.ownerPhone || '',
        muntazimAssignment: member.muntazimAssignment || null,
        password: '',
        occupation: member.occupation || '',
        gender: member.gender || '',
        title: member.title || '',
        bloodGroup: member.bloodGroup || '',
        education: member.education || '',
        tajneedNumber: member.tajneedNumber || '',
        relationshipStatus: member.relationshipStatus || '',
        profilePicture: member.profilePicture || ''
      });
    } catch (err) {
      setError('Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const getTitleLabel = (dept) => {
    return 'Title';
  };

  const loadMuntazims = async () => {
    try {
      const response = await api.getAllMuntazims();
      setMuntazims(response.data || []);
    } catch (err) {
      console.error('Error loading muntazims:', err);
    }
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    if (name === 'phone' || name === 'ownerPhone') {
      value = value.replace(/\D/g, '');
    }

    setFormData(prev => {
      let newGender = prev.gender;
      if (name === 'department' && value !== 'Bachgan') newGender = '';
      if (name === 'department' && value === 'Bachgan') {
        // No automatic gender assignment
      }
      
      if (name === 'conveyanceType') {
        // Handle checkbox for conveyance type
        const updatedTypes = checked
          ? [...prev.conveyanceType, value]
          : prev.conveyanceType.filter(type => type !== value);
        return {
          ...prev,
          conveyanceType: updatedTypes,
          ...(name === 'department' && value !== 'Lajna' && { husbandName: '' }),
          ...(name === 'department' && value === 'Lajna' && { fatherName: '' }),
          gender: newGender
        };
      }

      return {
        ...prev,
        [name]: value,
        ...(name === 'department' && value !== 'Lajna' && { husbandName: '' }),
        ...(name === 'department' && value === 'Lajna' && { fatherName: '' }),
        gender: newGender
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profilePicture: previewUrl }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let finalProfilePicture = formData.profilePicture;
      if (selectedImageFile) {
        const uploadResult = await api.uploadImage(selectedImageFile);
        finalProfilePicture = uploadResult.url;
      }

      const submitData = { ...formData, profilePicture: finalProfilePicture };
      
      if (formData.department !== 'Lajna') delete submitData.husbandName;
      if (formData.conveyanceType.length === 0 || (formData.conveyanceType.includes('cycle') && formData.conveyanceType.length === 1) || (formData.conveyanceType.includes('rickshaw') && formData.conveyanceType.length === 1)) delete submitData.conveyanceNumber;
      if (formData.department !== 'Khuddam') delete submitData.muntazimAssignment;
      if (formData.department !== 'Bachgan') delete submitData.gender;
      if (formData.houseStatus !== 'Rent') {
        delete submitData.ownerName;
        delete submitData.ownerPhone;
      }

      // Handle optional email for regular users
      const specialTitles = ['Sadar', 'Sadar Lajna', 'Zaeem'];
      if (!specialTitles.includes(formData.title) && !submitData.email) {
        delete submitData.email;
      }

      if (isEdit) {
        if (!submitData.password) delete submitData.password;
        await api.updateMember(id, submitData);
      } else {
        // When creating: password only required for special titles (Sadar, Sadar Lajna, Zaeem)
        if (!specialTitles.includes(formData.title)) {
          // For regular members, don't send password
          delete submitData.password;
        }
        await api.createMember(submitData);
      }
      
      if (isProfileEdit) {
        // If updating own profile, go back to profile view (which is dashboard for members)
        navigate('/dashboard');
      } else {
        navigate('/members');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {isProfileEdit ? 'Update Your Profile' : (isEdit ? 'Edit Member' : 'Add New Member')}
        </h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">

          {/* Profile Picture Upload */}
          <div className={styles.avatarUploadSection}>
            <div className={styles.avatarPreviewWrap}>
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Preview" className={styles.avatarPreviewImg} />
              ) : (
                <div className={styles.avatarPreviewPlaceholder}>
                  {formData.firstName?.[0] || '?'}{formData.lastName?.[0] || ''}
                </div>
              )}
              <label htmlFor="memberProfilePic" className={styles.avatarEditOverlay}>📷</label>
            </div>
            <input
              id="memberProfilePic"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <p className={styles.avatarHint}>Click the camera to add a profile photo (optional)</p>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name <span className="required">*</span></label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Ali"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name <span className="required">*</span></label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Ahmad"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor={formData.department === 'Lajna' ? 'husbandName' : 'fatherName'}>
                {formData.department === 'Lajna' ? 'Father/Husband Name' : 'Father Name'} <span className="required">*</span>
              </label>
              <input
                type="text"
                id={formData.department === 'Lajna' ? 'husbandName' : 'fatherName'}
                name={formData.department === 'Lajna' ? 'husbandName' : 'fatherName'}
                value={formData.department === 'Lajna' ? formData.husbandName : formData.fatherName}
                onChange={handleChange}
                placeholder="e.g. Muhammad Raza"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 0300 1234567"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Email field - required only for special titles (Sadar, Sadar Lajna, Zaeem) */}
            {['Sadar', 'Sadar Lajna', 'Zaeem'].includes(formData.title) ? (
              <div className={styles.formGroup}>
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. ali@example.com"
                  autoComplete="off"
                  required
                />
              </div>
            ) : (
              <div className={styles.formGroup}>
                <label htmlFor="email">Email <span style={{ color: '#6b7280' }}>(Optional)</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. ali@example.com"
                  autoComplete="off"
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="department">Department <span className="required">*</span></label>
              {isProfileEdit ? (
                <input
                  type="text"
                  id="department"
                  value={formData.department}
                  readOnly
                  style={{ background: 'var(--bg-secondary, #f3f4f6)', cursor: 'not-allowed', color: 'var(--text-muted, #6b7280)' }}
                />
              ) : (
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  {user?.role === 'Super Admin' ? (
                    <>
                      <option value="Ansar">Ansaar Ullah</option>
                      <option value="Khuddam">Khuddam</option>
                      <option value="Lajna">Lajna</option>
                      <option value="Atfal">Itfal</option>
                      <option value="Bachgan">Bachgan</option>
                      <option value="Nasirat">Nasirat</option>
                    </>
                  ) : user?.role === 'Sadar' ? (
                    <>
                      <option value="Ansar">Ansaar Ullah</option>
                      <option value="Khuddam">Khuddam</option>
                      <option value="Lajna">Lajna</option>
                      <option value="Atfal">Itfal</option>
                      <option value="Bachgan">Bachgan</option>
                      <option value="Nasirat">Nasirat</option>
                    </>
                  ) : user?.role === 'Khuddam Zaeem' ? (
                    <>
                      <option value="Khuddam">Khuddam</option>
                      <option value="Atfal">Itfal</option>
                    </>
                  ) : user?.role === 'Lajna Admin' ? (
                    <>
                      <option value="Lajna">Lajna</option>
                      <option value="Nasirat">Nasirat</option>
                      <option value="Bachgan">Bachgan</option>
                    </>
                  ) : (
                    <option value={user?.adminDepartment}>
                      {user?.adminDepartment === 'Ansar' ? 'Ansaar Ullah' : (user?.adminDepartment === 'Atfal' ? 'Itfal' : user?.adminDepartment)}
                    </option>
                  )}
                </select>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            {!isProfileEdit && (
              <div className={styles.formGroup}>
                <label htmlFor="title">Title</label>
                <select
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                >
                  <option value="">Select Title (Optional)</option>
                  <option value="Sadar">Sadar</option>
                  <option value="Nasir">Nasir</option>
                  <option value="Sadar Lajna">Sadar Lajna</option>
                  <option value="Lajna">Lajna</option>
                  <option value="Zaeem">Zaeem</option>
                  <option value="Khudam">Khudam</option>
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">Date of Birth <span className="required">*</span></label>
              <DatePicker
                selected={formData.dateOfBirth}
                onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                maxDate={new Date()}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                dateFormat="dd/MM/yyyy"
                placeholderText="e.g. 15/08/1990"
                required
                id="dateOfBirth"
                wrapperClassName="date-picker-wrapper"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="relationshipStatus">Relationship Status</label>
              <select
                id="relationshipStatus"
                name="relationshipStatus"
                value={formData.relationshipStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="occupation">Occupation <span className="required">*</span></label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Student, Engineer, Business"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Conveyance Type</label>
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }} data-conveyance-dropdown>
                <button
                  type="button"
                  onClick={() => setShowConveyanceDropdown(!showConveyanceDropdown)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '16px'
                  }}
                >
                  <span>{formData.conveyanceType.length === 0 ? 'Select Conveyance Type' : formData.conveyanceType.join(', ')}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {showConveyanceDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    marginTop: '4px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    padding: '8px'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', margin: 0, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="conveyanceType"
                        value="car"
                        checked={formData.conveyanceType.includes('car')}
                        onChange={handleChange}
                        style={{ marginRight: '10px', cursor: 'pointer' }}
                      />
                      Car
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', margin: 0, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="conveyanceType"
                        value="bike"
                        checked={formData.conveyanceType.includes('bike')}
                        onChange={handleChange}
                        style={{ marginRight: '10px', cursor: 'pointer' }}
                      />
                      Bike
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', margin: 0, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="conveyanceType"
                        value="cycle"
                        checked={formData.conveyanceType.includes('cycle')}
                        onChange={handleChange}
                        style={{ marginRight: '10px', cursor: 'pointer' }}
                      />
                      Cycle
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', margin: 0, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="conveyanceType"
                        value="rickshaw"
                        checked={formData.conveyanceType.includes('rickshaw')}
                        onChange={handleChange}
                        style={{ marginRight: '10px', cursor: 'pointer' }}
                      />
                      Rickshaw
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="bloodGroup">Blood Group</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
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
              <label htmlFor="education">Education</label>
              <input
                type="text"
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g. Masters in Computer Science"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tajneedNumber">Tajneed Number</label>
              <input
                type="number"
                id="tajneedNumber"
                name="tajneedNumber"
                value={formData.tajneedNumber}
                onChange={handleChange}
                placeholder="e.g. 2024001"
              />
            </div>
          </div>

          {formData.department === 'Bachgan' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="gender">Gender <span className="required">*</span></label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  disabled={user?.role === 'Lajna Admin' || user?.role === 'Sadar'}
                  style={user?.role === 'Lajna Admin' || user?.role === 'Sadar' ? { background: 'var(--bg-secondary)', cursor: 'not-allowed' } : {}}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          )}

          {(formData.conveyanceType.length > 0 && (formData.conveyanceType.includes('car') || formData.conveyanceType.includes('bike')) || formData.department === 'Khuddam') && (
            <div className={styles.formRow}>
              {formData.conveyanceType.length > 0 && (formData.conveyanceType.includes('car') || formData.conveyanceType.includes('bike')) ? (
                <div className={styles.formGroup}>
                  <label htmlFor="conveyanceNumber">Conveyance Number <span className="required">*</span></label>
                  <input
                    type="text"
                    id="conveyanceNumber"
                    name="conveyanceNumber"
                    value={formData.conveyanceNumber}
                    onChange={handleChange}
                    placeholder="Vehicle registration number"
                    required
                  />
                </div>
              ) : (
                <div className={styles.formGroup} style={{ visibility: 'hidden' }}>
                  <label>&nbsp;</label>
                  <input disabled />
                </div>
              )}

              {formData.department === 'Khuddam' ? (
                <div className={styles.formGroup}>
                  <label htmlFor="muntazimAssignment">Muntazim Assignment</label>
                  <select
                    id="muntazimAssignment"
                    name="muntazimAssignment"
                    value={formData.muntazimAssignment || ''}
                    onChange={handleChange}
                  >
                    <option value="">Unassigned</option>
                    {muntazims.map(muntazim => (
                      <option key={muntazim._id} value={muntazim.name}>{muntazim.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className={styles.formGroup} style={{ visibility: 'hidden' }}>
                  <label>&nbsp;</label>
                  <select disabled />
                </div>
              )}
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="houseStatus">House Status</label>
              <select
                id="houseStatus"
                name="houseStatus"
                value={formData.houseStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Own">Own</option>
                <option value="Rent">Rent</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ownerName">
                House Owner {formData.houseStatus === 'Rent' && <span className="required">*</span>}
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder={formData.houseStatus === 'Rent' ? "House owner's name (required if renting)" : "House owner's name (optional)"}
                required={formData.houseStatus === 'Rent'}
              />
            </div>
          </div>

          {formData.houseStatus === 'Rent' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="ownerPhone">Owner Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  id="ownerPhone"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="e.g. 0300 1234567"
                  required
                />
              </div>
              <div className={styles.formGroup} style={{ visibility: 'hidden' }}>
                <label>&nbsp;</label>
                <input disabled />
              </div>
            </div>
          )}

          <div className={styles.formRow}>
            {/* Password field - only shown when editing OR when creating with special titles */}
            {isEdit || ['Sadar Lajna', 'Sadar', 'Zaeem', 'Zaeem Sadar'].includes(formData.title) ? (
              <div className={styles.formGroup}>
                <label htmlFor="password">Password {!isEdit && <span className="required">*</span>}</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isEdit ? "Leave blank to keep current" : "Minimum 8 characters"}
                    autoComplete="new-password"
                    required={!isEdit}
                  />
                  <button 
                    type="button" 
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Member' : 'Create Member')}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/members')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default MemberFormPage;
