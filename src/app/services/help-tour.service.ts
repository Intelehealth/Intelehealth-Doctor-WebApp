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
  constructor(
    private appConfigSvc: AppConfigService
  ) { }

  initHelpTour(steps: TourStep[] | null= this.appConfigSvc.tourConfig) {
    if(this.tourIsActive || !steps || Array.isArray(steps) && steps.length === 0) return;

    this.tourIsActive = true;
    const tour = new TourGuideClient({
      steps,
      showStepProgress: false,
      debug: false,
      dialogZ: 1100,
      dialogWidth: 300,
      backdropClass: 'help-tour-backdrop',
      exitOnClickOutside: false,
      showStepDots: false,
      progressBar:'#0FD197',
      targetPadding: 0,
      autoScrollOffset: 30,
      autoScrollSmooth: false,
    });

    tour.onAfterExit(()=>{
      this.tourIsActive = false;
      document.querySelector('.help-tour-backdrop')?.remove?.();
      document.querySelector('.tg-dialog')?.remove?.();
    });

    setTimeout(() => {
      tour.start();
    }, 0);

    return tour;
  };
}
