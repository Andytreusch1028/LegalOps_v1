/**
 * Profile Management Components
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Export all profile management UI components
 */

export { ProfileManager } from './ProfileManager';
export type { ProfileManagerProps, UserProfile } from './ProfileManager';

export { AutoFillSettings } from './AutoFillSettings';
export type { 
  AutoFillSettingsProps, 
  AutoFillSettings as AutoFillSettingsType,
  FormType,
  FormConfiguration,
  FieldMapping 
} from './AutoFillSettings';

export { PrivacySettings } from './PrivacySettings';
export type { 
  PrivacySettingsProps, 
  PrivacySettings as PrivacySettingsType 
} from './PrivacySettings';

export { DataExport } from './DataExport';
export type { 
  DataExportProps, 
  ExportType, 
  ExportRequest, 
  ExportHistory 
} from './DataExport';