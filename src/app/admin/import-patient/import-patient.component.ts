import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { PageTitleService } from "src/app/core/page-title/page-title.service";
import { ImportPatientService } from "./import-patient.service";

@Component({
  selector: "app-import-patient",
  templateUrl: "./import-patient.component.html",
  styleUrls: ["./import-patient.component.scss"],
})
export class ImportPatientComponent implements OnInit {
  searchMemberForm: FormGroup;
  searchPatientList: any[] = [];
  formFields = [
    {
      label: "Given Name",
      controlName: "given",
      placeholder: "Enter Given Name",
      type: "text",
    },
    {
      label: "Family Name",
      controlName: "family",
      placeholder: "Enter Family Name",
      type: "text",
    },
    {
      label: "Identifier",
      controlName: "identifier",
      placeholder: "Enter Identifier",
      type: "text",
    },
    {
      label: "Telecom",
      controlName: "telecom",
      placeholder: "Enter Telecom",
      type: "text",
    },
    {
      label: "Gender",
      controlName: "gender",
      placeholder: "Select Gender",
      type: "select",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
      ],
    },
  ];
  displayedColumns = [
    "id",
    "name",
    "identifier",
    "telecom",
    "birthDate",
    "gender",
    "action",
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private pageTitleService: PageTitleService,
    private importPatientService: ImportPatientService
  ) {
    this.searchMemberForm = this.fb.group({
      given: [""],
      family: [""],
      identifier: [""],
      telecom: [""],
      gender: [""],
    });
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle({
      title: "Import Patient",
      imgUrl: "assets/svgs/downloading.svg",
    });
  }

  get f() {
    return this.searchMemberForm.controls;
  }

  onSubmit() {
    if (this.searchMemberForm.valid) {
      this.importPatientService
        .searchPatient(this.searchMemberForm.value)
        .subscribe({
          next: (res) => {
            this.searchPatientList =
              (
                this.importPatientService.parseToJsonRecursive(res)?.data
                  ?.entry ?? []
              ).map((entry: any) => {
                const resource = entry?.resource ?? {};
                return {
                  id: resource.id,
                  name: `${resource?.name?.[0]?.given?.join(" ")} ${
                    resource?.name?.[0]?.family
                  }`,
                  identifier: resource?.identifier?.[0]?.value || "",
                  telecom: resource?.telecom?.[0]?.value || "",
                  gender: resource?.gender,
                  birthDate: resource?.birthDate,
                };
              }) ?? [];
          },
          error: (err) => {
            this.toastr.error("Search failed. Please try again.");
          },
        });
    }
  }

  // Submit handler
  importPatient(id): void {
    if (id) {
      this.importPatientService.importPatient(id).subscribe({
        next: () => {
          this.toastr.success("Patient imported successfully!");
        },
        error: () => {
          this.toastr.error("An error occurred while importing the patient!");
        },
      });
    }
  }
}
