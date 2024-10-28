import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { FeatureModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-abha',
  templateUrl: './abha.component.html',
  styleUrls: ['./abha.component.scss']
})
export class AbhaComponent implements OnInit {
  displayedColumns : string[] = ['id', 'name', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  abhaData : FeatureModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getAbhas();
  }

  /**
  * Get Abhas.
  * @return {void}
  */
  getAbhas(): void {
    this.configService.getFeatures().subscribe(res=>{
      this.abhaData = res.feature?.filter((v: FeatureModel) => v.key === 'abha_section');
      this.dataSource = new MatTableDataSource(this.abhaData);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Update Abha status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(res => {
      const name = this.abhaData?.find((v: FeatureModel) => v.id === id)?.name;
      this.toastr.success(`${name} has been successfully updated`, "Update successful!");
      this.getAbhas();
    }, err => {
      this.getAbhas();
    });
  }

  /**
  * Publish Abha changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      const name = this.abhaData?.find((v: FeatureModel) => v.key === 'abha_section')?.name;
      this.toastr.success(`${name} changes published successfully!`, "Changes published!");
    });
  }
}
