import React, { useEffect, useRef, useState } from 'react';
import { Grid } from 'semantic-ui-react';
import Chatroom from './chatroom';
import translateText from './translate'
import detectText from './detectText'
import { addChat, setLanguageTranslate, clearChat, useGlobalState, setCurrentContactId } from '../store/state';
import Deposition from './Deposition';
//
const Ccp = () => {
    const [languageTranslate] = useGlobalState('languageTranslate');
    const languageTranslateRef = useRef([]);
    useEffect(() => { languageTranslateRef.current = languageTranslate; }, [languageTranslate]);
    var localLanguageTranslate = [];
    const [Chats] = useGlobalState('Chats');
    const [lang, setLang] = useState("");
    const [currentContactId] = useGlobalState('currentContactId');
    const [languageOptions] = useGlobalState('languageOptions');
    const [agentTargetLanguage] = useGlobalState('agentTargetLanguage');
    const agentTargetLanguageRef = useRef('en');
    useEffect(() => {
        agentTargetLanguageRef.current = agentTargetLanguage || 'en';
    }, [agentTargetLanguage]);
    const [agentChatSessionState, setAgentChatSessionState] = useState([]);
    const [setRefreshChild] = useState([]);

    console.log(lang)
    console.log(currentContactId)
    //console.log(Chats)

    // *******
    // Subscribe to the chat session
    // *******
    function getEvents(contact, agentChatSession) {
        console.log(agentChatSession);
        contact.getAgentConnection().getMediaController().then(controller => {
            controller.onMessage(messageData => {
                if (messageData.chatDetails.participantId === messageData.data.ParticipantId) {
                    console.log(`CDEBUG ===> Agent ${messageData.data.DisplayName} Says`,
                        messageData.data.Content)
                }
                else {
                    console.log(`CDEBUG ===> Customer ${messageData.data.DisplayName} Says`,messageData.data.Content);
                    processChatText(messageData.data.Content, messageData.data.Type, messageData.data.ContactId );
                }
            })
        })
    }
    // *******
    // Processing the incoming chat from the Customer
    // *******
    async function processChatText(content, type, contactId) {
        console.log(type);
        // Translate to English using 'auto' — Amazon Translate detects source language accurately.
        // Response includes { TranslatedText, SourceLanguageCode }
        // Detect language client-side (Lambda role lacks comprehend:DetectDominantLanguage)
        const detected = await detectText(content);
        const detectedLang = detected.textInterpretation.language;
        console.log("CDEBUG ===> Detected lang:", detectedLang);

        // If already English, no need to translate
        let translatedMessage = content;
        if (detectedLang !== 'en') {
            const result = await translateText(content, detectedLang, 'en');
            console.log("CDEBUG ===> FULL RESULT:", JSON.stringify(result));
            translatedMessage = result.TranslatedText || content;
        }
        console.log("CDEBUG ===> Translated:", translatedMessage);

        // Update languageTranslate store so the dropdown in Chatroom auto-updates
        const currentLangTranslate = languageTranslateRef.current;
        const updated = [...currentLangTranslate];
        const idx = updated.findIndex(item => item.contactId === contactId);
        if (idx > -1) updated[idx] = { contactId, lang: detectedLang };
        else updated.push({ contactId, lang: detectedLang });
        setLanguageTranslate(updated);

        // Add message to chat
        addChat(prevMsg => [...prevMsg, {
            contactId,
            username: 'customer',
            content: <p>{content}</p>,
            translatedMessage: <p>{translatedMessage}</p>
        }]);
    }

    // *******
    // Subscribing to CCP events. See : https://github.com/aws/amazon-connect-streams/blob/master/Documentation.md
    // *******
    function subscribeConnectEvents() {
        window.connect.core.onViewContact(function(event) {
            var contactId = event.contactId;
            console.log("CDEBUG ===> onViewContact", contactId)
            setCurrentContactId(contactId);    
          });

        console.log("CDEBUG ===> subscribeConnectEvents");

        // If this is a chat session
        if (window.connect.ChatSession) {
            console.log("CDEBUG ===> Subscribing to Connect Contact Events for chats");
            window.connect.contact(contact => {

                // This is invoked when CCP is ringing
                contact.onConnecting(() => {
                    console.log("CDEBUG ===> onConnecting() >> contactId: ", contact.contactId);
                    localStorage.setItem('myKey', contact.contactId);
                    let contactAttributes = contact.getAttributes();
                    console.log("CDEBUG ===> contactAttributes: ", JSON.stringify(contactAttributes));
                    let contactQueue = contact.getQueue();
                    console.log("CDEBUG ===> contactQueue: ", contactQueue);
                });

                // This is invoked when the chat is accepted
                contact.onAccepted(async() => {
                    console.log("CDEBUG ===> onAccepted: ", contact);
                    const cnn = contact.getConnections().find(cnn => cnn.getType() === window.connect.ConnectionType.AGENT);
                    const agentChatSession = await cnn.getMediaController();
                    setCurrentContactId(contact.contactId)
                    console.log("CDEBUG ===> agentChatSession ", agentChatSession)
                    // Save the session to props, this is required to send messages within the chatroom.js
                    setAgentChatSessionState(agentChatSessionState => [...agentChatSessionState, {[contact.contactId] : agentChatSession}])
                
                    // Get the language from the attributes, if the value is valid then add to the store
                    const x_lang = contact.getAttributes().x_lang;
                    localLanguageTranslate = x_lang ? x_lang.value : '';
                    if (localLanguageTranslate && Object.keys(languageOptions).find(key => languageOptions[key] === localLanguageTranslate) !== undefined){
                        console.log("CDEBUG ===> Setting lang code from attribites:", localLanguageTranslate)
                        languageTranslate.push({contactId: contact.contactId, lang: localLanguageTranslate})
                        setLanguageTranslate(languageTranslate);
                        setRefreshChild('updated')
                    }
                    console.log("CDEBUG ===> onAccepted, languageTranslate ", languageTranslate)
                    
                });

                // This is invoked when the customer and agent are connected
                contact.onConnected(async() => {
                    console.log("CDEBUG ===> onConnected() >> contactId: ", contact.contactId);
                    const cnn = contact.getConnections().find(cnn => cnn.getType() === window.connect.ConnectionType.AGENT);
                    const agentChatSession = await cnn.getMediaController();
                    getEvents(contact, agentChatSession);
                });

                // This is invoked when new agent data is available
                contact.onRefresh(() => {
                    console.log("CDEBUG ===> onRefresh() >> contactId: ", contact.contactId);
                });

                // This is invoked when the agent moves to ACW
                contact.onEnded(() => {
                    console.log("CDEBUG ===> onEnded() >> contactId: ", contact.contactId);
                    localStorage.removeItem('myKey');

                });
                
                // This is invoked when the agent moves out of ACW to a different state
                contact.onDestroy(() => {
                    console.log("CDEBUG ===> onDestroy() >> contactId: ", contact.contactId);
                    // TODO need to remove the previous chats from the store
                    //clearChat()
                    setCurrentContactId('');
                    clearChat();
                });
            });

            /* 
            **** Subscribe to the agent API **** 
            See : https://github.com/aws/amazon-connect-streams/blob/master/Documentation.md
            */

            console.log("CDEBUG ===> Subscribing to Connect Agent Events");
            window.connect.agent((agent) => {
                agent.onStateChange((agentStateChange) => {
                    // On agent state change, update the React state.
                    let state = agentStateChange.newState;
                    console.log("CDEBUG ===> New State: ", state);

                });

            });
        }
        else {
            console.log("CDEBUG ===> waiting 3s");
            setTimeout(function() { subscribeConnectEvents(); }, 3000);
        }
    };


    const ccpInitialized = useRef(false);

    // *****
    // Loading CCP
    // *****
    useEffect(() => {
        const connectUrl = process.env.REACT_APP_CONNECT_INSTANCE_URL;
        if (!connectUrl) {
            console.error("REACT_APP_CONNECT_INSTANCE_URL is not set in .env");
            return;
        }
        if (ccpInitialized.current) return;
        ccpInitialized.current = true;
        window.connect.core.initCCP(
            document.getElementById("ccp-container"),
            {
                ccpUrl: connectUrl + "/connect/ccp-v2/",
                region: process.env.REACT_APP_CONNECT_REGION,
                loginPopup: true,
                loginPopupAutoClose: true,
                softphone: {
                    allowFramedSoftphone: true
                },
                pageOptions: {
                    enableAudioDeviceSettings: true,
                    enablePhoneTypeSettings: true
                }
            }
        );
        window.connect.core.onInitialized(() => {
            subscribeConnectEvents();
        });
    }, []);


    return (
        <main>
        <Grid columns='equal' stackable padded>
        <Grid.Row>
          {/* CCP window will load here */}
          <div id="ccp-container"></div>
          {/* Translate window will laod here. We pass the agent state to be able to use this to push messages to CCP */}
          <div id="chatroom" ><Chatroom session={agentChatSessionState}/> </div> 
<div id="Depositioncontainer">
   <Deposition />
  </div>
          </Grid.Row>
        </Grid>
      </main>
    );
};

export default Ccp;
