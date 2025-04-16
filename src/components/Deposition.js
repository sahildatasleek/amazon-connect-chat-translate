import React, { useState } from "react";
import "./chatroom.css";
function Deposition() {
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const Depositionurl =
    "https://t86a6l5lk4.execute-api.us-east-1.amazonaws.com/production";
  const DepositionHandleChnage = async (e) => {
    setLoading(true);
    console.log(e.target.value);
    const myValue = localStorage.getItem("myKey");
    if (myValue) {
      //post method
      const data = {
        disposition_code: e.target.value,
        contact_id: myValue,
      };
      // console.log(data);
      const response = await fetch(Depositionurl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      setLoading(false);
      console.log(json);
      if (json.statusCode === 200) {
        alert("Contact attributes updated successfully");
      } else {
        alert("Contact attributes updated failed");
      }
    } else {
      alert("something went wrong");
      setLoading(false);
    }
    console.log(myValue);
  };
  //   const sahil = "232332222";
  //   localStorage.setItem("myKey", sahil);

  const resume =
    "https://928d9w8i2k.execute-api.us-east-1.amazonaws.com/production/resumerecording";
  const pauseapi =
    "https://928d9w8i2k.execute-api.us-east-1.amazonaws.com/production/suspendrecording";

  const startbuttonfnc = async (e) => {
    console.log("start button clicked");
    e.preventDefault();
    //post request
    const myValue = localStorage.getItem("myKey");
    if (myValue) {
      //post method

      const response = await fetch(resume, {
        method: "POST",

        body: JSON.stringify({
          contactid: myValue,
        }),
      });
      const data = await response.json();
      if (data.body === "True") {
        alert("Recording resume");
        setIsActive(true);
      } else {
        alert("Recording not resume");
        setIsActive(false);
      }
      console.log(data);
    }
  };
  const pausebuttonfnc = async (e) => {
    console.log("pause button clicked");
    e.preventDefault();
    //post request
    const myValue = localStorage.getItem("myKey");
    if (myValue) {
      //post method

      const response = await fetch(pauseapi, {
        method: "POST",

        body: JSON.stringify({
          contactid: myValue,
        }),
      });
      const data = await response.json();
      if (data.body === "True") {
        setIsActive(false);

        alert("Recording paused");
      } else {
        alert("Recording not paused");
        setIsActive(true);
      }

      console.log(data);
    }
  };
  return (
    <div className="DepositionContainer">
      <div style={{ height: "70%" }}>
        <div className="Depositionheader">
          <p>Disposition</p>
        </div>
        {loading ? (
          <div className="DepositionCode">Loading...</div>
        ) : (
          <div className="DepositionCode">
            <button
               value="Air – Change Flights"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Air – Change Flights
             </button>
             <button
               value="Air – Schedule Change"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Air – Schedule Change
             </button>
             <button
               value="Air – Cancel Flights"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Air – Cancel Flights
             </button>
             <button
               value="Air – Chg/Cxl w/in 24 hrs of Booking"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Air – Chg/Cxl w/in 24 hrs of Booking
             </button>
             <button
               value="Air – Seats, Baggage, or Other"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Air – Seats, Baggage, or Other
             </button>
             <button
               value="Cancel – Refund Option Available"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Cancel – Refund Option Available
             </button>
             <button
               value="Cancel – In Penalty or Non-Refundable"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Cancel – In Penalty or Non-Refundable
             </button>
             <button
               value="Change – Dates, People, or Product"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Change – Dates, People, or Product
             </button>
             <button
               value="Pre-Booking – Shopping or Error"
               onClick={(e) => DepositionHandleChnage(e)}
             >
               Pre-Booking – Shopping or Error
             </button>
             <button
               value="General Question "
               onClick={(e) => DepositionHandleChnage(e)}
             >
               General Question 
             </button>
             <button
               value="Air – Exchange"
               onClick={(e) => DepositionHandleChnage(e)}
             >
              Air – Exchange
             </button>
             <button
               value="Air – Airline Policy or Exception"
               onClick={(e) => DepositionHandleChnage(e)}
             >
             Air – Airline Policy or Exception
             </button>
             <button
               value="Air – Schedule Change"
               onClick={(e) => DepositionHandleChnage(e)}
             >
            Air – Schedule Change
             </button>
             <button
               value="Fee Waiver Request"
               onClick={(e) => DepositionHandleChnage(e)}
             >
            Fee Waiver Request
             </button>
             <button
               value="Follow-Up with Customer"
               onClick={(e) => DepositionHandleChnage(e)}
             >
             Follow-Up with Customer
             </button>
             <button
               value="Confirmation Number"
               onClick={(e) => DepositionHandleChnage(e)}
             >
             Confirmation Number
             </button>
             <button
               value="Hotel Check-In Issue or Request"
               onClick={(e) => DepositionHandleChnage(e)}
             >
            Hotel Check-In Issue or Request
             </button>
             <button
               value="Car Pick-Up Issue"
               onClick={(e) => DepositionHandleChnage(e)}
             >
            Car Pick-Up Issue
             </button>
             <button
               value="Activity Ticket or Supplier Issue"
               onClick={(e) => DepositionHandleChnage(e)}
             >
              Activity Ticket or Supplier Issue
             </button>
             <button
               value="Flight or Airline Issue"
               onClick={(e) => DepositionHandleChnage(e)}
             >
             Flight or Airline Issue
             </button>
           
          </div>
        )}
      </div>
      <div style={{ height: "30%" }}>
        <div className={isActive ? "Recordingcontrol" : "inactive"}>
          <p>{isActive ? "Recording" : "Recording Stopped"}</p>
        </div>
        <div className="controlsbutton">
          <button className="pauseButton" onClick={pausebuttonfnc}>
            Pause
          </button>
          <button className="startButton" onClick={startbuttonfnc}>
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}

export default Deposition;
