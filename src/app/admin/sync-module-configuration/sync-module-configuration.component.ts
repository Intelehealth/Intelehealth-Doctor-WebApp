import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SyncModuleConfigurationService } from "src/app/services/sync-module-configuration.service";
import { PageTitleService } from "../../core/page-title/page-title.service";

@Component({
  selector: 'app-sync-module-configuration',
  templateUrl: './sync-module-configuration.component.html',
  styleUrls: ['./sync-module-configuration.component.scss']
})
export class SyncModuleConfigurationComponent {

  modules=[];
  constructor(
    public dialog: MatDialog,
    private toastr: ToastrService,
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private syncModuleConfigurationService:SyncModuleConfigurationService
  ) {}

  ngOnInit(): void {
    this.pageTitleService.setTitle({
      title: "Sync module configuration",
      imgUrl: "assets/svgs/downloading.svg",
    });

    this.getAllSyncModule();
  }

  getAllSyncModule() {
    this.syncModuleConfigurationService.getList().subscribe({
      next: (res) => {
        if (res) {
          this.modules = res;
        } else {
        }
      },
      error: (err) => {
        this.toastr.error(`${this.translateService.instant('Failed to get list of modules')}`);
        console.error("Error fetching sync module list:", err);
      }
    })
  }

  updateModuleStatus(data: any) {
    const newData = {...data,status:!data.status}
    this.syncModuleConfigurationService.updateStatus(newData).subscribe({
      next: (res) => {
        if (res) {
          console.log(res);
          this.modules=this.modules.map((module: any) => {
            if (module.id == newData.id) {
              return res;
            }
            return module;
          })

        }
        this.toastr.success(`${this.translateService.instant('Status updated successfully')}`);
      },
      error: (err) => {
        this.toastr.error(`${this.translateService.instant('Failed to update status of modules')}`);
        console.error("Error updating sync module status:", err);
      }
    })
  }

}
