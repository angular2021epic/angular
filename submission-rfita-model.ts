import { SubmissionRFITAModel } from './submission-rfitamodel';

import { DocumentExtensionModel } from './document-extension-model';

import { AnnouncementTopicAreaSectionTypeDTO } from './announcement-topic-area-section-type-dto';

export interface SubmissionRFITAModel {
  announcementID?: number;

  activeTopicArea?: SubmissionRFITAModel;

  allowedFileTypes?: Array<DocumentExtensionModel>;

  hasTopicAreas?: boolean;

  standardSections?: Array<AnnouncementTopicAreaSectionTypeDTO>;

  topicAreas?: Array<SubmissionRFITAModel>;
}
