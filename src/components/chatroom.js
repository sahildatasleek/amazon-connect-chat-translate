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
  const [dropdowndata, setDropdowndata] = useState([]);
  const [loading, setLoading] = useState(false);
  const agentUsername = "AGENT";
  const messageEl = useRef(null);
  
  // Language state management
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const lastManualLanguage = useRef(null);
  const prevContactIdRef = useRef(currentContactId[0]);

  // Language selection handler
  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    setSelectedLanguage(lang);
    lastManualLanguage.current = lang;
  };

  // Effect to handle language detection
  useEffect(() => {
    const detectedLanguage = languageTranslate.find(
      lang => lang.contactId === currentContactId[0]
    );

    // Only auto-update if:
    // 1. It's a different contact, OR
    // 2. It's the same contact but no manual selection was made
    if (currentContactId[0] !== prevContactIdRef.current || !lastManualLanguage.current) {
      if (detectedLanguage) {
        setSelectedLanguage(detectedLanguage.lang);
      }
    }

    // Reset manual selection when contact changes
    if (currentContactId[0] !== prevContactIdRef.current) {
      lastManualLanguage.current = null;
    }

    prevContactIdRef.current = currentContactId[0];
  }, [currentContactId, languageTranslate]);

  // Auto-scroll effect
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
    
    if (!newMessage.trim()) return;

    try {
      const translatedMessageAPI = await translateTextAPI(newMessage, 'en', selectedLanguage);
      const translatedMessage = translatedMessageAPI.TranslatedText;

      const newChat = {
        contactId: currentContactId[0],
        username: agentUsername,
        content: <p>{newMessage}</p>,
        translatedMessage: <p>{translatedMessage}</p>,
      };

      addChat(prevMsg => [...prevMsg, newChat]);
      setNewMessage("");

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

  const handleCategorySelect = (e) => {
    setSelectedValue(e.target.value);
    const url = `https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/softphoneqna?category=${e.target.value}`;
    
    fetch(url, {
      headers: { 'x-api-key': "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C" }
    })
      .then(res => res.json())
      .then(data => setNewMessage(data.items?.reply || ""))
      .catch(console.error);
  };

  // Fetch dropdown categories
  useEffect(() => {
    fetch("https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/qna", {
      headers: { 'x-api-key': "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C" }
    })
      .then(res => res.json())
      .then(data => setDropdowndata(data.msg?.Items || []))
      .catch(console.error);
  }, []);

  const categories = dropdowndata.map(item => item.category).sort();

  return (
    <div className="chatroom">
      <h3>
        <select 
          id="language-select" 
          value={selectedLanguage} 
          onChange={handleLanguageChange}
          aria-label="Select translation language"
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
        <span>Translation - {selectedLanguage || "Not Selected"}</span>
      </h3>
      
      <ul className="chats" ref={messageEl}>
        {Chats.filter(chat => chat.contactId === currentContactId[0])
          .map((chat, index) => (
            <Message 
              key={`${chat.contactId}-${index}-${Date.now()}`}
              chat={chat} 
              user={agentUsername} 
            />
          ))
        }
      </ul>
      
      <form className="input" onSubmit={handleSubmit}>
        <textarea
          rows="2"
          cols="25"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          aria-label="Message input"
        />
        
        <div className="suggestion-container">
          <input
            list="suggestions"
            value={selectedValue}
            onChange={handleCategorySelect}
            placeholder="Select category"
            aria-label="Select message category"
          />
          <datalist id="suggestions">
            {categories.map(category => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !newMessage.trim()}
          aria-busy={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chatroom;