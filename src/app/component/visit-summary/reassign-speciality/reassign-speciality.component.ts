import { Component, OnInit, Inject, Input } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { FormGroup, FormControl } from "@angular/forms";
import { VisitService } from "src/app/services/visit.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { ConfirmDialogService } from "./confirm-dialog/confirm-dialog.service";
import { PushNotificationsService } from "src/app/services/push-notification.service";
import { EncounterService } from "src/app/services/encounter.service";
import { MatSnackBar } from "@angular/material/snack-bar";
declare var getFromStorage: any,
  saveToStorage: any;
@Component({
  selector: "app-reassign-speciality",
  templateUrl: "./reassign-speciality.component.html",
  styleUrls: ["./reassign-speciality.component.css"],
})
export class ReassignSpecialityComponent implements OnInit {
  @Input() isManagerRole : boolean;
  type = "N";
  patientDetails: any;
  visitUuid = this.route.snapshot.paramMap.get("visit_id");


  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/visit/${this.visitUuid}/attribute`;
  specializations = [
    "General Physician",
    "Dermatologist",
    "Physiotherapist",
    "Gynecologist",
    "Pediatrician",
    /** Namco */
    "Namco_Dermatology",
    "Namco_Physician",
    "Namco_Pediatrician",
    "Namco_Orthopaedic",
    "Namco_Gynecologist",
    "Namco_ENT",
    "Namco_General Surgeon",
  ];
  errorText: string;

  updateSpeciality = new FormGroup({
    specialization: new FormControl(""),
  });
  constructor(
    private visitService: VisitService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dialogService: ConfirmDialogService,
    private pushNotificationService: PushNotificationsService,
    private EncounterService: EncounterService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.visitService.getVisit(this.visitUuid).subscribe((visitDetails) => {
      this.patientDetails = visitDetails;
      this.updateSpeciality.controls.specialization.setValue(
        this.patientDetails.attributes[0].value
      );
    });
  }

  Submit() {
    const value = this.updateSpeciality.value;
    this.dialogService.openConfirmDialog("Are you sure to re-assign this visit to another doctor?")
      .afterClosed().subscribe(res => {
        if (res) {
          if (value.specialization !== null) {
            const URL = this.patientDetails.attributes[0].display
              ? `${this.baseURLProvider}/${this.patientDetails.attributes[0].uuid}`
              : this.baseURLProvider;
            const json = {
              attributeType: "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d",
              value: value.specialization,
            };
            this.http.post(URL, json).subscribe((response) => {
              this.router.navigate(["/home"]);
              this.snackbar.open(`Patient is reassigned to ${value.specialization} successfully.`, null, {
                duration: 4000,
              });
              //* Send Notification
              const myDate = new Date(Date.now() - 30000);
              const patientUuid = this.route.snapshot.paramMap.get("patient_id");

              const providerDetails = getFromStorage("provider");
              const attributes = providerDetails.attributes;
              const providerUuid = providerDetails.uuid;

              const json = {
                patient: patientUuid,
                encounterType: "8d5b27bc-c2cc-11de-8d13-0010c6dffd0f",
                encounterProviders: [
                  {
                    provider: providerUuid,
                    encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e04",
                  },
                ],
                visit: this.visitUuid,
                encounterDatetime: myDate,
              };
              this.EncounterService.postEncounter(json).subscribe((response) => {
                if (response) {
                  this.visitService
                    .fetchVisitDetails(this.visitUuid)
                    .subscribe((visitDetails) => {
                      saveToStorage("visitNoteProvider", visitDetails.encounters[0]);
                    });

                  attributes.forEach((element) => {
                    if (
                      element.attributeType.uuid ===
                      "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
                      !element.voided
                    ) {
                      const payload = {
                        speciality: value.specialization,
                        patient: {
                          name: response.patient.display,
                          provider: response.encounterProviders[0].display,
                        },
                        skipFlag: false,
                      };
                      this.pushNotificationService
                        .postNotification(payload)
                        .subscribe();
                    }
                  });
                }
              });

            });
          }
        }
      })
  }

}