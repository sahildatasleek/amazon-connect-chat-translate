const TRANSLATE_API_URL = 'https://id40hl57lf.execute-api.us-east-1.amazonaws.com/main/translate';

async function DetectChatText(content) {
    // Use Amazon Translate's auto-detect by passing 'auto' as sourceLang
    const response = await fetch(TRANSLATE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sourceLang: 'auto', targetLang: 'en' }),
    });
    const result = await response.json();
    // Return in the same shape ccp.js expects: result.textInterpretation.language
    return {
        textInterpretation: {
            language: result.SourceLanguageCode || 'en'
        }
    };
}

export default DetectChatText
