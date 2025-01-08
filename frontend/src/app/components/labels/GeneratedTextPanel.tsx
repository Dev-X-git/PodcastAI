import React, { useState } from 'react';

// Define the props interface for the GeneratedTextPanel component
interface GeneratedTextPanelProps {
    currentIndex: number; // Index of the currently selected text
    generatedText: Array<{ id: number, script: any[], category: string, type_content: string }>; // Array of generated text objects
    setGeneratedText: (text: Array<{ id: number, script: any[], category: string, type_content: string }>) => void; // Function to update the generated text
    isEditGeneratedText: boolean; // Flag to determine if the text is editable
}

// Define the GeneratedTextPanel component
export const GeneratedTextPanel: React.FC<GeneratedTextPanelProps> = ({
    currentIndex,
    generatedText,
    setGeneratedText,
    isEditGeneratedText
}) => {

    // Function to handle the blur event on the editable div
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>, messageIndex: number) => {
        const newGeneratedText = [...generatedText]; // Create a copy of the generatedText array
        // Update the text at the current index and message index
        newGeneratedText[currentIndex - 1].script[messageIndex].text = e.currentTarget.textContent || '';
        setGeneratedText(newGeneratedText); // Save the updated generatedText array
    };

    return (
        <>
            {generatedText.length > 0 && // Check if there is any generated text
                generatedText[currentIndex - 1] && // Check if the current index is valid
                generatedText[currentIndex - 1].script.map((message, index) => ( // Map over the script array
                    <div
                        key={index} // Unique key for each message
                        contentEditable={isEditGeneratedText} // Set content editable based on the flag
                        onBlur={(e) => handleBlur(e, index)} // Attach blur event handler
                        className={`max-w-[60%] mb-4 p-3 rounded-lg hover:outline-none focus:outline-none ${
                            index % 2 === 1
                                ? "bg-blue-500 text-white self-end" // Style for odd indexed messages
                                : "bg-gray-300 text-black self-start" // Style for even indexed messages
                        }
                        ${isEditGeneratedText ? "border-b border-black" : "border-b border-black"}` // Border style
                    }
                    >
                        {message.text} // Display the message text
                    </div>
                ))}
        </>
    );
};