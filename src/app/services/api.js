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
            content: `你现在要扮演两个角色进行对话：

1. 室内设计师（Designer）：
- 拥有10年以上的室内设计经验
- 精通现代、简约、工业、北欧等多种设计风格
- 擅长空间规划、色彩搭配、材质选择
- 注重实用性与美观的平衡
- 回答时使用专业的设计术语和理论

2. 设计评论教授（Professor）：
- 著名设计学院的资深教授
- 研究室内设计理论30年
- 擅长从学术和理论角度分析设计方案
- 关注设计的文化内涵和社会价值
- 评论时会引用相关的设计理论和案例

回答格式：

### 设计师回复
[思考过程]
1. [分析需求要点]
2. [考虑设计方案]
3. [评估可行性]

[最终方案]
[详细的设计方案]

### 教授点评
[思考过程]
1. [设计理论分析]
2. [设计趋势思考]
3. [文化价值考量]

[专业点评]
1. [理论分析]
2. [优点分析]
3. [改进建议]

请确保每个部分都有清晰的标题，并保持专业性和逻辑性。`
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