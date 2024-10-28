import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages, doctorDetails } from 'src/config/constant';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent implements OnInit {

  doctorName = '';
  greetingMsg = 'Hi';
  pc = true;
  sc = true;
  constructor(
    private pageTitleService: PageTitleService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    this.doctorName = getCacheData(false, doctorDetails.DOCTOR_NAME);
    const now = new Date();
    const hrs = now.getHours();
    if (hrs < 12) {
      this.greetingMsg = 'Good Morning';
    } else if (hrs >= 12 && hrs <= 17) {
      this.greetingMsg = 'Good Afternoon';
    } else if (hrs >= 17 && hrs <= 24) {
      this.greetingMsg = 'Good Evening';
    }


    if (this.route.snapshot.queryParamMap.get('pc') != null) {
      this.pc = !JSON.parse(this.route.snapshot.queryParamMap.get('pc'));
    }
    if (this.route.snapshot.queryParamMap.get('sc') != null) {
      this.sc = !JSON.parse(this.route.snapshot.queryParamMap.get('sc'));
    }

    if (this.route.snapshot.queryParamMap.get('pc') == null && this.route.snapshot.queryParamMap.get('sc') == null) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
  * Redirect to profile screen
  * @return {void}
  */
  setupProfile() {
    this.router.navigate(['/dashboard/profile']);
  }

  /**
  * Redirect to setup calendar screen
  * @return {void}
  */
  setupCalendar() {
    this.router.navigate(['/calendar/setup-calendar']);
  }

}
