import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { DoctorSpecialityModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-doctor-speciality',
  templateUrl: './doctor-speciality.component.html',
  styleUrls: ['./doctor-speciality.component.scss']
})
export class DoctorSpecialityComponent implements OnInit {
  displayedColumns : string[] = ['id', 'name', 'doctor_count', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  specialityData : DoctorSpecialityModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getDoctorSpecialities();
  }

  /**
  * Get doctor specialities.
  * @return {void}
  */
  getDoctorSpecialities(): void {
    this.configService.getDoctorSpecialities().subscribe(res=>{
      this.specialityData = res.specializations;
      this.dataSource = new MatTableDataSource(this.specialityData);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Update speciality status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateSpecialityStatus(id, status).subscribe(res => {
      this.toastr.success("Doctor Speciality has been successfully updated", "Update successful!");
      this.getDoctorSpecialities();
    }, err => {
      this.getDoctorSpecialities();
    });
  }

  /**
  * Publish doctor speciality changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Doctor Speciality changes published successfully!", "Changes published!");
    });
  }
}
