"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import type { UIMessage } from "ai"

interface ChatContextType {
  messages: UIMessage[]
  setMessages: (messages: UIMessage[]) => void
  addMessage: (message: UIMessage) => void
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<UIMessage[]>([])

  const addMessage = (message: UIMessage) => {
    setMessages((prev) => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <ChatContext.Provider value={{ messages, setMessages, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
