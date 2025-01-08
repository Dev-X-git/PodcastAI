import React, { useState } from 'react';
import { ModalStatus, RangeType } from '../types';
import { formatDownloadFile } from './../utils';

// Define the properties expected by the DownloadModal component
interface DownloadModalProps {
  isOpen: ModalStatus;
  audioUrls: string[];
  parameters: string[];
  genRange: RangeType;
  onClose: () => void;
}

// DownloadModal component definition
export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, audioUrls, parameters, genRange }) => {
  // State to track which audio files are selected for download
  const [selectedAudio, setSelectedAudio] = useState<Array<boolean>>(new Array(audioUrls.length).fill(false));

  // Function to download all audio files
  const downloadAll = () => {
    audioUrls.forEach((audioUrl, index) => {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = formatDownloadFile(parameters[index + genRange.start - 1]); // Use the parameter as the file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Function to download only selected audio files
  const downloadSelected = () => {
    audioUrls.forEach((audioUrl, index) => {
      if (selectedAudio[index]) {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = formatDownloadFile(parameters[index + genRange.start - 1]);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  // Return null if the modal is not open
  if (isOpen !== ModalStatus.Download) {
    return null;
  }

  // Render the modal UI
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-white text-2xl mb-4">Download Audio</h2>
        <div className='h-[600px] overflow-auto'>
          <table className="table-auto w-full text-white">
            <thead>
              <tr>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">Number</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Audio</th>
              </tr>
            </thead>
            <tbody>
              {audioUrls.map((audioFile, index) => (
                <tr key={index} className="border-t border-gray-600">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      onChange={() => {
                        const newSelectedAudio = [...selectedAudio];
                        newSelectedAudio[index] = !newSelectedAudio[index];
                        setSelectedAudio(newSelectedAudio);
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{parameters[index + genRange.start - 1]}</td>
                  <td className="px-4 py-2"><audio controls src={audioFile} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={onClose}>Close</button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={downloadAll}>Download All</button>
          {selectedAudio.some(audio => audio) && (
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={downloadSelected}>Download Selected</button>
          )}
        </div>
      </div>
    </div>
  );
};