import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from './services/app-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  primaryColor: string = '#2E1E91';
  secondaryColor: string = '#1B163A';

  constructor(public translate: TranslateService, private appConfigService: AppConfigService) {
    translate.addLangs(['en', 'ru']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit() {
    this.primaryColor = this.appConfigService.theme_config.find(obj=>obj.key==='primary_color')?.value;
    this.secondaryColor = this.appConfigService.theme_config.find(obj=>obj.key==='secondary_color')?.value;
    document.documentElement.style.setProperty('--color-darkBlue',  this.primaryColor);
    document.documentElement.style.setProperty('--color-secondary',  this.secondaryColor);
  }

}
