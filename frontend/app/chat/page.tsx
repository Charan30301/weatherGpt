"use client";

import { useState } from "react";

export default function ChatPage() {

  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      text: "Hello! I am WeatherGPT. Ask me anything about weather."
    }
  ]);

  const [input, setInput] = useState("");


  const sendMessage = async () => {

    if (!input.trim()) return;


    const userMessage = {
      role: "user",
      text: input
    };


    setMessages((prev) => [
      ...prev,
      userMessage
    ]);


    setInput("");


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            message: input
          })
        }
      );


      const data = await response.json();


      setMessages((prev) => [

        ...prev,

        {
          role: "assistant",
          text: data.response
        }

      ]);


    } catch {

      setMessages((prev) => [

        ...prev,

        {
          role: "assistant",
          text: "Unable to connect to WeatherGPT AI."
        }

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

            {message.text}

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
