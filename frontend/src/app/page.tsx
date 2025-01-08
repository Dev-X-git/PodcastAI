"use client";

import { useEffect, useState } from "react";
import { Bars, Circles } from "react-loading-icons";
import Switch from "react-switch";
import React, { useRef } from "react";
import { ModalStatus, PromptType, RangeType, TypeContentType, HistoryEntry } from "./components/types";
import { formatDuration, formatDownloadFile } from "./components/utils";

import {
  AiOutlineDownload,
  AiFillPlayCircle,
  AiFillPauseCircle,
  AiOutlineArrowRight,
  AiOutlineArrowLeft,
  AiOutlineUpload,
  AiOutlineEllipsis,
  AiOutlineHistory,
  AiOutlineRotateRight,
  AiFillPlusSquare,
  AiFillEdit,
  AiTwotoneSave,
  AiOutlineSwapRight,
  AiOutlineCloudDownload,
  AiOutlineCloudUpload,
} from "react-icons/ai";
import { DownloadModal } from "./components/modals/DownloadModal";
import { Timer } from "./components/labels/Timers";
import SetStartIndexModal from "./components/modals/SetStartIndexModal";
import { HistoryModal } from "./components/modals/HistoryModal";
import { Title } from "./components/labels/Title";
import { GeneratedTextPanel } from "./components/labels/GeneratedTextPanel";
import { title } from "process";
import SetGenerateAudioRangeModal from "./components/modals/SetGenerateAudioRangeModal";
export default function Home() {
  const [modalStatus, setModalStatus] = useState<ModalStatus>(
    ModalStatus.Closed
  );
  const [isNoUpdate, setIsNoUpdate] = useState(false); //Noupdate checkbox state
  const [isLoading, setIsLoading] = useState(true); //loading state
  const [isGenCategory, setIsGenCategory] = useState(true); //generate category checkbox state
  const [textMode, setTextMode] = useState(true); //textmode switch state
  const [text, setText] = useState("");  //text sate
  const [fileUploaded, setFileUploaded] = useState(false); // file update
  const [genLoading, setGenLoading] = useState(false);  //loading generate script
  const [file, setFile] = useState<File | null>(null); // State to hold the file
  const [generated, setGenerated] = useState(false);

  const [genRange, setGenRange] = useState<RangeType>({ start: 0, end: 0 }); //set  generate Range 
  const [generatedText, setGeneratedText] = useState<
    Array<{ id: number; script: any[]; category: string; type_content: string }>
  >([]);  //save generated text
  const [audioURL, setAudioURL] = useState<string[]>([]);  //save audiourls
  const [audioLoading, setAudioLoading] = useState(false);  //loading audio generating
  const [audio, setAudio] = useState<HTMLAudioElement[]>([]);  // set sudio
  const [isPlaying, setIsPlaying] = useState<boolean>(false); //playing state
  const [scriptTimers, setScriptTimers] = useState<string[]>([]); //script timer
  const [audioTimers, setAudioTimers] = useState<string[]>([]); //audio timer
  const [scriptTotalTimer, setScriptTotalTimer] = useState(0);// script total timer
  const [audioTotalTimer, setAudioTotalTimer] = useState(0);//audio total timer
  const [prompts, setPrompts] = useState<PromptType[]>([]); //prompt
  const [selectedPrompt, setSelectedPrompt] = useState<{         // selected prompt
    id: number;
    title: string;
    description: string;
  }>();
  const [contentTypes, setContentTypes] = useState<TypeContentType[]>([]); //content type
  const [selectedContentType, setSelectedContentType] = useState<TypeContentType>(); //selected content type
  const [userPrompts, setUserPrompts] = useState<PromptType[]>([]);   //user prompts

  const [selectedUserPrompt, setSelectedUserPrompt] = useState<PromptType>(); //selected user prompts
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);  //modal open state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserAddModalOpen, setIsUserAddModalOpen] = useState(false);
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [isConTypeAddModalOpen,setIsConTypeAddModalOpen] =useState(false);
  const [isConTypeEditModalOpen,setIsConTypeEditModalOpen] =useState(false);
  const [newContentType,setNewContentType] = useState({title:""});  //new cotent type
  const [newPrompt, setNewPrompt] = useState({ title: "", description: "" }); //new prompt
  const [voiceList, setVoiceList] = useState([]);  //save voicelist state
  const [voiceElevenLabs, setVoiceElevenLabs] = useState<  //save 11labs list
    { voice_id: string; name: string }[]
  >([]);
  const [speaker1, setSpeaker1] = useState(true);  //speak1 state
  const [speaker2, setSpeaker2] = useState(true);   //speak2 state
  const [processingIndex, setProcessingIndex] = useState(0);  // index number of proceessing currently
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for upload book list
  const fileInputRefRestore = useRef<HTMLInputElement>(null); // ref for upload restore
  const [editingPrompt, setEditingPrompt] = useState<PromptType | null>(null); // editing prompt
  const [editingConType, setEditingConType] = useState<TypeContentType | null>(null); // editing content type
  const [currentIndex, setCurrentIndex] = useState(1);  // current index of generated scripts
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]); // History data from database
  const [historyLoading, setHistoryLoading] = useState(false); // loading history data form database
  const [isEditGeneratedText, setIsEditGeneratedText] = useState(false); // set state generate text editing
  const [isEditGeneratedTextSave, setIsEditGeneratedTextSave] = useState(false); // 
  const [currentSpeaker, setCurrentSpeaker] = useState({    //current state speaker
    person1: "en-US-Casual-K",
    style1: true,
    person2: "en-US-Casual-K",
    style2: true,
  });
  const [isBackupLoading, setIsBackupLoading] = useState(false);  //backup loading
  const [isRestoreLoading, setIsRestoreLoading] = useState(false); //restore loading
  const [startIndex, setStartIndex] = useState(1);   // start index
  const [ttotalCount, setTtotalCount] = useState(0); // total count
  const [currentPagenation, setCurrentPagenation] = useState(0) //current pagenation


  const handleEditPrompt = async () => {
    if (!editingPrompt) return;
    try {
      //update prompt on db by id
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prompts/${editingPrompt.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingPrompt),
        }
      );

      if (response.ok) {
        // Refresh prompts list
        const updatedPrompts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/prompts`
        ).then((res) => res.json());
        setPrompts(updatedPrompts);
        setEditingPrompt(null);
        setSelectedPrompt(editingPrompt); // Update the selected prompt with edited values
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
    }
  };
  const [parameters, setParameters] = useState<string[]>([]);  // book name states
  const [genStatus, setGenStatus] = useState<string[]>([]);   //generate status like update, added
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); 
  const [currentStartTime, setCurrentStartTime] = useState("");
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();

      //upload text file and splite by line
      reader.onload = (e) => {
        const text = (e.target?.result as string)
          .split("\n")
          .filter((line) => line.trim() !== "");
        setParameters(text); //save to parameters
      };
      reader.readAsText(file);
    }
  };
  const handleDeletePrompt = async (id: number) => {
    //delete prompt on db
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prompts/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh prompts list
        const updatedPrompts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/prompts`
        ).then((res) => res.json());
        //update prompt as updated prompts
        setPrompts(updatedPrompts);
        if (updatedPrompts.length > 0) {
          setSelectedPrompt(updatedPrompts[0]);
        }
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  const handleAddPrompt = async () => {
    try {
      //get prompts
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prompts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPrompt),
        }
      );

      if (response.ok) {
        // Refresh prompts list
        const updatedPrompts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/prompts`
        ).then((res) => res.json());
        setPrompts(updatedPrompts);
        setIsAddModalOpen(false);
        setNewPrompt({ title: "", description: "" });
      }
    } catch (error) {
      console.error("Error adding prompt:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch prompts
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/prompts/`
        );
        const data = await response.json();
        setPrompts(data);

        // Fetch user prompts
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/userprompts/`
        );
        const userData = await userResponse.json();
        setUserPrompts(userData);

        //Fetch content Type
        const contentTypeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/content-type/`
        );
        const contentTypeData = await contentTypeResponse.json();
        setContentTypes(contentTypeData);
        setSelectedContentType(contentTypeData[0]);
        // Fetch google  voice list
        const voiceResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/get-voice-list/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const voiceData = await voiceResponse.json();
        setVoiceList(voiceData.voice_list);
        // Fetch 11labs voice list
        const voiceElevenLabsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/get-elevenlabs-voice-list/`,
          {
            method: "POST",
          }
        );
        const voiceElevenLabsData = await voiceElevenLabsResponse.json();
        setVoiceElevenLabs(voiceElevenLabsData.voice_list);

        // Set initial selected prompts
        if (data.length > 0) {
          setSelectedPrompt(data[0]);
        }
        if (userData.length > 0) {
          setSelectedUserPrompt(userData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  const fetchHistoryData = async () => {
    //fetch historydata from db by 
    //start time and counts
    const scriptsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/scripts/start-time-counts`
    );
    const scriptsData:HistoryEntry[] = await scriptsResponse.json();
    setHistoryData(scriptsData);
    return Promise.resolve();
  };
  //get id and change prompt
  const handlePromptChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedID = parseInt(event.target.value);
    setSelectedPrompt(prompts[selectedID]);
  };

  const handleContentTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedID = parseInt(event.target.value);
    setSelectedContentType(contentTypes[selectedID]);
  };
  const handleEditUserPrompt = async () => {
    if (!editingPrompt) return;

    //update user prompt on db
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/userprompts/${editingPrompt.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingPrompt),
        }
      );

      if (response.ok) {
        const updatedPrompts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/userprompts`
        ).then((res) => res.json());
        setUserPrompts(updatedPrompts);
        setEditingPrompt(null);
        setSelectedUserPrompt(editingPrompt);
      }
    } catch (error) {
      console.error("Error updating user prompt:", error);
    }
  };

  //delete user prompt on db
  const handleDeleteUserPrompt = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/userprompts/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedPrompts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/userprompts`
        ).then((res) => res.json());
        setUserPrompts(updatedPrompts);
        if (updatedPrompts.length > 0) {
          setSelectedUserPrompt(updatedPrompts[0]);
        }
        setIsUserEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting user prompt:", error);
    }
  };
// update contenty type on db
  const handleEditConType = async () => {
    if (!editingConType) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/content-type/${editingConType.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingConType),
        }
      );

      if (response.ok) {
        const updatedPrompts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/content-type`
        ).then((res) => res.json());
        setContentTypes(updatedPrompts);
        setEditingConType(null);
        setSelectedContentType(editingConType);
      }
    } catch (error) {
      console.error("Error updating user prompt:", error);
    }
  };
//delete content type on db
  const handleDeleteConType = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/content-type/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedPrompts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/content-type`
        ).then((res) => res.json());
        setContentTypes(updatedPrompts);
        if (updatedPrompts.length > 0) {
          setSelectedUserPrompt(updatedPrompts[0]);
        }
        setIsConTypeEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting user prompt:", error);
    }
  };

  //create userprompt and set it   on db
  const handleAddUserPrompt = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/userprompts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPrompt),
        }
      );

      if (response.ok) {
        const updatedPrompts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/userprompts`
        ).then((res) => res.json());
        setUserPrompts(updatedPrompts);
        setIsUserAddModalOpen(false);
        setNewPrompt({ title: "", description: "" });
      }
    } catch (error) {
      console.error("Error adding user prompt:", error);
    }
  };
//create content type and set it on db
  const handleAddContentType = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/content-type`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newContentType),
        }
      );

      if (response.ok) {
        const updatedcontents = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/content-type`
        ).then((res) => res.json());
        setContentTypes(updatedcontents);
        setIsConTypeAddModalOpen(false);
        setNewContentType({ title: ""});
      }
    } catch (error) {
      console.error("Error adding user prompt:", error);
    }
  };
  //update user prompt on db
  const handleUserPromptChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    console.log(userPrompts);
    const selectedID = parseInt(event.target.value);
    console.log(selectedID);
    setSelectedUserPrompt(userPrompts[selectedID]);
  };

  //generate audio form parameter
  const handleGenerateAudio = async () => {
    setAudioLoading(true);
    // set generation Range
    if (genRange.start == 0) setGenRange({ start: 1, end: parameters.length });
    try {
      const audioUrls: string[] = [];
      let totalTimer = 0;

      for (let index = genRange.start - 1; index < genRange.end; index++) {
        const conversation = generatedText[index];
        setProcessingIndex(index);
        const formData = new FormData();
        formData.append("currentSpeaker", JSON.stringify(currentSpeaker));
        formData.append("id", conversation.id.toString());
        formData.append("conversation", JSON.stringify(conversation.script));
        const startTime = performance.now();
        //generrate audio
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/generate-audio`,
          {
            method: "POST",
            body: formData, // Always send formData
            headers: undefined, // No need for Content-Type header with FormData
          }
        );
        const endTime = performance.now();
        const duration = endTime - startTime;
        const formattedDuration = formatDuration(duration);
        totalTimer += duration;
        setAudioTotalTimer(totalTimer);
        setAudioTimers((prevTimers) => [...prevTimers, formattedDuration]);
        if (!response.ok) {
          throw new Error("Failed to generate audio");
        }
        //Make it is possible to download
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        audioUrls.push(audioUrl);
        setAudioURL(audioUrls);
        const audioObjects = audioUrls.map((url) => new Audio(url));
        setAudio(audioObjects);
      }
      setAudioURL(audioUrls);
      const audioObjects = audioUrls.map((url) => new Audio(url));
      setAudio(audioObjects);
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setAudioLoading(false);
    }
  };
  const handleAudioPlay = () => {
    if (audio) {
      // If audio is currently playing, stop it
      if (isPlaying) {
        audio[currentIndex - genRange.start].pause();
        setIsPlaying(false);
      } else {
        // If audio is not playing, start it
        audio[currentIndex - genRange.start].play();
        setIsPlaying(true);
      }
    } else {
      // If audio object has not been created yet, create it
      const audioObjects = audioURL.map((url) => new Audio(url));
      setAudio(audioObjects);
      audioObjects[currentIndex - genRange.start].play();
      setIsPlaying(true);
    }
  };
  const handleFileUploadClick = () => {
    // Trigger the file input click event
    fileInputRef.current && fileInputRef.current.click();
  };
  const addScript = async (
    title: string,
    gscript: string,
    stime: number,
    etime: number,
    category: string,
    type_content: string
  ) => {
    // function body...
    const startDate = new Date(stime + performance.timeOrigin);
    const endDate = new Date(etime + performance.timeOrigin);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scripts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            gscript,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            category,
            noupdate: isNoUpdate,
            type_content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleGenerate = async () => {
    const slicedParameters = parameters.slice(startIndex - 1);
    setParameters(slicedParameters);

    setGenLoading(true);
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else if (textMode) {
      formData.append("text", text); // Append text as form dat
    }
    formData.append("userPrompt", selectedUserPrompt?.description || "");

    try {
      let allResults = [];
      let totalTimer = 0;
      const endpoint = textMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/generate-conversation-by-text`
        : `${process.env.NEXT_PUBLIC_API_URL}/generate-conversation`;

      if (!selectedPrompt?.description.includes("$1")) {
        formData.set("prompt", selectedPrompt?.description || "");
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData, // Always send formData
          headers: undefined, // No need for Content-Type header with FormData
        });
        const data = await response.json();
        if (data.error) {
          console.error(data.error);
        } else {
          allResults.push(data.result);
        }
      } else {
        const gstartTime = performance.now();
        for (let [index, parameter] of Array.from(slicedParameters.entries())) {
          let attempt = 0;
          let success = false;

          while (attempt < 5 && !success) {
            try {
              setProcessingIndex(index);
              const sprompt = selectedPrompt.description.replace(
                "$1",
                parameter
              );
              formData.set("prompt", sprompt);
              const startTime = performance.now();
              const response = await fetch(endpoint, {
                method: "POST",
                body: formData, // Always send formData
                headers: undefined, // No need for Content-Type header with FormData
              });
              const endTime = performance.now();
              const duration = endTime - startTime;
              const formattedDuration = formatDuration(duration);
              totalTimer += duration;
              setScriptTotalTimer(totalTimer);
              setScriptTimers((prevTimers) => [
                ...prevTimers,
                formattedDuration,
              ]);

              const para = encodeURIComponent(parameter);
              const responsetitle = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/scripts/title/${para}`
              );
              const responsetitleresult = await responsetitle.json();
              if (responsetitleresult.exists) {
                const existdb = responsetitleresult.script;
                if (isNoUpdate) {
                  allResults.push({
                    id: existdb.id,
                    script: JSON.parse(existdb.gscript),
                    category: existdb.category,
                    type_content: existdb.type_content,
                  });
                  if (index === 0) setCurrentIndex(1);
                  setGeneratedText(allResults);
                  setGenStatus((prevStatus) => {
                    const newStatus = [...prevStatus]; // Create a copy of the previous status array
                    newStatus[index] = "Skipped"; // Replace the status at the specific index
                    return newStatus; // Return the new status array
                  });
                } else {
                  const data = await response.json();

                  const starttime = new Date(
                    gstartTime + performance.timeOrigin
                  );
                  const endtime = new Date(endTime + performance.timeOrigin);
                  existdb.start_time = starttime.toISOString();
                  existdb.end_time = endtime.toISOString();
                  existdb.gscript = JSON.stringify(data.result);
                  existdb.noupdate = isNoUpdate;
                  const updateResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/scripts/${existdb.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(existdb),
                    }
                  );

                  if (!updateResponse.ok) {
                    throw new Error("Failed to update script");
                  }

                  const updatedScript = await updateResponse.json();

                  allResults.push({
                    id: updatedScript.id,
                    script: JSON.parse(updatedScript.gscript),
                    category: updatedScript.category,
                    type_content: updatedScript.type_content,
                  });
                  if (index === 0) setCurrentIndex(1);
                  setGeneratedText(allResults);
                  setGenStatus((prevStatus) => {
                    const newStatus = [...prevStatus]; // Create a copy of the previous status array
                    newStatus[index] = "Updated"; // Replace the status at the specific index
                    return newStatus; // Return the new status array
                  });
                }
                success = true;
                continue;
              }

              const data = await response.json();
              let category = null;

              if (isGenCategory) {
                category = await getCategory(parameter);
              }

              if (data.error) {
                console.error(data.error);
              } else {
                const result = await addScript(
                  parameter,
                  JSON.stringify(data.result),
                  gstartTime,
                  endTime,
                  category,
                  selectedContentType?.title|| "defaultTitle" 
                );
                allResults.push({
                  id: result.id,
                  script: data.result,
                  category: category,
                  type_content: selectedContentType?.title,
                });
                if (index === 0) setCurrentIndex(1);
                setGeneratedText(allResults);
                setGenStatus((prevStatus) => {
                  const newStatus = [...prevStatus]; // Create a copy of the previous status array
                  newStatus[index] = "Added"; // Replace the status at the specific index
                  return newStatus; // Return the new status array
                });
                success = true;
              }
            } catch (error) {
              console.error(`Error processing index ${index}:`, error);
              attempt++;
              if (attempt < 5) {
                console.log(`Retrying index ${index} in 10 seconds...`);
                await new Promise((resolve) => setTimeout(resolve, 10000));
              } else {
                console.error(
                  `Failed to process index ${index} after 5 attempts.`
                );
              }
            }
          }
        }
      }
      setGenerated(true);
      setGeneratedText(allResults);
    } catch (error) {
      console.error("Error generating conversation:", error);
    } finally {
      setGenLoading(false);
    }
  };
  const getCategory = async (title: string) => {
    const formData = new FormData();
    formData.append("text", title); // Use the title parameter
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/generate-category-by-title`,
      {
        method: "POST",
        body: formData,
        headers: undefined,
      }
    );
    const data = await response.json();
    return data.result;
  };
  const fetchScripts = async (skip = 0, limit = 100, startTime: string | undefined = undefined) => {
    try {
      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
  
      if (startTime) {
        queryParams.append("start_time", startTime);
      }
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scripts?${queryParams.toString()}`
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch scripts");
      }
  
      const data = await response.json();
      
      const generatedText = data.map((item: any) => ({
        id: item.id,
        script: JSON.parse(item.gscript),
        category:item.category,
        type_content:item.type_content
      }));
      const titles = data.map((item:any) => item.title);
      setGeneratedText(generatedText);
      setParameters(titles);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  }; 
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFile(file);
      setFileUploaded(true);
    }
  };
  const handleBackup = async () => {
    setIsBackupLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/db/backup`, {
        method: "POST",
      });
  
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "backup.sql"; // Set the desired file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // Clean up the URL object
      } else {
        const errorText = await response.text();
        console.error("Backup failed:", errorText);
      }
    } catch (error) {
      console.error("Error during backup:", error);
    } finally {
      setIsBackupLoading(false);
    }
  };
  
  const handleRestore = async (file: File) => {
    setIsRestoreLoading(true);
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/db/restore`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("Restore successful");
      } else {
        console.error("Restore failed");
      }
    } catch (error) {
      console.error("Error during restore:", error);
    } finally {
      setIsRestoreLoading(false);
    }
  };
  const saveGeneratedChanges = async () => {
    const id = generatedText[currentIndex - 1].id;
    const title = parameters[currentIndex - 1];

    // Fetch the existing script data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/scripts/${id}`
    );
    const scriptData = await response.json();
    // Update the necessary fields
    scriptData.title = title;
    scriptData.gscript = JSON.stringify(generatedText[currentIndex - 1].script);
    scriptData.category = generatedText[currentIndex - 1].category;
    scriptData.type_content = generatedText[currentIndex - 1].type_content;
    // Send a PUT request to the server with the updated data
    const updateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/scripts/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scriptData),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update script");
    }

    const updatedScript = await updateResponse.json();
    return updatedScript;
  };
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between w-full"
      style={{
        backgroundImage: "url('/assets/imgs/bg.png')",
        backgroundSize: "cover",
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Bars fill="cyan" className="h-12 w-12" />
        </div>
      ) : (
        <div className="w-[80%] pt-10 flex flex-col gap-8">
          <div className="flex w-full drop-shadow-lg  gap-8">
            <div className="w-1/4">
              <div className="w-full bg-slate-800 px-4 py-4 rounded-xl border-l-4 border-sky-500 flex flex-col gap-3">
                <div className="flex flex-row justify-between">
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="checkbox"
                      checked={textMode}
                      onChange={() => setTextMode(!textMode)}
                    />
                    <span className="text-white">Mode </span>
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="checkbox1"
                      checked={isGenCategory}
                      onChange={() => setIsGenCategory(!isGenCategory)}
                    />
                    <span className="text-white">Category</span>
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="checkbox2"
                      checked={isNoUpdate}
                      onChange={() => setIsNoUpdate(!isNoUpdate)}
                    />
                    <span className="text-white">No Update</span>
                  </div>
                </div>
                {!textMode ? (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-500 border-dashed rounded-lg cursor-pointer bg-gray-700 dark:bg-gray-700 hover:bg-gray-10 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 ">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        {fileUploaded ? (
                          <p className="text-cyan-500 font-bold">
                            File Uploaded.
                          </p>
                        ) : (
                          <>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Meida file such as video, image or audio
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <textarea
                      id="message1"
                      rows={6}
                      className="block p-2.5 w-full text-sm rounded-lg border bg-gray-700 outline-none border-gray-600 placeholder-gray-400 text-white  focus:ring-sky-500 focus:border-sky-500"
                      placeholder="Write a small description of type of style you want your space to be..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    ></textarea>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <div className="flex items-center ">
                      <p className="text-white">TypeContent:</p>
                    </div>
                    <select
                      id="content type"
                      className="p-2.5 w-full text-sm rounded-lg border bg-gray-700 outline-none border-gray-600 placeholder-gray-400 text-white focus:ring-sky-500 focus:border-sky-500"
                      onChange={handleContentTypeChange}
                    >
                      {contentTypes.map((contype, index) => (
                        <option key={index} value={index}>
                          {contype.title}
                        </option>
                      ))}
                    </select>
                    <button
                      className="px-2  text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center"
                      title="Add New User Prompt"
                      onClick={() => setIsConTypeAddModalOpen(true)}
                    >
                      <AiFillPlusSquare
                        style={{ width: "20px", height: "20px" }}
                      />
                    </button>
                    <button
                      className="px-2  text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center"
                      title="Edit User Prompts"
                      onClick={() => setIsConTypeEditModalOpen(true)}
                    >
                      <AiFillEdit style={{ width: "20px", height: "20px" }} />
                    </button>
                  </div>
                  <div className="flex gap-2 ">
                    <div className="flex items-center">
                      <p className="text-white">System:</p>
                    </div>
                    <select
                      id="prompt-select"
                      className="p-2.5 w-full text-sm rounded-lg border bg-gray-700 outline-none border-gray-600 placeholder-gray-400 text-white focus:ring-sky-500 focus:border-sky-500"
                      onChange={handlePromptChange} // Add onChange handler
                    >
                      {prompts.map((prompt, index) => (
                        <option key={index} value={index}>
                          {prompt.title}
                        </option>
                      ))}
                    </select>
                    <button
                      className="px-2  text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center"
                      title="Add New Prompt"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <AiFillPlusSquare
                        style={{ width: "20px", height: "20px" }}
                      />
                    </button>
                    <button
                      className="px-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center"
                      title="Edit Prompts"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <AiFillEdit style={{ width: "20px", height: "20px" }} />
                    </button>
                    <button
                      className="px-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center"
                      title="Upload File"
                      onClick={handleFileUploadClick}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                      <AiOutlineUpload
                        style={{ width: "20px", height: "20px" }}
                      />
                    </button>
                  </div>
                  <textarea
                    id="message"
                    rows={5}
                    className="block p-2.5 w-full text-sm rounded-lg border bg-gray-700 outline-none border-gray-600 placeholder-gray-400 text-white focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Write a small description of type of style you want your space to be..."
                    value={selectedPrompt?.description} // Bind textarea value to selectedPrompt state
                    onChange={(e) =>
                      selectedPrompt
                        ? setSelectedPrompt({
                            ...selectedPrompt,
                            description: e.target.value,
                          })
                        : null
                    } // Allow manual editing
                  ></textarea>
                </div>
                <div className="flex flex-col gap-3 ">
                  <div className="flex gap-2">
                    <div className="flex items-center ">
                      <p className="text-white">User:</p>
                    </div>
                    <select
                      id="user-prompt-select"
                      className="p-2.5 w-full text-sm rounded-lg border bg-gray-700 outline-none border-gray-600 placeholder-gray-400 text-white focus:ring-sky-500 focus:border-sky-500"
                      onChange={handleUserPromptChange}
                    >
                      {userPrompts.map((prompt, index) => (
                        <option key={index} value={index}>
                          {prompt.title}
                        </option>
                      ))}
                    </select>
                    <button
                      className="px-2  text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center"
                      title="Add New User Prompt"
                      onClick={() => setIsUserAddModalOpen(true)}
                    >
                      <AiFillPlusSquare
                        style={{ width: "20px", height: "20px" }}
                      />
                    </button>
                    <button
                      className="px-2  text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center"
                      title="Edit User Prompts"
                      onClick={() => setIsUserEditModalOpen(true)}
                    >
                      <AiFillEdit style={{ width: "20px", height: "20px" }} />
                    </button>
                  </div>
                  <textarea
                    id="user-prompt-message"
                    rows={6}
                    className="block p-2.5 w-full text-sm rounded-lg border bg-gray-700 outline-none border-gray-600 placeholder-gray-400 text-white focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Write a small description of type of style you want your space to be..."
                    value={selectedUserPrompt?.description || ""}
                    onChange={(e) =>
                      selectedUserPrompt
                        ? setSelectedUserPrompt({
                            ...selectedUserPrompt,
                            description: e.target.value,
                          })
                        : null
                    }
                  ></textarea>
                </div>

                <div className="flex justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <label htmlFor="prompt-select" className="text-white">
                        Speaker 1
                      </label>
                      <Switch
                        onChange={() => setSpeaker1(!speaker1)}
                        checked={speaker1}
                        id="speaker1-switch"
                        handleDiameter={16} // Smaller handle diameter
                        height={20} // Smaller height
                      />
                    </div>
                    <select
                      id="speaker1-select"
                      className="block p-2.5 w-full text-sm rounded-lg border bg-gray-700 outline-none border-gray-600 placeholder-gray-400 text-white focus:ring-sky-500 focus:border-sky-500"
                      onChange={(e) =>
                        setCurrentSpeaker({
                          ...currentSpeaker,
                          person1: e.target.value,
                          style1: speaker1,
                        })
                      }
                      value={currentSpeaker.person1}
                    >
                      {speaker1
                        ? voiceList.map((voice) => (
                            <option key={voice} value={voice}>
                              {voice}
                            </option>
                          ))
                        : voiceElevenLabs.map((voice) => (
                            <option key={voice.voice_id} value={voice.voice_id}>
                              {voice.name}
                            </option>
                          ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        onChange={() => setSpeaker2(!speaker2)}
                        checked={speaker2}
                        id="speaker2-switch"
                        handleDiameter={16} // Smaller handle diameter
                        height={20} // Smaller height
                      />
                      <label htmlFor="prompt-select" className="text-white">
                        Speaker 2
                      </label>
                    </div>
                    <select
                      id="speaker2-select"
                      className="block p-2.5 w-full text-sm rounded-lg border bg-gray-700 outline-none border-gray-600 placeholder-gray-400 text-white focus:ring-sky-500 focus:border-sky-500"
                      onChange={(e) =>
                        setCurrentSpeaker({
                          ...currentSpeaker,
                          person2: e.target.value,
                          style2: speaker2,
                        })
                      }
                      value={currentSpeaker.person2}
                    >
                      {speaker2
                        ? voiceList.map((voice) => (
                            <option key={voice} value={voice}>
                              {voice}
                            </option>
                          ))
                        : voiceElevenLabs.map((voice) => (
                            <option key={voice.voice_id} value={voice.voice_id}>
                              {voice.name}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <button
                  className={`w-full text-white bg-cyan-500 py-2 rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer`}
                  disabled={
                    (!fileUploaded && !textMode) || (textMode && text === "")
                  }
                  onClick={handleGenerate}
                >
                  <div className="flex justify-center items-center gap-4">
                    {genLoading && <Bars fill="cyan" className="h-4 w-4" />}
                    Generate
                  </div>
                </button>
                <div className="w-full flex justify-between  gap-2">
                  <button
                    className={`${"w-full"} text-white bg-cyan-500 py-2 rounded-lg disabled:bg-cyan-800  hover:bg-cyan-600 cursor-pointer`}
                    disabled={generatedText.length === 0}
                    onClick={handleGenerateAudio}
                  >
                    <div className="flex justify-center items-center gap-4">
                      {audioLoading && <Bars fill="cyan" className="h-4 w-4" />}
                      Generate Audio
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-3/4 flex flex-col gap-3 ">
              <div className="flex items-end justify-between w-full bg-slate-800 rounded-xl border-l-4 border-sky-500 drop-shadow-lg">
                <h1 className="text-white/80 font-extrabold text-4xl py-6 px-8  ">
                  Podcast AI <span className="text-white">1.3.0</span>
                </h1>
                <div className=" flex gap-2 p-2">
                  <button
                    className="text-white bg-cyan-500 relative px-1 py-1 justify-center items-center rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                    onClick={handleBackup}
                    disabled={isBackupLoading}
                  >
                    {isBackupLoading ? (
                      <Circles style={{ width: "24px", height: "24px" }} />
                    ) : (
                      <AiOutlineCloudDownload
                        style={{ width: "24px", height: "24px" }}
                      />
                    )}
                  </button>
                  <button
                    className="text-white bg-cyan-500 relative px-1 py-1 justify-center items-center rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                    onClick={() =>
                      fileInputRefRestore.current && fileInputRefRestore.current.click()
                    }
                    disabled={isRestoreLoading}
                  >
                    {isRestoreLoading ? (
                      <Circles style={{ width: "24px", height: "24px" }} />
                    ) : (
                      <AiOutlineCloudUpload
                        style={{ width: "24px", height: "24px" }}
                      />
                    )}
                    <input
                      ref={fileInputRefRestore}
                      type="file"
                      onChange={(e) =>
                        e.target.files && handleRestore(e.target.files[0])
                      }
                      style={{ display: "none" }}
                    />
                  </button>
                </div>
              </div>

              <div className="w-full flex flex-col h-[740px]">
                <div className="w-full h-12   bg-slate-600 rounded-t-xl flex justify-between items-center p-2  ">
                  {/* {audioURL && ( */}
                  <div className="flex flex-col">
                    {genLoading ? (
                      <p className="pl-10 text-white text-[16px]">
                        Processing Script generation item:{processingIndex + 1}/
                        {parameters.length}{" "}
                        <span className="text-red-500">
                          (
                          {parameters[processingIndex].length > 40
                            ? `${parameters[processingIndex].slice(0, 40)}...`
                            : parameters[processingIndex]}
                          )
                        </span>{" "}
                      </p>
                    ) : (
                      <></>
                    )}

                    {audioLoading ? (
                      <p className="pl-10 text-white text-[16px]">
                        Processing Audio generation item:{processingIndex + 1}/
                        {genRange.end}{" "}
                        <span className="text-red-500">
                          ({parameters[processingIndex]})
                        </span>{" "}
                      </p>
                    ) : (
                      <div></div>
                    )}
                    {generatedText.length > 0 && (
                      <Title
                        currentIndex={currentIndex}
                        parameters={parameters}
                        isEditGeneratedText={isEditGeneratedText}
                        setParameters={setParameters}
                        generatedText={generatedText}
                        setGeneratedText={setGeneratedText}
                        genStatus={genStatus}
                      />
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      className="  text-white bg-cyan-500 px-1 py-1 justify-center items-center  rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                      disabled={
                        currentIndex === 1 ||
                        !generatedText.length ||
                        isPlaying ||
                        isEditGeneratedText ||
                        isEditGeneratedTextSave
                      }
                    >
                      <AiOutlineArrowLeft
                        style={{ width: "24px", height: "24px" }}
                      />{" "}
                    </button>
                    {!generatedText.length ? (
                      <p className="font-bold text-gray-400">0/0</p>
                    ) : (
                      <p className="font-bold text-white">
                        {currentIndex}/{parameters.length}
                      </p>
                    )}
                    <button
                      className="  text-white bg-cyan-500 px-1 py-1 justify-center items-center  rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                      onClick={() => {
                        setCurrentIndex(currentIndex + 1)
                       }}
                      disabled={
                        currentIndex === generatedText.length ||
                        !generatedText.length ||
                        isPlaying ||
                        isEditGeneratedText ||
                        isEditGeneratedTextSave
                      }
                    >
                      <AiOutlineArrowRight
                        style={{ width: "24px", height: "24px" }}
                      />
                    </button>

                    <button
                      onClick={handleAudioPlay}
                      className="  text-white bg-cyan-500 px-1  py-1 justify-center items-center  rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                      disabled={
                        !audioURL ||
                        audioURL.length === 0 ||
                        !(
                          currentIndex < genRange.end + 1 &&
                          currentIndex > genRange.start - 1
                        )
                      }
                    >
                      {isPlaying ? (
                        <AiFillPauseCircle
                          style={{ width: "24px", height: "24px" }}
                        />
                      ) : (
                        <AiFillPlayCircle
                          style={{ width: "24px", height: "24px" }}
                        />
                      )}
                    </button>

                    {!(
                      !audioURL ||
                      audioURL.length === 0 ||
                      !(
                        currentIndex < genRange.end + 1 &&
                        currentIndex > genRange.start - 1
                      )
                    ) && (
                      <a
                        href={audioURL[currentIndex - genRange.start]}
                        download={formatDownloadFile(
                          parameters[currentIndex - 1]
                        )}
                        className={`text-white bg-cyan-500 flex px-1 py-1 justify-center items-center rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer`}
                      >
                        <AiOutlineDownload
                          style={{ width: "24px", height: "24px" }}
                        />
                      </a>
                    )}
                    <button
                      className="  text-white bg-cyan-500 relative px-1 py-1 justify-center items-center  rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                      onClick={() => setModalStatus(ModalStatus.SetStartIndex)}
                      disabled={!parameters.length}
                    >
                      <AiOutlineRotateRight
                        style={{ width: "24px", height: "24px" }}
                      />
                      {parameters.length > 0 && (
                        <div className="absolute -top-1 -right-1 flex justify-center items-center w-[16px] h-[16px] rounded-full  bg-white">
                          <p className=" text-[12px] text-red-600   font-bold  ">
                            {startIndex}
                          </p>
                        </div>
                      )}
                    </button>
                    <button
                      className="  text-white bg-cyan-500 relative px-1 py-1 justify-center items-center  rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                      onClick={() => setModalStatus(ModalStatus.SetRangeModal)}
                      disabled={!parameters.length}
                    >
                      <AiOutlineSwapRight
                        style={{ width: "24px", height: "24px" }}
                      />
                    </button>
                    <button
                      className="  text-white bg-cyan-500 relative px-1 py-1 justify-center items-center  rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                      onClick={async () => {
                        if (isEditGeneratedText) {
                          setIsEditGeneratedTextSave(true); // Set saving status to true before starting the save operation
                          await saveGeneratedChanges(); // Replace this with your actual save function
                          setIsEditGeneratedTextSave(false); // Set saving status to false after the save operation is complete
                        }
                        setIsEditGeneratedText(!isEditGeneratedText);
                      }}
                      disabled={
                        !generatedText.length || isEditGeneratedTextSave
                      }
                    >
                      {isEditGeneratedTextSave ? (
                        <Circles style={{ width: "24px", height: "24px" }} /> // Replace this with your actual loading spinner component
                      ) : isEditGeneratedText ? (
                        <AiTwotoneSave
                          style={{ width: "24px", height: "24px" }}
                        />
                      ) : (
                        <AiFillEdit style={{ width: "24px", height: "24px" }} />
                      )}
                    </button>

                    <button
                      className="  text-white bg-cyan-500 px-1 py-1 justify-center items-center  rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                      onClick={async () => {
                        if (modalStatus === ModalStatus.HistoryModal) {
                          setGenStatus([]);
                          setModalStatus(ModalStatus.Closed);
                        } else {
                          setHistoryLoading(true);
                          await fetchHistoryData();
                          setHistoryLoading(false);
                          setModalStatus(ModalStatus.HistoryModal);
                        }
                      }}
                    >
                      {historyLoading ? (
                        <Circles style={{ width: "24px", height: "24px" }} />
                      ) : (
                        <AiOutlineHistory
                          style={{ width: "24px", height: "24px" }}
                        />
                      )}
                    </button>
                    <button
                      className="  text-white bg-cyan-500 px-1 py-1 justify-center items-center  rounded-lg disabled:bg-cyan-800 hover:bg-cyan-600 cursor-pointer"
                      onClick={() => setModalStatus(ModalStatus.Download)}
                      disabled={!audioURL.length || isPlaying}
                    >
                      <AiOutlineEllipsis
                        style={{ width: "24px", height: "24px" }}
                      />
                    </button>
                  </div>
                  {/* )} */}
                </div>
                <div className="w-full  min-h-[750px] relative  bg-slate-800 rounded-b-xl ">
                  <HistoryModal
                    isOpen={modalStatus}
                    onClose={() => setModalStatus(ModalStatus.Closed)}
                    historyData={historyData || []}
                    setCurrentIndex={setCurrentIndex}
                 
                    fetchScripts={fetchScripts}
                    setTtotalCount ={setTtotalCount}
                    setCurrentStartTime ={setCurrentStartTime}
                  />
                  <div className="w-full h-full p-5 relative  flex flex-col overflow-auto  ">
                    {generatedText.length > 0 && (
                      <Timer
                        scriptTimers={scriptTimers}
                        scriptTotalTimer={scriptTotalTimer}
                        audioTimers={audioTimers}
                        audioTotalTimer={audioTotalTimer}
                        currentIndex={currentIndex}
                        formatDuration={formatDuration}
                      />
                    )}
                    <GeneratedTextPanel
                      isEditGeneratedText={isEditGeneratedText}
                      currentIndex={currentIndex}
                      generatedText={generatedText}
                      setGeneratedText={setGeneratedText}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DownloadModal
            isOpen={modalStatus}
            onClose={() => setModalStatus(ModalStatus.Closed)}
            audioUrls={audioURL}
            parameters={parameters}
            genRange={genRange}
          />
          <SetStartIndexModal
            isOpen={modalStatus}
            onClose={() => setModalStatus(ModalStatus.Closed)}
            startIndex={startIndex}
            setStartIndex={setStartIndex}
            limit={parameters.length}
          />
          <SetGenerateAudioRangeModal
            isOpen={modalStatus}
            onClose={() => setModalStatus(ModalStatus.Closed)}
            genRange={genRange}
            setGenRange={setGenRange}
            limit={parameters.length}
          />

          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-slate-800 p-6 rounded-lg w-96">
                <h2 className="text-white text-xl mb-4">Add New Prompt</h2>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                  value={newPrompt.title}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, title: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                  value={newPrompt.description}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, description: e.target.value })
                  }
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-cyan-600 text-white rounded"
                    onClick={handleAddPrompt}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-slate-800 p-6 rounded-lg w-96">
                <h2 className="text-white text-xl mb-4">Edit Prompts</h2>
                <div className="max-h-96 overflow-y-auto">
                  {editingPrompt ? (
                    <div className="mb-4 p-4 bg-gray-700 rounded">
                      <input
                        type="text"
                        className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
                        value={editingPrompt.title}
                        onChange={(e) =>
                          setEditingPrompt({
                            ...editingPrompt,
                            title: e.target.value,
                          })
                        }
                      />
                      <textarea
                        className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
                        value={editingPrompt.description}
                        onChange={(e) =>
                          setEditingPrompt({
                            ...editingPrompt,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-gray-600 text-white rounded"
                          onClick={() => setEditingPrompt(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-cyan-600 text-white rounded"
                          onClick={handleEditPrompt}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-gray-700 rounded">
                      <h3 className="text-white font-bold">
                        {selectedPrompt?.title}
                      </h3>
                      <p className="text-gray-300 max-w-96">
                        {selectedPrompt?.description}
                      </p>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-cyan-600 text-white rounded"
                          onClick={() =>
                            selectedPrompt
                              ? setEditingPrompt(selectedPrompt)
                              : null
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={() =>
                            selectedPrompt &&
                            handleDeletePrompt(selectedPrompt.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingPrompt(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {isUserAddModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-slate-800 p-6 rounded-lg w-96">
                <h2 className="text-white text-xl mb-4">Add New User Prompt</h2>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                  value={newPrompt.title}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, title: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                  value={newPrompt.description}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, description: e.target.value })
                  }
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                    onClick={() => setIsUserAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-cyan-600 text-white rounded"
                    onClick={handleAddUserPrompt}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* User Edit Modal */}
          {isUserEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-slate-800 p-6 rounded-lg w-96">
                <h2 className="text-white text-xl mb-4">Edit User Prompts</h2>
                <div className="max-h-96 overflow-y-auto">
                  {editingPrompt ? (
                    <div className="mb-4 p-4 bg-gray-700 rounded">
                      <input
                        type="text"
                        className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
                        value={editingPrompt.title}
                        onChange={(e) =>
                          setEditingPrompt({
                            ...editingPrompt,
                            title: e.target.value,
                          })
                        }
                      />
                      <textarea
                        className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
                        value={editingPrompt.description}
                        onChange={(e) =>
                          setEditingPrompt({
                            ...editingPrompt,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-gray-600 text-white rounded"
                          onClick={() => setEditingPrompt(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-cyan-600 text-white rounded"
                          onClick={handleEditUserPrompt}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-gray-700 rounded">
                      <h3 className="text-white font-bold">
                        {selectedUserPrompt?.title}
                      </h3>
                      <p className="text-gray-300 max-w-96">
                        {selectedUserPrompt?.description}
                      </p>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-cyan-600 text-white rounded"
                          onClick={() =>
                            selectedUserPrompt
                              ? setEditingPrompt(selectedUserPrompt)
                              : null
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={() =>
                            selectedUserPrompt &&
                            handleDeleteUserPrompt(selectedUserPrompt.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                    onClick={() => {
                      setIsUserEditModalOpen(false);
                      setEditingPrompt(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

         {isConTypeAddModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-slate-800 p-6 rounded-lg w-96">
                <h2 className="text-white text-xl mb-4">Add New Content Type</h2>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                  value={newContentType.title}
                  onChange={(e) =>
                    setNewContentType({ ...newContentType, title: e.target.value })
                  }
                />
                 
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                    onClick={() => setIsConTypeAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-cyan-600 text-white rounded"
                    onClick={handleAddContentType}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* User Edit Modal */}
          {isConTypeEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-slate-800 p-6 rounded-lg w-96">
                <h2 className="text-white text-xl mb-4">Edit ContentType</h2>
                <div className="max-h-96 overflow-y-auto">
                  {editingConType ? (
                    <div className="mb-4 p-4 bg-gray-700 rounded">
                      <input
                        type="text"
                        className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
                        value={editingConType.title}
                        onChange={(e) =>
                          setEditingConType({
                            ...editingConType,
                            title: e.target.value,
                          })
                        }
                      />
                      
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-gray-600 text-white rounded"
                          onClick={() => setEditingConType(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-cyan-600 text-white rounded"
                          onClick={handleEditConType}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-gray-700 rounded">
                      <h3 className="text-white font-bold">
                        {selectedContentType?.title}
                      </h3> 
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-cyan-600 text-white rounded"
                          onClick={() =>
                            selectedContentType
                              ? setEditingConType(selectedContentType)
                              : null
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={() =>
                            selectedContentType &&
                            handleDeleteConType(selectedContentType.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                    onClick={() => {
                      setIsConTypeEditModalOpen(false);
                      setEditingConType(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
