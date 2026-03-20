const TRANSLATE_API_URL = 'https://id40hl57lf.execute-api.us-east-1.amazonaws.com/main/translate';

async function ProcessChatTextAPI(content, sourceLang, targetLang) {
    try {
        const response = await fetch(TRANSLATE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, sourceLang, targetLang }),
        });
        const resp = await response.json();
        console.log("Response: ", resp);
        return resp;
    }
    catch (error) {
        console.error("ProcessChatTextAPI: ", error);
        return error;
    }
}
export default ProcessChatTextAPI
