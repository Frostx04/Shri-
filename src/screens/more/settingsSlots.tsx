import type { ComponentType } from 'react';
import { OfflineSection } from './OfflineSection';
import { SyncSection } from './SyncSection';
/** Дополнительные секции настроек. */
export const settingsExtraSections: ComponentType[] = [SyncSection, OfflineSection];
