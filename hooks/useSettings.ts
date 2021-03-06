import { SettingsContext } from 'context/SettingsContext';
import { createSafeContext } from 'context/createSafeContext';

export const useSettings = createSafeContext(SettingsContext);
