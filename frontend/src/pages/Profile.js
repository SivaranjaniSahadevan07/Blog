import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProfile,
  updateProfilePicture,
  updateUsername,
  updateEmail,
  updatePassword,
} from '../redux/actions/userActions';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, postedBlogs } = useSelector((state) => state.users);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const handleProfilePictureChange = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('profileImage', profileImage);
    dispatch(updateProfilePicture(formData));
    setProfileImage(null); // Clear the input after submission
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUsernameChange = (e) => {
    e.preventDefault();
    dispatch(updateUsername(username));
    setUsername(''); // Clear the input after submission
  };

  const handleEmailChange = (e) => {
    e.preventDefault();
    dispatch(updateEmail(email));
    setEmail(''); // Clear the input after submission
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    dispatch(updatePassword(oldPassword, newPassword));
    setOldPassword(''); // Clear the input after submission
  };

  return (
    <div className="container-fluid row m-auto p-md-5 p-4 text-center d-flex justify-content-center bg-dark-subtle">
      <div className="col-md-6">
        <h4 className="mb-4">Profile</h4>
        <div className="card">
          <div className="card-body">
            <img src={user?.profileImage || 'default-profile.png'} className="rounded-circle card-img border border-dark object-fit-cover"
              style={{ width: "100px", height: "100px" }} alt="profile-pic" />
            <p className="card-title"><b>UserName: </b>{user?.username}</p>
            <p><b>Email: </b>{user?.email}</p>
            {user?.role !== "reader" && <p><b>Posted Blogs: </b>{postedBlogs}</p>}
          </div>
        </div>
        <div className="p-5 pt-4">
          <form className="d-flex flex-column align-items-center" onSubmit={handleProfilePictureChange}>
            <input
              type="file"
              ref={fileInputRef}
              name="profile-image"
              className="form-control"
              onChange={(e) => setProfileImage(e.target.files[0])}
              required
            />
            <button className="btn btn-primary mt-3" type="submit">Change Profile</button>
          </form>
        </div>
      </div>

      <div className="col-md-6">
        <h4 className="mb-4">Change Credentials</h4>
        <form className="d-flex flex-column align-items-center" onSubmit={handleUsernameChange}>
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Enter new username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button className="btn btn-primary mt-3" type="submit">Change UserName</button>
        </form>
        <form className="d-flex flex-column align-items-center mt-3" onSubmit={handleEmailChange}>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Enter new email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn btn-primary mt-3" type="submit">Change Email</button>
        </form>
        <form className="d-flex flex-column align-items-center mt-3" onSubmit={handlePasswordChange}>
          <input
            type="password"
            name="oldPassword"
            className="form-control mb-2"
            placeholder="Enter old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            name="newPassword"
            className="form-control"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary mt-3" type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;