import React, { useEffect, useRef, useState } from 'react';
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
  const { user, postedBlogs, userError } = useSelector((state) => state.users);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const runUpdate = async (key, action, successMessage, reset) => {
    if (pending) return;
    setPending(key);
    setNotice('');
    try {
      const result = await action();
      if (result) {
        setNotice(successMessage);
        reset?.();
      }
    } finally {
      setPending('');
    }
  };

  const handleProfilePictureChange = async (event) => {
    event.preventDefault();
    if (!profileImage) return;
    const formData = new FormData();
    formData.append('profileImage', profileImage);
    await runUpdate('image', () => dispatch(updateProfilePicture(formData)), 'Profile photo updated.', () => {
      setProfileImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    setImageError('');
    if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
      setImageError('Choose a JPG or PNG image.');
      event.target.value = '';
      setProfileImage(null);
    } else if (file && file.size > 2 * 1024 * 1024) {
      setImageError('Your image must be smaller than 2 MB.');
      event.target.value = '';
      setProfileImage(null);
    } else {
      setProfileImage(file || null);
    }
  };

  const handleUsernameChange = (event) => {
    event.preventDefault();
    runUpdate('username', () => dispatch(updateUsername(username.trim())), 'Username updated.', () => setUsername(''));
  };

  const handleEmailChange = (event) => {
    event.preventDefault();
    runUpdate('email', () => dispatch(updateEmail(email.trim())), 'Email address updated.', () => setEmail(''));
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    runUpdate('password', () => dispatch(updatePassword(oldPassword, newPassword)), 'Password updated.', () => {
      setOldPassword('');
      setNewPassword('');
    });
  };

  return (
    <main className="profile-page profile-page-redesign">
      <div className="profile-shell">
        <header className="profile-heading">
          <span className="eyebrow">YOUR ACCOUNT</span>
          <h1>Make yourself at home.</h1>
          <p>Manage your profile and keep your account details up to date.</p>
        </header>

        <div className="profile-layout">
          <section className="profile-card">
            <div className="profile-avatar-wrap">
              <img
                src={user?.profileImage || 'default-profile.png'}
                className="profile-avatar"
                alt={user?.username ? `${user.username}'s profile` : 'Profile'}
              />
              <span className="profile-role">{user?.role || 'Member'}</span>
            </div>
            <h2>{user?.username || 'Your profile'}</h2>
            <p className="profile-email">{user?.email || ' '}</p>
            {user?.role !== 'reader' && (
              <div className="profile-stat">
                <strong>{postedBlogs || 0}</strong>
                <span>stories published</span>
              </div>
            )}
            <form className="profile-photo-form" onSubmit={handleProfilePictureChange}>
              <label htmlFor="profile-photo">Profile photo</label>
              <input
                id="profile-photo"
                type="file"
                ref={fileInputRef}
                name="profile-image"
                className="form-control"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
              />
              <small>JPG or PNG · up to 2 MB</small>
              {imageError && <p className="profile-inline-error" role="alert">{imageError}</p>}
              <button className="profile-save-button" type="submit" disabled={!profileImage || pending === 'image'}>
                {pending === 'image' ? 'Updating…' : 'Update photo'}
              </button>
            </form>
          </section>

          <section className="profile-settings">
            <div className="profile-settings-heading">
              <span className="eyebrow">ACCOUNT SETTINGS</span>
              <h2>Update your details</h2>
            </div>
            {notice && <p className="profile-notice" role="status">{notice}</p>}
            {userError && <p className="profile-inline-error" role="alert">{userError}</p>}

            <form className="profile-edit-form" onSubmit={handleUsernameChange}>
              <div className="profile-form-copy">
                <h3>Username</h3>
                <p>Choose the name readers see on your stories and comments.</p>
              </div>
              <div className="profile-form-controls">
                <label className="visually-hidden" htmlFor="profile-username">New username</label>
                <input
                  id="profile-username"
                  type="text"
                  className="form-control"
                  placeholder={user?.username || 'Enter a new username'}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
                <button type="submit" className="profile-save-button" disabled={!username.trim() || pending === 'username'}>
                  {pending === 'username' ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>

            <form className="profile-edit-form" onSubmit={handleEmailChange}>
              <div className="profile-form-copy">
                <h3>Email address</h3>
                <p>Keep your sign-in address current.</p>
              </div>
              <div className="profile-form-controls">
                <label className="visually-hidden" htmlFor="profile-email">New email address</label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-control"
                  placeholder={user?.email || 'Enter a new email'}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <button type="submit" className="profile-save-button" disabled={!email.trim() || pending === 'email'}>
                  {pending === 'email' ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>

            <form className="profile-edit-form profile-password-form" onSubmit={handlePasswordChange}>
              <div className="profile-form-copy">
                <h3>Password</h3>
                <p>Use your current password to choose a new one.</p>
              </div>
              <div className="profile-form-controls profile-password-controls">
                <label className="visually-hidden" htmlFor="profile-old-password">Current password</label>
                <input
                  id="profile-old-password"
                  type="password"
                  className="form-control"
                  placeholder="Current password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  required
                />
                <label className="visually-hidden" htmlFor="profile-new-password">New password</label>
                <input
                  id="profile-new-password"
                  type="password"
                  className="form-control"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
                <button type="submit" className="profile-save-button" disabled={!oldPassword || !newPassword || pending === 'password'}>
                  {pending === 'password' ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Profile;
