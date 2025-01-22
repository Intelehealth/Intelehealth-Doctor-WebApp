import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../core/page-title/page-title.service';
import { getCacheData } from '../utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-help-and-support',
  templateUrl: './help-and-support.component.html',
  styleUrls: ['./help-and-support.component.scss']
})
export class HelpAndSupportComponent implements OnInit {

  panelOpenState = false;

  constructor(private pageTitleService: PageTitleService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Tech Support Chat", imgUrl: "assets/svgs/menu-info-circle.svg" });
  }

}
