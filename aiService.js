// AI Multi-Provider Service for Chat AI

export const PERSONAS = {
  general: {
    id: 'general',
    name: 'مساعد ذكي شامل',
    nameEn: 'General Assistant',
    description: 'مساعد شامل لجميع المهام والأسئلة العامة والمعلومات الدقيقة.',
    prompt: 'أنت "شات AI"، نموذج ذكاء اصطناعي فائق التطور، ذكي، ودود، وسريع. تجيب باللغة العربية بأسلوب فصيح، منسق واحترافي، وتدعم اللغات الأخرى عند الحاجة. استخدم تنسيق Markdown، الجداول، والقوائم عند تنظيم الإجابات.'
  },
  coder: {
    id: 'coder',
    name: 'خبير البرمجة والمطور المحترف',
    nameEn: 'Senior Software Engineer',
    description: 'متخصص في كتابة وتصحيح وتطوير الأكواد، هندسة البرمجيات، وحل المشكلات.',
    prompt: 'أنت مهندس برمجيات رئيسي (Senior Lead Engineer) وخبير في جميع لغات البرمجة وأطر العمل. تقدم أكواداً نظيفة (Clean Code)، آمنة، وموثقة مع شرح دقيق للأداء والتعقيد الحسابي وطريقة التشغيل. احرص على وضع الأكواد داخل كتل التنسيق البرمجية مع تحديد اسم اللغة دائماً.'
  },
  writer: {
    id: 'writer',
    name: 'كاتب مقالات ومحتوى إبداعي',
    nameEn: 'Pro Content & SEO Writer',
    description: 'متخصص في صياغة المقالات المتوافقة مع الـ SEO، المنشورات الجذابة، وإعادة الصياغة.',
    prompt: 'أنت كاتب محتوى إبداعي وصحفي محترف وخبير في تحسين محركات البحث (SEO). تكتب مقالات بأسلوب شيق، جذاب، ومقسم بعناوين رئيسية وفرعية غنية بالكلمات المفتاحية، مع مقدمة تجذب الانتباه وخاتمة قوية ودعوة لاتخاذ إجراء (CTA).'
  },
  designer: {
    id: 'designer',
    name: 'مهندس برومبت وتصميم الصور',
    nameEn: 'AI Art Prompt Engineer',
    description: 'خبير في صياغة أوامر (Prompts) توليد الصور الاحترافية لـ Midjourney و Flux و DALL-E.',
    prompt: 'أنت خبير عالمي في صياغة أوامر توليد وتصميم الصور (Prompt Engineer) لأنظمة الذكاء الاصطناعي مثل FLUX و Midjourney و Stable Diffusion. عندما يطلب منك المستخدم وصف صورة، قم بتوسيع الفكرة بتفاصيل سينمائية، ونوع الإضاءة، وزوايا الكاميرا، والدقة والتأثيرات البصرية باللغة الإنجليزية والعربية.'
  },
  teacher: {
    id: 'teacher',
    name: 'معلم ومرشد أكاديمي',
    nameEn: 'Academic Tutor',
    description: 'شرح مبسط للمفاهيم المعقدة، العلوم، والرياضيات خطوة بخطوة.',
    prompt: 'أنت معلم صبور وخبير أكاديمي بارع. تقوم بتبسيط أصعب المفاهيم العلمية والرياضية والتقنية بأسلوب سهل الفهم وبالأمثلة التوضيحية واستخدام معادلات LaTeX الرياضية عند الحاجة.'
  }
};

export const IMAGE_STYLES = [
  { id: 'realistic', name: 'واقعي فوتوغرافي', nameEn: 'Photorealistic', promptModifier: 'ultra-realistic, 8k resolution, professional photography, cinematic lighting, photorealistic details, high fidelity, 35mm lens, award winning' },
  { id: 'cinematic', name: 'سينمائي درامي', nameEn: 'Cinematic Studio', promptModifier: 'cinematic movie still, dramatic lighting, anamorphic lens, shallow depth of field, 8k, color graded, masterpiece' },
  { id: 'anime', name: 'أنمي ياباني حديث', nameEn: 'Modern Anime / Manga', promptModifier: 'modern anime art style, makoto shinkai style, vibrant colors, detailed illustration, studio ghibli lighting, sharp focus' },
  { id: '3d_render', name: 'ثلاثي الأبعاد 3D', nameEn: '3D Render / Unreal 5', promptModifier: 'unreal engine 5 render, octane render, ray tracing, ultra detailed 3D, volumetric lighting, subsurface scattering' },
  { id: 'cyberpunk', name: 'سايبر بانك نيون', nameEn: 'Cyberpunk Neon', promptModifier: 'cyberpunk aesthetic, glowing neon lights, futuristic city reflections, dark sci-fi atmosphere, highly detailed' },
  { id: 'oil_painting', name: 'لوحة زيتية فنية', nameEn: 'Classic Oil Painting', promptModifier: 'classic oil on canvas, textured brush strokes, artistic masterpiece, rembrandt lighting, museum quality' },
  { id: 'digital_art', name: 'فن رقمي إبداعي', nameEn: 'Digital Concept Art', promptModifier: 'digital concept art, artstation trending, highly polished, rich colors, intricate fantasy details' },
  { id: 'minimalist', name: 'فيكتور بسيط حديث', nameEn: 'Minimalist Vector', promptModifier: 'clean minimalist vector art, modern flat design, elegant shapes, balanced composition, soft gradient' }
];

export const ASPECT_RATIOS = [
  { id: '1:1', name: 'مربع (1:1)', width: 1024, height: 1024, icon: 'Square' },
  { id: '16:9', name: 'عريض لاندسكيب (16:9)', width: 1280, height: 720, icon: 'Monitor' },
  { id: '9:16', name: 'طولي ستوري/تيك توك (9:16)', width: 720, height: 1280, icon: 'Smartphone' },
  { id: '4:3', name: 'شاشة كلاسيكية (4:3)', width: 1024, height: 768, icon: 'Layout' }
];

export const aiService = {
  // Format history messages for Gemini
  _formatGeminiHistory(messages, systemInstruction) {
    const formatted = [];
    
    // Add history
    messages.forEach(msg => {
      if (msg.role === 'system') return;
      const role = msg.role === 'user' ? 'user' : 'model';
      
      const parts = [];
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      
      // If message has base64 image
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(img => {
          if (img.base64) {
            const cleanBase64 = img.base64.split(',')[1] || img.base64;
            parts.push({
              inline_data: {
                mime_type: img.type || 'image/jpeg',
                data: cleanBase64
              }
            });
          }
        });
      }

      if (parts.length > 0) {
        formatted.push({ role, parts });
      }
    });

    return formatted;
  },

  // Test API Key connection
  async testConnection(settings) {
    const startTime = Date.now();
    try {
      if (settings.provider === 'gemini') {
        if (!settings.geminiApiKey) throw new Error('يرجى إدخال مفتاح Gemini API أولاً');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.geminiModel || 'gemini-2.0-flash'}:generateContent?key=${settings.geminiApiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Hello, reply with one word OK' }] }]
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `فشل الاتصال: رمز الخطأ ${res.status}`);
        }
      } else if (settings.provider === 'openai') {
        if (!settings.openaiApiKey) throw new Error('يرجى إدخال مفتاح OpenAI API أولاً');
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openaiApiKey.trim()}`
          },
          body: JSON.stringify({
            model: settings.openaiModel || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say OK' }],
            max_tokens: 5
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `خطأ في مفتاح OpenAI: رمز ${res.status}`);
        }
      } else if (settings.provider === 'openrouter') {
        if (!settings.openrouterApiKey) throw new Error('يرجى إدخال مفتاح OpenRouter API');
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openrouterApiKey.trim()}`
          },
          body: JSON.stringify({
            model: settings.openrouterModel || 'deepseek/deepseek-r1',
            messages: [{ role: 'user', content: 'Say OK' }],
            max_tokens: 5
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `خطأ في OpenRouter: رمز ${res.status}`);
        }
      } else {
        // Free Default Engine check
        const res = await fetch('https://text.pollinations.ai/hello?json=false&model=openai');
        if (!res.ok) throw new Error('المحرك المجاني غير متاح حالياً');
      }

      const latency = Date.now() - startTime;
      return { success: true, latency, message: `الاتصال ناجح تماماً! سرعة الاستجابة: ${latency}ms` };
    } catch (err) {
      return { success: false, latency: 0, message: err.message || 'تعذر الاتصال بالخادم' };
    }
  },

  // Main Chat Send Method (Supports Streaming & Non-streaming)
  async sendMessage({ messages, settings, onChunk, signal }) {
    const provider = settings.provider || 'default';
    const persona = PERSONAS[settings.systemPersona] || PERSONAS.general;
    const systemPrompt = settings.customSystemPrompt?.trim() || persona.prompt;

    // 1. Google Gemini API
    if (provider === 'gemini' && settings.geminiApiKey?.trim()) {
      return await this._callGemini({ messages, settings, systemPrompt, onChunk, signal });
    }

    // 2. OpenAI API
    if (provider === 'openai' && settings.openaiApiKey?.trim()) {
      return await this._callOpenAI({ messages, settings, systemPrompt, onChunk, signal });
    }

    // 3. OpenRouter API
    if (provider === 'openrouter' && settings.openrouterApiKey?.trim()) {
      return await this._callOpenRouter({ messages, settings, systemPrompt, onChunk, signal });
    }

    // 4. Default High-Speed Free Engine
    return await this._callFreeEngine({ messages, settings, systemPrompt, onChunk, signal });
  },

  // Google Gemini Implementation
  async _callGemini({ messages, settings, systemPrompt, onChunk, signal }) {
    const model = settings.geminiModel || 'gemini-2.0-flash';
    const apiKey = settings.geminiApiKey.trim();
    const isStreaming = settings.streamResponse !== false && Boolean(onChunk);

    const endpoint = isStreaming 
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const formattedContents = this._formatGeminiHistory(messages, systemPrompt);

    const payload = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: settings.temperature ?? 0.7,
        maxOutputTokens: 4096
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini API Error: ${response.status}`);
    }

    if (!isStreaming) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return text;
    }

    // Handle Gemini SSE Stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr) {
              const parsed = JSON.parse(jsonStr);
              const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (chunk) {
                fullText += chunk;
                onChunk(fullText);
              }
            }
          } catch (e) {
            // Ignore parse errors on partial frames
          }
        }
      }
    }

    return fullText;
  },

  // OpenAI Implementation
  async _callOpenAI({ messages, settings, systemPrompt, onChunk, signal }) {
    const model = settings.openaiModel || 'gpt-4o-mini';
    const apiKey = settings.openaiApiKey.trim();
    const isStreaming = settings.streamResponse !== false && Boolean(onChunk);

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => {
        if (m.images && m.images.length > 0) {
          return {
            role: m.role,
            content: [
              { type: 'text', text: m.content || '' },
              ...m.images.map(img => ({
                type: 'image_url',
                image_url: { url: img.base64 }
              }))
            ]
          };
        }
        return { role: m.role, content: m.content };
      })
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: settings.temperature ?? 0.7,
        stream: isStreaming
      }),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI API Error: ${response.status}`);
    }

    if (!isStreaming) {
      const data = await response.json();
      return data?.choices?.[0]?.message?.content || '';
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.replace('data: ', '').trim();
          if (dataStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed?.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              onChunk(fullText);
            }
          } catch (e) {}
        }
      }
    }

    return fullText;
  },

  // OpenRouter Implementation
  async _callOpenRouter({ messages, settings, systemPrompt, onChunk, signal }) {
    const model = settings.openrouterModel || 'deepseek/deepseek-r1';
    const apiKey = settings.openrouterApiKey.trim();
    const isStreaming = settings.streamResponse !== false && Boolean(onChunk);

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Chat AI Pro'
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: settings.temperature ?? 0.7,
        stream: isStreaming
      }),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenRouter Error: ${response.status}`);
    }

    if (!isStreaming) {
      const data = await response.json();
      return data?.choices?.[0]?.message?.content || '';
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.replace('data: ', '').trim();
          if (dataStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed?.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              onChunk(fullText);
            }
          } catch (e) {}
        }
      }
    }

    return fullText;
  },

  // Built-in Free High Speed Engine
  async _callFreeEngine({ messages, settings, systemPrompt, onChunk, signal }) {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userQuery = lastUserMessage?.content || 'مرحبا';

    // Format conversation context
    const conversationContext = messages
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'المستخدم' : 'الذكاء الاصطناعي'}: ${m.content}`)
      .join('\n\n');

    const promptWithSystem = `${systemPrompt}\n\nسياق المحادثة الأخيرة:\n${conversationContext}\n\nأجب الآن باللغة العربية بدقة واحترافية:`;

    const encodedPrompt = encodeURIComponent(promptWithSystem);
    const url = `https://text.pollinations.ai/${encodedPrompt}?model=openai&json=false&seed=${Date.now()}`;

    try {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error('فشل جلب الرد من المحرك المجاني');
      const text = await response.text();

      // Simulate ultra-smooth streaming if onChunk is provided
      if (onChunk && text) {
        const words = text.split(' ');
        let accumulated = '';
        for (let i = 0; i < words.length; i++) {
          accumulated += (i === 0 ? '' : ' ') + words[i];
          onChunk(accumulated);
          // Micro delay for realistic typewriter feel
          if (i % 3 === 0) {
            await new Promise(r => setTimeout(r, 18));
          }
        }
        return accumulated;
      }

      return text;
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      // Fallback
      return `مرحباً بك في **شات AI**! 🎉\n\nأنا جاهز لمساعدتك في كافة المهام:\n- 💻 **البرمجة والأكواد**: كتابة وتصحيح وشرح الأكواد بجميع اللغات.\n- ✍️ **كتابة المقالات**: صياغة مقالات متوافقة مع الـ SEO ونصوص إبداعية.\n- 🎨 **توليد الصور**: توجه إلى قسم "استوديو الصور" لتصميم صور سينمائية فائقة الدقة.\n\n*(ملاحظة: يمكنك إضافة مفتاح API الخاص بك من زر الإعدادات للوصول لنماذج Gemini 2.0 و GPT-4o بأقصى سرعة).*`;
    }
  },

  // Enhance Image Prompt using AI
  async enhanceImagePrompt(userPrompt, style = 'realistic') {
    const styleObj = IMAGE_STYLES.find(s => s.id === style) || IMAGE_STYLES[0];
    const systemPrompt = `You are an elite AI Art Prompt Engineer for FLUX & Midjourney. Convert the user's prompt into an ultra-detailed, vivid, cinematic English visual prompt. Output ONLY the refined English prompt text without explanations or quotes. Include lighting, camera angle, textures, style (${styleObj.promptModifier}), high details, 8k.`;

    const promptUrl = `https://text.pollinations.ai/${encodeURIComponent(systemPrompt + '\nUser Prompt: ' + userPrompt)}?model=openai&json=false`;
    try {
      const res = await fetch(promptUrl);
      if (res.ok) {
        const enhanced = await res.text();
        return enhanced.trim().replace(/^["']|["']$/g, '');
      }
    } catch (e) {
      console.warn('Enhancer fallback', e);
    }
    // Fallback enhancement
    return `${userPrompt}, ${styleObj.promptModifier}, masterpiece, highly detailed, sharp focus, 8k`;
  },

  // Image Generation URL Builder
  generateImageUrl({ prompt, style = 'realistic', aspectRatio = '1:1', seed = null, isFlux = true }) {
    const styleObj = IMAGE_STYLES.find(s => s.id === style) || IMAGE_STYLES[0];
    const ratioObj = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[0];
    
    // Final prompt combining style modifier
    const finalPrompt = `${prompt}, ${styleObj.promptModifier}`;
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const finalSeed = seed || Math.floor(Math.random() * 9999999);

    const model = isFlux ? 'flux' : 'turbo';
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${ratioObj.width}&height=${ratioObj.height}&seed=${finalSeed}&model=${model}&nologo=true&enhance=false`;
  }
};
