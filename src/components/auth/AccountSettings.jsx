import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AccountSettings = () => {
  const { currentUser, updateUserProfile, updatePassword, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const font = "'DM Sans', 'Poppins', sans-serif";

  const inputStyle = {
    width: '100%',
    padding: '12px 18px',
    border: '2.5px solid #E0DDD5',
    borderRadius: '12px',
    fontSize: '15px',
    fontFamily: font,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    color: '#2D2D2D'
  };

  const handleFocus = (e) => {
    e.currentTarget.style.borderColor = '#3DAEF5';
    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(61, 174, 245, 0.25)';
  };
  const handleBlur = (e) => {
    e.currentTarget.style.borderColor = '#E0DDD5';
    e.currentTarget.style.boxShadow = 'none';
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (!displayName.trim()) { setProfileError('Display name cannot be empty'); return; }
    setProfileLoading(true);
    try {
      await updateUserProfile({ displayName: displayName.trim() });
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileError('Failed to update profile. Please try again.');
    } finally { setProfileLoading(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmNewPassword) { setPasswordError('Please fill in all password fields'); return; }
    if (newPassword !== confirmNewPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    setPasswordLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
      console.error('Password update error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect');
      } else { setPasswordError('Failed to change password. Please try again.'); }
    } finally { setPasswordLoading(false); }
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
    } finally { setDeleteLoading(false); }
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch (error) { console.error('Logout error:', error); alert('Failed to logout. Please try again.'); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FDF8F0',
      padding: '100px 20px 40px',
      fontFamily: font
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '32px', fontWeight: '800', color: '#2D2D2D', marginBottom: '32px',
          fontFamily: "'Poppins', 'DM Sans', sans-serif"
        }}>
          Account Settings
        </h1>

        {/* Profile Section */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '32px', marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2D2D2D', marginBottom: '24px', fontFamily: font }}>
            Profile Information
          </h2>

          <div style={{
            marginBottom: '24px', padding: '20px', background: '#F0F7ED', borderRadius: '12px',
            border: '1px solid #E0DDD5'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#5A5A5A', fontWeight: '600' }}>Email:</span>
              <div style={{ fontSize: '15px', color: '#2D2D2D', fontWeight: '700', marginTop: '4px' }}>
                {currentUser?.email}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#5A5A5A', fontWeight: '600' }}>Display Name:</span>
              <div style={{ fontSize: '15px', color: '#2D2D2D', fontWeight: '700', marginTop: '4px' }}>
                {currentUser?.displayName || 'Not set'}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#2D2D2D', marginBottom: '8px' }}>
                Update Display Name
              </label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter new display name" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            {profileSuccess && (
              <div style={{
                marginBottom: '16px', padding: '12px 16px', background: '#e4f5e7',
                borderLeft: '5px solid #5EC269', borderRadius: '12px', color: '#2e7d32', fontSize: '14px', fontWeight: '600'
              }}>{profileSuccess}</div>
            )}
            {profileError && (
              <div style={{
                marginBottom: '16px', padding: '12px 16px', background: '#fde8e8',
                borderLeft: '5px solid #E84545', borderRadius: '12px', color: '#b71c1c', fontSize: '14px', fontWeight: '600'
              }}>{profileError}</div>
            )}

            <button type="submit" disabled={profileLoading} style={{
              padding: '12px 28px', background: profileLoading ? '#B0A999' : '#3DAEF5',
              color: 'white', border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
              cursor: profileLoading ? 'not-allowed' : 'pointer', fontFamily: font, transition: 'all 0.2s'
            }}>
              {profileLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Section */}
        {currentUser && !currentUser.providerData.some(p => p.providerId === 'google.com') && (
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px', marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2D2D2D', marginBottom: '24px', fontFamily: font }}>
              Change Password
            </h2>
            <form onSubmit={handleUpdatePassword}>
              {[
                { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, placeholder: 'Enter current password' },
                { label: 'New Password', value: newPassword, setter: setNewPassword, placeholder: 'Enter new password' },
                { label: 'Confirm New Password', value: confirmNewPassword, setter: setConfirmNewPassword, placeholder: 'Re-enter new password' },
              ].map((field) => (
                <div key={field.label} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#2D2D2D', marginBottom: '8px' }}>
                    {field.label}
                  </label>
                  <input type="password" value={field.value} onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              ))}

              {passwordSuccess && (
                <div style={{
                  marginBottom: '16px', padding: '12px 16px', background: '#e4f5e7',
                  borderLeft: '5px solid #5EC269', borderRadius: '12px', color: '#2e7d32', fontSize: '14px', fontWeight: '600'
                }}>{passwordSuccess}</div>
              )}
              {passwordError && (
                <div style={{
                  marginBottom: '16px', padding: '12px 16px', background: '#fde8e8',
                  borderLeft: '5px solid #E84545', borderRadius: '12px', color: '#b71c1c', fontSize: '14px', fontWeight: '600'
                }}>{passwordError}</div>
              )}

              <button type="submit" disabled={passwordLoading} style={{
                padding: '12px 28px', background: passwordLoading ? '#B0A999' : '#3DAEF5',
                color: 'white', border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
                cursor: passwordLoading ? 'not-allowed' : 'pointer', fontFamily: font, transition: 'all 0.2s'
              }}>
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)', border: '2px solid rgba(232, 69, 69, 0.2)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#E84545', marginBottom: '16px', fontFamily: font }}>
            Danger Zone
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={handleLogout} style={{
              padding: '12px 28px', background: 'white', color: '#2D2D2D', border: '2.5px solid #E0DDD5',
              borderRadius: '999px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: font
            }}>
              Logout
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} style={{
              padding: '12px 28px', background: 'white', color: '#E84545', border: '2.5px solid rgba(232, 69, 69, 0.3)',
              borderRadius: '999px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: font
            }}>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div onClick={() => setShowDeleteConfirm(false)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', zIndex: 9999, backdropFilter: 'blur(4px)'
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px',
            zIndex: 10000, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#E84545', marginBottom: '16px', fontFamily: "'Poppins', sans-serif" }}>
              Delete Account?
            </h3>
            <p style={{ fontSize: '15px', color: '#5A5A5A', marginBottom: '24px', lineHeight: '1.6' }}>
              This action cannot be undone. All your saved mats and data will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading} style={{
                flex: 1, padding: '14px', background: 'white', border: '2.5px solid #E0DDD5',
                borderRadius: '999px', fontSize: '15px', fontWeight: '700',
                cursor: deleteLoading ? 'not-allowed' : 'pointer', fontFamily: font
              }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading} style={{
                flex: 1, padding: '14px', background: deleteLoading ? '#B0A999' : '#E84545',
                color: 'white', border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
                cursor: deleteLoading ? 'not-allowed' : 'pointer', fontFamily: font
              }}>
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
