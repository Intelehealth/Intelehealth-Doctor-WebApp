import { Inject, Injectable, Optional } from '@angular/core';
import { ENV_CONFIG } from '../config/config.token';

@Injectable({
  providedIn: 'root',
})
export class EnvConfigService {
  constructor(@Optional() @Inject(ENV_CONFIG) private config: any) {}

  getConfig(key: string): string {
    return this.config?.[key] || '';
  }
}
