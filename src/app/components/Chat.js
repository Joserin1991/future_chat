'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import { sendMessageToSiliconFlow } from '../services/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 获取当前时间的格式化字符串
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(), // 使用更可靠的唯一ID生成方法
      text: inputMessage,
      sender: 'user',
      timestamp: getCurrentTime()
    };

    // 添加用户消息
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 创建AI消息占位符
    const aiMessageId = crypto.randomUUID();
    const aiMessage = {
      id: aiMessageId,
      text: '',
      sender: 'bot',
      timestamp: getCurrentTime()
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
      // 调用API并处理流式响应
      await sendMessageToSiliconFlow(inputMessage, (content, isDone) => {
        if (isDone) {
          setIsLoading(false);
          return;
        }

        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, text: msg.text + content }
            : msg
        ));
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsLoading(false);
      // 更新AI消息显示错误
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, text: '抱歉，发生了错误，请稍后重试。' }
          : msg
      ));
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>AI 聊天助手</h2>
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
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isLoading ? "AI正在思考..." : "输入消息..."}
          className={styles.messageInput}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={`${styles.sendButton} ${isLoading ? styles.sendButtonDisabled : ''}`}
          disabled={isLoading}
        >
          {isLoading ? "发送中..." : "发送"}
        </button>
      </form>
    </div>
  );
} 