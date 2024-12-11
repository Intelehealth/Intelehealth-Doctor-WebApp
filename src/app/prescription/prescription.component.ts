import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../core/page-title/page-title.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { ApiResponseModel, CustomEncounterModel, CustomVisitModel, ProviderAttributeModel } from '../model/model';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit {

  active: number = 1;
  completedVisits: CustomVisitModel[] = [];
  prescriptionSent: CustomVisitModel[] = [];
  doctorCompletedVisits: CustomVisitModel[] = [];
  loaded1: boolean = false;
  loaded2: boolean = false;
  loaded3:  boolean = false;
  specialization: string = '';
  prescriptionSentCount: number = 0;
  completedVisitsCount: number = 0;
  doctorCompletedVisitsCount: number = 0;

  constructor(private pageTitleService: PageTitleService, private visitService: VisitService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Prescription", imgUrl: "assets/svgs/menu-treatment-circle.svg" });
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
      }
    }
    this.getPrescriptionSentVisits();
    this.getCompletedVisits();
    this.geDoctorsCompletedVisits(provider.uuid);
  }

  /**
  * Get completed visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getCompletedVisits(page: number = 1) {
    if(page == 1) this.completedVisits = [];
    this.visitService.getEndedVisits(this.specialization, page).subscribe((cv: ApiResponseModel) => {
      if (cv.success) {
        this.completedVisitsCount = cv.totalCount;
        let records = [];
        for (let i = 0; i < cv.data.length; i++) {
          let visit = cv.data[i];
          let vcenc = this.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
          let pesenc = this.checkIfEncounterExists(visit.encounters, visitTypes.PATIENT_EXIT_SURVEY);
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.prescription_sent = (vcenc) ? this.checkIfDateOldThanOneDay(vcenc.encounter_datetime) : null;
          if (pesenc) {
            visit.visit_ended = this.checkIfDateOldThanOneDay(pesenc.encounter_datetime);
          } else {
            visit.visit_ended = this.checkIfDateOldThanOneDay(visit.date_stopped);
          }
          visit.person.age = this.calculateAge(visit.person.birthdate);
          records.push(visit);
        }
        this.completedVisits = this.completedVisits.concat(records);
        this.loaded1 = true;
      }
    });
  }

  /**
  * Get completed visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getCompletedVisitsData(page: number) {
    this.getCompletedVisits(page);
  }

  /**
  * Get prescriptions sent visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getPrescriptionSentVisits(page: number = 1) {
    if(page == 1) this.prescriptionSent = [];
    this.visitService.getCompletedVisits(this.specialization, page).subscribe((ps: ApiResponseModel) => {
      if (ps.success) {
        this.prescriptionSentCount = ps.totalCount;
        let records = [];
        for (let i = 0; i < ps.data.length; i++) {
          let visit = ps.data[i];
          let vcenc = this.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.prescription_sent = (vcenc) ? this.checkIfDateOldThanOneDay(vcenc.encounter_datetime) : null;
          visit.person.age = this.calculateAge(visit.person.birthdate);
          records.push(visit);
        }
        this.prescriptionSent = this.prescriptionSent.concat(records);
        this.loaded2 = true;
      }
    });
  }

  geDoctorsCompletedVisits(uuid: any, page: number = 1) {
    if(page == 1) this.doctorCompletedVisits = [];
    this.visitService.getEndedVisits(this.specialization, page).subscribe((ps: ApiResponseModel) => {
      if (ps.success) {
         let record = [];
        for (let i = 0; i < ps.data.length; i++) {
          let visit = ps.data[i];
          let vcenc = this.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.prescription_sent = (vcenc) ? this.checkIfDateOldThanOneDay(vcenc.encounter_datetime) : null;
          visit.person.age = this.calculateAge(visit.person.birthdate);
          if(vcenc?.encounter_provider?.provider.uuid === uuid) {
            record.push(visit);
          }
        }
        this.doctorCompletedVisitsCount = record.length;
        this.doctorCompletedVisits = this.doctorCompletedVisits.concat(record);
        this.loaded3 = true;
      }
    });
  }

  /**
  * Get prescriptions sent visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getPrescriptionSentVisitsData(page: number) {
    this.getPrescriptionSentVisits(page);
  }

  /**
  * Get encounter datetime for a given encounter type
  * @param {CustomVisitModel} visit - Visit
  * @param {string} encounterName - Encounter type
  * @return {string} - Encounter datetime
  */
  getEncounterCreated(visit: CustomVisitModel, encounterName: string): string {
    let created_at: string = '';
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(encounterName) !== null) {
        created_at = this.getCreatedAt(encounter.encounter_datetime);
      }
    });
    return created_at;
  }

  /**
  * Returns the created time in words from the date
  * @param {string} data - Date
  * @return {string} - Created time in words from the date
  */
  getCreatedAt(data: string) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    };
    if (hours < 1) {
      return  minutes ? `${minutes} minutes ago` : '-';
    }
    return hours ? `${hours} hrs ago`: '-';
  }

  /**
  * Retreive the chief complaints for the visit
  * @param {CustomVisitModel} visit - The visit
  * @return {string[]} - Chief complaints array
  */
  getCheifComplaint(visit: CustomVisitModel): string[] {
    let recent: string[] = [];
    const encounters = visit.encounters;
    encounters.forEach(encounter => {
      const display = encounter.type?.name;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.concept_id == 163212) {
            const currentComplaint = this.visitService.getData2(currentObs)?.value_text.replace(new RegExp('►', 'g'),'').split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

  /**
  * Returns the age in years from the birthdate
  * @param {string} birthdate - Date in string format
  * @return {number} - Age
  */
  calculateAge(birthdate: string): number {
    return moment().diff(birthdate,'years');
  }

  /**
  * Check how old the date is from now
  * @param {string} data - Date in string format
  * @return {string} - Returns how old the date is from now
  */
  checkIfDateOldThanOneDay(data: string) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY hh:mm A');
    };
    if (hours < 1) {
      return  minutes !== 0 ? `${minutes} minutes ago` : "-" ;
    }
    return hours ? `${hours} hrs ago` : '-';
  }

  /**
  * Returns the ecounter for a given encounter type
  * @param {CustomEncounterModel[]} encounters - Array of visit encounters
  * @return {CustomEncounterModel} - Ecounter for a given encounter type
  */
  checkIfEncounterExists(encounters: CustomEncounterModel[], encounterType: string) {
    return encounters.find((enc: CustomEncounterModel) => enc.type.name == encounterType);
  }

  /**
  * Get doctor speciality
  * @param {ProviderAttributeModel[]} attr - Array of provider attributes
  * @return {string} - Doctor speciality
  */
  getSpecialization(attr: ProviderAttributeModel[]): string {
    let specialization: string = '';
    attr.forEach((a: ProviderAttributeModel) => {
      if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

}
