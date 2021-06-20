import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormModel } from '@app/shared/models/form-model';
import { AnnOverviewModel, AnnouncementTopicAreaModel, TopicAreaCopyModel } from '@app/api/models';
import { CurrentAnnouncementService } from '@app/announcement/announcement-details/current-announcement.service';
import { MenuItem } from 'primeng/api';
import { retry } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AnnDevOverviewService, AnnDevSubmissionDetailsService } from '@app/api/services';
import { SubmissionInfoComponent } from '@app/announcement/announcement-details/announcement-development/ann-dev-submission-details/submission-info/submission-info.component';
import { removeSummaryDuplicates } from '@angular/compiler';
import { AnnDevSubmissionDetailsModel } from '@app/api/models/ann-dev-submission-details-model';
import { SubmissionDetailsTopicAreaModel } from '@app/api/models/submission-details-topic-area-model';
import { AnnouncementType } from '@app/shared/LookupConsts';
import { WizardComponentBase } from '@app/common-services/wizard/wizard.component-base';

@Component({
  selector: 'app-ann-deadlines',
  templateUrl: './ann-deadlines.component.html',
  styleUrls: ['./ann-deadlines.component.css']
})
export class AnnDeadlinesComponent implements OnInit {
    public AnnouncementType = AnnouncementType;
    @Input() model: AnnDevSubmissionDetailsModel;
    @Input() f: FormModel;
    @Input() fnSave: () => Promise<boolean>;
    @Input() isCollapsedFieldset : boolean;
    @Output() onCopySuccess = new EventEmitter();
    announcementAnticipatedDateRange: Date[];
    awardNegotiationRange: Date[];
    submissionDeadlineFullAppRange: Date[];
    expectedSelectionNotificationDateRange: Date[];
    expectedSubmissionDeadlineRRCRange: Date[];
    submissionDeadlineLOIRange: Date[];
    isWebinarDateSetByRange: boolean = false;
    defaultDate: Date;
    public tabItems: MenuItem[] = [];
    public activeTab: MenuItem;
    public activeTopicArea: SubmissionDetailsTopicAreaModel;
    public activeTabIndex: number;

  constructor(public _currentAnnouncement: CurrentAnnouncementService,
                    private annDevSubmissionDetailsService: AnnDevSubmissionDetailsService) {
                       }

  ngOnInit() {
    this.setInformationWebbbinarDate();
    this.activeTabIndex = 0;
    this.defaultDate = this.getDefaultDate();
  }
  getDefaultDate() : Date

  {
    let resDate : Date;
    if(this.model.anticipatedPublicationToDate !=null){
        resDate = new Date(this.model.anticipatedPublicationToDate);
    }
    else if(this.model.anticipatedPublicationFromDate !=null)
    {
      resDate = new Date(this.model.anticipatedPublicationFromDate);
    }
    else
    {
      var today = new Date();
      var anticipatedPublicationDate = this.model.anticipatedPublicationYear-1+'-'+10+'-'+1;
      resDate = new Date(anticipatedPublicationDate);
    }

     return resDate;
  }

  updateDefaultDate() {
      this.defaultDate = this.getDefaultDate();
  }

  handleChange(e) {
      this.activeTabIndex = e.index;
  }

  refresh() {
  }

  setActivetab() {
      this.activeTab = this.tabItems[this.activeTabIndex];
      this.activeTopicArea = this.model.announcementTopicAreas.filter(p => p.topicAreaNumber > 0)[this.activeTabIndex];
  }

  getDefaultTopicArea(): SubmissionDetailsTopicAreaModel{
      if(!this.model.hasTopicAreas){
          this.model.activeTopicArea = this.model.announcementTopicAreas.filter(p => p.topicAreaNumber == 0)[0];
       }

      return this.model.activeTopicArea;
  }
  getTopicAreas(): SubmissionDetailsTopicAreaModel[] {
      return this.model.announcementTopicAreas.filter(p => p.topicAreaNumber > 0);
  }

  onWillSubmissionDeadlinesVaryByTAChange() {
      this.activeTabIndex = 0;
      this.setActivetab();
  }

  onExpectedSelectionNotificationDateChange(topicArea: SubmissionDetailsTopicAreaModel) {

      if (topicArea != null && topicArea != undefined) {
          if (topicArea.expectedSelectionNotificationDateTo != null) {
              topicArea.awardNegotiationsMonthYearFrom = this.toMonthAndYearString(new Date(topicArea.expectedSelectionNotificationDateTo));
          }
          else if (topicArea.expectedSelectionNotificationDateFrom != null) {
              topicArea.awardNegotiationsMonthYearFrom = this.toMonthAndYearString(new Date(topicArea.expectedSelectionNotificationDateFrom));
          }
          else {
              topicArea.awardNegotiationsMonthYearFrom = "";
          }

          if (topicArea.awardNegotiationsMonthYearFrom == "" && topicArea.awardNegotiationsMonthYearTo.indexOf('-') > -1) {
              let valueToStr = topicArea.awardNegotiationsMonthYearTo;
              topicArea.awardNegotiationsMonthYearTo = valueToStr.substring(2, valueToStr.length).trim();
          }
          else if (topicArea.awardNegotiationsMonthYearTo != "" && topicArea.awardNegotiationsMonthYearFrom != "" && topicArea.awardNegotiationsMonthYearTo.indexOf('-') == -1) {
              topicArea.awardNegotiationsMonthYearTo = ' - ' + topicArea.awardNegotiationsMonthYearTo;
          }
      }
      else {
          if (this.model.anticipatedSelectionToDate != null) {

              this.model.activeTopicArea.awardNegotiationsMonthYearFrom = this.toMonthAndYearString(new Date(this.model.anticipatedSelectionToDate));
          }
          else if (this.model.anticipatedSelectionFromDate != null) {

              this.model.activeTopicArea.awardNegotiationsMonthYearFrom = this.toMonthAndYearString(new Date(this.model.anticipatedSelectionFromDate));
          }
          else {
              this.model.activeTopicArea.awardNegotiationsMonthYearFrom = "";
          }

          if (this.model.activeTopicArea.awardNegotiationsMonthYearFrom == "" && this.model.activeTopicArea.awardNegotiationsMonthYearTo.indexOf('-') > -1) {
              let valueToStr = topicArea.awardNegotiationsMonthYearTo;
              topicArea.awardNegotiationsMonthYearTo = valueToStr.substring(2, valueToStr.length).trim();
          }
          else if (this.model.activeTopicArea.awardNegotiationsMonthYearTo != "" && this.model.activeTopicArea.awardNegotiationsMonthYearFrom != "" && this.model.activeTopicArea.awardNegotiationsMonthYearTo.indexOf('-') == -1) {
              this.model.activeTopicArea.awardNegotiationsMonthYearTo = ' - ' + this.model.activeTopicArea.awardNegotiationsMonthYearTo;
          }
      }
   }

  onAwardIssueTimeFrameChange(topicArea: SubmissionDetailsTopicAreaModel) {

      if (topicArea != null && topicArea != undefined) {
          if (topicArea.awardIssueDateTo != null) {
              topicArea.awardNegotiationsMonthYearTo = this.toMonthAndYearString(new Date(topicArea.awardIssueDateTo));
          }
          else if (topicArea.awardIssueDateFrom != null) {
              topicArea.awardNegotiationsMonthYearTo = this.toMonthAndYearString(new Date(topicArea.awardIssueDateFrom));
          }
          else {
              topicArea.awardNegotiationsMonthYearTo = "";
          }

         if (topicArea.awardNegotiationsMonthYearTo != "" && topicArea.awardNegotiationsMonthYearFrom != "") {
              topicArea.awardNegotiationsMonthYearTo = ' - ' + topicArea.awardNegotiationsMonthYearTo;
          }
      }
      else {
          if (this.model.anticipatedAwardToDate != null) {
              this.model.activeTopicArea.awardNegotiationsMonthYearTo = this.toMonthAndYearString(new Date(this.model.anticipatedAwardToDate));
          }
          else if (this.model.anticipatedAwardFromDate != null) {
              this.model.activeTopicArea.awardNegotiationsMonthYearTo = this.toMonthAndYearString(new Date(this.model.anticipatedAwardFromDate));
          }
          else {
              this.model.activeTopicArea.awardNegotiationsMonthYearTo = "";
          }

          if (this.model.activeTopicArea.awardNegotiationsMonthYearTo != "" && this.model.activeTopicArea.awardNegotiationsMonthYearFrom != "") {
              this.model.activeTopicArea.awardNegotiationsMonthYearTo = ' - ' + this.model.activeTopicArea.awardNegotiationsMonthYearTo;
          }
      }
  }

  onWillUseLOICheckboxChange(topicArea: SubmissionDetailsTopicAreaModel) {
      if (topicArea.submissionDeadlineLOINotApplicable) {
          topicArea.submissionDeadlineLOIFrom = null;

          topicArea.submissionDeadlineLOITo = null;
      }
  }

  onWillUseConceptPapersCheckboxChange(topicArea: SubmissionDetailsTopicAreaModel) {
      if (topicArea.submissionDeadlineCPNotApplicable) {
          topicArea.submissionDeadlineCPFrom = null;

          topicArea.submissionDeadlineCPTo = null;
      }
  }


  onExpectedSubmissionDeadlineRRCNotApplicableCheckboxChange(topicArea: SubmissionDetailsTopicAreaModel) {
      if (topicArea.expectedSubmissionDeadlineRRCNotApplicable) {
          topicArea.expectedSubmissionDeadlineRRCFrom = null;

          topicArea.expectedSubmissionDeadlineRRCTo = null;
      }
  }

  onSubmissionDeadlineLOICalendarChange(topicArea: SubmissionDetailsTopicAreaModel) {
      if (topicArea.submissionDeadlineLOITo != null && topicArea.submissionDeadlineLOIFrom != null) {
          topicArea.submissionDeadlineLOINotApplicable = null;
      }
  }
  onSubmissionDeadlineCPCalendarChange(topicArea: SubmissionDetailsTopicAreaModel) {

      if (topicArea.submissionDeadlineCPTo != null && topicArea.submissionDeadlineCPFrom != null) {
          topicArea.submissionDeadlineCPNotApplicable = null;
      }
  }

  onExpectedSubmissionDeadlineRRCCalendarChange(topicArea: SubmissionDetailsTopicAreaModel) {

      if (topicArea.expectedSubmissionDeadlineRRCTo != null && topicArea.expectedSubmissionDeadlineRRCFrom != null) {
          topicArea.expectedSubmissionDeadlineRRCNotApplicable = null;
      }
  }

  toMonthAndYearString(date?: Date): string {
      let result = "";
      if (date != null) {
          result = this.monthNames[date.getMonth()] + " " + date.getFullYear();
      }

      return result;
  }

  onAnnouncementIssueDateChange() {
      //this.setInformationWebinarDate();
  }

  monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];

  get fnCopy() {
      return (model: TopicAreaCopyModel) => this.annDevSubmissionDetailsService.CopyAnnDevSubmissionInfo(model);
  }

  onCopy(model: TopicAreaCopyModel) {
      this.onCopySuccess.emit();
  }
}
