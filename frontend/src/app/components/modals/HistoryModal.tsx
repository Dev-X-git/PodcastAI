import React, { useState } from "react";
import { ModalStatus } from "../types";
import { HistoryEntry } from "../types";
import {
  AiOutlineDownload,
  AiFillPlayCircle,
  AiFillPauseCircle,
  AiOutlineArrowRight,
  AiOutlineArrowLeft,
} from "react-icons/ai";

// Define the properties expected by the HistoryModal component
interface HistoryModalProps {
  isOpen: ModalStatus; // Status to determine if the modal is open
  onClose: () => void; // Function to close the modal
  historyData: HistoryEntry[]; // Array of history entries
  setCurrentIndex: (index: number) => void; // Function to set the current index
  fetchScripts: (skip?: number, limit?: number, startTime?: string) => Promise<void>; // Function to fetch scripts
  setTtotalCount: (index: number) => void; // Function to set the total count
  setCurrentStartTime: (str: string) => void; // Function to set the current start time
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyData,
  setCurrentIndex,
  fetchScripts,
  setTtotalCount,
  setCurrentStartTime,
}) => {
  // State to track loading status of a specific history entry
  const [isloading, setIsLoading] = useState(-1);

  // Return null if the modal is not open
  if (isOpen !== ModalStatus.HistoryModal) {
    return null;
  }

  return (
    <>
      <div
        className={`w-[300px] h-full overflow-auto absolute top-0 right-0 bg-slate-900 z-40 rounded-br-xl ${
          isOpen === ModalStatus.HistoryModal ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {historyData.map((hdata, index) => {
          // Format the start time for display
          const formattedTime = hdata.start_time.replace("T", "_").split(".")[0];
          return (
            <button
              key={index}
              className="w-full hover:bg-cyan-800 py-2 pl-5 text-gray-300"
              onClick={async () => {
                setCurrentIndex(1); // Set the current index
                setTtotalCount(hdata.count); // Set the total count
                setCurrentStartTime(hdata.start_time); // Set the current start time
                setIsLoading(index); // Set loading state for the current entry
                await fetchScripts(0, hdata.count, hdata.start_time); // Fetch scripts
                setIsLoading(-1); // Reset loading state
              }}
              disabled={isloading !== -1} // Disable button if loading
            >
              <p className="text-left">Date: {formattedTime}</p>
              {isloading === index ? (
                <p className="text-left">Loading ...</p>
              ) : (
                <p className="text-left">Count: {hdata.count}</p>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};