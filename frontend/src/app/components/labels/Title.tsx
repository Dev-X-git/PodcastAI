import React, { useState } from 'react';

// Define the interface for the component's props
interface TitleProps {
    parameters: string[];
    currentIndex: number;
    isEditGeneratedText: boolean;
    setParameters: (parameters: string[]) => void;
    generatedText: Array<{ id: number, script: any[], category: string, type_content: string }>;
    setGeneratedText: (text: Array<{ id: number, script: any[], category: string, type_content: string }>) => void;
    genStatus: string[];
}

// Define the Title component
export const Title: React.FC<TitleProps> = ({
    parameters,
    currentIndex,
    isEditGeneratedText,
    generatedText,
    setGeneratedText,
    setParameters,
    genStatus,
}) => {
    // Handle blur event for updating parameters
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        const newParameters = [...parameters]; // Create a copy of the parameters array
        newParameters[currentIndex - 1] = e.currentTarget.textContent || ''; // Update the value at the currentIndex
        setParameters(newParameters); // Save the updated parameters array
    };

    // Handle blur event for updating category in generatedText
    const handleBlurcate = (e: React.FocusEvent<HTMLDivElement>) => {
        const newParameters = [...generatedText]; // Create a copy of the generatedText array
        newParameters[currentIndex - 1].category = e.currentTarget.textContent || ''; // Update the category at the currentIndex
        setGeneratedText(generatedText); // Save the updated generatedText array
    };

    // Handle blur event for updating type_content in generatedText
    const handleBlurType = (e: React.FocusEvent<HTMLDivElement>) => {
        const newParameters = [...generatedText]; // Create a copy of the generatedText array
        newParameters[currentIndex - 1].type_content = e.currentTarget.textContent || ''; // Update the type_content at the currentIndex
        setGeneratedText(generatedText); // Save the updated generatedText array
    };

    return (
        <div className='flex gap-3'>
            {isEditGeneratedText ? (
                <>
                    {/* Editable div for parameters */}
                    <div contentEditable="true" onBlur={handleBlur} className="border-b pl-10 border-gray-300 rounded p-1 hover:outline-none focus:outline-none ">
                        {parameters[currentIndex - 1]}
                    </div>
                    {/* Editable div for category */}
                    <div contentEditable="true" onBlur={handleBlurcate} className="text-gray-800 border-b border-gray-300 rounded p-1 hover:outline-none focus:outline-none ">
                        {generatedText[currentIndex - 1].category ? generatedText[currentIndex - 1].category : 'Not selected'}
                    </div>
                    {/* Editable div for type_content */}
                    <div contentEditable="true" onBlur={handleBlurType} className="text-gray-800 border-b border-gray-300 rounded p-1 hover:outline-none focus:outline-none ">
                        {generatedText[currentIndex - 1].category ? generatedText[currentIndex - 1].type_content : 'Not selected'}
                    </div>
                </>
            ) : (
                <>
                    {/* Display parameters with truncation if necessary */}
                    <div className='pl-10'>
                        {parameters[currentIndex - 1].length > 30 ? `${parameters[currentIndex - 1].slice(0, 30)} ...` : parameters[currentIndex - 1]}
                    </div>
                    {/* Display category with a label */}
                    <div className='text-gray-800 relative'>
                        {generatedText[currentIndex - 1] && generatedText[currentIndex - 1].category ? generatedText[currentIndex - 1].category : 'Not selected'}
                        <p className='absolute text-[12px] text px-1 bg-yellow-300 rounded-md top-0 -right-16'>Category</p>
                    </div>
                    {/* Display type_content with a label */}
                    <div className='text-gray-800 relative pl-16'>
                        {generatedText[currentIndex - 1] && generatedText[currentIndex - 1].type_content ? generatedText[currentIndex - 1].type_content : 'Not selected'}
                        <p className='absolute text-[12px] text px-1 bg-yellow-300 rounded-md top-0 -right-24'>ContentType</p>
                    </div>
                    {/* Display generation status */}
                    <span className='pl-24'>{genStatus[currentIndex - 1]}</span>
                </>
            )}
        </div>
    );
};