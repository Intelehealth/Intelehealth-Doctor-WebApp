import { Injectable, Inject } from '@angular/core';
import { ENV_CONFIG } from '../config/config.token';

@Injectable({
  providedIn: 'root'
})
export class EnvConfigService {
  
  private config: any;

  constructor(@Inject(ENV_CONFIG) private envConfig: any) {
    this.config = envConfig;
    console.log("this.config",this.config)
    console.log("this.config",this.config.production)
  }

  // getConfig(key: string): any {
  //   return this.config?.[key] || null; // ✅ Retrieve the environment variable
  // }

  getConfig(key: string): any {
    if (this.config?.hasOwnProperty(key)) {
      return this.config[key];  // ✅ Directly return the value, even if it's `false`
    }
    return null;
  }
}
