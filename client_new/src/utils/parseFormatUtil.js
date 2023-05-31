import DOMPurify from "dompurify";

export function formatTime(timestamp) {
  let date = new Date(timestamp);
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseLinks(inputMessage) {
  const urlRegex = /((https?:\/\/)[^\s]+)/g;
  return inputMessage.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
  });
}

function parseEmotes(inputMessage) {
  const emoteRegex = /:([a-z0-9]+?):/gi;
  return inputMessage.replace(emoteRegex, (match, emoteName) => {
    return `<img src="/images/betterttv-images/${emoteName}.webp" alt="${emoteName}" class="inline-block" />`;
  });
}

export function parseAndSanitizeMessage(message) {
  const messageWithParsedLinks = parseLinks(message);
  const messageWithParsedLinksAndEmotes = parseEmotes(messageWithParsedLinks);
  const sanitizedAndParsedMessage = DOMPurify.sanitize(
    messageWithParsedLinksAndEmotes,
    { ADD_ATTR: ["target"] }
  );
  return sanitizedAndParsedMessage;
}
