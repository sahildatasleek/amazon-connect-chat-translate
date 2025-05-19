import React, { useEffect, useRef, useState } from 'react';
import './chatroom.css';
import Message from './message.js';
import translateTextAPI from './translateAPI';
import { addChat, useGlobalState } from '../store/state';

const Chatroom = (props) => {
  const [Chats] = useGlobalState("Chats");
  const currentContactId = useGlobalState("currentContactId");
  const [newMessage, setNewMessage] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [languageTranslate] = useGlobalState("languageTranslate");
  const [languageOptions] = useGlobalState("languageOptions");
  const [dropdowndata, setDropdowndata] = useState([]);
  const [loading, setLoading] = useState(false);
  const agentUsername = "AGENT";
  const messageEl = useRef(null);
  const input = useRef(null);
  
  // Language state management
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isManualSelection, setIsManualSelection] = useState(false);
  const prevContactIdRef = useRef(currentContactId[0]);

  // Language selection handler
  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    setSelectedLanguage(lang);
    setIsManualSelection(true);
  };

  // Effect to handle language detection
  useEffect(() => {
    // Only auto-update if:
    // 1. It's a different contact, or
    // 2. It's the same contact but no manual selection was made
    if (currentContactId[0] !== prevContactIdRef.current || !isManualSelection) {
      const detectedLanguage = languageTranslate.find(
        lang => lang.contactId === currentContactId[0]
      );
      
      if (detectedLanguage) {
        setSelectedLanguage(detectedLanguage.lang);
        setIsManualSelection(false);
      }
    }

    // Update previous contact ID reference
    prevContactIdRef.current = currentContactId[0];
    
    // Reset manual selection flag when contact changes
    if (currentContactId[0] !== prevContactIdRef.current) {
      setIsManualSelection(false);
    }
  }, [currentContactId, languageTranslate, isManualSelection]);

  // Auto-scroll and focus effects
  useEffect(() => {
    if (messageEl.current) {
      messageEl.current.addEventListener('DOMNodeInserted', event => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
  }, []);

  async function handleSubmit(event) {
    setLoading(true);
    event.preventDefault();
    
    if (newMessage === "") {
      return;
    }

    try {
      // Translate the message
      const translatedMessageAPI = await translateTextAPI(newMessage, 'en', selectedLanguage);
      const translatedMessage = translatedMessageAPI.TranslatedText;

      console.log(`Original: ${newMessage}\nTranslated: ${translatedMessage}`);
      
      // Create the new message
      const newChat = {
        contactId: currentContactId[0],
        username: agentUsername,
        content: <p>{newMessage}</p>,
        translatedMessage: <p>{translatedMessage}</p>,
      };

      // Add to store and clear input
      addChat(prevMsg => [...prevMsg, newChat]);
      setNewMessage("");

      // Send message via session
      const session = retrieveValue(currentContactId[0]);
      if (session) {
        await sendMessage(session, translatedMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  }

  const sendMessage = async (session, content) => {
    try {
      const awsSdkResponse = await session.sendMessage({
        contentType: "text/plain",
        message: content
      });
      console.log("Message sent:", awsSdkResponse.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const retrieveValue = (key) => {
    for (const obj in props.session) {
      for (const item in props.session[obj]) {
        if (item === key) {
          return props.session[obj][item];
        }
      }
    }
    return null;
  };

  const handleChange2 = (e) => {
    setTimeout(() => {
      setSelectedValue(e.target.value);
      const urlq = `https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/softphoneqna?category=${e.target.value}`;
      const headers = new Headers();
      headers.append("x-api-key", "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C");
      
      fetch(new Request(urlq, {
        method: "GET",
        headers: headers,
      }))
        .then((response) => response.json())
        .then((json) => setNewMessage(json.items.reply))
        .catch((error) => console.error(error));
    }, 2000);
  };

  // Fetch dropdown data
  useEffect(() => {
    const apiKey = "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C";
    const headers = new Headers();
    headers.append("x-api-key", apiKey);
    const url = "https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/qna";
    
    fetch(new Request(url, {
      method: "GET",
      headers: headers,
    }))
      .then((response) => response.json())
      .then((json) => setDropdowndata(json.msg.Items))
      .catch((error) => console.error(error));
  }, []);

  const valueData = dropdowndata.map(element => element.category).sort();

  return (
    <div className="chatroom">
      <h3>
        <select 
          id="language-select" 
          value={selectedLanguage} 
          onChange={handleLanguageChange}
        >
          <option value="fr">French</option>
          <option value="ja">Japanese</option>
          <option value="es">Spanish</option>
          <option value="zh">Chinese</option>
          <option value="en">English</option>
          <option value="pt">Portuguese</option>
          <option value="de">German</option>
          <option value="th">Thai</option>
        </select>
        Translation - {selectedLanguage || "Not Selected"}
      </h3>
      
      <ul className="chats" ref={messageEl}>
        {Chats.map((chat) => (
          chat.contactId === currentContactId[0] && (
            <Message key={`${chat.contactId}-${chat.username}-${Date.now()}`} 
                    chat={chat} 
                    user={agentUsername} />
          )
        ))}
      </ul>
      
      <form className="input" onSubmit={handleSubmit}>
        <textarea
          rows="2"
          cols="25"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        
        <datalist id="suggestions">
          {valueData.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        
        <input
          autoComplete="on"
          list="suggestions"
          placeholder="Select category"
          onChange={handleChange2}
        />
        
        <input 
          type="submit" 
          value={loading ? "Sending..." : "Send"} 
          disabled={loading}
        />
      </form>
    </div>
  );
};

export default Chatroom;