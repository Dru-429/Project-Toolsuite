const statusBox = document.getElementById("status");

/*
-----------------------------------
HELPERS
-----------------------------------
*/

function setStatus(message) {
  statusBox.textContent = message;
}

function downloadFile(content, fileName, type) {
  const blob = new Blob([content], { type });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = fileName;

  a.click();

  URL.revokeObjectURL(url);
}

/*
-----------------------------------
IMAGE CONVERTER
-----------------------------------
*/

document
  .getElementById("convertImageBtn")
  .addEventListener("click", () => {
    const file =
      document.getElementById("imageInput").files[0];

    const format =
      document.getElementById("imageFormat").value;

    if (!file) {
      setStatus("Please select an image.");
      return;
    }

    const img = new Image();

    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          const extension =
            format.split("/")[1];

          downloadFile(
            blob,
            `converted.${extension}`,
            format,
          );

          setStatus(
            `Image converted to ${extension.toUpperCase()}.`,
          );
        },
        format,
        1,
      );
    };

    reader.readAsDataURL(file);
  });

/*
-----------------------------------
JSON TO CSV
-----------------------------------
*/

document
  .getElementById("convertJsonBtn")
  .addEventListener("click", () => {
    const file =
      document.getElementById("jsonInput").files[0];

    if (!file) {
      setStatus("Please select a JSON file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);

        const items = Array.isArray(json)
          ? json
          : [json];

        const headers = Object.keys(items[0]);

        const csv = [
          headers.join(","),
          ...items.map((row) =>
            headers
              .map((field) => `"${row[field] ?? ""}"`)
              .join(","),
          ),
        ].join("\n");

        downloadFile(
          csv,
          "converted.csv",
          "text/csv",
        );

        setStatus("JSON converted to CSV.");
      } catch {
        setStatus("Invalid JSON file.");
      }
    };

    reader.readAsText(file);
  });

/*
-----------------------------------
CSV TO JSON
-----------------------------------
*/

document
  .getElementById("convertCsvBtn")
  .addEventListener("click", () => {
    const file =
      document.getElementById("csvInput").files[0];

    if (!file) {
      setStatus("Please select a CSV file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const lines = reader.result
        .split("\n")
        .filter((line) => line.trim());

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim());

      const result = [];

      for (let i = 1; i < lines.length; i++) {
        const obj = {};

        const currentLine = lines[i].split(",");

        headers.forEach((header, index) => {
          obj[header] =
            currentLine[index]?.trim() || "";
        });

        result.push(obj);
      }

      downloadFile(
        JSON.stringify(result, null, 2),
        "converted.json",
        "application/json",
      );

      setStatus("CSV converted to JSON.");
    };

    reader.readAsText(file);
  });

/*
-----------------------------------
TXT TO JSON
-----------------------------------
*/

document
  .getElementById("convertTxtBtn")
  .addEventListener("click", () => {
    const file =
      document.getElementById("txtInput").files[0];

    if (!file) {
      setStatus("Please select a TXT file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const json = JSON.stringify(
        {
          content: reader.result,
        },
        null,
        2,
      );

      downloadFile(
        json,
        "converted.json",
        "application/json",
      );

      setStatus("TXT converted to JSON.");
    };

    reader.readAsText(file);
  });

/*
-----------------------------------
MARKDOWN TO HTML
-----------------------------------
*/

document
  .getElementById("convertMarkdownBtn")
  .addEventListener("click", () => {
    const file =
      document.getElementById("markdownInput").files[0];

    if (!file) {
      setStatus("Please select a Markdown file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      let markdown = reader.result;

      let html = markdown
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
        .replace(/\*(.*?)\*/gim, "<i>$1</i>")
        .replace(/\n/gim, "<br>");

      downloadFile(
        html,
        "converted.html",
        "text/html",
      );

      setStatus("Markdown converted to HTML.");
    };

    reader.readAsText(file);
  });

/*
-----------------------------------
BASE64 ENCODER
-----------------------------------
*/

document
  .getElementById("encodeBase64Btn")
  .addEventListener("click", () => {
    const file =
      document.getElementById(
        "base64EncodeInput",
      ).files[0];

    if (!file) {
      setStatus("Please select a file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 =
        reader.result.split(",")[1];

      await navigator.clipboard.writeText(base64);

      setStatus(
        "Base64 copied to clipboard.",
      );
    };

    reader.readAsDataURL(file);
  });

/*
-----------------------------------
BASE64 DECODER
-----------------------------------
*/

document
  .getElementById("decodeBase64Btn")
  .addEventListener("click", () => {
    const base64 =
      document.getElementById("base64Text")
        .value;

    const extension =
      document.getElementById(
        "base64Extension",
      ).value || "txt";

    if (!base64.trim()) {
      setStatus("Paste Base64 text first.");
      return;
    }

    try {
      const byteCharacters = atob(base64);

      const byteNumbers = new Array(
        byteCharacters.length,
      );

      for (
        let i = 0;
        i < byteCharacters.length;
        i++
      ) {
        byteNumbers[i] =
          byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(
        byteNumbers,
      );

      const blob = new Blob([byteArray]);

      downloadFile(
        blob,
        `decoded.${extension}`,
        blob.type,
      );

      setStatus(
        "Base64 decoded successfully.",
      );
    } catch {
      setStatus("Invalid Base64 string.");
    }
  });

/*
-----------------------------------
AUDIO TO WAV
-----------------------------------
*/

document
  .getElementById("convertAudioBtn")
  .addEventListener("click", async () => {
    const file =
      document.getElementById("audioInput")
        .files[0];

    if (!file) {
      setStatus("Please select an audio file.");
      return;
    }

    try {
      const audioContext =
        new AudioContext();

      const arrayBuffer =
        await file.arrayBuffer();

      const audioBuffer =
        await audioContext.decodeAudioData(
          arrayBuffer,
        );

      const wavBlob =
        audioBufferToWav(audioBuffer);

      downloadFile(
        wavBlob,
        "converted.wav",
        "audio/wav",
      );

      setStatus("Audio converted to WAV.");
    } catch {
      setStatus(
        "Audio conversion failed.",
      );
    }
  });

/*
-----------------------------------
TEXT CASE CONVERTER
-----------------------------------
*/

let caseResult = "";

document
  .getElementById("uppercaseBtn")
  .addEventListener("click", () => {
    const text =
      document.getElementById("caseInput")
        .value;

    caseResult = text.toUpperCase();

    document.getElementById(
      "caseInput",
    ).value = caseResult;

    setStatus("Converted to uppercase.");
  });

document
  .getElementById("lowercaseBtn")
  .addEventListener("click", () => {
    const text =
      document.getElementById("caseInput")
        .value;

    caseResult = text.toLowerCase();

    document.getElementById(
      "caseInput",
    ).value = caseResult;

    setStatus("Converted to lowercase.");
  });

document
  .getElementById("downloadCaseBtn")
  .addEventListener("click", () => {
    const text =
      document.getElementById("caseInput")
        .value;

    downloadFile(
      text,
      "converted.txt",
      "text/plain",
    );

    setStatus("Text downloaded.");
  });

/*
-----------------------------------
URL ENCODER / DECODER
-----------------------------------
*/

document
  .getElementById("encodeUrlBtn")
  .addEventListener("click", () => {
    const input =
      document.getElementById("urlInput");

    input.value = encodeURIComponent(
      input.value,
    );

    setStatus("URL encoded.");
  });

document
  .getElementById("decodeUrlBtn")
  .addEventListener("click", () => {
    const input =
      document.getElementById("urlInput");

    try {
      input.value = decodeURIComponent(
        input.value,
      );

      setStatus("URL decoded.");
    } catch {
      setStatus("Invalid encoded URL.");
    }
  });

/*
-----------------------------------
HTML ESCAPER
-----------------------------------
*/

document
  .getElementById("escapeHtmlBtn")
  .addEventListener("click", () => {
    const input =
      document.getElementById("htmlInput");

    input.value = input.value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    setStatus("HTML escaped.");
  });

document
  .getElementById("unescapeHtmlBtn")
  .addEventListener("click", () => {
    const input =
      document.getElementById("htmlInput");

    input.value = input.value
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&");

    setStatus("HTML unescaped.");
  });

/*
-----------------------------------
NUMBER BASE CONVERTER
-----------------------------------
*/

document
  .getElementById("convertNumberBtn")
  .addEventListener("click", () => {
    const number = parseInt(
      document.getElementById("numberInput")
        .value,
    );

    if (isNaN(number)) {
      setStatus("Invalid number.");
      return;
    }

    document.getElementById(
      "numberOutput",
    ).value =
      `Binary: ${number.toString(2)}\n\n` +
      `Hexadecimal: ${number.toString(16)}\n\n` +
      `Octal: ${number.toString(8)}`;

    setStatus("Number converted.");
  });

/*
-----------------------------------
JSON FORMATTER
-----------------------------------
*/

document
  .getElementById("formatJsonBtn")
  .addEventListener("click", () => {
    const input =
      document.getElementById(
        "jsonFormatterInput",
      );

    try {
      const formatted = JSON.stringify(
        JSON.parse(input.value),
        null,
        2,
      );

      input.value = formatted;

      setStatus("JSON formatted.");
    } catch {
      setStatus("Invalid JSON.");
    }
  });

/*
-----------------------------------
SHA-256 HASH GENERATOR
-----------------------------------
*/

document
  .getElementById("generateHashBtn")
  .addEventListener("click", async () => {
    const text =
      document.getElementById("hashInput")
        .value;

    const encoder = new TextEncoder();

    const data = encoder.encode(text);

    const hashBuffer =
      await crypto.subtle.digest(
        "SHA-256",
        data,
      );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer),
    );

    const hashHex = hashArray
      .map((b) =>
        b.toString(16).padStart(2, "0"),
      )
      .join("");

    document.getElementById(
      "hashOutput",
    ).value = hashHex;

    setStatus("SHA-256 generated.");
  });

/*
-----------------------------------
AUDIO BUFFER TO WAV
-----------------------------------
*/

function audioBufferToWav(buffer) {
  const numOfChan =
    buffer.numberOfChannels;

  const length =
    buffer.length * numOfChan * 2 + 44;

  const bufferArray = new ArrayBuffer(
    length,
  );

  const view = new DataView(bufferArray);

  const channels = [];

  let offset = 0;

  let pos = 0;

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);

  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(
    buffer.sampleRate * 2 * numOfChan,
  );
  setUint16(numOfChan * 2);
  setUint16(16);

  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (
    let i = 0;
    i < buffer.numberOfChannels;
    i++
  ) {
    channels.push(
      buffer.getChannelData(i),
    );
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(
        -1,
        Math.min(1, channels[i][offset]),
      );

      sample =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7fff;

      view.setInt16(pos, sample, true);

      pos += 2;
    }

    offset++;
  }

  return new Blob([view], {
    type: "audio/wav",
  });
}
