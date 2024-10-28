import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData, setCacheData } from '../utils/utility-functions';
import { languages } from 'src/config/constant';
import { DataItemModel, SlideModel } from '../model/model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppConfigService } from '../services/app-config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {
  logoImageURL: string;
  configPublicUrl = environment.configPublicURL;
  slides: SlideModel[] = [];

  selectedLanguage: string = 'en';
  languages: DataItemModel[] = [
    {
      id: 1,
      name: 'English',
      code: 'en'
    },
    {
      id: 2,
      name: 'Russian',
      code: 'ru'
    }
  ];

  constructor(public translate: TranslateService, public router: Router, public location: Location, private appConfigService: AppConfigService) { 
  }

  ngOnInit(): void {
    this.logoImageURL = this.appConfigService.theme_config.find(obj=>obj.key==='logo')?.value;
    this.getSlideImages();
    if(getCacheData(false, languages.SELECTED_LANGUAGE)) {
      this.selectedLanguage = getCacheData(false, languages.SELECTED_LANGUAGE);
    }
  }

  /**
  * Callback for language changed event
  * @return {void}
  */
  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    setCacheData( languages.SELECTED_LANGUAGE, this.selectedLanguage);
    window.location.reload();
  }

  getSlideImages(){
    let imagesList = this.appConfigService.theme_config.find(obj=>obj.key==='images_with_text')?.value;
    if(imagesList && imagesList.length){
      imagesList.forEach(element => {
        this.slides.push(
          {
              img_url: this.configPublicUrl + element.image,
              title: element.text,
              description: "",
              heartbeat1: "assets/images/login/right_red_heartbeat.png",
              heartbeat2: "assets/images/login/right_green_heartbeat.png"
          }
        );
      });
    }
  }

}
