import { useState, useEffect } from 'react';
import { Button, Input, Card } from './ui';
import { getIdToken, resendVerificationEmail } from './auth-service';

const UserProfile = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch full profile data from backend
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = await getIdToken();
      
      const response = await fetch('https://svc-01kb2kaj6e225wh9hdv8rwfpfb.01kaabs55f12xsvgzarqrjkdsa.lmapp.run/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
        setDisplayName(data.user.displayName || user?.name || '');
        setPhotoURL(data.user.photoURL || user?.photoURL || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = await getIdToken();
      
      const response = await fetch('https://svc-01kb2kaj6e225wh9hdv8rwfpfb.01kaabs55f12xsvgzarqrjkdsa.lmapp.run/api/profile/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: displayName || undefined,
          photoURL: photoURL || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Update parent component
      if (onUpdate) {
        onUpdate({
          ...user,
          name: displayName,
          photoURL: photoURL
        });
      }

      // Refresh profile data
      await fetchProfile();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        setSuccess(result.message);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <Card className="profile-card">
        <div className="profile-header">
          <h2>User Profile</h2>
          {!editing && (
            <Button onClick={() => setEditing(true)} variant="secondary" size="sm">
              Edit Profile
            </Button>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {!user?.emailVerified && (
          <div className="verification-warning">
            <strong>⚠️ Email not verified</strong>
            <p>Please verify your email to access all features.</p>
            <Button 
              onClick={handleResendVerification} 
              disabled={loading}
              size="sm"
              variant="secondary"
            >
              Resend Verification Email
            </Button>
          </div>
        )}

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Display Name</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Photo URL</label>
              <Input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="Enter photo URL"
              />
            </div>

            <div className="form-actions">
              <Button 
                type="submit" 
                disabled={loading}
                variant="primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDisplayName(profileData?.displayName || user?.name || '');
                  setPhotoURL(profileData?.photoURL || user?.photoURL || '');
                }}
                variant="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-avatar">
              {photoURL ? (
                <img src={photoURL} alt={displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <label>Name:</label>
                <span>{displayName || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="detail-row">
                <label>Email Verified:</label>
                <span className={user?.emailVerified ? 'verified' : 'not-verified'}>
                  {user?.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                </span>
              </div>
              {profileData?.metadata && (
                <>
                  <div className="detail-row">
                    <label>Account Created:</label>
                    <span>{new Date(profileData.metadata.creationTime).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <label>Last Sign In:</label>
                    <span>{new Date(profileData.metadata.lastSignInTime).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>

            {profileData?.providerData && profileData.providerData.length > 0 && (
              <div className="provider-info">
                <h3>Connected Accounts</h3>
                {profileData.providerData.map((provider, index) => (
                  <div key={index} className="provider-item">
                    <span className="provider-icon">
                      {provider.providerId === 'google.com' ? '🔍' : '📧'}
                    </span>
                    <span className="provider-name">
                      {provider.providerId === 'google.com' ? 'Google' : 'Email'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;
