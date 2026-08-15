/**
 * Chat AI - Multi-Provider AI Service
 */

export const PERSONAS = {
  general: {
    name: 'مساعد ذكي شامل',
    prompt: 'أنت "شات AI"، نموذج ذكاء اصطناعي فائق التطور، ذكي، ودود، وسريع. تجيب باللغة العربية بأسلوب فصيح، منسق واحترافي. استخدم تنسيق Markdown، الجداول، والقوائم عند تنظيم الإجابات.'
  },
  coder: {
    name: 'خبير البرمجة والمطور المحترف',
    prompt: 'أنت مهندس برمجيات رئيسي (Senior Lead Engineer) وخبير في جميع لغات البرمجة وأطر العمل. تقدم أكواداً نظيفة (Clean Code)، آمنة، وموثقة مع شرح دقيق للأداء والتعقيد الحسابي وطريقة التشغيل. احرص على وضع الأكواد داخل كتل التنسيق البرمجية مع تحديد اسم اللغة دائماً.'
  },
  writer: {
    name: 'كاتب مقالات ومحتوى إبداعي',
    prompt: 'أنت كاتب محتوى إبداعي وصحفي محترف وخبير في تحسين محركات البحث (SEO). تكتب مقالات بأسلوب شيق، جذاب، ومقسم بعناوين رئيسية وفرعية غنية بالكلمات المفتاحية، مع مقدمة تجذب الانتباه وخاتمة قوية ودعوة لاتخاذ إجراء (CTA).'
  },
  designer: {
    name: 'مهندس برومبت وتصميم الصور',
    prompt: 'أنت خبير عالمي في صياغة أوامر توليد وتصميم الصور (Prompt Engineer) لأنظمة الذكاء الاصطناعي مثل FLUX و Midjourney و Stable Diffusion. عندما يطلب منك المستخدم وصف صورة، قم بتوسيع الفكرة بتفاصيل سينمائية، ونوع الإضاءة، وزوايا الكاميرا، والدقة والتأثيرات البصرية باللغة الإنجليزية والعربية.'
  }
};

export const IMAGE_STYLES = [
  { id: 'realistic', name: 'واقعي فوتوغرافي', modifier: 'ultra-realistic, 8k resolution, professional photography, cinematic lighting, photorealistic details, 35mm lens' },
  { id: 'cinematic', name: 'سينمائي درامي', modifier: 'cinematic movie still, dramatic studio lighting, anamorphic lens, shallow depth of field, 8k, color graded, masterpiece' },
  { id: 'anime', name: 'أنمي ياباني حديث', modifier: 'modern anime art style, makoto shinkai style, vibrant colors, detailed illustration, sharp focus' },
  { id: '3d_render', name: 'ثلاثي الأبعاد 3D', modifier: 'unreal engine 5 render, octane render, ray tracing, ultra detailed 3D, volumetric lighting' },
  { id: 'cyberpunk', name: 'سايبر بانك نيون', modifier: 'cyberpunk aesthetic, glowing neon lights, futuristic city reflections, dark sci-fi atmosphere' },
  { id: 'oil_painting', name: 'لوحة زيتية فنية', modifier: 'classic oil on canvas, textured brush strokes, artistic masterpiece, rembrandt lighting' },
  { id: 'digital_art', name: 'فن رقمي إبداعي', modifier: 'digital concept art, artstation trending, highly polished, rich colors, intricate fantasy details' },
  { id: 'minimalist', name: 'فيكتور بسيط', modifier: 'clean minimalist vector art, modern flat design, elegant shapes, soft gradient' }
];

export const ASPECT_RATIOS = [
  { id: '1:1', name: 'مربع (1:1)', width: 1024, height: 1024 },
  { id: '16:9', name: 'عريض (16:9)', width: 1280, height: 720 },
  { id: '9:16', name: 'طولي (9:16)', width: 720, height: 1280 },
  { id: '4:3', name: 'كلاسيكي (4:3)', width: 1024, height: 768 }
];

export const AIService = {
  // Test connection to provider
  async testConnection(settings) {
    const start = Date.now();
    try {
      if (settings.provider === 'gemini') {
        if (!settings.geminiApiKey?.trim()) throw new Error('يرجى كتابة مفتاح Gemini API أولاً');
        const apiKey = settings.geminiApiKey.trim();
        
        // Check models endpoint which validates API key without 404 issues
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(listUrl);
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `خطأ Gemini (رمز ${res.status})`;
          if (res.status === 400 || errMsg.toLowerCase().includes('api key')) {
            throw new Error('مفتاح Gemini API غير صالح، تأكد من نسخه بشكل صحيح');
          }
          throw new Error(errMsg);
        }

        const data = await res.json().catch(() => ({}));
        const modelsCount = data.models ? data.models.length : 0;
        const latency = Date.now() - start;
        return { 
          success: true, 
          latency, 
          message: `تم التحقق بنجاح! مفتاحك شغال ومتصل (${latency}ms)` 
        };
      } else if (settings.provider === 'openai') {
        if (!settings.openaiApiKey?.trim()) throw new Error('يرجى كتابة مفتاح OpenAI API');
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openaiApiKey.trim()}`
          },
          body: JSON.stringify({
            model: settings.openaiModel || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `خطأ OpenAI: رمز ${res.status}`);
        }
      } else if (settings.provider === 'openrouter') {
        if (!settings.openrouterApiKey?.trim()) throw new Error('يرجى كتابة مفتاح OpenRouter API');
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openrouterApiKey.trim()}`
          },
          body: JSON.stringify({
            model: settings.openrouterModel || 'deepseek/deepseek-r1',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `خطأ OpenRouter: رمز ${res.status}`);
        }
      } else {
        const res = await fetch('https://text.pollinations.ai/hello?json=false&model=openai');
        if (!res.ok) throw new Error('المحرك المجاني غير متاح حالياً');
      }

      const latency = Date.now() - start;
      return { success: true, latency, message: `الاتصال ناجح تماماً! السرعة: ${latency}ms` };
    } catch (err) {
      return { success: false, latency: 0, message: err.message || 'فشل الاتصال بالخادم' };
    }
  },

  // Main Chat Completion
  async sendMessage({ messages, settings, onChunk, signal }) {
    const provider = settings.provider || 'default';
    const persona = PERSONAS[settings.systemPersona] || PERSONAS.general;
    const systemPrompt = settings.customSystemPrompt?.trim() || persona.prompt;

    if (provider === 'gemini' && settings.geminiApiKey?.trim()) {
      return await this._callGemini({ messages, settings, systemPrompt, onChunk, signal });
    }

    if (provider === 'openai' && settings.openaiApiKey?.trim()) {
      return await this._callOpenAI({ messages, settings, systemPrompt, onChunk, signal });
    }

    if (provider === 'openrouter' && settings.openrouterApiKey?.trim()) {
      return await this._callOpenRouter({ messages, settings, systemPrompt, onChunk, signal });
    }

    return await this._callFreeEngine({ messages, settings, systemPrompt, onChunk, signal });
  },

  // Gemini Handler with Smart Model Fallbacks
  async _callGemini({ messages, settings, systemPrompt, onChunk, signal }) {
    let model = settings.geminiModel || 'gemini-1.5-flash';
    const apiKey = settings.geminiApiKey.trim();
    const isStream = settings.streamResponse !== false && Boolean(onChunk);

    const formattedContents = [];
    messages.forEach(msg => {
      if (msg.role === 'system') return;
      const parts = [];
      if (msg.content) parts.push({ text: msg.content });
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(img => {
          if (img.base64) {
            const cleanData = img.base64.split(',')[1] || img.base64;
            parts.push({
              inline_data: { mime_type: img.type || 'image/jpeg', data: cleanData }
            });
          }
        });
      }
      if (parts.length > 0) {
        formattedContents.push({ role: msg.role === 'user' ? 'user' : 'model', parts });
      }
    });

    const payload = {
      contents: formattedContents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: settings.temperature ?? 0.7 }
    };

    const tryFetch = async (targetModel) => {
      const endpoint = isStream 
        ? `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

      return await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });
    };

    let res = await tryFetch(model);

    // If 404 (model not found), automatically fallback to gemini-1.5-flash
    if (res.status === 404 && model !== 'gemini-1.5-flash') {
      res = await tryFetch('gemini-1.5-flash');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `خطأ Gemini (${res.status})`);
    }

    if (!isStream) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
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
            const parsed = JSON.parse(line.replace('data: ', '').trim());
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
              full += text;
              onChunk(full);
            }
          } catch (e) {}
        }
      }
    }
    return full;
  },

  // OpenAI Handler
  async _callOpenAI({ messages, settings, systemPrompt, onChunk, signal }) {
    const model = settings.openaiModel || 'gpt-4o-mini';
    const apiKey = settings.openaiApiKey.trim();
    const isStream = settings.streamResponse !== false && Boolean(onChunk);

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => {
        if (m.images && m.images.length > 0) {
          return {
            role: m.role,
            content: [
              { type: 'text', text: m.content || '' },
              ...m.images.map(img => ({ type: 'image_url', image_url: { url: img.base64 } }))
            ]
          };
        }
        return { role: m.role, content: m.content };
      })
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: settings.temperature ?? 0.7,
        stream: isStream
      }),
      signal
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `خطأ OpenAI (${res.status})`);
    }

    if (!isStream) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || '';
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const tr = line.trim();
        if (tr.startsWith('data: ')) {
          const d = tr.replace('data: ', '').trim();
          if (d === '[DONE]') break;
          try {
            const parsed = JSON.parse(d);
            const delta = parsed?.choices?.[0]?.delta?.content || '';
            if (delta) {
              full += delta;
              onChunk(full);
            }
          } catch (e) {}
        }
      }
    }
    return full;
  },

  // OpenRouter Handler
  async _callOpenRouter({ messages, settings, systemPrompt, onChunk, signal }) {
    const model = settings.openrouterModel || 'deepseek/deepseek-r1';
    const apiKey = settings.openrouterApiKey.trim();
    const isStream = settings.streamResponse !== false && Boolean(onChunk);

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: settings.temperature ?? 0.7,
        stream: isStream
      }),
      signal
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `خطأ OpenRouter (${res.status})`);
    }

    if (!isStream) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || '';
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const tr = line.trim();
        if (tr.startsWith('data: ')) {
          const d = tr.replace('data: ', '').trim();
          if (d === '[DONE]') break;
          try {
            const parsed = JSON.parse(d);
            const delta = parsed?.choices?.[0]?.delta?.content || '';
            if (delta) {
              full += delta;
              onChunk(full);
            }
          } catch (e) {}
        }
      }
    }
    return full;
  },

  // High Speed Free Fallback Engine
  async _callFreeEngine({ messages, settings, systemPrompt, onChunk, signal }) {
    const recentContext = messages.slice(-5).map(m => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`).join('\n\n');
    const fullPrompt = `${systemPrompt}\n\nسياق المحادثة:\n${recentContext}\n\nأجب باللغة العربية بدقة:`;

    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai&json=false&seed=${Date.now()}`;

    try {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error('فشل جلب الرد من المحرك المجاني');
      const text = await res.text();

      if (onChunk && text) {
        const words = text.split(' ');
        let cur = '';
        for (let i = 0; i < words.length; i++) {
          cur += (i === 0 ? '' : ' ') + words[i];
          onChunk(cur);
          if (i % 2 === 0) await new Promise(r => setTimeout(r, 12));
        }
        return cur;
      }
      return text;
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      return `مرحباً بك! 👋\nأنا **شات AI** مساعدك الذكي المتكامل.\nيمكنك الدردشة، كتابة الأكواد وتصحيحها، وتوليد المقالات والصور.\n*(للحصول على وصول أسرع لنماذج Gemini 2.0 و GPT-4o يمكنك إضافة مفتاح API من زر الإعدادات).*`;
    }
  },

  // AI Prompt Enhancer for Image Studio
  async enhanceImagePrompt(prompt, style = 'realistic') {
    const styleObj = IMAGE_STYLES.find(s => s.id === style) || IMAGE_STYLES[0];
    const systemText = `You are a prompt engineer for FLUX AI. Translate and expand this image description into a rich English prompt with lighting, camera angle, atmosphere and style (${styleObj.modifier}). Output ONLY the prompt string.`;
    
    try {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(systemText + '\nDescription: ' + prompt)}?model=openai&json=false`);
      if (res.ok) {
        const text = await res.text();
        return text.trim().replace(/^["']|["']$/g, '');
      }
    } catch (e) {}

    return `${prompt}, ${styleObj.modifier}, high quality, masterpiece, 8k`;
  },

  // Build Generated Image URL
  buildImageUrl({ prompt, style = 'realistic', aspectRatio = '1:1', seed = null, isFlux = true }) {
    const styleObj = IMAGE_STYLES.find(s => s.id === style) || IMAGE_STYLES[0];
    const ratioObj = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[0];
    const finalSeed = seed || Math.floor(Math.random() * 9999999);
    const finalPrompt = encodeURIComponent(`${prompt}, ${styleObj.modifier}`);
    const model = isFlux ? 'flux' : 'turbo';

    return `https://image.pollinations.ai/prompt/${finalPrompt}?width=${ratioObj.width}&height=${ratioObj.height}&seed=${finalSeed}&model=${model}&nologo=true&enhance=false`;
  }
};
