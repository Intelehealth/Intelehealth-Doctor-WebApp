import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData, setCacheData } from '../utils/utility-functions';
import { languages } from 'src/config/constant';
import { DataItemModel, SlideModel } from '../model/model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

  slides: SlideModel[] = [
    {
      img_url: "assets/images/ekal1.jpg",
      title: "Deliver quality health care where there is no doctor",
      description: "",
      heartbeat1: "assets/images/login/right_red_heartbeat.png",
      heartbeat2: "assets/images/login/right_green_heartbeat.png"
    },
    {
      img_url: "assets/images/ekal2.png",
      title: "4,00,000 population covered from 1400 villages in 13 states",
      description: "",
      heartbeat1: "assets/images/login/right_green_heartbeat.png",
      heartbeat2: "assets/images/login/right_red_heartbeat.png"
    },
    {
      img_url: "assets/svgs/slide-3.svg",
      title: "Take online consultations and send prescriptions to the patients virtually",
      description: "",
      heartbeat1: "assets/images/login/right_red_heartbeat.png",
      heartbeat2: "assets/images/login/right_green_heartbeat.png"
    }
  ];

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

  constructor(public translate: TranslateService, public router: Router, public location: Location) { 
  }

  ngOnInit(): void {
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

}
