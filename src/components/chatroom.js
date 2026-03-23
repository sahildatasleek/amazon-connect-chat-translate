import React, { useEffect, useRef, useState } from 'react';
import './chatroom.css';
import Message from './message.js';
import translateTextAPI from './translateAPI'
import { addChat, useGlobalState, setAgentTargetLanguage } from '../store/state';

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
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    // true when agent manually picked a language — stops auto-detect overriding dropdown
    const userOverrideRef = useRef(false);

    const sendMessage = async (session, content) => {
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

    // When incoming message is detected, auto-update dropdown UNLESS agent manually overrode
    useEffect(() => {
        const detectedLanguage = languageTranslate.find(
            (lang) => lang.contactId === currentContactId[0]
        );
        if (detectedLanguage && !userOverrideRef.current) {
            setSelectedLanguage(detectedLanguage.lang);
            setAgentTargetLanguage(detectedLanguage.lang);
        }
    }, [languageTranslate, currentContactId]);

    // Reset override when contact changes (new customer = fresh auto-detect)
    useEffect(() => {
        userOverrideRef.current = false;
    }, [currentContactId]);

    // Agent manually picks a language → lock dropdown to that choice
    const handleChange = (event) => {
        const lang = event.target.value;
        setSelectedLanguage(lang);
        setAgentTargetLanguage(lang);
        userOverrideRef.current = true;
    };

    async function handleSubmit(event) {
        setLoading(true);
        event.preventDefault();
        if (newMessage === "") {
            setLoading(false);
            return;
        }

        // Translate agent message from English to the selected/auto-detected language
        let translatedMessageAPI = await translateTextAPI(newMessage, 'en', selectedLanguage);
        let translatedMessage = translatedMessageAPI.TranslatedText;

        console.log(`Original: ${newMessage} | Translated (${selectedLanguage}): ${translatedMessage}`);

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
            for (var obj in props.session) {
                for (var item in props.session[obj]) {
                    if (item === key) {
                        value = props.session[obj][item];
                        break;
                    }
                }
            }
            return value;
        }

        setLoading(false);
        if (!session || typeof session.sendMessage !== 'function') {
            console.error("No active chat session found for contactId:", currentContactId[0]);
            return;
        }
        sendMessage(session, translatedMessage);
    }

    const handleChange2 = (e) => {
        setTimeout(() => {
            setSelectedValue(e.target.value);
            const urlq = `https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/softphoneqna?category=${e.target.value}`;
            const headers = new Headers();
            headers.append("x-api-key", "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C");
            const request = new Request(urlq, { method: "GET", headers });
            fetch(request)
                .then((response) => response.json())
                .then((json) => setNewMessage(json.items.reply))
                .catch((error) => console.error(error));
        }, 2000);
    };

    const apiKey = "AzP1YtY7VF24pdQPqgbhNaeMi2vbrzWk9H25mS9C";
    const headers = new Headers();
    headers.append("x-api-key", apiKey);
    const url = "https://betqoq75b6.execute-api.us-east-1.amazonaws.com/production/qna";
    const request = new Request(url, { method: "GET", headers });

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
                {Chats.map((chat) => {
                    if (chat.contactId === currentContactId[0])
                        return <Message chat={chat} user={agentUsername} />;
                })}
            </ul>
            <form className="input" onSubmit={handleSubmit}>
                <textarea
                    rows="2"
                    cols="25"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <datalist id="suggestions">
                    {valueData.sort().map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </datalist>
                <input
                    autoComplete="on"
                    list="suggestions"
                    placeholder="select"
                    onChange={(e) => handleChange2(e)}
                />
                <input type="submit" value={loading ? "loading......" : "Submit"} />
            </form>
        </div>
    );
};

export default Chatroom;
