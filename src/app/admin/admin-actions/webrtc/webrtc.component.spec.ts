import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebrtcComponent } from './webrtc.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { mockWebrtcResponse } from 'mocks/data/webrtc';

describe('WebrtcComponent', () => {
  let component: WebrtcComponent;
  let fixture: ComponentFixture<WebrtcComponent>;

  beforeEach(() => {    
    TestBed.configureTestingModule({
      declarations: [WebrtcComponent],
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
    fixture = TestBed.createComponent(WebrtcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call the getWebrtcs method', () => {
    expect(mockConfigService.getWebrtcs).toHaveBeenCalled();
    expect(component.webrtcData).toEqual(mockWebrtcResponse.webrtc)
    expect(component.webrtcData?.webrtc_section?.is_enabled).toEqual(true)
  });

  it('should call the updateStatus method', () => {
    mockWebrtcResponse.webrtc.webrtc[0].is_enabled = false;
    
    mockConfigService.getWebrtcs.and.returnValue(of(mockWebrtcResponse))
    mockConfigService.updateWebrtcEnabledStatus.and.returnValue(of({}))
    
    fixture.detectChanges();
    
    const toggleCheckbox = fixture.debugElement.query(By.css('.card-body .pretty.p-switch input[type="checkbox"]'));
   
    toggleCheckbox.triggerEventHandler('change', {
      "target": {
        'checked': false
      }
    })
    
    expect(toggleCheckbox).toBeDefined();
     
    expect(mockConfigService.updateWebrtcEnabledStatus).toHaveBeenCalled();
    expect(component.webrtcData?.webrtc?.[0]?.is_enabled).toEqual(false)
    expect(component.webrtcData).toEqual(mockWebrtcResponse.webrtc)
  });

  it('should call the updateFeatureStatus method', () => {
    
    mockWebrtcResponse.webrtc.webrtc_section.is_enabled = false; 
    mockConfigService.getWebrtcs.and.returnValue(of(mockWebrtcResponse))
    mockConfigService.updateFeatureEnabledStatus.and.returnValue(of({}))
    
    fixture.detectChanges();
    
    const toggleCheckbox = fixture.debugElement.query(By.css('.pretty.p-switch input[type="checkbox"]'));
    
    toggleCheckbox.triggerEventHandler('change', {
      "target": {
        'checked': false
      }
    })
    
    expect(toggleCheckbox).toBeDefined();
    
    expect(mockConfigService.updateFeatureEnabledStatus).toHaveBeenCalled();
    expect(component.webrtcData?.webrtc_section?.is_enabled).toEqual(false)
  });
});
