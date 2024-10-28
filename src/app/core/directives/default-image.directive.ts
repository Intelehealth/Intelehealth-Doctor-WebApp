import { Directive, Input } from '@angular/core';
import { error } from 'console';

@Directive({
  selector: 'img[src]',
  host: {
    '[src]': 'checkPath(src)',
    '(error)': 'onError()'
  }
})
export class DefaultImageDirective {
  @Input() src: string;
  public defaultImg: string = 'assets/svgs/user.svg';

  public onError() {
    if(this.src.includes('openmrs'))
      this.src = this.defaultImg;
  }

  public checkPath(src: string) {
    return src || this.defaultImg;
  }
}
