import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { HttpLoaderFactory } from '../../admin.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { mockTranslateService } from 'mocks/services/translate.service.mock';
import { mockPageTitleService } from 'mocks/services/page.service.mock';
import { configService as mockConfigService } from 'mocks/services/config.service.mock';
import { ConfigService } from 'src/app/services/config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockFeatureResponse } from 'mocks/data/webrtc';
import { AbhaComponent } from './abha.component';

describe('AbhaComponent', () => {
  let component: AbhaComponent;
  let fixture: ComponentFixture<AbhaComponent>;

  const featureResponse = mockFeatureResponse?.filter((v) => v.key == "abha_section");

  beforeEach(() => {
    mockConfigService.getFeatures.and.returnValue(of({ feature: featureResponse }));

    TestBed.configureTestingModule({
      declarations: [AbhaComponent],
      imports: [
        HttpClientTestingModule,
        MatPaginatorModule,
        BrowserAnimationsModule,
        MatTableModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        ToastrModule.forRoot({
          positionClass: 'toast-bottom-right',
          preventDuplicates: true,
          closeButton: true,
          tapToDismiss: false
        })
      ],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: PageTitleService, useValue: mockPageTitleService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AbhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call the getFeatures method', () => {
    expect(mockConfigService.getFeatures).toHaveBeenCalled();
    expect(component.abhaData).toEqual(featureResponse)
    expect(component.abhaData?.[0]?.is_enabled).toEqual(true)
  });

  it('should call the updateStatus method', () => {

    featureResponse[0].is_enabled = false;
    mockConfigService.getFeatures.and.returnValue(of({ feature: featureResponse }))
    mockConfigService.updateFeatureEnabledStatus.and.returnValue(of({}))

    fixture.detectChanges();

    const toggleCheckbox = fixture.debugElement.query(By.css('.card-body .pretty.p-switch input[type="checkbox"]'));

    toggleCheckbox.triggerEventHandler('change', {
      "target": {
        'checked': false
      }
    })

    expect(toggleCheckbox).toBeDefined();
    
    fixture.detectChanges();

    expect(mockConfigService.updateFeatureEnabledStatus).toHaveBeenCalled();
    expect(component.abhaData?.[0]?.is_enabled).toEqual(false)
    expect(component.abhaData).toEqual(featureResponse)
  });
});
