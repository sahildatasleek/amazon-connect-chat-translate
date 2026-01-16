import React, { useState, useCallback, useMemo } from "react";
import "./chatroom.css";

// 1. Define the disposition codes data structure once outside the component
const DISPOSITION_CODES = [
  "Air – Change Flights",
  "Air – Schedule Change",
  "Air – Cancel Flights",
  "Air - Seats, Baggage, or Other",
  "Air – Only",
  "Hotel - Cancel or Change",
  "Car - Cancel or Change",
  "Activity - Cancel or Change",
  "Pre-Booking - Payment Error",
  "Pre-Booking - Shopping Assistance",
  "Program or Points Question", 
  "Other Travel Assistance",
  "Outbound Air – Airline",
  "Outbound - Hotel",
  "Outbound - Car",
  "Outbound - Activity",
  "Outbound - Customer Air",
  "Outbound - Customer Land",
];

function Deposition() {
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Use useMemo for constant URLs
  const Depositionurl = useMemo(() =>
    "https://t86a6l5lk4.execute-api.us-east-1.amazonaws.com/production", []);
  
  const resumeUrl = useMemo(() =>
    "https://928d9w8i2k.execute-api.us-east-1.amazonaws.com/production/resumerecording", []);

  const pauseUrl = useMemo(() =>
    "https://928d9w8i2k.execute-api.us-east-1.amazonaws.com/production/suspendrecording", []);

  // Use useCallback to memoize the disposition change function
  const handleDepositionChange = useCallback(async (dispositionCode) => {
    setLoading(true);
    
    // Using a try-catch block for robust error handling
    try {
        const myValue = localStorage.getItem("myKey");
        if (!myValue) {
            console.error("Error: contact_id (myKey) not found in localStorage.");
            alert("Something went wrong: Contact ID not found.");
            return;
        }

        const data = {
            disposition_code: dispositionCode,
            contact_id: myValue,
        };

        const response = await fetch(Depositionurl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const json = await response.json();
        console.log("Deposition API Response:", json);

        if (json.statusCode === 200) {
            alert("Contact attributes updated successfully");
        } else {
            // Log failure reason if available
            console.error("Deposition update failed:", json.message || "Unknown error");
            alert("Contact attributes updated failed");
        }
    } catch (error) {
        console.error("Network or parsing error during deposition update:", error);
        alert("An error occurred during the update process.");
    } finally {
        setLoading(false);
    }
  }, [Depositionurl]); // Dependency array includes Depositionurl

  // 3. Consolidate Recording Controls into a single function using useCallback
  const handleRecording = useCallback(async (action) => {
    const isResume = action === "resume";
    const endpoint = isResume ? resumeUrl : pauseUrl;
    const actionName = isResume ? "resume" : "pause";
    
    try {
        const myValue = localStorage.getItem("myKey");
        if (!myValue) {
            alert("Something went wrong: Contact ID not found for recording control.");
            return;
        }

        const response = await fetch(endpoint, {
            method: "POST",
            // Note: If contactid is consistently a string, using contactid: myValue is fine.
            // If the API expects a number, you might need: contactid: Number(myValue)
            body: JSON.stringify({ contactid: myValue }), 
        });
        
        // Check if response is ok before attempting to parse JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const success = data.body === "True";

        if (success) {
            setIsActive(isResume);
            alert(`Recording ${actionName}d successfully`);
        } else {
            alert(`Recording not ${actionName}d (API returned failure)`);
        }
        console.log("Recording control response:", data);
        
    } catch (error) {
        console.error(`Error during ${actionName} operation:`, error);
        alert(`An error occurred while trying to ${actionName} the recording.`);
    }
  }, [resumeUrl, pauseUrl]); // Dependency array includes URLs

  return (
    <div className="DepositionContainer">
      <div style={{ height: "70%" }}>
        <div className="Depositionheader">
          <p>Disposition</p>
        </div>
        
        {loading ? (
          <div className="DepositionCode">Loading...</div>
        ) : (
          // 2. Centralized Button Rendering
          <div className="DepositionCode">
            {DISPOSITION_CODES.map((code) => (
              <button
                key={code} // Critical for production code: Unique key for list items
                onClick={() => handleDepositionChange(code)} // Pass value directly
              >
                {code}
              </button>
            ))}
          </div>
        )}
      </div>


      <div style={{ height: "30%" }}>
        <div className={isActive ? "Recordingcontrol" : "inactive"}>
          <p>{isActive ? "Recording" : "Recording Stopped"}</p>
        </div>
        <div className="controlsbutton">
          {/* Use the consolidated handler */}
          <button className="pauseButton" onClick={() => handleRecording("pause")}>
            Pause
          </button>
          <button className="startButton" onClick={() => handleRecording("resume")}>
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}

export default Deposition;
