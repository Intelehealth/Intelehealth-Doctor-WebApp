import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { PageTitleService } from "../../core/page-title/page-title.service";
import { FacilityModuleConfigurationService } from "../../services/facility-module-configuration.service";
import { AddFacilityDialogComponent } from "./add-facility-dialog/add-facility-dialog.component";

@Component({
  selector: "facility-configuration",
  templateUrl: "./facility-configuration.component.html",
  styleUrls: ["./facility-configuration.component.scss"],
})
export class FacilityConfigurationComponent {
  modules = [];

  constructor(
    public dialog: MatDialog,
    private toastr: ToastrService,
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private facilityModuleConfigurationService: FacilityModuleConfigurationService
  ) {}

  ngOnInit(): void {
    this.pageTitleService.setTitle({
      title: "Facility module configuration",
      imgUrl: "assets/svgs/downloading.svg",
    });

    this.getFacilityConfigurationModule();
  }

  openAddFacilityDialog(): void {
    const dialogRef = this.dialog.open(AddFacilityDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getFacilityConfigurationModule();
      }
    });
  }

  openEditFacilityDialog(module: any): void {
    const dialogRef = this.dialog.open(AddFacilityDialogComponent, {
      width: '400px',
      data: module,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getFacilityConfigurationModule();
      }
    });
  }

  getFacilityConfigurationModule() {
    this.facilityModuleConfigurationService
      .getFacilityConfigurationList()
      .subscribe({
        next: (res) => {
          this.modules = res;
        },
        error: (err) => {
          this.toastr.error(
            `${this.translateService.instant("Failed to get list of modules")}`
          );
          console.error("Error fetching sync module list:", err);
        },
      });
  }
}
