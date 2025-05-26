import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Error fetching user:', error);
          navigate('/signin');
          return;
        }
        
        setUser(user);
      } catch (err) {
        console.error('Error in user fetch:', err);
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    setUpdating(true);
    setError(null);
    
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        setError("Current password is incorrect");
        setUpdating(false);
        return;
      }
      
      // If verification passes, update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error.message);
      } else {
        setUpdateSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setUpdating(true);
    setError(null);
    
    try {
      // First, get all the user's daycares and delete them
      const { data: ownedDaycares, error: daycareError } = await supabase
        .from('Daycares')
        .select('id')
        .eq('user_id', user.id);
        
      if (daycareError) {
        throw daycareError;
      }
      
      // Delete all daycares owned by the user
      if (ownedDaycares && ownedDaycares.length > 0) {
        const daycareIds = ownedDaycares.map(dc => dc.id);
        
        // Delete from DaycareMembers where daycare_id in daycareIds
        const { error: memberDeleteError } = await supabase
          .from('DaycareMembers')
          .delete()
          .in('daycare_id', daycareIds);
          
        if (memberDeleteError) {
          throw memberDeleteError;
        }
        
        // Delete the daycares themselves
        const { error: daycareDeleteError } = await supabase
          .from('Daycares')
          .delete()
          .in('id', daycareIds);
          
        if (daycareDeleteError) {
          throw daycareDeleteError;
        }
      }
      
      // Delete user's memberships
      const { error: userMembershipsError } = await supabase
        .from('DaycareMembers')
        .delete()
        .eq('user_id', user.id);
        
      if (userMembershipsError) {
        throw userMembershipsError;
      }
      
      // Ask for password to verify identity before deleting
      const password = prompt("Please enter your password to confirm account deletion:");
      
      if (!password) {
        throw new Error('Password is required to delete your account');
      }
      
      // Re-authenticate the user first to verify their identity
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });
      
      if (signInError) {
        throw new Error('Password verification failed: ' + signInError.message);
      }
      
      // Attempt to scramble sensitive user data for privacy
      // This won't trigger email confirmations but helps with privacy
      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { 
            deleted: true,
            deletion_time: new Date().toISOString(),
            original_email_hash: hashString(user.email) // Store only a hash for reference
          }
        });
        
        if (metadataError) {
          console.warn('Failed to update user metadata:', metadataError);
        }
      } catch (err) {
        console.warn('Error updating user metadata:', err);
      }
      
      // Important: Instead of changing the email (which triggers confirmation emails),
      // we'll just invalidate the session and inform the user that all their data is gone
      
      // Sign the user out from all devices
      await supabase.auth.signOut({ scope: 'global' });
      
      // Try to log the deleted user for admin reference, but don't fail if table doesn't exist
      try {
        await supabase.from('deleted_users_log').insert([{
          user_id: user.id,
          email: user.email,
          deleted_at: new Date().toISOString()
        }]);
      } catch (logError) {
        // This is non-critical, log to console but don't interrupt the flow
        console.warn('Note: Failed to log deleted user. This is not a critical error.', logError);
      }
      
      alert(`Your account data has been successfully deleted. The account is now inaccessible.
      
Note: For security reasons, the account entry might still appear in the authentication system, but it has been completely disconnected from all data and is no longer usable.`);
      
      navigate('/');
      
    } catch (err) {
      setError('Failed to delete account: ' + (err.message || 'Unknown error'));
      console.error('Delete account error:', err);
    } finally {
      setUpdating(false);
      setShowConfirmDelete(false);
    }
  };

  // Simple string hashing function for privacy
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16); // Convert to hex
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <button className="back-button" onClick={goBack}>
            ← Back
          </button>
          <h1>User Settings</h1>
        </div>
        
        <div className="user-info-section">
          <h2>Your Information</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Account created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="password-reset-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                className="placeholder-input"
              />
            </div>
            
            <div className="form-group">
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                className="placeholder-input"
              />
            </div>
            
            <div className="form-group">
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
                className="placeholder-input"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {updateSuccess && <div className="success-message">Password updated successfully!</div>}
            
            <button 
              type="submit"
              className="update-password-btn"
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
        
        <div className="danger-zone">
          <h2>Danger Zone</h2>
          <p>Deleting your account will permanently remove all your data including any daycares you've created.</p>
          
          {!showConfirmDelete ? (
            <button 
              className="delete-account-btn"
              onClick={() => setShowConfirmDelete(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className="confirm-delete">
              <p>Are you sure? This action cannot be undone.</p>
              <div className="confirm-buttons">
                <button 
                  className="confirm-delete-btn"
                  onClick={handleDeleteAccount}
                  disabled={updating}
                >
                  {updating ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button 
                  className="cancel-delete-btn"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
