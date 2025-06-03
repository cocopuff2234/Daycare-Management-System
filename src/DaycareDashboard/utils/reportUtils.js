import ExcelJS from 'exceljs';
import { formatLocalTime, formatDateWithDay } from './dateUtils';

// Group attendance records by day
export const groupRecordsByDay = (attendanceData) => {
  const recordsByDay = {};
  attendanceData.forEach(record => {
    // Convert the UTC timestamp to a Date object
    const utcDate = new Date(record.timestamp);
    // Convert to the user's local time zone
    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    // Use the local date string for grouping (YYYY-MM-DD)
    const localDateStr = localDate.getFullYear() + '-' +
      String(localDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(localDate.getDate()).padStart(2, '0');

    if (!recordsByDay[localDateStr]) {
      recordsByDay[localDateStr] = [];
    }
    recordsByDay[localDateStr].push({
      ...record,
      type: record.type,
      time: localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      hasSignature: !!record.parent_signature,
      note: record.note || null,
      timestamp: record.timestamp
    });
  });
  return recordsByDay;
};

// Generate monthly attendance report
export const generateMonthlyReport = async (childName, reportYear, reportMonth, recordsByDay) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startDate);

    // Add title rows before header
    const titleRow = sheet.addRow([`${childName}'s ${monthName} ${reportYear} Attendance`]);
    titleRow.font = { bold: true, size: 14 };
    sheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.addRow([]); // Spacer
    sheet.addRow(['Date', 'Time In', 'Check-In Signature', 'Time Out', 'Check-Out Signature']);
    
    sheet.columns = [
      { key: 'date', width: 20 },
      { key: 'timeIn', width: 20 },
      { key: 'checkInSig', width: 30 },
      { key: 'timeOut', width: 20 },
      { key: 'checkOutSig', width: 30 },
    ];

    const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(reportYear, reportMonth - 1, day);
      
      // Create local date string for matching
      const localDayStr = date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0');
      
      // Format date with day of week
      const dateWithDay = formatDateWithDay(date);

      // Find attendance records for this day using local date string
      const dayRecords = recordsByDay[localDayStr] || [];
      
      const checkIn = dayRecords.find(r => r.type === 'check_in');
      const checkOut = dayRecords.find(r => r.type === 'check_out');
      const absent = dayRecords.find(r => r.type === 'absent');

      const checkInTime = checkIn?.timestamp ? formatLocalTime(checkIn.timestamp) : (absent?.note ? `Absent: ${absent.note}` : '');
      const checkOutTime = checkOut?.timestamp ? formatLocalTime(checkOut.timestamp) : '';

      const rowData = {
        date: dateWithDay,
        timeIn: checkInTime,
        checkInSig: '',
        timeOut: checkOutTime,
        checkOutSig: '',
      };
      const row = sheet.addRow(rowData);

      // Set row height for signature visibility
      if (checkIn?.hasSignature || checkOut?.hasSignature) {
        row.height = 50;
      }

      // Add signature images if they exist
      if (checkIn?.hasSignature && checkIn.parent_signature) {
        try {
          const base64 = checkIn.parent_signature.replace(/^data:image\/png;base64,/, '');
          const imageId = workbook.addImage({ base64, extension: 'png' });
          // Full width, but not too tall (more vertical inset)
          sheet.addImage(imageId, {
            tl: { col: 2, row: row.number - 1 + 0.25 }, // start at left edge, inset top
            br: { col: 3, row: row.number - 0.25 },     // end at right edge, inset bottom
            editAs: 'oneCell'
          });
        } catch (err) {
          console.error('Error adding check-in signature image:', err);
        }
      }

      if (checkOut?.hasSignature && checkOut.parent_signature) {
        try {
          const base64 = checkOut.parent_signature.replace(/^data:image\/png;base64,/, '');
          const imageId = workbook.addImage({ base64, extension: 'png' });
          // Full width, but not too tall (more vertical inset)
          sheet.addImage(imageId, {
            tl: { col: 4, row: row.number - 1 + 0.25 },
            br: { col: 5, row: row.number - 0.25 },
            editAs: 'oneCell'
          });
        } catch (err) {
          console.error('Error adding check-out signature image:', err);
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    const fileName = `${childName}_${monthName}_${reportYear}_Attendance.xlsx`;
    
    return { blob, fileName };
  } catch (err) {
    console.error('Error generating report:', err);
    throw err;
  }
};
