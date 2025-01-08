import React, { useState } from 'react';
import { ModalStatus } from '../types';

// Define the properties expected by the SetStartIndexModal component
interface SetStartIndexModalProps {
    isOpen: ModalStatus; // Determines if the modal is open
    onClose: () => void; // Function to close the modal
    startIndex: number; // Current start index value
    setStartIndex: (index: number) => void; // Function to update the start index
    limit: number; // Maximum allowable start index
}

// Functional component for the SetStartIndexModal
const SetStartIndexModal: React.FC<SetStartIndexModalProps> = ({ isOpen, onClose, startIndex, setStartIndex, limit }) => {

    // Return null if the modal is not supposed to be open
    if (isOpen !== ModalStatus.SetStartIndex) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg w-96">
                <h2 className="text-white text-xl mb-4">Set Start Index</h2>
                <input
                    type="number"
                    placeholder="Start Index"
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                    value={startIndex}
                    min={1} // Minimum value set to 1
                    max={limit} // Maximum value set to the provided limit
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        // Update the start index, ensuring it does not exceed the limit
                        setStartIndex(value > limit ? limit : value);
                    }}
                />
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded"
                        onClick={onClose} // Close the modal on cancel
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-cyan-600 text-white rounded"
                        onClick={() => {
                            // Close the modal on confirmation
                            onClose();
                        }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetStartIndexModal;