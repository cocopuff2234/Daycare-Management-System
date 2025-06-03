import { useState } from 'react';
import { groupRecordsByDay, generateMonthlyReport } from '../utils/reportUtils';
import { useAttendance } from './useAttendance';

export const useReportGeneration = (daycareId) => {
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [reportBlob, setReportBlob] = useState(null);
  const [reportFileName, setReportFileName] = useState('');
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);

  const { fetchAttendanceRecords } = useAttendance(daycareId);

  const generateReport = async (child, month, year) => {
    try {
      // Use provided month and year parameters directly
      if (!month || !year || !child) {
        console.error("Report parameters missing:", { child, month, year });
        throw new Error('Missing required report parameters');
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Fetch attendance data for the child in the given date range
      const attendanceData = await fetchAttendanceRecords(child.id, startDate, endDate);
      
      // Debug: Log all attendance records
      console.log('All attendance records for report:', attendanceData);
      console.log('Total records found:', attendanceData.length);
      console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());
      console.log('Child ID:', child.id);
      
      // Group records by day for processing
      const recordsByDay = groupRecordsByDay(attendanceData);
      console.log('Records grouped by day:', recordsByDay);

      // Generate the report
      const { blob, fileName } = await generateMonthlyReport(
        child.name,
        year,
        month,
        recordsByDay
      );
      
      setReportBlob(blob);
      setReportFileName(fileName);
      return { blob, fileName };
    } catch (err) {
      console.error('Error in report generation:', err);
      throw err;
    }
  };

  const downloadReport = () => {
    if (reportBlob) {
      const url = URL.createObjectURL(reportBlob);
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = reportFileName;
      document.body.appendChild(a);
      a.click();
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Reset state
      setReportBlob(null);
      setReportFileName('');
      return true;
    }
    return false;
  };

  const resetReportState = () => {
    setReportMonth('');
    setReportYear('');
    setReportBlob(null);
    setReportFileName('');
    setShowReportConfirmation(false);
  };

  return {
    reportMonth,
    reportYear,
    reportBlob,
    reportFileName,
    showReportConfirmation,
    setReportMonth,
    setReportYear,
    setShowReportConfirmation,
    generateReport,
    downloadReport,
    resetReportState
  };
};
