'use client';

import { useState } from 'react';
import styles from './Chat.module.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>聊天室</h2>
      </div>
      
      <div className={styles.messageList}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.messageItem} ${
              message.sender === 'user' ? styles.userMessage : styles.botMessage
            }`}
          >
            <div className={styles.messageContent}>
              <p>{message.text}</p>
              <span className={styles.timestamp}>{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="输入消息..."
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>
          发送
        </button>
      </form>
    </div>
  );
} 