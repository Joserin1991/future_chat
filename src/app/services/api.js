// SiliconFlow API 服务
export const sendMessageToSiliconFlow = async (message, onStream) => {
  try {
    // 确保环境变量存在
    const apiKey = process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1';

    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-R1',
        messages: [
          {
            role: 'system',
            content: '你是一个有帮助的AI助手。在回答问题时，请先进行思考分析，然后再给出最终答案。请按照以下格式输出：\n\n思考过程：\n1. [分析问题的关键点]\n2. [考虑可能的解决方案]\n3. [评估最佳方案]\n\n最终答案：\n[详细的回答]'
          },
          {
            role: 'user',
            content: message
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      if (response.status === 403) {
        console.error('API认证失败，请检查API密钥是否正确');
        throw new Error('API认证失败，请检查API密钥是否正确');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API请求失败: ${response.status} - ${errorData.error?.message || '未知错误'}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let isFirstChunk = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onStream(null, true); // 流结束
          } else {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                // 如果是第一个内容块，添加换行
                if (isFirstChunk) {
                  onStream('\n', false);
                  isFirstChunk = false;
                }
                onStream(content, false);
              }
            } catch (e) {
              console.error('解析响应数据失败:', e);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('API调用失败:', error);
    if (error.message.includes('API认证失败')) {
      onStream('API认证失败，请检查API密钥是否正确。', true);
    } else {
      onStream('抱歉，发生了错误，请稍后重试。', true);
    }
  }
}; 