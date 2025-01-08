import React, { useState } from "react";
import { RangeType } from "../types";
import { ModalStatus } from "../types";

// Define the props for the SetGenerateAudioRangeModal component
interface SetGenerateAudioRangeModalProps {
  isOpen: ModalStatus; // Determines if the modal is open
  onClose: () => void; // Function to close the modal
  genRange: RangeType; // Current range values
  setGenRange: (index: RangeType) => void; // Function to update the range
  limit: number; // Maximum limit for the range
}

// Functional component for setting the audio generation range
const SetGenerateAudioRangeModal: React.FC<SetGenerateAudioRangeModalProps> = ({
  isOpen,
  onClose,
  genRange,
  setGenRange,
  limit,
}) => {
  // Return null if the modal is not open
  if (isOpen !== ModalStatus.SetRangeModal) {
    return null;
  }

  return (
    // Modal overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      {/* Modal content */}
      <div className="bg-slate-800 p-6 rounded-lg w-96 flex flex-col gap-4">
        <h2 className="text-white text-xl mb-4">Set Start Index</h2>
        
        {/* Input for start index */}
        <div className="flex w-full items-center justify-between gap-4">
          <p className="text-white">Start:</p>
          <input
            type="number"
            placeholder="Start Index"
            className="p-2 w-4/5 bg-gray-700 text-white rounded"
            value={genRange.start}
            min={1} // Minimum value set to 1
            max={limit} // Maximum value set to limit
            onChange={(e) => {
              const value = Number(e.target.value);
              setGenRange({ start: value, end: genRange.end }); // Update start index
            }}
          />
        </div>
        
        {/* Input for end index */}
        <div className="flex w-full items-center justify-between gap-4">
          <p className="text-white">End:</p>
          <input
            type="number"
            placeholder="End Index"
            className="w-4/5 p-2 bg-gray-700 text-white rounded"
            value={genRange.end}
            min={1} // Minimum value set to 1
            max={limit} // Maximum value set to limit
            onChange={(e) => {
              const value = Number(e.target.value);
              setGenRange({ start: genRange.start, end: value }); // Update end index
            }}
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded"
            onClick={onClose} // Close modal on cancel
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-cyan-600 text-white rounded"
            onClick={() => {
              onClose(); // Close modal on OK
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetGenerateAudioRangeModal;