import { LinkCheck } from '../types/entry';

interface LinkCheckResponse extends LinkCheck {
  savedEpisode: string;
}

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const checkLink = async (
  serviceUrl: string,
  link: string,
  savedEpisode: string
): Promise<LinkCheckResponse> => {
  const response = await fetch(`${normalizeBaseUrl(serviceUrl)}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: link, savedEpisode }),
  });

  const result = (await response.json()) as LinkCheckResponse & { error?: string };

  if (!response.ok) {
    throw new Error(result.error || 'The link checker could not process this request.');
  }

  return result;
};
