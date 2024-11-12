import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportGeneratorComponent implements OnInit {

  reportForm: FormGroup;
  submitted: boolean = false;
  today = new Date().toISOString().slice(0, 10);
  specializations = ["General Physician", "Specialist doctor not needed"];
  states: any = [];
  districts: any = [];
  sanchs: any = [];
  villages: any = [];
  isDisabled: Boolean = false;
  isShow: Boolean = false;
  isDistrict: Boolean = false;
  isSanch: Boolean = false;
  isVillage: Boolean = false;
  selectedState: any;
  selectedDistrict: any;
  selectedSanch: any;
  selectedVillage: any;
  selectedSpeciality: string

  /* For State DropDown */
  stateDropDownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: "districts",
    textField: "name",
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true,
  };

  /* For District DropDown */
  districtDropDownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: "sanchs",
    textField: "name",
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true,
  };

  /* For Sanch DropDown */
  sanchDropDownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: "villages",
    textField: "name",
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true,
  };

  /* For Village DropDown */
  villageDropDownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: "id",
    textField: "name",
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true,
  };


  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ReportGeneratorComponent>,
    private visitService: VisitService) {
    this.reportForm = new FormGroup({
      field1: new FormControl('', [Validators.required]),
      field2: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.visitService.getLocations().subscribe((res: any) => {
      this.states = res.states;
    });
  }

  onStateSelect(state: any) {
    if (state?.districts?.length) {
      this.districts = state.districts;
      this.isDistrict = true;
    }
  }

  onDistrictSelect(district: any) {
    if (district?.sanchs?.length) {
      this.sanchs = district.sanchs;
      this.isSanch = true;
    }
  }

  onSanchSelect(sanch: any) {
    if (sanch?.villages?.length) {
      this.villages = sanch.villages;
      this.isVillage = true;
    }
  }

  onItemDeSelect(event, type) {
    switch (type) {
      case 'state':
        this.selectedDistrict = '';
        this.selectedSanch = '';
        this.selectedVillage = '';
        this.districts = [];
        this.sanchs = [];
        this.villages = [];
        break;
      case 'district':
        this.selectedSanch = '';
        this.selectedVillage = '';
        this.sanchs = [];
        this.villages = [];
        break;
      case 'sanch':
        this.selectedVillage = '';
        this.villages = [];
        break;
    }
  }

  get f() { return this.reportForm.controls; }

  get isDatesValid() {
    return new Date(this.reportForm.value.field1).getTime() > new Date(this.reportForm.value.field2).getTime();
  }

  /**
  * Close modal
  * @return {void}
  */
  close() {
    this.dialogRef.close();
  }

  /**
* generate Report
* @return {void}
*/
  generateReport() {
    this.submitted = true;
    let filter = {
      stateId: this.selectedState?.length > 0 ? this.returnId(this.selectedState[0]?.name, "state") : "-",
      districtId: this.selectedDistrict?.length > 0 ? this.returnId(this.selectedDistrict[0]?.name, "district") : '-',
      sanchId: this.selectedSanch?.length > 0 ? this.returnId(this.selectedSanch[0]?.name, "sanchs") : '-',
      villageId: this.selectedVillage?.length > 0 ? this.selectedVillage[0]?.id : '-',
      speciality: this.selectedSpeciality ? this.selectedSpeciality[0] : '-'
    }
    this.reportForm['filter'] = filter;
    if (this.reportForm.invalid) {
      return;
    }
    this.dialogRef.close(this.reportForm);
  }


  returnId(selectedItem, type) {
    let data;
    if (type === "state") {
      data = this.states
    } else if (type === "district") {
      data = this.districts
    } else if (type === "sanchs") {
      data = this.sanchs;
    }
    let item = data?.filter((item: any) => item.name === selectedItem);
    return item[0].id;
  }
}