import React, { useEffect, useRef, useState } from 'react';
import './chatroom.css';
import Message from './message.js';
//import translateText from './translate'
import translateTextAPI from './translateAPI'
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
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isUserAction, setIsUserAction] = useState(false);
  const userActionRef = useRef(false); // Ref to track user actions
    
    function getKeyByValue(object) {
        let obj = languageTranslate.find(o => o.contactId === currentContactId[0]);
        if(obj === undefined) {
            return
          } else {
                return Object.keys(object).find(key => object[key] === obj.lang);
        }
        
    }

    const sendMessage = async(session, content) => {
        const awsSdkResponse = await session.sendMessage({
            contentType: "text/plain",
            message: content
        });
        const { AbsoluteTime, Id } = awsSdkResponse.data;
        console.log(AbsoluteTime, Id);
    }
    // const handleChange = (event) => {
    //     setSelectedLanguage(event.target.value); // Update the state
    //     userActionRef.current = true; // Mark this as a user action
    //   };

    //! orignal handleChange
// const handleChange = (event) => {
//   setSelectedLanguage(event.target.value);
//   userActionRef.current = true;
// };
//! orignal handleChange
const handleChange = (event) => {
  const lang = event.target.value;
  setSelectedLanguage(lang);
  userChangedRef.current = true; // Mark manual control
};

    useEffect(() => {

        // this ensures that the chat window will auto scoll to ensure the more recent message is in view
        if (messageEl) {
            messageEl.current.addEventListener('DOMNodeInserted', event => {
                const { currentTarget: target } = event;
                target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
            });
        }
        // this ensure that the input box has the focus on load and after each entry
        // input.current.focus();
    }, []);


    async function handleSubmit(event) {
      setLoading(true);
        event.preventDefault();
        // if there is no text in the the chat input box, do nothing.
        if (newMessage === "") {
            return;
        }
        let destLang = languageTranslate.find(o => o.contactId === currentContactId[0]);
        console.log("destLang: ", destLang);

        // translate the agent message  ** Swap the below two round if you wnat to test custom termonologies **
        // let translatedMessage = await translateText(newMessage, 'en', destLang.lang);

        /***********************************CUSTOM TERMINOLOGY*************************************************    
         
            To support custom terminologies comment out the line above, and uncomment the below 2 lines 
         
         ******************************************************************************************************/
        console.log(newMessage);
        let translatedMessageAPI = await translateTextAPI(newMessage, 'en', selectedLanguage); // Provide a custom terminology created outside of this deployment
        //let translatedMessageAPI = await translateTextAPI(newMessage, 'en', destLang.lang, ['connectChatTranslate']); // Provide a custom terminology created outside of this deployment
        let translatedMessage = translatedMessageAPI.TranslatedText

        console.log(` Original Message: ` + newMessage + `\n Translated Message: ` + translatedMessage);
        // create the new message to add to Chats.
        let data2 = {
            contactId: currentContactId[0],
            username: agentUsername,
            content: <p>{newMessage}</p>,
            translatedMessage: <p>{translatedMessage}</p>, // set to {translatedMessage.TranslatedText} if using custom terminologies
        };
        // add the new message to the store
        addChat(prevMsg => [...prevMsg, data2]);
        // clear the chat input box
        setNewMessage("");

        
        
        const session = retrieveValue(currentContactId[0]);

        function retrieveValue(key){
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
        setLoading(false);
        sendMessage(session, translatedMessage);
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
    
      const apiKey = "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C";
      const headers = new Headers();
      headers.append("x-api-key", apiKey);
      const url =
        "https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/qna";
      const request = new Request(url, {
        method: "GET",
        headers: headers,
      });
      
    
      useEffect(() => {
        fetch(request)
          .then((response) => response.json())
          .then((json) => setDropdowndata(json.msg.Items))
          .catch((error) => console.error(error));
      }, []);
      const valueData = [];
      for (const element of dropdowndata) {
        valueData.push(element.category);
      }

      //!orginal useEffect
      // useEffect(() => {
      //   const detectedLanguage = languageTranslate.find(
      //     (lang) => lang.contactId === currentContactId[0]
      //   );
      
      //   if (detectedLanguage && !userActionRef.current) {
      //     setSelectedLanguage(detectedLanguage.lang); // Update dropdown
      //   }
      
      //   // Reset userActionRef after a short delay
      //   const timer = setTimeout(() => {
      //     userActionRef.current = false;
      //   }, 3000); // Adjust delay as needed
      
      //   return () => clearTimeout(timer); // Clean up the timer
      // }, [languageTranslate, currentContactId]);
       //!orginal useEffect

// useEffect(() => {
//   const detectedLanguage = languageTranslate.find(
//     (lang) => lang.contactId === currentContactId[0]
//   );

//   if (detectedLanguage) {
//     if (!userActionRef.current) {
//       setSelectedLanguage(detectedLanguage.lang);
//     }
//   }
// }, [languageTranslate, currentContactId]);
// const lastDetectedLangRef = useRef(null);

// useEffect(() => {
//   const detectedLanguage = languageTranslate.find(
//     (lang) => lang.contactId === currentContactId[0]
//   );

//   if (detectedLanguage) {
//     const newLang = detectedLanguage.lang;

//     // If user has not selected manually or if detected language changed
//     if (
//       (!userActionRef.current && selectedLanguage !== newLang) ||
//       lastDetectedLangRef.current !== newLang
//     ) {
//       setSelectedLanguage(newLang);
//       lastDetectedLangRef.current = newLang;
//       userActionRef.current = false; // reset user action since we followed detected lang
//     }
//   }
// }, [languageTranslate, currentContactId]);
const detectedLangRef = useRef(null); // Track last detected lang
const userChangedRef = useRef(false); // Track if user made a change

// When detected language or current contact changes
useEffect(() => {
  const detectedLanguage = languageTranslate.find(
    (lang) => lang.contactId === currentContactId[0]
  );

  if (detectedLanguage) {
    const newLang = detectedLanguage.lang;

    // If detected language has changed
    if (detectedLangRef.current !== newLang) {
      detectedLangRef.current = newLang;

      // If user has not manually changed OR wants to follow detected
      if (!userChangedRef.current) {
        setSelectedLanguage(newLang);
      }
    }
  }
}, [languageTranslate, currentContactId]);

// When user changes the dropdown manually

useEffect(() => {
  userChangedRef.current = false;
}, [currentContactId]);


    return (
        <div className="chatroom">
      <h3>
      <select id="language-select" value={selectedLanguage} onChange={handleChange}>
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

Translation - {selectedLanguage || "Not Selected"}
      </h3>
      <ul className="chats" ref={messageEl}>
        {
          // iterate over the Chats, and only display the messages for the currently active chat session
          Chats.map((chat) => {
            if (chat.contactId === currentContactId[0])
              return <Message chat={chat} user={agentUsername} />;
          })
        }
      </ul>
      <form className="input" onSubmit={handleSubmit}>
        {/* <input
            ref={input}
            maxLength="1024"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />  */}
        <textarea
          rows="2"
          cols="25"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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
          placeholder="select"
          onChange={(e) => handleChange2(e)}
        />

        {/* <select
            value={selectedValue}
            onChange={(e) => handleChange2(e)}
            style={{
              width: "7rem",
              background: "grey",
              color: "white",
              height: "2rem",
            }}
          >
            <option value=" ">Select</option>
            {valueData.sort().map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select> */}

        <input type="submit" value={loading ? "loading......" : "Submit"} />
      </form>
    </div>
    );
};


export default Chatroom;
