'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import { sendMessageToSiliconFlow } from '../services/api';
import Avatar from './Avatar';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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
      id: crypto.randomUUID(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
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
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
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

  // Markdown组件，用于渲染Markdown文本
  const MarkdownContent = ({ content }) => {
    return (
      <div className={styles.markdownContent}>
        <ReactMarkdown 
          rehypePlugins={[rehypeSanitize, rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const renderBotMessage = (message) => {
    // 将消息文本按照标题分割成不同部分
    const sections = message.text.split('###').filter(Boolean);
    
    return sections.map((section, index) => {
      const isDesigner = section.includes('设计师回复');
      const role = isDesigner ? 'designer' : 'professor';
      
      // 分割思考过程和最终答案
      const [title, ...content] = section.split('[思考过程]');
      const [thoughtProcess, finalAnswer] = content.join('').split(isDesigner ? '[最终方案]' : '[专业点评]');

      return (
        <div key={index} className={`${styles.botMessage} ${styles[role]}`}>
          <Avatar role={role} />
          <div className={styles.messageContent}>
            <div className={styles.roleTitle}>
              <h3>{isDesigner ? '室内设计师' : '设计评论教授'}</h3>
            </div>
            {thoughtProcess && (
              <div className={styles.thoughtProcess}>
                <strong>思考过程：</strong>
                <MarkdownContent content={thoughtProcess} />
              </div>
            )}
            {finalAnswer && (
              <div className={styles.finalAnswer}>
                <strong>{isDesigner ? '设计方案：' : '专业点评：'}</strong>
                <MarkdownContent content={finalAnswer} />
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>AI 设计对话</h2>
      </div>
      
      <div className={styles.messageList}>
        {messages.map((message) => (
          message.sender === 'user' ? (
            <div
              key={message.id}
              className={`${styles.messageItem} ${styles.userMessage}`}
            >
              <div className={styles.messageContent}>
                <p>{message.text}</p>
                <span className={styles.timestamp}>{message.timestamp}</span>
              </div>
            </div>
          ) : renderBotMessage(message)
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isLoading ? "AI正在思考..." : "请描述您的设计需求..."}
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