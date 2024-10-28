import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { MenuConfig } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';


@Component({
  selector: 'app-menu-config',
  templateUrl: './menu-config.component.html',
  styleUrls: ['./menu-config.component.scss']
})
export class MenuConfigComponent {
  displayedColumns : string[] = ['id', 'name', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  menuData : MenuConfig[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getMenuConfig();
  }

  /**
  * Get Menu config.
  * @return {void}
  */
  getMenuConfig(): void {
    this.configService.getSidebarMenuConfig().subscribe(res=>{
      this.menuData = res.sidebar_menus;
      this.dataSource = new MatTableDataSource(this.menuData);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Update Menu config.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateSidebarMenuConfig(id, status).subscribe(res => {
      const name = this.menuData?.find((v: MenuConfig) => v.id === id)?.name;
      this.toastr.success(`${name} has been successfully updated`, "Update successful!");
      this.getMenuConfig();
    }, err => {
      this.getMenuConfig();
    });
  }

  /**
  * Publish Menu config changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success(`Changes published successfully!`, "Changes published!");
    });
  }
}
