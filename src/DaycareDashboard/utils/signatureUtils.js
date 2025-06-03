// Helper to initialize or reset a signature pad
export const initializeSignaturePad = (sigPadRef) => {
  if (sigPadRef?.current) {
    try {
      // Ensure the canvas is resized properly without resetting
      sigPadRef.current.off(); // stop old listeners if any
      sigPadRef.current.on();  // reattach safely
    } catch (err) {
      console.warn('Signature pad init error:', err);
    }
  }
};

// Helper to clear a signature pad
export const clearSignaturePad = (sigPadRef) => {
  if (sigPadRef?.current) {
    sigPadRef.current.clear();
  }
};

// Helper to get signature data URL from pad
export const getSignatureDataUrl = (sigPadRef) => {
  if (sigPadRef?.current && !sigPadRef.current.isEmpty()) {
    return sigPadRef.current.getCanvas().toDataURL('image/png');
  }
  return null;
};

// Check if signature pad is empty
export const isSignaturePadEmpty = (sigPadRef) => {
  return !sigPadRef?.current || sigPadRef.current.isEmpty();
};
