import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PwaPromptComponent } from '../modal-components/pwa-prompt/pwa-prompt.component';
import { Router } from '@angular/router';
declare const $: any;

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  private promptEvent;

  constructor(private platform: Platform, private bottomSheet: MatBottomSheet, private router: Router) { }

  /**
  * Init PWA prompt
  * @return {void}
  */
  public initPwaPrompt() {
    if (this.platform.ANDROID || this.platform.isBrowser) {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.promptEvent = event;
        this.openPromptComponent('android');
      });
    }
    if (this.platform.IOS) {
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator['standalone']);
      if (!isInStandaloneMode) {
        this.openPromptComponent('ios');
      }
    }
  }

  /**
  * Open PWA promp bottom shit
  * @param {string} mobileType - Mobile type ios/android
  * @return {void}
  */
  private openPromptComponent(mobileType: 'ios' | 'android') {
    timer(3000)
      .pipe(take(1))
      .subscribe(() => {
        if (!(this.router.url.includes('/i/') || this.router.url.includes('/verify-otp'))) {
          const activeElement = document.activeElement;
          if (!activeElement.id) {
            activeElement.setAttribute('id', 'XXX');
          }
          const matBottomSheet = this.bottomSheet.open(PwaPromptComponent, { hasBackdrop: false, restoreFocus: true, data: { mobileType, promptEvent: this.promptEvent } });
          matBottomSheet.afterOpened().subscribe(res => {
            document.getElementById(activeElement.id)?.focus();
            if (activeElement.id === 'XXX') {
              activeElement.removeAttribute('id');
            }
          });
        }
      });
  }
}
