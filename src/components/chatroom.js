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
  
  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [userOverride, setUserOverride] = useState(false);
  const lastDetectedLang = useRef("en");

  // Handle language detection changes
  useEffect(() => {
    const detectedLanguage = languageTranslate.find(
      lang => lang.contactId === currentContactId[0]
    );

    if (detectedLanguage) {
      const newLang = detectedLanguage.lang;
      lastDetectedLang.current = newLang;
      
      if (!userOverride) {
        setSelectedLanguage(newLang);
      }
    }
  }, [languageTranslate, currentContactId]);

 const handleLanguageChange = (event) => {
    const lang = event.target.value;
    if (lang) {  // Ensure a valid selection
      setSelectedLanguage(lang);
      setUserOverride(true);
    }
  };

  // Reset user override when contact changes
  useEffect(() => {
    setUserOverride(false);
    // Reset to detected language when contact changes
    const detectedLanguage = languageTranslate.find(
      lang => lang.contactId === currentContactId[0]
    );
    if (detectedLanguage) {
      setSelectedLanguage(detectedLanguage.lang);
    }
  }, [currentContactId]);

  const sendMessage = async(session, content) => {
    const awsSdkResponse = await session.sendMessage({
      contentType: "text/plain",
      message: content
    });
    const { AbsoluteTime, Id } = awsSdkResponse.data;
    console.log(AbsoluteTime, Id);
  }

  useEffect(() => {
    if (messageEl) {
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
      console.log(newMessage);
      let translatedMessageAPI = await translateTextAPI(newMessage, 'en', selectedLanguage);
      let translatedMessage = translatedMessageAPI.TranslatedText;

      console.log(`Original Message: ${newMessage}\nTranslated Message: ${translatedMessage}`);
      
      let data2 = {
        contactId: currentContactId[0],
        username: agentUsername,
        content: <p>{newMessage}</p>,
        translatedMessage: <p>{translatedMessage}</p>,
      };
      
      addChat(prevMsg => [...prevMsg, data2]);
      setNewMessage("");

      const session = retrieveValue(currentContactId[0]);
      function retrieveValue(key) {
        var value = "";
        for(var obj in props.session) {
          for(var item in props.session[obj]) {
            if(item === key) {
              value = props.session[obj][item];
              break;
            }
          }
        }
        return value;
      }
      
      await sendMessage(session, translatedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error to user
    } finally {
      setLoading(false);
    }
  }

  const handleChange2 = (e) => {
    setTimeout(() => {
      setSelectedValue(e.target.value);
      const urlq = `https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/softphoneqna?category=${e.target.value}`;
      const headers = new Headers();
      headers.append("x-api-key", "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C");
      const request = new Request(urlq, {
        method: "GET",
        headers: headers,
      });

      fetch(request)
        .then((response) => response.json())
        .then((json) => setNewMessage(json.items.reply))
        .catch((error) => console.error(error));
    }, 2000);
  };

  // API data fetching
  useEffect(() => {
    const apiKey = "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C";
    const headers = new Headers();
    headers.append("x-api-key", apiKey);
    const url = "https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/qna";
    const request = new Request(url, {
      method: "GET",
      headers: headers,
    });

    fetch(request)
      .then((response) => response.json())
      .then((json) => setDropdowndata(json.msg.Items))
      .catch((error) => console.error(error));
  }, []);

  const valueData = [];
  for (const element of dropdowndata) {
    valueData.push(element.category);
  }

  return (
    <div className="chatroom">
     <h3>
        <select 
          id="language-select" 
          value={selectedLanguage} 
          onChange={handleLanguageChange}
          aria-label="Select translation language"
        >
          <option value="">Select a language</option>
          <option value="fr">French</option>
          <option value="ja">Japanese</option>
          <option value="es">Spanish</option>
          <option value="zh">Chinese</option>
          <option value="en">English</option>
          <option value="pt">Portuguese</option>
          <option value="de">German</option>
          <option value="th">Thai</option>
        </select>
        {selectedLanguage ? `Translation - ${selectedLanguage}` : "No language selected"}
        {userOverride && " (Manual)"}
      </h3>
      
      <ul className="chats" ref={messageEl}>
        {Chats.map((chat) => {
          if (chat.contactId === currentContactId[0])
            return <Message key={`${chat.contactId}-${chat.id}`} chat={chat} user={agentUsername} />;
        })}
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

        <datalist id="suggestions">
          {valueData.sort().map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </datalist>
        
        <input
          autoComplete="on"
          list="suggestions"
          placeholder="Select quick response"
          onChange={(e) => handleChange2(e)}
          aria-label="Quick response selector"
        />

        <button 
          type="submit" 
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chatroom;