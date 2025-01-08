import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { getCacheData } from '../utils/utility-functions';
import { languages } from 'src/config/constant';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private translateService: TranslateService,
    private toastr: ToastrService,) { }

  /**
  * Get translation
  * @param {string} msg1 - Message 1
  * @param {string} msg2 - Message 2
  * @param {boolean} flag - true for success and false for error
  * @return {string} -Translated value
  */
  getTranslation(msg1: string, msg2: string, flag: boolean) {
    if (flag) {
      this.toastr.success(this.translateService.instant(msg1), this.translateService.instant(msg2));
    } else {
      this.toastr.error(this.translateService.instant(msg1), this.translateService.instant(msg2));
    }
  }

  /**
  * Get selected language
  * @return {string} -Selected language
  */
  getSelectedLanguage() {
    return this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
  }

  /**
  * Get dropdown translations
  * @param {string} element - Dropdown element
  * @param {string} elementName - Element name
  * @return {string} -Translated value
  */
  getDropdownTranslation(element: string, elementName: string) {
    return this.translateService.instant(`${element}.${elementName}`);
  }
}
