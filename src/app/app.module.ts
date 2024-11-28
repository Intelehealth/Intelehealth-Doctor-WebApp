import { BrowserModule } from "@angular/platform-browser";
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  CommonModule,
  APP_BASE_HREF,
  LocationStrategy,
  HashLocationStrategy,
  registerLocaleData,
} from "@angular/common";

import localeRu from '@angular/common/locales/ru';
import localeEn from '@angular/common/locales/en';

// Component Import
import { AppComponent } from "./app.component";
import { TestComponent } from "./test/test.component";
import { MainContainerComponent } from './main-container/main-container.component';

// Package Import
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from "@angular/common/http";
import { CookieService } from 'ngx-cookie-service';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { ToastrModule } from "ngx-toastr";
import {
  NgxUiLoaderModule,
  NgxUiLoaderConfig,
  SPINNER,
  POSITION,
  PB_DIRECTION,
  NgxUiLoaderHttpModule,
} from "ngx-ui-loader";
import { NgxPermissionsModule } from "ngx-permissions";

// Material Design Imports
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { CdkAccordionModule } from "@angular/cdk/accordion";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

//Regular Imports
import { environment } from "../environments/environment";
import { SocketService } from "./services/socket.service";
import { AppRoutingModule } from './app-routing.module';
import { NetworkInterceptor } from "./core/interceptors/network.interceptor";
import { ErrorInterceptor } from "./core/interceptors/error.interceptor";
import { ModalComponentsModule } from "./modal-components/modal-components.module";
import { SharedModule } from "./shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PwaService } from "./services/pwa.service";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { JwtInterceptor } from "./core/interceptors/jwt.interceptor";
import { getCacheData } from "./utils/utility-functions";
import { languages } from "src/config/constant";

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: "#2E1E91",
  bgsPosition: POSITION.bottomCenter,
  bgsSize: 40,
  bgsType: SPINNER.fadingCircle, // background spinner type
  fgsColor: "#FFFFFF", //#2E1E91
  fgsType: SPINNER.ballSpinClockwise, // foreground spinner type
  pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
  pbThickness: 3, // progress bar thickness
  text: getCacheData(false, languages.SELECTED_LANGUAGE) === 'ru' ? "Пожалуйста, подождите..." : "Please Wait..."
};

const initializer = (pwaService: PwaService) => () => pwaService.initPwaPrompt();

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

registerLocaleData(localeRu);
registerLocaleData(localeEn);

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    MainContainerComponent
  ],

  imports: [
    MatSidenavModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
      tapToDismiss: false
    }),
    ModalComponentsModule,
    CdkAccordionModule,
    MatTabsModule,
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    HttpClientModule,
    MatMenuModule,
    ServiceWorkerModule.register("/intelehealth/custom-service-worker.js", {
      enabled: environment.production,
      registrationStrategy: "registerImmediately",
    }),
    AppRoutingModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true,
      exclude: [
        'https://ekal.intelehealth.org:3004/api/messages/',
        'https://ekal.intelehealth.org:3004/api/support/',
        'https://ekal.intelehealth.org:3004/api/auth/validateProviderAttribute',
        'https://ekal.intelehealth.org:3000/api/getToken',
        'https://ekal.intelehealth.org/gen',
        'https://ekal.intelehealth.org/vl2',
        'https://ekal.intelehealth.org/bs',
        'https://ekal.intelehealth.org/vlrv',
        'https://ekal.intelehealth.org/lcrep'
      ]
    }),
    NgxPermissionsModule.forRoot({
      permissionsIsolate: false,
      rolesIsolate: false,
      configurationIsolate: false
    }),
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatBottomSheetModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    CookieService,
    SocketService,
    { provide: APP_BASE_HREF, useValue: "/" },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NetworkInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      deps: [PwaService],
      multi: true
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
