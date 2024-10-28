import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { WebrtcDataModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.scss']
})
export class WebrtcComponent implements OnInit {
  displayedColumns : string[] = ['id', 'name', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  webrtcData : WebrtcDataModel;

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getWebrtcs();
  }

  /**
  * Get Webrtcs.
  * @return {void}
  */
  getWebrtcs(): void {
    this.configService.getWebrtcs().subscribe(res=>{
      this.webrtcData = res.webrtc;
      this.dataSource = new MatTableDataSource(this.webrtcData?.webrtc);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Update Webrtc status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateWebrtcEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Webrtc has been successfully updated", "Update successful!");
      this.getWebrtcs();
    }, err => {
      this.getWebrtcs();
    });
  }

  /**
  * Update Webrtc status.
  * @return {void}
  */
  updateFeatureStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Webrtc has been successfully updated", "Update successful!");
      this.getWebrtcs();
    }, err => {
      this.getWebrtcs();
    });
  }

  /**
  * Publish Webrtc changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Webrtc changes published successfully!", "Changes published!");
    });
  }
}
