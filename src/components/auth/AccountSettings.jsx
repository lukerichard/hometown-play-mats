import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AccountSettings = () => {
  const { currentUser, updateUserProfile, updatePassword, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  // Profile update state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!displayName.trim()) {
      setProfileError('Display name cannot be empty');
      return;
    }

    setProfileLoading(true);

    try {
      await updateUserProfile({ displayName: displayName.trim() });
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
      console.error('Password update error:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else if (error.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect');
      } else {
        setPasswordError('Failed to change password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    try {
      await deleteAccount();
      await logout();
      navigate('/signup');
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account. You may need to re-login and try again.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafb',
      padding: '100px 20px 40px',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#3A3A3A',
          marginBottom: '32px',
          letterSpacing: '-0.5px'
        }}>
          Account Settings
        </h1>

        {/* Profile Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#3A3A3A',
            marginBottom: '24px'
          }}>
            Profile Information
          </h2>

          {/* Current Info Display */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(121, 151, 127, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(121, 151, 127, 0.5)'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Email:</span>
              <div style={{ fontSize: '15px', color: '#3A3A3A', fontWeight: '700', marginTop: '4px' }}>
                {currentUser?.email}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Display Name:</span>
              <div style={{ fontSize: '15px', color: '#3A3A3A', fontWeight: '700', marginTop: '4px' }}>
                {currentUser?.displayName || 'Not set'}
              </div>
            </div>
          </div>

          {/* Update Profile Form */}
          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: '#3A3A3A',
                marginBottom: '8px'
              }}>
                Update Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter new display name"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid rgba(121, 151, 127, 0.6)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {profileSuccess && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(121, 151, 127, 0.3)',
                border: '1px solid rgba(121, 151, 127, 0.5)',
                borderRadius: '10px',
                color: '#A86E67',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '10px',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {profileError}
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              style={{
                padding: '14px 24px',
                background: profileLoading ? '#9ca3af' : 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: profileLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {profileLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Section - Only show for email/password users */}
        {currentUser && !currentUser.providerData.some(p => p.providerId === 'google.com') && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#3A3A3A',
              marginBottom: '24px'
            }}>
              Change Password
            </h2>

            <form onSubmit={handleUpdatePassword}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#3A3A3A',
                  marginBottom: '8px'
                }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid rgba(121, 151, 127, 0.6)',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#3A3A3A',
                  marginBottom: '8px'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid rgba(121, 151, 127, 0.6)',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#3A3A3A',
                  marginBottom: '8px'
                }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid rgba(121, 151, 127, 0.6)',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {passwordSuccess && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: 'rgba(121, 151, 127, 0.3)',
                  border: '1px solid rgba(121, 151, 127, 0.5)',
                  borderRadius: '10px',
                  color: '#A86E67',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '10px',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  padding: '14px 24px',
                  background: passwordLoading ? '#9ca3af' : 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '2px solid rgba(220, 38, 38, 0.2)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#dc2626',
            marginBottom: '16px'
          }}>
            Danger Zone
          </h2>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleLogout}
              style={{
                padding: '14px 24px',
                background: 'white',
                color: '#3A3A3A',
                border: '2px solid rgba(121, 151, 127, 0.6)',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Logout
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '14px 24px',
                background: 'white',
                color: '#dc2626',
                border: '2px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            onClick={() => setShowDeleteConfirm(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999,
              backdropFilter: 'blur(4px)'
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            zIndex: 10000,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#dc2626',
              marginBottom: '16px'
            }}>
              Delete Account?
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              This action cannot be undone. All your saved mats and data will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'white',
                  border: '2px solid rgba(121, 151, 127, 0.6)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: deleteLoading ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSettings;
