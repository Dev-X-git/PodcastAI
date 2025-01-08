import React, { useState } from 'react';

// Define the props for the AddPromptModal component
interface AddPromptModalProps {
  isOpen: boolean; // Determines if the modal is open
  onClose: () => void; // Function to close the modal
  onAdd: (title: string, description: string) => void; // Function to add a new prompt
}

// AddPromptModal component
export const AddPromptModal: React.FC<AddPromptModalProps> = ({ isOpen, onClose, onAdd }) => {
  // State to manage the new prompt's title and description
  const [newPrompt, setNewPrompt] = useState({ title: '', description: '' });

  // Function to handle adding a new prompt
  const handleAdd = () => {
    onAdd(newPrompt.title, newPrompt.description); // Call the onAdd function with the new prompt data
    setNewPrompt({ title: '', description: '' }); // Reset the prompt fields
  };

  // If the modal is not open, return null to render nothing
  if (!isOpen) {
    return null;
  }

  // Render the modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-lg w-96">
        <h2 className="text-white text-xl mb-4">Add New Prompt</h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
          value={newPrompt.title}
          onChange={(e) =>
            setNewPrompt({ ...newPrompt, title: e.target.value }) // Update the title in state
          }
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
          value={newPrompt.description}
          onChange={(e) =>
            setNewPrompt({ ...newPrompt, description: e.target.value }) // Update the description in state
          }
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded"
            onClick={onClose} // Close the modal
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-cyan-600 text-white rounded"
            onClick={handleAdd} // Add the new prompt
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};