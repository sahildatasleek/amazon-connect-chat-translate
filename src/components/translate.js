const TRANSLATE_API_URL = 'https://id40hl57lf.execute-api.us-east-1.amazonaws.com/main/translate';

async function ProcessChatText(content, sourceLang, targetLang) {
    const response = await fetch(TRANSLATE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sourceLang, targetLang }),
    });
    const result = await response.json();
    return result.TranslatedText;
}

export default ProcessChatText
