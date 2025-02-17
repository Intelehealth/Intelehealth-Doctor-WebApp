import { NgModule } from '@angular/core';
import { LibPresciptionComponent } from './lib-presciption.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from "@angular/common/http";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";

// ✅ Define the function BEFORE using it
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LibPresciptionComponent  
  ],
  exports: [
    LibPresciptionComponent
  ]
})
export class LibPresciptionModule { }
