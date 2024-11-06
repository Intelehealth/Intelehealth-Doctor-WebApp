import { Injectable } from '@angular/core';
import { TourGuideClient } from '@sjmc11/tourguidejs';
import { AppConfigService } from './app-config.service';

export interface TourStep {
  content: string;
  title?: string;
  target?: HTMLElement | Element | HTMLInputElement | string;
  order?: number;
  group?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HelpTourService {
  tourIsActive = false;
  public tour: TourGuideClient | null = null;
  constructor(
    private appConfigSvc: AppConfigService
  ) { }

  initHelpTour(steps: TourStep[] | null= this.appConfigSvc.tourConfig) {
    if(this.tourIsActive || !steps || Array.isArray(steps) && steps.length === 0) return;

    this.tourIsActive = true;
    this.tour = new TourGuideClient({
      steps,
      showStepProgress: false,
      debug: false,
      dialogZ: 1100,
      dialogWidth: 300,
      dialogClass: 'help-tour-dialog',
      backdropClass: 'help-tour-backdrop',
      exitOnClickOutside: false,
      showStepDots: false,
      progressBar:'#0FD197',
      targetPadding: 0,
      autoScrollOffset: 30,
      autoScrollSmooth: false,
    });

    this.tour.onAfterExit(()=>{
      this.tourIsActive = false;
      document.querySelector('.help-tour-backdrop')?.remove?.();
      document.querySelector('.tg-dialog')?.remove?.();
    });

    this.tour.onAfterStepChange(()=>{
      const btn = document.getElementById('tg-dialog-next-btn')
      if(btn){
        btn?.textContent?.trim?.() === 'Finish' ? btn.classList.add('btn-finish') : btn.classList.remove('btn-finish');
      }
    });

    setTimeout(() => {
      this.tour.start();
    }, 0);

    return this.tour;
  };

  closeTour(){
    this.tour?.exit();
  }
}
