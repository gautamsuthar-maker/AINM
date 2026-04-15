import { NextResponse } from 'next/server';

// Allow up to 6 minutes for Manus tasks to complete
export const maxDuration = 360;

type CreativeFormat = 'Image' | 'Short Video' | 'Text Content';

interface GeneratePayload {
  action?: 'generate' | 'edit' | 'regenerate';
  channel: string;
  format: CreativeFormat;
  ageCategory: string;
  language: string;
  productName: string;
  brief: string;
  referenceImageB64?: string;
  sourceImageB64?: string;
  sourceImageUrl?: string;
  sourceText?: string;
}

function validate(payload: Partial<GeneratePayload>): string[] {
  const required: Array<keyof GeneratePayload> = [
    'channel',
    'format',
    'ageCategory',
    'language',
    'productName',
    'brief',
  ];
  return required.filter((field) => {
    const value = payload[field];
    return typeof value !== 'string' || value.trim().length === 0;
  }) as string[];
}

function buildPrompt(payload: GeneratePayload): string {
  const lines = [
    `Product: ${payload.productName}`,
    `Channel: ${payload.channel}`,
    `Format: ${payload.format}`,
    `Age Category: ${payload.ageCategory}`,
    `Language: ${payload.language}`,
    `Creative Brief: ${payload.brief}`,
    'Goal: Generate a high-converting, audience-aware marketing creative with clear product relevance.',
  ];
  if (payload.referenceImageB64) {
    lines.push('Note: A reference image has been uploaded by the user. Use it to inform the style, layout, or branding of the output.');
  }
  return lines.join('\n');
}

async function generateTextCreative(prompt: string, sourceText?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      type: 'text',
      provider: 'fallback-template',
      model: 'template-v1',
      content: {
        headline: 'Upgrade Your Daily Workflow with Better Results',
        body: `Built for your audience, this creative highlights clear value and practical outcomes.\n\n${prompt}`,
        cta: 'Get Started Today',
      },
    };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'You are an elite performance marketing copywriter. Return strict JSON with keys: headline, body, cta.',
        },
        {
          role: 'user',
          content: sourceText && sourceText.trim().length > 0
            ? `${prompt}\n\nEdit and improve this existing copy while preserving core intent:\n${sourceText}`
            : prompt,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Text generation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const textContent = data?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(textContent ?? '{}');

  return {
    type: 'text',
    provider: 'openai',
    model: 'gpt-4.1',
    content: {
      headline: parsed.headline ?? 'Generated Headline',
      body: parsed.body ?? 'Generated body copy.',
      cta: parsed.cta ?? 'Learn More',
    },
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Extract an image URL from a string — handles markdown, extension-less CDN links, etc.
function extractImageUrlFromString(text: string): string | null {
  // 1. Markdown image syntax: ![alt](url)
  const mdMatch = text.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/);
  if (mdMatch?.[1]) return mdMatch[1];

  // 2. Known image extensions
  const extMatch = text.match(/(https?:\/\/[^\s"'<>)\]]+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s"'<>)\]]*)?)/i);
  if (extMatch?.[1]) return extMatch[1];

  // 3. CDN/file-service URLs without extension (Manus, S3, etc.)
  const cdnMatch = text.match(
    /(https?:\/\/(?:[a-z0-9-]+\.)*(?:manus\.(?:ai|im)|amazonaws\.com|cloudfront\.net|storage\.googleapis\.com|blob\.core\.windows\.net)[^\s"'<>)\]]*)/i
  );
  if (cdnMatch?.[1]) return cdnMatch[1];

  return null;
}

// Walk the entire Manus listMessages payload looking for any image URL.
function extractFirstImageUrlFromObject(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;

  const stack: unknown[] = [value];
  const imageKeys = ['url', 'image_url', 'preview_url', 'download_url', 'file_url', 'src', 'href'];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current == null) continue;

    if (typeof current === 'string') {
      const found = extractImageUrlFromString(current);
      if (found) return found;
      continue;
    }

    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }

    if (typeof current === 'object') {
      const record = current as Record<string, unknown>;

      // Prioritise well-known URL keys
      for (const key of imageKeys) {
        const v = record[key];
        if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
      }

      // Recurse into all values
      for (const v of Object.values(record)) stack.push(v);
    }
  }

  return null;
}

// Returns the latest agent_status string from a listMessages payload, or null if not found.
// Manus sends messages newest-first; the first status_update has the current state.
function getManusAgentStatus(payload: Record<string, unknown>): string | null {
  const messages = payload.messages;
  if (!Array.isArray(messages)) return null;
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') continue;
    const m = msg as Record<string, unknown>;
    if (m.type === 'status_update') {
      const su = m.status_update as Record<string, unknown> | undefined;
      return typeof su?.agent_status === 'string' ? su.agent_status : null;
    }
  }
  return null;
}

async function generateImageCreative(prompt: string, forceVariation: boolean) {
  const manusApiKey = process.env.Manus_API ?? process.env.AINM_API_KEY ?? process.env.MANUS_API_KEY;
  const manusBaseUrl = process.env.MANUS_API_BASE_URL ?? 'https://api.manus.im';

  if (!manusApiKey) {
    return {
      type: 'image',
      provider: 'fallback-prompt',
      model: 'prompt-only',
      content: {
        prompt:
          `Set Manus_API in .env.local and use this prompt in a Manus image task:\n\n` +
          `${prompt}\n\n` +
          'Style: photorealistic, high-detail product ad, cinematic lighting, realistic textures, modern composition.',
      },
    };
  }

  const taskPrompt =
    `${prompt}\n\n` +
    (forceVariation
      ? `Create a distinctly different composition than prior outputs. Variation token: ${crypto.randomUUID()}.\n\n`
      : '') +
    'Generate a realistic marketing image and return a direct image URL in the response.';

  const createTaskResponse = await fetch(`${manusBaseUrl}/v2/task.create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-manus-api-key': manusApiKey,
    },
    body: JSON.stringify({ message: { content: taskPrompt } }),
  });

  if (!createTaskResponse.ok) {
    const errorText = await createTaskResponse.text();
    throw new Error(`Image generation failed via Manus task.create: ${createTaskResponse.status} ${errorText}`);
  }

  const createTaskData = (await createTaskResponse.json()) as Record<string, unknown>;
  const nestedData = createTaskData?.data as Record<string, unknown> | undefined;
  const taskId = (createTaskData?.task_id ?? nestedData?.task_id) as string | undefined;

  if (!taskId) {
    throw new Error('Image generation failed: Manus task_id missing in task.create response.');
  }

  let imageUrl: string | null = null;
  let lastMessagesPayload: unknown = null;
  const maxPoll = 72; // 72 × 5s = 6 minutes

  for (let attempt = 0; attempt < maxPoll; attempt += 1) {
    await sleep(5000);
    const listMessagesResponse = await fetch(
      `${manusBaseUrl}/v2/task.listMessages?task_id=${encodeURIComponent(taskId)}`,
      {
        method: 'GET',
        headers: { 'x-manus-api-key': manusApiKey },
      }
    );

    if (!listMessagesResponse.ok) {
      const errorText = await listMessagesResponse.text();
      throw new Error(`Image generation failed via Manus task.listMessages: ${listMessagesResponse.status} ${errorText}`);
    }

    const messagesPayload = (await listMessagesResponse.json()) as Record<string, unknown>;
    lastMessagesPayload = messagesPayload;

    const agentStatus = getManusAgentStatus(messagesPayload);

    // Keep polling while the agent is still running
    if (agentStatus === 'running') continue;

    // Task finished — extract image URL from the messages
    imageUrl = extractFirstImageUrlFromObject(messagesPayload);
    if (imageUrl) break;

    // Task ended but still no URL — bail out rather than keep polling
    if (agentStatus !== null) break;
  }

  if (!imageUrl) {
    const payloadSnippet = JSON.stringify(lastMessagesPayload ?? {}).slice(0, 1000);
    throw new Error(
      `Image generation failed: Manus task completed but no image URL found. ` +
      `Task ID: ${taskId}. Payload sample: ${payloadSnippet}`
    );
  }

  return {
    type: 'image',
    provider: 'manus.ai',
    model: 'manus-task-v2',
    content: {
      imageUrl,
      b64Json: null,
      prompt,
      taskId,
    },
  };
}

async function editImageCreative(prompt: string, sourceImageUrl?: string) {
  const manusApiKey = process.env.Manus_API ?? process.env.AINM_API_KEY ?? process.env.MANUS_API_KEY;
  const manusBaseUrl = process.env.MANUS_API_BASE_URL ?? 'https://api.manus.im';

  if (!manusApiKey) {
    throw new Error('Image edit failed: Manus_API key is not set.');
  }

  const editPrompt =
    `${prompt}\n\n` +
    (sourceImageUrl
      ? `Source image to edit: ${sourceImageUrl}\nEdit and improve this existing marketing image. Keep the composition coherent, realistic, and ad-ready. `
      : `Edit and improve the existing marketing image. Keep the composition coherent, realistic, and ad-ready. `) +
    `Variation token: ${crypto.randomUUID()}.\n\n` +
    'Return a direct image URL in the response.';

  const createTaskResponse = await fetch(`${manusBaseUrl}/v2/task.create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-manus-api-key': manusApiKey,
    },
    body: JSON.stringify({ message: { content: editPrompt } }),
  });

  if (!createTaskResponse.ok) {
    const errorText = await createTaskResponse.text();
    throw new Error(`Image edit failed via Manus task.create: ${createTaskResponse.status} ${errorText}`);
  }

  const createTaskData = (await createTaskResponse.json()) as Record<string, unknown>;
  const nestedData = createTaskData?.data as Record<string, unknown> | undefined;
  const taskId = (createTaskData?.task_id ?? nestedData?.task_id) as string | undefined;

  if (!taskId) {
    throw new Error('Image edit failed: Manus task_id missing in task.create response.');
  }

  let imageUrl: string | null = null;
  let lastMessagesPayload: unknown = null;
  const maxPoll = 72; // 72 × 5s = 6 minutes

  for (let attempt = 0; attempt < maxPoll; attempt += 1) {
    await sleep(5000);
    const listMessagesResponse = await fetch(
      `${manusBaseUrl}/v2/task.listMessages?task_id=${encodeURIComponent(taskId)}`,
      {
        method: 'GET',
        headers: { 'x-manus-api-key': manusApiKey },
      }
    );

    if (!listMessagesResponse.ok) {
      const errorText = await listMessagesResponse.text();
      throw new Error(`Image edit failed via Manus task.listMessages: ${listMessagesResponse.status} ${errorText}`);
    }

    const messagesPayload = (await listMessagesResponse.json()) as Record<string, unknown>;
    lastMessagesPayload = messagesPayload;

    const agentStatus = getManusAgentStatus(messagesPayload);

    if (agentStatus === 'running') continue;

    imageUrl = extractFirstImageUrlFromObject(messagesPayload);
    if (imageUrl) break;

    if (agentStatus !== null) break;
  }

  if (!imageUrl) {
    const payloadSnippet = JSON.stringify(lastMessagesPayload ?? {}).slice(0, 1000);
    throw new Error(
      `Image edit failed: Manus task completed but no image URL found. ` +
      `Task ID: ${taskId}. Payload sample: ${payloadSnippet}`
    );
  }

  return {
    type: 'image',
    provider: 'manus.im',
    model: 'manus-task-v2',
    content: {
      imageUrl,
      b64Json: null,
      prompt,
      editedFromMemory: true,
      taskId,
    },
  };
}

async function generateVideoCreative(prompt: string) {
  const runwayKey = process.env.RUNWAY_API_KEY;

  if (!runwayKey) {
    return {
      type: 'video',
      provider: 'fallback-storyboard',
      model: 'storyboard-v1',
      content: {
        videoPrompt:
          `${prompt}\n\n` +
          'Create a realistic 8-12 second ad video with hook in first 2 seconds, product close-up, social proof, and strong CTA.',
        storyboard: [
          '0-2s: Bold product hook with dynamic motion.',
          '2-6s: Product in realistic usage scene that matches age category and channel.',
          '6-9s: Highlight key differentiator and proof point.',
          '9-12s: CTA end card aligned to campaign objective.',
        ],
      },
    };
  }

  return {
    type: 'video',
    provider: 'runway',
    model: 'gen-4-turbo',
    content: {
      videoPrompt:
        `${prompt}\n\n` +
        'Generate a photorealistic marketing video with cinematic camera motion and natural human expressions.',
      note: 'RUNWAY_API_KEY is set. Integrate Runway generation endpoint here based on your account setup.',
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GeneratePayload>;
    const missing = validate(body);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const payload = body as GeneratePayload;
    const prompt = buildPrompt(payload);
    const action = payload.action ?? 'generate';

    if (payload.format === 'Image') {
      if (action === 'edit') {
        const result = await editImageCreative(prompt, payload.sourceImageUrl);
        return NextResponse.json({ ok: true, result });
      }

      const result = await generateImageCreative(prompt, action === 'regenerate');
      return NextResponse.json({ ok: true, result });
    }

    if (payload.format === 'Short Video') {
      const result = await generateVideoCreative(prompt);
      return NextResponse.json({ ok: true, result });
    }

    const result = await generateTextCreative(
      prompt,
      action === 'edit' ? payload.sourceText : undefined
    );
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
