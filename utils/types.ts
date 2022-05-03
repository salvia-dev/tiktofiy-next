import type React from 'react';

export type Theme = 'default' | 'carbon' | 'material' | 'metaverse';

/* eslint-disable  @typescript-eslint/no-explicit-any */
export type AnyObject = Record<keyof any, unknown>;
export type EmptyObject = Record<keyof any, never>;

export type DeepReadonly<T extends AnyObject> = {
  +readonly [K in keyof T]: T[K] extends AnyObject ? DeepReadonly<T[K]> : T[K];
};

export interface SeoProps {
  readonly title: string;
}

export interface ErrorAlertProps {
  readonly errorMessage: string;
}

export type SongFound = {
  readonly isFound: true;
  readonly artist: string;
  readonly title: string;
  readonly albumImage: string;
};

type SongNotFound = {
  readonly isFound: false;
};

export type RecognitionResult = SongFound | SongNotFound;

export interface Settings {
  shazamApiKey: string;
  start: number;
  end: number;
}

export type RequestData = {
  url: string;
  settings: Settings;
};

export interface ChildrenProps {
  children: React.ReactNode;
}

export type SettingsKeys = keyof Settings;
