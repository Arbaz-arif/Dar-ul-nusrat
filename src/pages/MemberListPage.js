import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import styles from '../styles/MemberList.module.css';

const MemberListPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      department: params.get('department') || 'All',
      conveyanceType: params.get('conveyanceType') || '',
      bloodGroup: params.get('bloodGroup') || '',
      searchTerm: params.get('searchTerm') || ''
    };
  });

  const loadMembers = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let response;

      if (user.role === 'Khuddam Zaeem') {
        if (filters.department === 'All') {
          // Special case: Zaeem sees Khuddam and Atfal when 'All' selected
          response = await api.searchMembers(filters.searchTerm, null, { ...filters, page, pageSize: 10 });
        } else {
          response = await api.getMembersByDepartment(filters.department, { ...filters, page, pageSize: 10 });
        }
      } else if (user.role === 'Khuddam Muntazim') {
        response = await api.getMuntazimMembers(user.muntazimFor);
      } else if (filters.department === 'All' || filters.searchTerm || filters.bloodGroup) {
        response = await api.searchMembers(filters.searchTerm, filters.department === 'All' ? null : filters.department, { ...filters, page, pageSize: 10 });
      } else {
        response = await api.getMembersByDepartment(filters.department, { ...filters, page, pageSize: 10 });
      }

      setMembers(response.data.members || response.data);
      if (response.data.totalPages) {
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters, page]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deptParam = params.get('department');
    const convParam = params.get('conveyanceType') || '';
    const searchParam = params.get('searchTerm') || '';
    
    if (deptParam !== filters.department || convParam !== filters.conveyanceType || searchParam !== filters.searchTerm) {
      setFilters({
        department: deptParam || 'All',
        conveyanceType: convParam,
        searchTerm: searchParam
      });
      setSearchInput(searchParam);
    }
  }, [location.search, filters.department, filters.conveyanceType, filters.searchTerm]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setPage(1);

    const params = new URLSearchParams(location.search);
    if (value === 'All' || value === '') {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchClick = () => {
    const newFilters = { ...filters, searchTerm: searchInput };
    setFilters(newFilters);
    setPage(1);

    const params = new URLSearchParams(location.search);
    if (searchInput === '') {
      params.delete('searchTerm');
    } else {
      params.set('searchTerm', searchInput);
    }
    navigate({ search: params.toString() }, { replace: true });
    performSearch(newFilters, 1);
  };

  const performSearch = async (searchFilters, pageNum) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let response;

      if (user.role === 'Khuddam Zaeem') {
        if (searchFilters.department === 'All') {
          response = await api.searchMembers(searchFilters.searchTerm, null, { ...searchFilters, page: pageNum, pageSize: 10 });
        } else {
          response = await api.getMembersByDepartment(searchFilters.department, { ...searchFilters, page: pageNum, pageSize: 10 });
        }
      } else if (user.role === 'Khuddam Muntazim') {
        response = await api.getMuntazimMembers(user.muntazimFor);
      } else if (searchFilters.department === 'All' || searchFilters.searchTerm || searchFilters.bloodGroup) {
        response = await api.searchMembers(searchFilters.searchTerm, searchFilters.department === 'All' ? null : searchFilters.department, { ...searchFilters, page: pageNum, pageSize: 10 });
      } else {
        response = await api.getMembersByDepartment(searchFilters.department, { ...searchFilters, page: pageNum, pageSize: 10 });
      }

      setMembers(response.data.members || response.data);
      if (response.data.totalPages) {
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    const member = members.find(m => m._id === id);
    setMemberToDelete(member);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    
    try {
      await api.deleteMember(memberToDelete._id);
      setDeleteModal(false);
      setMemberToDelete(null);
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member. Please try again.');
    }
  };

  if (loading) {
    return <Layout><div className={styles.loading}>Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.headerWrap}>
          <h1 className={styles.title}>Member Management</h1>
          {(user?.role === 'Super Admin' || user?.role?.includes('Admin') || user?.role === 'Khuddam Zaeem' || user?.role === 'Sadar') && (
            <button className={styles.addBtn} onClick={() => window.location.href = '/members/create'}>
              + Add Member
            </button>
          )}
        </div>

        <div className={styles.filters}>
          {(user?.role === 'Super Admin' || user?.role === 'Khuddam Zaeem' || user?.role === 'Lajna Admin' || user?.role === 'Sadar') && (
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className={styles.filterInput}
            >
              {(user?.role === 'Super Admin' || user?.role === 'Khuddam Zaeem' || user?.role === 'Sadar') && <option value="All">All Departments</option>}
              {user?.role === 'Lajna Admin' && <option value="All">All Departments</option>}
              {user?.role === 'Super Admin' ? (
                <>
                  <option value="Ansar">Ansaar Ullah</option>
                  <option value="Khuddam">Khuddam</option>
                  <option value="Lajna">Lajna</option>
                  <option value="Atfal">Itfal</option>
                  <option value="Bachgan">Bachgan</option>
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

          <select
            name="conveyanceType"
            value={filters.conveyanceType}
            onChange={handleFilterChange}
            className={styles.filterInput}
          >
            <option value="">All Conveyance Types</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="cycle">Cycle</option>
          </select>

          <select
            name="bloodGroup"
            value={filters.bloodGroup || ''}
            onChange={handleFilterChange}
            className={styles.filterInput}
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>

          <div className={styles.searchBarWrap}>
            <input
              type="text"
              placeholder="Search by name, email, occupation..."
              value={searchInput}
              onChange={handleSearchChange}
              className={`${styles.filterInput} ${styles.searchInput}`}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className={styles.searchBtn}
              onClick={handleSearchClick}
            >
              Search
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Father/Husband Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Occupation</th>
                <th>Department</th>
                <th>Conveyance</th>
                <th>Blood Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map(member => (
                  <tr key={member._id}>
                    <td>{member.firstName} {member.lastName}</td>
                    <td>{member.husbandName || member.fatherName || 'N/A'}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>{member.occupation || 'N/A'}</td>
                    <td>{member.department === 'Ansar' ? 'Ansaar Ullah' : (member.department === 'Atfal' ? 'Itfal' : member.department)}</td>
                    <td>{member.conveyanceType}</td>
                    <td>{member.bloodGroup}</td>
                    <td className={styles.actions}>
                      <button className={styles.viewBtn} onClick={() => navigate(`/members/${member._id}`)}>
                        View
                      </button>
                      {(user?.role === 'Super Admin' || user?.role?.includes('Admin') || user?.role === 'Khuddam Zaeem' || user?.role === 'Sadar') && (
                        <button className={styles.editBtn} onClick={() => navigate(`/members/${member._id}/edit`)}>
                          Edit
                        </button>
                      )}
                      {(user?.role === 'Super Admin' || user?.role === 'Ansar Admin' || user?.role === 'Khuddam Zaeem' || user?.role === 'Sadar' || user?.role === 'Lajna Admin') && (
                        <button className={styles.deleteBtn} onClick={() => handleDeleteClick(member._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No members found in this department
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={styles.pageBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={styles.pageBtn}
          >
            Next
          </button>
        </div>
      </div>

      {deleteModal && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Confirm Delete</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete <strong>{memberToDelete?.firstName} {memberToDelete?.lastName}</strong>? 
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalBtnCancel} 
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.modalBtnConfirm} 
                onClick={confirmDelete}
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MemberListPage;
