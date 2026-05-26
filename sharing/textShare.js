// Text Post Sharing Service
function shareTextMessage(referenceKey) {
    const targetRow = sheetDataset.find(row => row["نمبر شمار"] === referenceKey);
    if (!targetRow) return;

    const srNo = targetRow["نمبر شمار"];
    
    // Extract localized attributes
    let ucName, pointName, address, responsiblePerson;

    if (currentLanguage === 'ur') {
        ucName = targetRow["یو سی"] || "";
        pointName = targetRow["پوائنٹ کا نام"] || `پوائنٹ #${srNo}`;
        address = targetRow["پوائنٹ کا ایڈریس"] || "";
        responsiblePerson = targetRow["پوائنٹ ذمہ دار"] || "";
    } else {
        ucName = targetRow["uc"] || "";
        pointName = targetRow["Point Name"] || `Point #${srNo}`;
        address = targetRow["location points"] || "";
        responsiblePerson = targetRow["Point responsible"] || "";
    }

    // Coordinates mapping
    let sharedMapLink = targetRow["Google Map Link"] ? targetRow["Google Map Link"].trim() : "";
    if (!sharedMapLink && targetRow["cordinates"]) {
        const cleanCoords = targetRow["cordinates"].trim();
        if (/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(cleanCoords)) {
            sharedMapLink = "https://maps.google.com/?q=" + cleanCoords;
        } else if (cleanCoords.startsWith("http://") || cleanCoords.startsWith("https://")) {
            sharedMapLink = cleanCoords;
        }
    }

    // Format billingual headers
    let headingText = "";
    let subheadingText = "";
    let brandText = "";
    let callToActionText = "";

    if (currentLanguage === 'ur') {
        headingText = "قربانی کی کھالیں";
        subheadingText = "عاشقانِ رسول کی دینی تحریک";
        brandText = "دعوتِ اسلامی";
        callToActionText = "کو دے کر دینی کاموں میں حصہ لیجیے!";
    } else {
        headingText = "Qurbani Hides";
        subheadingText = "Religious Movement of Ashiqan-e-Rasool";
        brandText = "Dawat-e-Islami";
        callToActionText = "Donate your hides and participate in religious work!";
    }

    let textMessage = `🌟 *${headingText}* 🌟\n✨ *${subheadingText}* ✨\n🕌 *${brandText}* 🕌\n📢 *${callToActionText}*\n\n`;

    if (currentLanguage === 'ur') {
       
        textMessage += `🏢 *یو سی (UC):* ${ucName}\n`;
        textMessage += `🏠 *پتہ:* ${address}\n`;
        textMessage += `👤 *ذمہ دار:* ${responsiblePerson}\n`;
        textMessage += `📞 *رابطہ نمبر:* ${targetRow["موبائل نمبر"]}\n`;
        if(sharedMapLink) textMessage += `🗺️ *گوگل میپ لوکیشن:* ${sharedMapLink}\n`;
    } else {
       
        textMessage += `🏢 *Union Council (UC):* ${ucName}\n`;
        textMessage += `🏠 *Address:* ${address}\n`;
        textMessage += `👤 *Person in Charge:* ${responsiblePerson}\n`;
        textMessage += `📞 *Mobile Number:* ${targetRow["موبائل نمبر"]}\n`;
        if(sharedMapLink) textMessage += `🗺️ *Google Map Link:* ${sharedMapLink}\n`;
    }

    // Direct platform share if supported, fallback to clipboard
    if (navigator.share) {
        navigator.share({
            title: i18n[currentLanguage].title,
            text: textMessage
        })
        .then(() => {
            if (typeof showToast === "function") {
                showToast(i18n[currentLanguage].successShare);
            }
        })
        .catch(err => {
            console.log("Direct share cancelled/failed, copying to clipboard", err);
            copyTextToClipboard(textMessage);
        });
    } else {
        copyTextToClipboard(textMessage);
    }
}

function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === "function") {
            showToast(i18n[currentLanguage].textCopied, "success");
        }
    })    .font-nastaliq {
        font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
        line-height: 2.3;
    }
