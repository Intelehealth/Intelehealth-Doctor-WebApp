import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-sub-sections',
  templateUrl: './sub-sections.component.html',
  styleUrls: ['./sub-sections.component.scss']
})
export class SubSectionsComponent {
  displayedColumns : string[] = ['id', 'name', 'is_enabled'];
  section_id: number;
  dataSource = new MatTableDataSource<any>();
  updateFlag = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<SubSectionsComponent>, private configService: ConfigService, private toastr: ToastrService) { 
    this.dataSource = new MatTableDataSource(data.sub_sections);
    this.section_id = data.id;
  }

  /**
  * Update Abha status.
  * @return {void}
  */
  updateStatus(sub_section: string, status: boolean): void {
    this.configService.updatePVSSEnabledStatus(this.section_id, sub_section, status).subscribe(res => {
      this.toastr.success(`${sub_section} has been successfully updated`, "Update successful!");
      this.updateFlag = true;
    });
  }

  close(): void {
    this.dialogRef.close(this.updateFlag);
  }
}
