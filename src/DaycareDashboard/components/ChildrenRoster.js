import React from 'react';

const ChildrenRoster = ({ children, openSignatureModal, openAbsentModal, openReportModal }) => {
  return (
    <table className="dashboard-table daycare-roster-table" style={{ marginTop: '20px' }}>
      <tbody>
        {children.length === 0 ? (
          <tr>
            <td>No children on this roster yet.</td>
          </tr>
        ) : (
          children.map((child, idx) => (
            <tr key={child.id || idx}>
              <td>
                <strong>{child.name}</strong><br />
                DOB: {child.dob}
              </td>
              <td style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginRight: 8 }}>
                  <button
                    onClick={() => openSignatureModal(child, 'check_in')}
                  >
                    Check In
                  </button>
                </span>
                <span style={{ display: 'inline-block', marginRight: 8 }}>
                  <button
                    onClick={() => openSignatureModal(child, 'check_out')}
                  >
                    Check Out
                  </button>
                </span>
                <span style={{ display: 'inline-block', marginRight: 8 }}>
                  <button onClick={() => openAbsentModal(child)}>
                    Mark Absent
                  </button>
                </span>
                <span style={{ display: 'inline-block' }}>
                  <button onClick={() => openReportModal(child)}>
                    View Monthly Report
                  </button>
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ChildrenRoster;
