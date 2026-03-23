// Detect language by Unicode script — reliable for non-Latin scripts, even single words
function detectByScript(text) {
    if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'; // hiragana/katakana = Japanese
    if (/[\u4E00-\u9FFF\u3400-\u4DBF]/.test(text)) return 'zh'; // CJK = Chinese
    if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/[\u0400-\u04FF]/.test(text)) return 'ru';
    if (/[\u0590-\u05FF]/.test(text)) return 'he';
    return null;
}

function detectLatinLang(text) {
    const t = text.toLowerCase();
    const scores = { fr: 0, de: 0, es: 0, pt: 0, en: 0 };

    // ── Portuguese ── strongest unique markers first
    if (/[ãõ]/.test(t)) scores.pt += 8;                          // ã õ almost exclusively Portuguese
    if (/ção\b|ções\b|ção |ão\b|ões\b/.test(t)) scores.pt += 6; // -ção -ão endings
    if (/\b(não|são|está|você|obrigado|obrigada|tchau|olá|tudo|bem|oi|sim|isso|nós)\b/.test(t)) scores.pt += 5;
    if (/\b(este|esta|esse|essa|eles|elas|numa|num)\b/.test(t)) scores.pt += 2;

    // ── Spanish ── unique markers
    if (/[¿¡ñ]/.test(t)) scores.es += 8;                        // ¿ ¡ ñ only in Spanish
    if (/\b(hola|sí|qué|gracias|cómo|español|nosotros|vosotros|ellos|también|prueba|mucho|muy)\b/.test(t)) scores.es += 5;
    if (/\b(del|al|hay|pero|porque|cuando|todo|los|las|unos|unas|estoy|estás|estamos)\b/.test(t)) scores.es += 3;
    if (/[áéíóú]/.test(t) && scores.pt === 0) scores.es += 2;   // accents, only if not already Portuguese

    // ── French ── unique markers
    if (/[àâêîôùûœæ]/.test(t)) scores.fr += 5;                  // French-specific accented vowels
    if (/[ç]/.test(t) && scores.pt === 0) scores.fr += 4;        // ç in French (not if Portuguese already detected)
    if (/\b(bonjour|merci|oui|pourquoi|voilà|voici|très|aussi|alors|donc|ici|ceci|cela|je|tu|nous|vous|ils|elles|cette|avec|dans|mais)\b/.test(t)) scores.fr += 5;
    if (/\b(est|les|des|du|aux|par|sur|qui)\b/.test(t) && scores.fr > 0) scores.fr += 1; // ambiguous words only if other French markers present

    // ── German ── unique markers
    if (/[äöüß]/.test(t)) scores.de += 8;
    if (/\b(hallo|danke|bitte|ich|wir|das|die|der|ein|eine|und|ist|nicht|mit|für|von|zu|nein)\b/.test(t)) scores.de += 5;

    // ── English ── common English-only words
    if (/\b(hello|hi|the|this|that|is|are|was|were|and|or|but|yes|no|how|what|why|with|please|thank|here|there|it's)\b/.test(t)) scores.en += 4;

    console.log("CDEBUG ===> lang scores:", JSON.stringify(scores), "for:", text);
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best[1] > 0 ? best[0] : null;
}

async function DetectChatText(content) {
    const scriptLang = detectByScript(content);
    if (scriptLang) {
        console.log("CDEBUG ===> script detected:", scriptLang);
        return { textInterpretation: { language: scriptLang } };
    }
    const detectedLang = detectLatinLang(content) || 'en';
    console.log("CDEBUG ===> pattern detected:", detectedLang);
    return { textInterpretation: { language: detectedLang } };
}

export default DetectChatText;
