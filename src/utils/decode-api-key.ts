/**
 * API Key Decoder
 *
 * Copied from interworky-assistant/src/utils/common.js
 * Decodes API keys in the same format used by the assistant widget
 */

export interface DecodedApiKey {
  orgId: string;
  assistantId?: string;
  lmStudioUrl?: string;
  modelName?: string;
  systemMessage?: string;
}

/**
 * Decodes an API key from Base64 and extracts the organization and assistant IDs.
 *
 * @param {string} apiKey - The API key encoded in Base64 format.
 * @returns {DecodedApiKey} - An object containing `orgId` and `assistantId`.
 *
 * Supported formats:
 * - WordPress/Standard: orgId:assistantId
 * - LM Studio: orgId:lmStudioUrl:modelName:systemMessage
 */
export function decodeApiKey(apiKey: string): DecodedApiKey {
  const decodedData = Buffer.from(apiKey, 'base64').toString('utf-8');
  let parts = decodedData.split('$$');

  if (!parts || parts.length < 2) {
    parts = decodedData.split(':');
  }

  // Check if it's for LM Studio or OpenAI
  if (parts.length === 4) {
    // LM Studio API key: orgId:lmStudioUrl:modelName:systemMessage
    const [orgId, lmStudioUrl, modelName, systemMessage] = parts;
    return { orgId, lmStudioUrl, modelName, systemMessage };
  } else if (parts.length === 2) {
    // OpenAI API key: orgId:assistantId
    const [orgId, assistantId] = parts;
    return { orgId, assistantId };
  } else {
    throw new Error('Invalid API key format.');
  }
}

/**
 * Get API key from environment variable
 */
export function getApiKeyFromEnv(): string {
  const apiKey = process.env.NEXT_PUBLIC_CARLA_API_KEY;

  if (!apiKey) {
    throw new Error(
      'NEXT_PUBLIC_CARLA_API_KEY not found in environment variables.\n' +
        'Please add it to your .env.local, .env.development, or .env file.\n' +
        'You can get your API key from: https://interworky.com/dashboard/integrations'
    );
  }

  return apiKey;
}
