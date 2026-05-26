// Premium HTML Canvas Dynamic Graphic Image Poster Maker
function generateAndSharePosterImage(type, referenceKey) {
    const canvasTitle = document.getElementById('canvasDynamicTitle');
    const canvasBody = document.getElementById('canvasDynamicBody');
    
    let filename = "Qurbani-Campaign-Poster.png";
    let textMessage = `قربانی کی کھالیں مہم 2026 - دعوتِ اسلامی کینٹ ٹاؤن راولپنڈی\n\n`;

    if (type === 'location') {
        const targetRow = sheetDataset.find(row => row["نمبر شمار"] === referenceKey);
        if (!targetRow) return;

        canvasTitle.innerText = `${targetRow["یو سی"]}`;
        filename = `${targetRow["یو سی"]}-پوائنٹ-${referenceKey}.png`;

        const address = currentLanguage === 'ur' 
            ? (targetRow["پوائنٹ کا ایڈریس"] || targetRow["location points"] || '')
            : (targetRow["location points"] || targetRow["پوائنٹ کا ایڈریس"] || '');

        const responsiblePerson = currentLanguage === 'ur'
            ? (targetRow["پوائنٹ ذمہ دار"] || "")
            : (targetRow["Point responsible"] || targetRow["پوائنٹ ذمہ دار"] || "");

        // Premium enhanced HTML structure inside the poster details card
        canvasBody.innerHTML = `
            <div class="text-center bg-black/45 p-4 rounded-2xl border border-yellow-500/20" style="margin-bottom: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                <span class="text-yellow-300 font-extrabold text-xs tracking-wider block mb-1.5" style="font-family: 'Outfit', 'Inter', sans-serif;">📍 ${i18n[currentLanguage].posterAddress}</span>
                <p class="text-xl font-bold text-white leading-relaxed font-naskh">${address}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-black/45 p-3.5 rounded-2xl border border-yellow-500/20 text-center">
                    <span class="text-emerald-300 text-xs font-extrabold block mb-1.5">👤 ${i18n[currentLanguage].posterRep}</span>
                    <span class="text-base text-slate-100 font-bold leading-normal">${responsiblePerson}</span>
                </div>
                <div class="bg-black/45 p-3.5 rounded-2xl border border-yellow-500/20 text-center">
                    <span class="text-emerald-300 text-xs font-extrabold block mb-1.5">📞 ${i18n[currentLanguage].posterPhone}</span>
                    <span class="text-base font-mono text-yellow-100 font-black tracking-wide leading-normal">${targetRow["موبائل نمبر"]}</span>
                </div>
            </div>
        `;

        let sharedMapLink = targetRow["Google Map Link"] ? targetRow["Google Map Link"].trim() : "";
        if (!sharedMapLink && targetRow["cordinates"]) {
            const cleanCoords = targetRow["cordinates"].trim();
            if (/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(cleanCoords)) {
                sharedMapLink = "https://maps.google.com/?q=" + cleanCoords;
            } else if (cleanCoords.startsWith("http://") || cleanCoords.startsWith("https://")) {
                sharedMapLink = cleanCoords;
            }
        }
        textMessage += `📍 یو سی: ${targetRow["یو سی"]}\n🏠 ایڈریس: ${address}\n👤 ذمہ دار: ${responsiblePerson}\n📞 رابطہ نمبر: ${targetRow["موبائل نمبر"]}\n`;
        if(sharedMapLink) textMessage += `🗺️ میپ لوکیشن: ${sharedMapLink}\n`;
    }

    if (typeof showToast === "function") {
        showToast(i18n[currentLanguage].sharingPoster, "info");
    }
    const captureCanvasTarget = document.getElementById('imagePosterGeneratorCanvas');
    
    // Set scale to 3.0 for crisp, ultra-high-definition sharing images
    html2canvas(captureCanvasTarget, { scale: 3.0, backgroundColor: '#022c22' }).then(canvas => {
        canvas.toBlob(blob => {
            const imgFile = new File([blob], filename, { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [imgFile] })) {
                navigator.share({
                    files: [imgFile],
                    title: i18n[currentLanguage].title,
                    text: textMessage
                })
                .then(() => {
                    if (typeof showToast === "function") {
                        showToast(i18n[currentLanguage].successShare);
                    }
                })
                .catch(err => {
                    console.log("Share cancelled/failed, downloading locally: ", err);
                    fallbackDownloadMechanism(canvas, filename);
                });
            } else {
                fallbackDownloadMechanism(canvas, filename);
            }
        }, 'image/png');
    });
}

function fallbackDownloadMechanism(canvas, name) {
    if (typeof showToast === "function") {
        showToast(i18n[currentLanguage].fallbackShare, "info");
    }
    const anchor = document.createElement('a');
    anchor.download = name;
    anchor.href = canvas.toDataURL('image/png');
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}
