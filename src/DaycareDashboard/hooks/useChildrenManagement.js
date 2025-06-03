import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const useChildrenManagement = (daycareId, onRosterUpdate) => {
  const [newChild, setNewChild] = useState({ name: '', dob: '' });
  const [removeChild, setRemoveChild] = useState({ name: '', dob: '' });

  const handleChildFormChange = (e) => {
    setNewChild({ ...newChild, [e.target.name]: e.target.value });
  };

  const handleRemoveChildFormChange = (e) => {
    setRemoveChild({ ...removeChild, [e.target.name]: e.target.value });
  };

  const addChild = async (e) => {
    e.preventDefault();
    if (!newChild.name || !newChild.dob) {
      alert('Please fill out all fields.');
      return;
    }
    const { error } = await supabase.from('Roster').insert([
      { ...newChild, daycare_id: daycareId }
    ]);
    if (error) {
      alert('Error adding child: ' + error.message);
      return false;
    } else {
      setNewChild({ name: '', dob: '' });
      if (onRosterUpdate) onRosterUpdate();
      return true;
    }
  };

  const removeChildFromRoster = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('Roster')
      .delete()
      .match({ name: removeChild.name, dob: removeChild.dob, daycare_id: daycareId });

    if (error) {
      alert('Error removing child: ' + error.message);
      return false;
    } else {
      setRemoveChild({ name: '', dob: '' });
      if (onRosterUpdate) onRosterUpdate();
      return true;
    }
  };

  return {
    newChild,
    removeChild,
    setNewChild,
    setRemoveChild,
    handleChildFormChange,
    handleRemoveChildFormChange,
    addChild,
    removeChildFromRoster
  };
};
