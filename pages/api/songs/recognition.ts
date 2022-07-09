import fs from 'fs';
import validUrl from 'valid-url';
import { withValidation } from 'middlewares/withValidation';
import { AudioSchema } from 'schemas/audioSchema';
import {
	convertAudio,
	cutAudio,
	downloadAudio,
	getTikTokAudioUrl,
	getTikTokFinalUrl,
	recognizeAudio,
} from 'services/audioService';
import { getSongByUrl, storeSong } from 'services/databaseService';
import { clearMedia } from 'services/mediaService';
import { getConfig } from 'utils/config';
import { CustomError, InvalidHTTPMethodError, InvalidUrlError } from 'utils/errors';
import { generateRandomString, isSongFound, getMediaPath } from 'utils/utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { RequestData, DeepReadonly, AnyObject } from 'utils/types';

interface CustomNextApiRequest<T extends AnyObject> extends NextApiRequest {
	readonly body: T;
}

const recognitionHandler = async (
	req: CustomNextApiRequest<DeepReadonly<RequestData>>,
	res: NextApiResponse,
) => {
	try {
		if (req.method !== 'POST') {
			throw new InvalidHTTPMethodError('Only POST method is allowed');
		}

		const { url, settings } = req.body;
		if (!validUrl.isUri(url)) {
			throw new InvalidUrlError('Invalid url has been provided');
		}

		const finalUrl = await getTikTokFinalUrl(url);
		const audioUrl = await getTikTokAudioUrl(finalUrl);

		if (getConfig('NODE_ENV') !== 'testing') {
			const storedTikTok = await getSongByUrl(audioUrl);
			if (storedTikTok) {
				return res.status(200).send({
					isFound: true,
					artist: storedTikTok.artist,
					title: storedTikTok.title,
					albumImage: storedTikTok.albumImage,
				});
			}
		}

		const audioFilename = generateRandomString();
		const cutAudioFilename = generateRandomString();
		const cutConvertedAudioFilename = generateRandomString();

		await downloadAudio(audioUrl, audioFilename);
		await cutAudio(audioFilename, cutAudioFilename, settings.start, settings.end);
		await convertAudio(cutAudioFilename, cutConvertedAudioFilename);

		const audioBase64 = fs.readFileSync(getMediaPath(cutConvertedAudioFilename), {
			encoding: 'base64',
		});
		const recognizedAudio = await recognizeAudio(audioBase64, settings.shazamApiKey);

		if (getConfig('NODE_ENV') !== 'testing' && isSongFound(recognizedAudio)) {
			await storeSong({
				url: audioUrl,
				artist: recognizedAudio.artist,
				title: recognizedAudio.title,
				albumImage: recognizedAudio.albumImage,
			});
		}

		await clearMedia([audioFilename, cutAudioFilename, cutConvertedAudioFilename]);

		res.status(200).send(recognizedAudio);
	} catch (err) {
		if (err instanceof CustomError) {
			return res.status(err.statusCode).send({ message: err.message });
		}

		res.status(500).send({ message: 'Unexpected error has occured' });
	}
};

export default withValidation(AudioSchema, recognitionHandler);
