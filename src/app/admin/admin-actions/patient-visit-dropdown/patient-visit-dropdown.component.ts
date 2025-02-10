import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { PageTitleService } from "src/app/core/page-title/page-title.service";
import { ConfigService } from "src/app/services/config.service";
import { compare, getCacheData } from "src/app/utils/utility-functions";
import { languages } from "src/config/constant";
import { MatSort } from "@angular/material/sort";
import { PatientVisitDropdownFieldsModel } from "src/app/model/model";
import * as moment from "moment";

@Component({
  selector: 'app-patient-visit-dropdown',
  templateUrl: './patient-visit-dropdown.component.html',
  styleUrls: ['./patient-visit-dropdown.component.scss']
})
export class PatientVisitDropdownComponent {
   displayedColumns : string[] = ['id', 'name', 'updatedAt','is_enabled'];
    tabList = ['Advice','Diagnosis', 'Medication','Refer Specialisation','Referral Facility','Test'];
    currentTabIndex = 0; 
    dataSource = new MatTableDataSource<any>();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    patientFieldsData: any;
    sortedData: PatientVisitDropdownFieldsModel[];
    selectedSort: any;
    sortOptions = [{colName:"name",label:"Name"},{colName:"updatedAt",label:"Last Updated"}, ];
    sectionEnabled: boolean = false;
    allSectionData: any = {};   
    tableData = [];

    constructor(
      private pageTitleService: PageTitleService,
      private translateService: TranslateService,
      private configService: ConfigService,
      private toastr: ToastrService
    ) { }
  
    ngOnInit(): void {
      this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
      this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    }
  
    ngAfterViewInit(){
      this.getAllDropdownFeilds();
    }
  
    onTabChange(tabIndex){
      this.currentTabIndex = tabIndex;
      this.paginator.pageIndex = 0;
      this.sort.sort({id: '', start: 'asc', disableClear: false});
      this.sortDataAndUpdate();
    }
  
    /**
     * Get patient visit dropdown fields.
     * @return {void}
     */

    getAllDropdownFeilds():void {
      this.configService.getPatientVisitDropdownFields().subscribe(res=>{
        // console.log("dropdown resposne",res.dropdown)
        this.patientFieldsData = res.dropdown
         this.allSectionData['advice'] = res.dropdown.advice;
        //  this.allSectionData['advice'] = { id:0 , is_enabled:true };
        this.allSectionData['diagnosis'] = res.dropdown.diagnosis;
        this.allSectionData['medication'] = res.dropdown.medication;
        this.allSectionData['refer specialisation'] = res.dropdown['refer specialisation'];
        this.allSectionData['referral facility'] = res.dropdown['referral facility'];
        this.allSectionData['test'] = res.dropdown.test;
          this.sortDataAndUpdate();
      },err=>{
        console.error("Error fetching dropdown fields", err);
      })
    }
  
    /**
     * Update Field status.
     * @return {void}
     */
    updateStatus(id: number, status: boolean): void {
      this.configService.updatePatientVisitDropdown(id, status).subscribe(res => {
        this.toastr.success("Patient visit dropdown has been successfully updated","Update successful!");
          this.getAllDropdownFeilds();
      }, err => {
          this.getAllDropdownFeilds();
      });
    }
  
    /**
     * Publish langauge changes.
     * @return {void}
     */
    onPublish(): void {
      this.configService.publishConfig().subscribe(res => {
        this.toastr.success("Patient visit dropdown changes published successfully!", "Changes published!");
      });
    }
  
    sortDataAndUpdate(sortOption = null){
      this.sortData(sortOption);
      this.dataSource = new MatTableDataSource(this.sortedData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  

  sortData(sortOption) {
  const currTabName = this.tabList[this.currentTabIndex].toLocaleLowerCase();
  console.log("Current tab:", currTabName);

  const data = this.patientFieldsData[currTabName]?.slice() || [];

  if (!sortOption) {
    this.sortedData = data;
    this.sortOptions.forEach(e => e['direction'] = null);
    return;
  } else {
    this.sortOptions.forEach(e => {
      if (sortOption.colName !== e.colName) e['direction'] = null;
    });
  }

  switch (sortOption.direction) {
    case 'asc':
      sortOption['direction'] = 'desc';
      break;
    case 'desc':
      sortOption['direction'] = null;
      this.sortedData = data;
      return;
    default:
      sortOption['direction'] = 'asc';
      break;
  }

  this.sortedData = data.sort((a, b) => {
    const isAsc = sortOption.direction === 'asc';
    switch (sortOption.colName) {
      case 'name':
        return compare(a.name, b.name, isAsc);
      case 'updatedAt':
        return compare(moment(a.updatedAt).unix(), moment(b.updatedAt).unix(), isAsc);
      default:
        return 0;
    }
  });
}
  
}
