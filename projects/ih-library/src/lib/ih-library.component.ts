import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'lib-ih-library',
  templateUrl: './ih-library.component.html',
})
export class IhLibraryComponent implements OnInit {

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'ru']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit() {

  }
}
