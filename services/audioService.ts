import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import randomUseragent from 'random-useragent';
import { SHAZAM_API_URL, TIKTOK_API_URL } from 'utils/constants';
import {
  AudioConvertError,
  AudioCutError,
  AudioDownloadError,
  InvalidUrlFormatError,
  ShazamRequestError,
  TikTokRequestError,
  TikTokUnavailableError,
} from 'utils/errors';
import { getTikTokId } from 'utils/utils';
import type { Readable } from 'stream';
import type {
  RecognitionResult,
  ShazamResponse,
  TikTokMetadata,
  ExtendedAxiosResponse,
} from 'utils/types';

// Configure ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath.path);

export const getTikTokFinalUrl = async (url: string) => {
  const response: ExtendedAxiosResponse = await axios.get(url);
  if (response.status !== 200 || typeof response.request === 'undefined') {
    throw new TikTokRequestError(
      'Something went wrong while performing the TikTok request, try again',
    );
  }

  const tiktokId = getTikTokId(response.request?.res.responseUrl);
  if (tiktokId === undefined) {
    throw new InvalidUrlFormatError('Provide a valid format of TikTok url');
  }

  return TIKTOK_API_URL + tiktokId;
};

// User-Agent header is required by TikTok to perform a successful request
export const getTikTokAudioUrl = async (url: string) => {
  try {
    const response = await axios.get<TikTokMetadata>(url, {
      headers: {
        'user-agent': randomUseragent.getRandom(),
      },
    });
    if (response.status === 10217) {
      throw new TikTokUnavailableError('Provided TikTok is not available');
    }
    return response.data.itemInfo.itemStruct.music.playUrl;
  } catch (err) {
    throw new TikTokRequestError(
      'Something went wrong while performing the TikTok request, try again',
    );
  }
};

export const getAudioStream = async (url: string) => {
  try {
    const response = await axios.get<Readable>(url, {
      responseType: 'stream',
    });
    if (response.data === undefined) {
      throw new AudioDownloadError('Audio not available for this TikTok');
    }
    return response.data;
  } catch (err) {
    throw new AudioDownloadError('Failed to download the audio file, try again');
  }
};

// It's a pretty clever hack using a PassThrough stream to avoid storing a temp file ;)
export const getConvertedAudioBase64 = (
  readStream: Readable,
  startTime?: number,
  duration?: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    ffmpeg(readStream)
      .setStartTime(startTime || 0)
      .setDuration(duration || 5)
      .format('s16le')
      .audioChannels(1)
      .audioFrequency(44100)
      .pipe()
      .on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      })
      .on('end', () => {
        resolve(Buffer.concat(chunks).toString('base64'));
      })
      .on('error', () => {
        reject(new AudioConvertError('Failed to convert the audio, try again'));
      });
  });
};

export const getRecognizedAudio = async (
  audioBase64: string,
  shazamApiKey: string,
): Promise<RecognitionResult> => {
  try {
    const {
      data: { track },
    } = await axios.post<ShazamResponse>(SHAZAM_API_URL, audioBase64, {
      headers: {
        'content-type': 'text/plain',
        'x-rapidapi-host': 'shazam.p.rapidapi.com',
        'x-rapidapi-key': shazamApiKey,
      },
    });
    if (typeof track === 'undefined') {
      return {
        isFound: false,
      };
    }

    return {
      isFound: true,
      artist: track.subtitle,
      title: track.title,
      albumImage: track.images?.background,
    };
  } catch (err) {
    throw new ShazamRequestError(
      'Shazam service is probably temporarily unavailable, try again later or check API Key',
    );
  }
};
