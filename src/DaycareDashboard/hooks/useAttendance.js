import { useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { getSignatureDataUrl, isSignaturePadEmpty } from '../utils/signatureUtils';

export const useAttendance = (daycareId) => {
  const sigPadRef = useRef(null);

  const recordAttendance = async (childId, type, signatureDataUrl, note = '') => {
    // Store the current timestamp
    const currentTimestamp = new Date().toISOString();
    
    const { data, error } = await supabase.from('Attendance').insert([
      {
        child_id: childId,
        daycare_id: daycareId,
        type: type,
        parent_signature: signatureDataUrl || '',
        timestamp: currentTimestamp,
        note: note
      }
    ]);

    if (error) {
      console.error('Database error details:', error);
      throw new Error('Error saving attendance: ' + error.message);
    }
    
    return { data, timestamp: currentTimestamp };
  };

  const recordSignatureAttendance = async (child, type) => {
    if (isSignaturePadEmpty(sigPadRef)) {
      throw new Error('Please provide a signature.');
    }

    const signatureDataUrl = getSignatureDataUrl(sigPadRef);
    return await recordAttendance(child.id, type, signatureDataUrl);
  };

  const recordAbsence = async (child, reason) => {
    return await recordAttendance(child.id, 'absent', '', reason);
  };

  const fetchAttendanceRecords = async (childId, startDate, endDate) => {
    // Set end date to end of day to include all records
    const endWithTime = new Date(endDate);
    endWithTime.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('Attendance')
      .select('*')
      .eq('child_id', childId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endWithTime.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error('Error fetching attendance: ' + error.message);
    }

    return data || [];
  };

  return {
    sigPadRef,
    recordSignatureAttendance,
    recordAbsence,
    fetchAttendanceRecords
  };
};
