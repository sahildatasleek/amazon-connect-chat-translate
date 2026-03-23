const TRANSLATE_API_URL = 'https://id40hl57lf.execute-api.us-east-1.amazonaws.com/main/translate';

// Returns { TranslatedText, SourceLanguageCode }
async function ProcessChatText(content, sourceLang, targetLang) {
    const response = await fetch(TRANSLATE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sourceLang, targetLang }),
    });
    const result = await response.json();
    console.log("CDEBUG ===> raw translate response:", result);
    // Lambda wraps its response in a 'body' string — parse it
    const parsed = result.body ? JSON.parse(result.body) : result;
    return parsed;
}

export default ProcessChatText
