import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext';
import axios from 'axios';
import { base_url } from '../../config/api';
import { FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import authInstance from '../../config/authInstance';

function UserList() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const axiosAuth = authInstance(auth, logout, navigate)

  const [userList, setUserList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [role, setRole] = useState('All');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUserList();
  }, [auth.company, currentPage]); // Add dependencies here

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await axiosAuth.get(`/public/email/get_all_user_master/${auth.company}?page=${currentPage}&limit=${itemsPerPage}`);
      setUserList(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error in getting User List:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await axiosAuth.delete(`/public/user/delete_usermaster_by_id/${userId}`);

        if (response.status === 200) {
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
          fetchUserList();
        } else {
          Swal.fire('Error!', 'Failed to delete the user.', 'error');
        }
      } catch (error) {
        console.error("Error while deleting user:", error);
        setLoading(false);
        Swal.fire('Error!', 'Something went wrong.', 'error');
      } finally {
        setLoading(false);
      }
    }
  }

  const updateUserStatus = async (userId, status) => {
    try {
      setLoading(true);
      const isActive = status === 'Active'
        ? true
        : status === 'Inactive'
          ? false
          : null;
      const response = await axiosAuth.put(`/public/user_master/update_user_status/${userId}/${isActive}`);

      if (response.status === 200) {
        setUserList(prevUsers =>
          prevUsers.map(user =>
            user.userId === userId ? { ...user, active: isActive } : user
          )
        );
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let results = userList;

    if (searchUser) {
      results = results.filter(user =>
        user.userName.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.userId.toLowerCase().includes(searchUser.toLowerCase())
      );
    }

    if (role !== 'All') {
      results = results.filter(user => user.role === role);
    }

    setFilteredUsers(results);
  }, [userList, searchUser, role]);

  // Get unique roles for dropdown
  const getUniqueRoles = () => {
    const allRoles = userList.map(user => user.role);
    const uniqueRoles = [...new Set(allRoles)];
    return ['All', ...uniqueRoles.sort()];
  };

  const uerRole = getUniqueRoles();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const noData = '/assets/nodata.png';
  const buffer = '/assets/buffer.gif';

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <img src={buffer} alt="Loading..." className="w-50 h-50" />
    </div>
  );
  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen p-4">
      <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>

        <div className="w-full md:w-auto">
          <button
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
            onClick={() => navigate('/create-user')}
          >
            + New User
          </button>
        </div>
      </div>

      {/* Table and Search */}
      <div className="bg-white p-6 mt-10 rounded-lg shadow-md">
        <div className='flex flex-col md:flex-row gap-4 flex-grow mb-6'>
          <div className='relative w-full md:w-72'>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder='Search by Name or User ID'
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchUser}
              onChange={(e) => {
                setSearchUser(e.target.value);
                setRole('All');
                setCurrentPage(1);
              }}
            />
          </div>

          <div className='relative w-full md:w-72'>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setSearchUser('');
                setCurrentPage(1);
              }}
            >
              {uerRole.map((type) => (
                <option value={type} key={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="rounded-xl overflow-hidden border border-gray-300">
          {/* Desktop Table */}
          <table className="hidden md:table w-full min-w-[100px] divide-y divide-gray-200">
            <thead className="bg-gray-100 h-[50px]">
              <tr className="border-b border-gray-300">
                <th className="py-3 px-4 text-left">User ID</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Mobile</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.userId} className="border-t border-gray-300">
                    <td className="py-3 px-4">{user.userId}</td>
                    <td className="py-3 px-4">{user.userName}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4">{user.mobileNumber}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.active ? 'Active' : 'Inactive'}
                        onChange={(e) => updateUserStatus(user.userId, e.target.value)}
                        className={`px-3 py-1  text-sm font-medium 
    ${user.active ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}
    focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            console.log(user);
                            navigate('/edit-user', { state: { user } })
                          }}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors duration-200"
                          title="Edit"
                        >
                          <FaEdit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => deleteUser(user.userId)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
                          title="Delete"
                        >
                          <FaTrash className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <img src={noData} alt="No users found" className="w-32 h-32 mb-4" />
                      <p className="text-gray-500 text-lg">No users found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div
                  key={user.userId}
                  className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-lg">{user.userName}</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          navigate('/edit-user', { state: { user } });
                        }}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors duration-200"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.userId)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
                        title="Delete"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p><span className="font-medium">User ID:</span> {user.userId}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Role:</span> {user.role}</p>
                  <p><span className="font-medium">Mobile:</span> {user.mobileNumber}</p>
                  <div className="mt-2">
                    <select
                      value={user.active ? 'Active' : 'Inactive'}
                      onChange={(e) => updateUserStatus(user.userId, e.target.value)}
                      className={`w-full px-3 py-1 text-sm font-medium ${user.active
                        ? 'bg-green-200 text-green-900'
                        : 'bg-red-200 text-red-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-400 transition rounded`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <img src={noData} alt="No users found" className="w-32 h-32 mb-4" />
                  <p className="text-gray-500 text-lg">No users found</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-6">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-4 py-1 border-t border-b border-gray-300 bg-white text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserList;