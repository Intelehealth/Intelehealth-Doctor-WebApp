import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../core/page-title/page-title.service';
import { getCacheData } from '../../utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  active: number = 1;
  
  constructor(private pageTitleService: PageTitleService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Report", imgUrl: "assets/svgs/menu-treatment-circle.svg" });
  }
}
