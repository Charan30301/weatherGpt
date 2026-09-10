"use client";

import { useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
export default function ChatPage() {

  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      text: "Hello! I am WeatherGPT. Ask me anything about weather."
    }
  ]);

  const [input, setInput] = useState("");
const [isListening, setIsListening] = useState(false);
const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
const startListening = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event: any) => {
    const transcript =
      event.results[0][0].transcript;

    setInput(transcript);
  };

  recognition.onerror = () => {
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};
const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = {
    role: "user",
    text: input,
  };

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);

  setInput("");

  try {
const language =
  localStorage.getItem("weathergpt-language") || "en";
    const response = await fetch(
      "http://127.0.0.1:8000/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
body: JSON.stringify({
  message: input,
  language,
}),
      }
    );

    const data = await response.json();

    const assistantMessage = {
      role: "assistant",
      text: data.response,
    };

    setMessages((prev) => [
      ...prev,
      assistantMessage,
    ]);

    const speech =
      new SpeechSynthesisUtterance(
        data.response
      );

    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  } catch {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "Unable to connect to WeatherGPT AI.",
      },
    ]);
  }
};

  return (

    <main className="app-background min-h-screen flex flex-col">

      <header className="p-5 text-center border-b border-slate-800">

        <h1 className="text-xl font-bold">
          🤖 WeatherGPT Assistant
        </h1>

      </header>


      <div className="flex-1 p-5 space-y-4">

        {messages.map((message, index) => (

          <div

            key={index}

            className={`
              p-4
              rounded-2xl
              max-w-[80%]

              ${message.role === "user"

                ? "bg-blue-600 ml-auto"

                : "bg-slate-800"
              }

            `}

          >

<div className="flex items-start gap-3">

  <div className="flex-1">
    {message.text}
  </div>

  {message.role === "assistant" && (
    <button
      onClick={() => {
        window.speechSynthesis.cancel();

        const speech =
          new SpeechSynthesisUtterance(
            message.text
          );

        speech.lang = "en-IN";
        speech.rate = 1;
        speech.pitch = 1;

        setSpeakingIndex(index);

        speech.onend = () => {
          setSpeakingIndex(null);
        };

        window.speechSynthesis.speak(speech);
      }}
      className="shrink-0 rounded-lg bg-slate-700 p-2 hover:bg-slate-600"
      title="Read answer aloud"
    >
      <Volume2 size={18} />
    </button>
  )}

</div>
          </div>

        ))}

      </div>


<div className="p-5 flex gap-2">

  <input
    value={input}
    onChange={(e) =>
      setInput(e.target.value)
    }
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    }}
    placeholder="Ask about weather..."
    className="
      flex-1
      p-4
      rounded-xl
      bg-slate-800
      outline-none
    "
  />

  <button
    onClick={startListening}
    className={`
      px-5
      rounded-xl
      flex
      items-center
      justify-center
      ${isListening ? "bg-red-600" : "bg-slate-700"}
    `}
    title={isListening ? "Listening..." : "Speak"}
  >
    {isListening ? (
      <MicOff size={22} />
    ) : (
      <Mic size={22} />
    )}
  </button>

  <button
    onClick={sendMessage}
    className="
      bg-blue-600
      px-5
      rounded-xl
    "
  >
    Send
  </button>

</div>
    </main>

  );

}
