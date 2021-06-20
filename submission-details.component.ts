import { Component, OnInit } from '@angular/core';
import { ValidationRuleFactoryService } from '@app/shared/services/validation-rule-factory.service';

import { AnnouncementType, AnnouncementTopicAreaSectionType, DocumentExtention } from '@app/shared/LookupConsts';

import { WizardStepType1 } from '@app/shared/LookupConsts';
@Component({
  selector: 'app-submission-details',
  templateUrl: './submission-details.component.html',
  styleUrls: ['./submission-details.component.css']
})

export class SubmissionDetailsComponent implements OnInit {
  public AnnouncementType = AnnouncementType;

  @ViewChild('submission', { static: false }) public submission: SubmissionInfoComponent;

  @ViewChild('deadlines', { static: false }) public deadlines: AnnDeadlinesComponent;

  overviewModel: AnnDevSubmissionDetailsModel = null;

  isCollapsedFieldset: boolean = false;

  defaultDate: Date;

  annAppSubmissionLOIModel: AnnAppSubmissionLOIModel;

  submissionRFIModel: SubmissionRFIModel = null;

  // isRefresh: boolean = false;
  constructor(injector: Injector,

    private currentAnnouncement: CurrentAnnouncementService,

    private annDevSubmissionDetailsService: AnnDevSubmissionDetailsService,

    private loiSvc: AnnDevAppSubmissionLOIService,

    private _validationRuleFactory: ValidationRuleFactoryService,

    private annDevAppSubmissionRFIService: AnnDevAppSubmissionRFIService

  ) {
         super(injector);
   }

  async ngOnInit() {
  }
  getDefaultDate(): Date {

    let resDate: Date;

    if (this.overviewModel.anticipatedPublicationToDate != null) {

        resDate = new Date(this.overviewModel.anticipatedPublicationToDate);

    }
    else if (this.overviewModel.anticipatedPublicationFromDate != null) {

        resDate = new Date(this.overviewModel.anticipatedPublicationFromDate);
    }
    else {

        var today = new Date();

        var anticipatedPublicationDate = this.overviewModel.anticipatedPublicationYear - 1 + '-' + 10 + '-' + 1;

        resDate = new Date(anticipatedPublicationDate);

    }
    return resDate;

}
onAnnouncementIssueDateChange() {
  this.deadlines.updateDefaultDate();
}

expandAllFieldset() {
  this.isCollapsedFieldset = false;
}

collapseAllFieldset() {
  this.isCollapsedFieldset = true;
}

onCopySuccess() {
  this.refresh();
  this.wizardComponent.refreshModel();

}

async refresh() {

  this.overviewModel = await this.annDevSubmissionDetailsService.GetSubmissionDetailsInformation(this.currentAnnouncement.announcementID).toPromise();

  if (this.overviewModel.announcementTypeID == AnnouncementType.RFI) {

      this.submissionRFIModel = await this.annDevAppSubmissionRFIService.GetRequestForInformation(this.currentAnnouncement.announcementID).toPromise();

      if (this.submissionRFIModel.hasTopicAreas) {

          this.submissionRFIModel.topicAreas.forEach(topicArea => {

              topicArea.displaySections = topicArea.sections.filter(s => s.isActive);

          });

      } else {

          if (this.submissionRFIModel.topicAreas[0].sections.length == 0) {

              this.submissionRFIModel.topicAreas[0].displaySections = [];

              this.submissionRFIModel.topicAreas[0].sections = [];

              var standardSection = this.submissionRFIModel.standardSections[0];

              this.addSection(this.submissionRFIModel.topicAreas[0], standardSection)

          } else {
              this.submissionRFIModel.topicAreas[0].displaySections = this.submissionRFIModel.topicAreas[0].sections;
          }
      }
  }
  setTimeout(() => {
      if (this.deadlines) this.deadlines.refresh();
      if (this.submission) this.submission.refresh();

  }, 0);
  this.defaultDate = this.getDefaultDate();
}

async updateDefaultDate() {
  this.deadlines.updateDefaultDate();
}

get isDirty(): boolean {
  return this.f.dirty;
}

get fnSave() {
  return () => this.wizardComponent.save();
}

async mapSubmissionDetailToSubmissionLetterOfIntent(sdm: AnnDevSubmissionDetailsModel): Promise<AnnAppSubmissionLOIModel> {

  let scm: AnnAppSubmissionLOIModel = { activeTopicArea: {} };

  let cfdeModel = await this.loiSvc.ContentFormsDocumentExtensions(sdm.announcementID).toPromise();

  scm.activeTopicArea.announcementID = sdm.activeTopicArea.announcementID;

  scm.activeTopicArea.loiRequirementID = 1;

  scm.activeTopicArea.willUseLOI = sdm.activeTopicArea.willUseLOI;

 scm.activeTopicArea.announcementTopicAreaID = sdm.activeTopicArea.announcementTopicAreaID;

  scm.activeTopicArea.topicAreaNumber = sdm.activeTopicArea.topicAreaNumber;

  scm.activeTopicArea.topicAreaTitle = sdm.activeTopicArea.topicAreaTitle;

  scm.activeTopicArea.secondaryNumber = sdm.activeTopicArea.secondaryNumber;

  scm.activeTopicArea.topicAreaCode = sdm.activeTopicArea.topicAreaCode;

  scm.activeTopicArea.loiContentForms = cfdeModel.contentForms;

  scm.activeTopicArea.loiAllowFileTypes = cfdeModel.documentExtentions;

  scm.hasTopicAreas = sdm.hasTopicAreas;

  return scm;

}

async intializedContentLetter(sdm: AnnDevSubmissionDetailsModel) {

  if (sdm.hasTopicAreas && sdm.announcementTopicAreas.filter(p => p.topicAreaNumber != 0).length > 0) {

      let submissionContentLetterModel = await this.mapSubmissionDetailToSubmissionLetterOfIntent(sdm);

      await this.loiSvc.SaveLOISubmissionInformation(submissionContentLetterModel).toPromise();

  }

}

async onSave() {

  if (this.f.isValid()) {
      try {
          if (this.currentAnnouncement.canEdit) {
              //await this.intializedContentLetter(this.overviewModel);

              if (this.overviewModel.announcementTypeID == AnnouncementType.RFI) {

                  if (this.overviewModel.activeTopicArea != null) {

                      this.submissionRFIModel.activeTopicArea =

                          this.submissionRFIModel.topicAreas.filter(x => x.announcementTopicAreaID ==

                              this.overviewModel.activeTopicArea.announcementTopicAreaID)[0];

                  }
                  await this.annDevAppSubmissionRFIService.SaveRequestForInformation(this.submissionRFIModel).toPromise();
              }
              await this.annDevSubmissionDetailsService.SaveSubmissionDetailsInformation(this.overviewModel).toPromise();
          }
          this.f.dirty = false;
          await this.currentAnnouncement.loadBasicInformation();
          return true;

      } catch (e) {
          console.error(e);
          return false;

      }
  }
}

currentStepType(): WizardStepType1 {
  return WizardStepType1.ADSubmissionDetails;
}

onChange() {

}

validationRules = {
  validDateRange: [
      this._validationRuleFactory.create({
          condition: () => this.dateToValidateRange(),
          messageName: "InvalidAnnouncementIssueDateRange",
      }),
  ],
};

dateToValidateRange(): boolean {

  var anticipatedPublicationDate = this.overviewModel.anticipatedPublicationYear;

  var fromAnticipatedPublicationDate = new Date(anticipatedPublicationDate - 1 + '-' + 10 + '-' + 1);

  var toAnticipatedPublicationDate = new Date(anticipatedPublicationDate + '-' + 9 + '-' + 30);

  var fromDateToValidate = new Date(this.overviewModel.anticipatedPublicationFromDate);

  var toDateToValidate = new Date(this.overviewModel.anticipatedPublicationToDate);

  if (this.overviewModel.anticipatedPublicationFromDate == null
      && this.overviewModel.anticipatedPublicationToDate == null) {
      return true;
  }

  else if (this.overviewModel.anticipatedPublicationFromDate != null
      && !(fromDateToValidate >= fromAnticipatedPublicationDate) || !(fromDateToValidate <= toAnticipatedPublicationDate)) {
      return false;
  }

  else if (this.overviewModel.anticipatedPublicationToDate != null
      && !(toDateToValidate >= fromAnticipatedPublicationDate) || !(toDateToValidate <= toAnticipatedPublicationDate)) {

      return false;
  }
  return true;

}

addSection(topicArea: SubmissionRFITAModel, standardSection?: AnnouncementTopicAreaSectionTypeDTO) {

  let section = {

      announcementTopicAreaID: topicArea.announcementTopicAreaID,

      allowedFileTypes: JSON.parse(JSON.stringify(this.submissionRFIModel.allowedFileTypes)),

      isActive: true,

      expanded: true,

  } as SubmissionRFITASectionModel;

  if (standardSection) {

      section.announcementTopicAreaSectionTypeID = standardSection.announcementTopicAreaSectionTypeID;

      section.sectionTitle = (standardSection.announcementTopicAreaSectionTypeID != AnnouncementTopicAreaSectionType.Other) ? standardSection.announcementTopicAreaSectionTypeName : '';

      section.description = standardSection.description;

      section.pageLimit = standardSection.pageLimit;

      switch (section.announcementTopicAreaSectionTypeID) {

          case AnnouncementTopicAreaSectionType.RFIUploadedResponse:

              section.allowedFileTypes.find(t => (t.documentExtentionID === DocumentExtention.Docx || t.documentExtentionID === DocumentExtention.Doc)).selected = true;

              break;
      }

  }

  topicArea.sections.push(section);

  topicArea.displaySections.push(section);

}
}
