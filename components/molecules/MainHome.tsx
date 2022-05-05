import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { File, Ghost } from 'react-kawaii';
import { useFadeRightTransition } from '../../hooks/useFadeRightTransition';
import { useFetch } from '../../hooks/useFetch';
import { useSettings } from '../../hooks/useSettings';
import { AUDIO_BASE_URL } from '../../utils/constants';
import { isSongFound } from '../../utils/utils';
import { Noti } from '../atoms/Noti';
import type {
  EmptyObject,
  ErrorAlertProps,
  RecognitionResult,
  RequestData,
} from '../../utils/types';
import type { ChangeEvent } from 'react';

const ErrorAlert = dynamic<ErrorAlertProps>(() =>
  import(/* webpackChunkName: "ErrorAlert" */ '../atoms/ErrorAlert').then(mod => mod.ErrorAlert),
);
const Loading = dynamic<EmptyObject>(() =>
  import(/* webpackChunkName: "Loading" */ '../atoms/Loading').then(mod => mod.Loading),
);

export const MainHome = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [url, setUrl] = useState('');
  const motionProps = useFadeRightTransition();
  const { settings } = useSettings();
  const { fetchingState, performFetching } = useFetch<RecognitionResult, RequestData>(
    'POST',
    AUDIO_BASE_URL,
    {
      url: url,
      settings: settings,
    },
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.currentTarget.value);
  };

  // Hack for the server/client side difference
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return null;
  }

  return (
    <motion.main
      {...motionProps}
      className="flex items-center flex-1 flex-col p-10 sm:px-0 xl:py-24"
    >
      <div
        className={`relative flex flex-col items-center w-full sm:w-96 md:w-144 xl:w-196 ${
          fetchingState.status === 'loading' && 'opacity-40 pointer-events-none select-none'
        }`}
      >
        {fetchingState.status === 'error' && (
          <ErrorAlert errorMessage={fetchingState.errorMessage} />
        )}
        <input
          placeholder="Paste a TikTok url..."
          className="p-4 bg-input w-full rounded-2xl text-sm font-robotomonomedium text-foreground placeholder-subactive"
          onChange={handleChange}
        />
        <button
          aria-label="Find a song"
          onClick={() => void performFetching()}
          className="mt-10 w-48 p-3 rounded-3xl bg-primary text-sm font-robotomonomedium"
        >
          Find a song
        </button>
      </div>
      <div className="mt-24">
        {(() => {
          switch (fetchingState.status) {
            case 'success':
              return isSongFound(fetchingState.data) ? (
                <>
                  <p className="text-sm text-center">look what we have just found for you</p>
                  {fetchingState.data.albumImage && (
                    <div className="flex items-center justify-center mt-10">
                      <Image
                        src={fetchingState.data.albumImage}
                        alt="Album image"
                        width={112}
                        height={112}
                        className="mt-3 rounded-xl mx-auto"
                      />
                    </div>
                  )}
                  <p className="mt-10 text-sm md:text-lg text-center">
                    {fetchingState.data.artist} - {fetchingState.data.title}
                  </p>
                </>
              ) : (
                <Noti
                  icon={<File size={120} mood="ko" color="#fff" />}
                  message="sorry, we weren't able to find anything"
                />
              );
            case 'idle':
              return (
                <Noti
                  icon={<Ghost size={120} mood="blissful" color="#fff" />}
                  message="come one... search for something"
                />
              );
            case 'error':
              return (
                <Noti
                  icon={<File size={120} mood="ko" color="#fff" />}
                  message="something went wrong..."
                />
              );
            case 'loading':
              return <Loading />;
          }
        })()}
      </div>
    </motion.main>
  );
};
