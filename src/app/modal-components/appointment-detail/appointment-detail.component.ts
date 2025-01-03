import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { EncounterModel, ObsModel, ProviderAttributeModel, VisitModel } from 'src/app/model/model';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-appointment-detail',
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.scss']
})
export class AppointmentDetailComponent implements OnInit {

  baseUrl: string = environment.baseURL;
  patientRegFields: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<AppointmentDetailComponent>,
    private visitService: VisitService,
    private translate:TranslateService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit(): void {
    this.patientRegFields = this.appConfigService.patientRegFields;
    if (this.data?.title == 'Appointment') {
      this.visitService.fetchVisitDetails(this.data.id).subscribe((visit: VisitModel)=> {
        this.data.meta.visit_info = visit;
        let cdata = this.getCheifComplaint(visit);
        this.data.meta.cheif_complaint = cdata.complaint;
        this.data.meta.visit_status = this.checkVisitStatus(visit.encounters);
        this.data.meta.starts_in = this.checkIfDateOldThanOneDay(this.data?.meta.slotJsDate);
        this.data.meta.hwPhoneNo = cdata.hwPhoneNo;
        this.data.meta.prescriptionCreatedAt = cdata.prescriptionCreatedAt;

      });
    } else if (this.data?.title == 'Follow-up visit') {
      let cdata = this.getCheifComplaint(this.data?.meta.visit_info);
      this.data.meta.cheif_complaint = cdata.complaint;
      this.data.meta.visit_status = this.checkVisitStatus(this.data?.meta.visit_info.encounters);
      this.data.meta.starts_in = this.checkIfDateOldThanOneDay(this.data?.meta.slotJsDate);
      this.data.meta.hwPhoneNo = cdata.hwPhoneNo;
      this.data.meta.prescriptionCreatedAt = cdata.prescriptionCreatedAt;
    }
  }

  /**
  * Close modal
  * @param {string|boolean} val - Dialog result
  * @return {void}
  */
  close(val: string|boolean) {
    this.dialogRef.close(val);
  }

  /**
  * Check how old the date is from now
  * @param {string} data - Date in string format
  * @return {string} - Returns how old the date is from now
  */
  checkIfDateOldThanOneDay(data: string) {
    let hours = moment(data).diff(moment(), 'hours');
    let minutes = moment(data).diff(moment(), 'minutes');
    if(hours > 24) {
      return `${this.translate.instant('Starts in')} ${Math.round(hours/24)} ${this.translate.instant('days')}`;
    };
    if (hours < 1) {
      if (hours < -24) {
        return `${this.translate.instant('Awaiting since')} ${Math.round(-hours/24)} ${this.translate.instant('days')}`;
      } else if (hours < 0 && hours > -24) {
        return `${this.translate.instant('Awaiting since')} ${-hours} ${this.translate.instant('hrs')}`;
      } else if (hours == 0 && minutes < 0) {
        return `${this.translate.instant('Awaiting since')} ${-minutes} ${this.translate.instant('minutes')}`;
      }
      return `${this.translate.instant('Starts in')} ${minutes} ${this.translate.instant('minutes')}`;
    }
    return `${this.translate.instant('Starts in')} ${hours} ${this.translate.instant('hrs')}`;
  }

  /**
  * Retreive the chief complaints for the visit
  * @param {VisitModel} visit - Visit
  * @return {{complaint: string[],hwPhoneNo: string, prescriptionCreatedAt: string }} - Object having Chief complaints array, HW phone number and prescription created time
  */
  getCheifComplaint(visit: VisitModel) {
    let recent: string[] = [];
    let hwPhoneNo: string = '';
    let prescriptionCreatedAt: string = '';

    const encounters = visit.encounters;
    encounters.forEach((encounter: EncounterModel) => {
      const display = encounter.display;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach((currentObs: ObsModel) => {
          if (currentObs.display.match(visitTypes.CURRENT_COMPLAINT) !== null) {
            const currentComplaint =this.visitService.getData(currentObs)?.value.replace(new RegExp('►', 'g'),'').split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                recent.push(obs1[0]);
              }
            }
          }
        });
        const providerAttribute = encounter.encounterProviders[0].provider.attributes;
        if (providerAttribute.length) {
          providerAttribute.forEach((attribute: ProviderAttributeModel) => {
            if (attribute.display.match(doctorDetails.PHONE_NUMBER) != null) {
              hwPhoneNo = attribute.value;
            }
          });
        }
      }
      if (display.match(visitTypes.VISIT_COMPLETE) !== null) {
        prescriptionCreatedAt = this.checkPrescriptionCreatedAt(encounter.encounterDatetime);
      }
    });
    return { complaint: recent, hwPhoneNo, prescriptionCreatedAt };
  }

  /**
  * Check visit status
  * @param {EncounterModel[]} encounters - Array of visit encounters
  * @return {string} - Returns visit status
  */
  checkVisitStatus(encounters: EncounterModel[]) {
    if (this.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY)) {
      return 'Ended';
    } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_COMPLETE)) {
      return 'Completed';
    } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE)) {
      return 'In-progress';
    } else if (this.checkIfEncounterExists(encounters, visitTypes.FLAGGED)) {
      return'Priority';
    } else if (this.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) || this.checkIfEncounterExists(encounters, visitTypes.VITALS)) {
      return 'Awaiting';
    }
  }

  /**
  * Returns the ecounter for a given encounter type
  * @param {CustomEncounterModel[]} encounters - Array of visit encounters
  * @return {CustomEncounterModel} - Ecounter for a given encounter type
  */
  checkIfEncounterExists(encounters: EncounterModel[], encounterType: string) {
    return encounters.find(({ display = "" }) => display.includes(encounterType));
  }

  /**
  * Returns the prescription created time
  * @param {string} data - Timestamp
  * @return {string} - Prescription created time
  */
  checkPrescriptionCreatedAt(data: string) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if(hours > 24) {
      return `${this.translate.instant('Prescription created')} ${Math.round(hours/24)} ${this.translate.instant('days ago')}`;
    };
    if (hours < 1) {
      return `${this.translate.instant('Prescription created')} ${minutes} ${this.translate.instant('minutes ago')}`;
    }
    return `${this.translate.instant('Prescription created')} ${hours} ${this.translate.instant('hrs ago')}`;
  }

  checkPatientRegField(fieldName): boolean{
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

}
