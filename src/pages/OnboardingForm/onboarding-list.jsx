import React, { useState, useEffect } from "react";
import {
  getAllOnboardingList,
  approveOnboarding,
  updateActiveStatus
} from "../../services/onboardingServices";
import { Info } from "lucide-react";
import Swal from 'sweetalert2';

export default function OnboardingList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false); // new popup for info

  useEffect(() => {
    fetchAllOnboardingList();
  }, []);

  const fetchAllOnboardingList = async () => {
    const res = await getAllOnboardingList();
    if (res.message == "Session is Expired") {
      localStorage.removeItem("token");
      localStorage.clear();
      Swal.fire({
        icon: 'warning',
        title: 'Logged out!',
        text: kpiData.message,
        customClass: { icon: 'scale-down' }
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.clear();
        navigate("/login", { replace: true });
        window.location.reload();

      });
    }
    else {
      setUsers(res);
    }

  };

  const handleApproveClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleConfirmApprove = async () => {
    await approveOnboarding(selectedUser.onboardingid);
    await fetchAllOnboardingList();
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Show info popup
  const handleInfoClick = (user) => {
    setSelectedUser(user);
    setShowInfoModal(true);
  };

  // Close info popup
  const closeInfoModal = () => {
    setShowInfoModal(false);
    setSelectedUser(null);
  };


  const toggleUserStatus = async (user) => {
    try {
      const updatedStatus = !user.isactive;
      var json = { "isactive": updatedStatus };
      await updateActiveStatus(user.onboardingid, { "isactive": updatedStatus });

      // Update UI without reloading everything
      setUsers((prev) =>
        prev.map((u) =>
          u.onboardingid === user.onboardingid
            ? { ...u, isactive: updatedStatus }
            : u
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };
  // 👇 Add these new states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusUser, setPendingStatusUser] = useState(null);

  // 👇 Update this function (instead of toggling directly)
  const handleStatusToggle = (user) => {
    setPendingStatusUser(user);
    setShowStatusModal(true);
  };

  // 👇 When user confirms in the modal
  const confirmStatusToggle = async () => {
    if (!pendingStatusUser) return;
    await toggleUserStatus(pendingStatusUser);
    setShowStatusModal(false);
    setPendingStatusUser(null);
  };

  // 👇 When user cancels in the modal
  const cancelStatusToggle = () => {
    setShowStatusModal(false);
    setPendingStatusUser(null);
  };


  return (
    <div className="p-6 bg-gray-50 ">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Onboarding Users
      </h2>

      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">
                Onboarding ID
              </th>
              <th className="px-4 py-3 text-left font-medium">User Name</th>
              <th className="px-4 py-3 text-left font-medium">Company Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Phone Number</th>
              <th className="px-4 py-3 text-left font-medium">Approved</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="text-left font-medium w-10"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{user.onboardingid}</td>
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{user.companyname}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.usersphonenumber}</td>
                <td className="px-4 py-3">
                  {user.approved ? (
                    <span className="text-green-600 font-semibold">
                      Approved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApproveClick(user)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Approve
                    </button>
                  )}
                </td>

                {/* ✅ New column for Active / Inactive */}
                <td className="px-4 py-3">
                  {user.approved ?
                    (<div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleStatusToggle(user)}

                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${user.isactive ? "bg-green-500" : "bg-gray-300"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${user.isactive ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>

                      <span
                        className={`text-sm font-semibold ${user.isactive ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {user.isactive ? "Active" : "Inactive"}
                      </span>
                    </div>) : (<div></div>)
                  }
                </td>


                {/* Info Icon */}
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInfoClick(user);
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <Info size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Approve Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Approve User
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve{" "}
              <span className="font-semibold">{selectedUser?.user_name}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Info Popup Modal */}
      {showInfoModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Company Details
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Company Name:</strong> {selectedUser.companyname}
              </p>
              <p>
                <strong>Area/Street:</strong>{" "}
                {selectedUser.company_area_street || "-"}
              </p>
              <p>
                <strong>City:</strong> {selectedUser.company_city || "-"}
              </p>
              <p>
                <strong>State:</strong> {selectedUser.company_state || "-"}
              </p>
              <p>
                <strong>Zip Code:</strong> {selectedUser.company_zip_code || "-"}
              </p>
              <p>
                <strong>GST Number:</strong> {selectedUser.company_gst_number || "-"}
              </p>
              <p>
                <strong>Website:</strong> {selectedUser.company_website || "-"}
              </p>
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={closeInfoModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Status Confirmation Modal */}
      {showStatusModal && pendingStatusUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Change User Status
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to{" "}
              <span className="font-semibold">
                {pendingStatusUser.isactive ? "deactivate" : "activate"}
              </span>{" "}
              <span className="font-semibold">{pendingStatusUser.user_name}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelStatusToggle}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusToggle}
                className={`px-4 py-2 rounded text-white ${pendingStatusUser.isactive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {pendingStatusUser.isactive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
