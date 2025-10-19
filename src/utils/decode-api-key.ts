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
  // Validate input
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('API key is required and must be a string');
  }

  // Attempt to decode from Base64
  let decodedData: string;
  try {
    decodedData = Buffer.from(apiKey, 'base64').toString('utf-8');
  } catch (error) {
    throw new Error(
      'Failed to decode API key. Ensure it is a valid Base64-encoded string.\n' +
        'Get your API key from: https://interworky.com/dashboard/integrations'
    );
  }

  // Split by $$ first (new format), then fall back to : (old format)
  let parts = decodedData.split('$$');

  if (!parts || parts.length < 2) {
    parts = decodedData.split(':');
  }

  // Check if it's for LM Studio or OpenAI
  if (parts.length === 4) {
    // LM Studio API key: orgId:lmStudioUrl:modelName:systemMessage
    const [orgId, lmStudioUrl, modelName, systemMessage] = parts;

    if (!orgId || orgId.trim().length === 0) {
      throw new Error('Invalid API key: Organization ID is missing');
    }

    return { orgId: orgId.trim(), lmStudioUrl, modelName, systemMessage };
  } else if (parts.length === 2) {
    // OpenAI API key: orgId$$assistantId or orgId:assistantId
    const [orgId, assistantId] = parts;

    if (!orgId || orgId.trim().length === 0) {
      throw new Error('Invalid API key: Organization ID is missing');
    }

    return { orgId: orgId.trim(), assistantId: assistantId?.trim() };
  } else {
    throw new Error(
      `Invalid API key format. Expected 2 or 4 parts, got ${parts.length}.\n` +
        'Decoded value: ' +
        decodedData.substring(0, 50) +
        (decodedData.length > 50 ? '...' : '') +
        '\n' +
        'Please verify your API key at: https://interworky.com/dashboard/integrations'
    );
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
