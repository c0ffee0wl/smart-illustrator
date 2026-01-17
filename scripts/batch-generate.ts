#!/usr/bin/env npx -y bun

/**
 * Batch Image Generation Script
 *
 * Generates multiple images from a JSON config file.
 *
 * Usage:
 *   npx -y bun batch-generate.ts --config illustrations.json --output-dir ./images
 *
 * Config format (illustrations.json):
 *   {
 *     "style": { ... },
 *     "illustrations": [
 *       { "id": 1, "prompt": "...", "filename": "01-xxx.png" },
 *       { "id": 2, "prompt": "...", "filename": "02-xxx.png" }
 *     ]
 *   }
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface IllustrationConfig {
  id: number;
  prompt: string | object;
  filename: string;
  type?: string;
  position?: string;
}

interface BatchConfig {
  style?: {
    mode?: string;
    background?: string;
    primary?: string;
    accent?: string[];
  };
  instructions?: string;
  illustrations: IllustrationConfig[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

function buildPrompt(illustration: IllustrationConfig, style?: BatchConfig['style']): string {
  let prompt = '';

  if (style) {
    prompt += `Style: ${style.mode || 'light'} mode, `;
    prompt += `background ${style.background || '#F8F9FA'}, `;
    prompt += `primary color ${style.primary || '#2F2B42'}, `;
    if (style.accent) {
      prompt += `accent colors ${style.accent.join(', ')}. `;
    }
  }

  if (typeof illustration.prompt === 'string') {
    prompt += illustration.prompt;
  } else {
    prompt += JSON.stringify(illustration.prompt);
  }

  return prompt;
}

async function generateImage(
  prompt: string,
  model: string,
  apiKey: string
): Promise<Buffer | null> {
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Generate an image: ${prompt}`
          }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ['image', 'text'],
      responseMimeType: 'image/png'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini API Error: ${data.error.message}`);
  }

  if (!data.candidates?.[0]?.content?.parts) {
    return null;
  }

  for (const part of data.candidates[0].content.parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function printUsage(): never {
  console.log(`
Batch Image Generation Script

Usage:
  npx -y bun batch-generate.ts --config illustrations.json --output-dir ./images

Options:
  -c, --config <path>       JSON config file with illustration specs
  -o, --output-dir <path>   Output directory (default: ./illustrations)
  -m, --model <model>       Model to use (default: gemini-3-pro-image-preview)
  -d, --delay <ms>          Delay between requests in ms (default: 1000)
  -h, --help                Show this help

Environment:
  GEMINI_API_KEY            Required. Get from https://aistudio.google.com/apikey

Config File Format:
  {
    "style": {
      "mode": "light",
      "background": "#F8F9FA",
      "primary": "#2F2B42",
      "accent": ["#F59E0B", "#38BDF8"]
    },
    "illustrations": [
      {
        "id": 1,
        "prompt": "A concept diagram showing...",
        "filename": "01-concept.png"
      }
    ]
  }
`);
  process.exit(0);
}

async function main() {
  const args = process.argv.slice(2);

  let configPath: string | null = null;
  let outputDir = './illustrations';
  let model = 'gemini-3-pro-image-preview';
  let delay = 1000;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        printUsage();
        break;
      case '-c':
      case '--config':
        configPath = args[++i];
        break;
      case '-o':
      case '--output-dir':
        outputDir = args[++i];
        break;
      case '-m':
      case '--model':
        model = args[++i];
        break;
      case '-d':
      case '--delay':
        delay = parseInt(args[++i], 10);
        break;
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is required');
    console.error('Get your API key from: https://aistudio.google.com/apikey');
    process.exit(1);
  }

  if (!configPath) {
    console.error('Error: --config is required');
    process.exit(1);
  }

  const configContent = await readFile(configPath, 'utf-8');
  const config: BatchConfig = JSON.parse(configContent);

  if (!config.illustrations || config.illustrations.length === 0) {
    console.error('Error: No illustrations in config');
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });

  const total = config.illustrations.length;
  let success = 0;
  let failed = 0;

  console.log(`\nBatch Image Generation`);
  console.log(`======================`);
  console.log(`Model: ${model}`);
  console.log(`Total: ${total} images`);
  console.log(`Output: ${outputDir}\n`);

  for (const illustration of config.illustrations) {
    const prompt = buildPrompt(illustration, config.style);
    const outputPath = join(outputDir, illustration.filename);

    console.log(`[${illustration.id}/${total}] Generating: ${illustration.filename}`);

    try {
      const imageBuffer = await generateImage(prompt, model, apiKey);

      if (imageBuffer) {
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, imageBuffer);
        console.log(`  ✓ Saved (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
        success++;
      } else {
        console.log(`  ✗ No image generated`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error instanceof Error ? error.message : error}`);
      failed++;
    }

    if (illustration.id < total) {
      await sleep(delay);
    }
  }

  console.log(`\n======================`);
  console.log(`Complete: ${success}/${total} succeeded, ${failed} failed`);
  console.log(`Output directory: ${outputDir}`);
}

main();
