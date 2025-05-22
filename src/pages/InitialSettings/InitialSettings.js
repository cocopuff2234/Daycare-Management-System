import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './InitialSettings.css';

const InitialSettings = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleRoleSelect = async (role) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('No user found.');
      return;
    }

    // Check if user already has a role set
    const { data: existingUser, error: fetchError } = await supabase
      .from('Users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') { // Not "No rows found"
      alert('Error fetching user role: ' + fetchError.message);
      return;
    }

    if (existingUser && existingUser.role) {
      // Role already set, prevent changing
      alert('Your role has already been set and cannot be changed.');
      // Optionally, redirect anyway
      navigate('/dashboard');
      return;
    }

    // If user row exists, update; otherwise, insert
    let upsertResult;
    if (existingUser) {
      upsertResult = await supabase
        .from('Users')
        .update({ role })
        .eq('id', user.id);
    } else {
      upsertResult = await supabase
        .from('Users')
        .insert([{ id: user.id, role }]);
    }
    const { error: upsertError } = upsertResult;
    if (upsertError) {
      alert('Error saving role: ' + upsertError.message);
      return;
    }

    // Save role in localStorage
    localStorage.setItem('role', role);
    // Redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="initial-settings-container">
      <button onClick={handleBack} className="back-button">← Back to Home</button>
      <h2 className="initial-settings-heading">You are a:</h2>
      <div className="role-cards">
        <div
          className="role-card"
          onClick={() => handleRoleSelect('parent')}
          style={{ cursor: 'pointer' }}
        >
          <span>Parent</span>
        </div>
        <div
          className="role-card"
          onClick={() => handleRoleSelect('administrator')}
          style={{ cursor: 'pointer' }}
        >
          <span>Administrator</span>
        </div>
      </div>
    </div>
  );
};

export default InitialSettings;