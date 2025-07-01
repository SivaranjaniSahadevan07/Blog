import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  createUser,
  updateUserRole,
  blockUnblockUser,
  deleteUser,
} from "../redux/actions/userActions";

const PromoteUser = () => {
  const dispatch = useDispatch();
  const { users, loading, totalPages, currentPage } = useSelector((state) => state.users);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "reader" });
  const [page, setPage] = useState(1);
  const limit = 10; // Number of users per page

  // console.log(users)

  useEffect(() => {
    dispatch(getAllUsers(page, limit, searchQuery));
  }, [dispatch, page, searchQuery, limit]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    await dispatch(createUser(newUser));
    dispatch(getAllUsers(page, limit, searchQuery));
    setNewUser({ username: "", email: "", password: "", role: "reader" });
  };

  const handlePromote = (userId, role) => {
    dispatch(updateUserRole(userId, role));
    // dispatch(getAllUsers(page, limit, searchQuery));
  };

  const handleBlockUnblock = (userId, isBlocked) => {
    dispatch(blockUnblockUser(userId, !isBlocked));
    // dispatch(getAllUsers(page, limit, searchQuery));
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(userId));
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;


  return (
    <div className="container-fluid p-md-5 p-4 bg-dark-subtle">
      <h4 className="mt-4">Manage Users</h4>

      {/* Create User Form */}
      <form onSubmit={handleCreateUser} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="reader">Reader</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100">
              Create User
            </button>
          </div>
        </div>
      </form>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by username or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* User Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isBlocked ? "Blocked" : "Active"}</td>
                <td>
                  <div className="d-flex gap-2">
                    {/* Change Role */}
                    <select
                      className="form-select form-select-sm"
                      value={u.role}
                      onChange={(e) => handlePromote(u._id, e.target.value)}
                    >
                      <option value="reader">Reader</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* Block/Unblock */}
                    <button
                      className={`btn btn-sm ${u.isBlocked ? "btn-warning" : "btn-secondary"}`}
                      onClick={() => handleBlockUnblock(u._id, u.isBlocked)}
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>

                    {/* Delete */}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(u._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="btn btn-secondary"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PromoteUser;