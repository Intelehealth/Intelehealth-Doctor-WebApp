import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ListTicketsComponent } from './list-tickets.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../help-and-support.module';
import { HttpClient } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { PagerdutyService } from 'src/app/services/pagerduty.service';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { mockTranslateService } from 'mocks/services/translate.service.mock';
import { mockPageTitleService } from 'mocks/services/page.service.mock';
import { pagerdutyService as mockPagerdutyService} from 'mocks/services/pagerduty.service.mock';
import { mockPagerdutyList, mockPagerdutyObject } from 'mocks/data/pagerduty';
import { SharedModule } from 'src/app/shared.module';
import { CommonModule } from '@angular/common';
import { CoreService } from 'src/app/services/core/core.service';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListTicketsComponent } from './list-tickets.component';

describe('ListTicketsComponent', () => {
  let component: ListTicketsComponent;
  let fixture: ComponentFixture<ListTicketsComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ListTicketsComponent],
      imports: [
        CommonModule,
        HttpClientTestingModule,
        MatPaginatorModule,
        BrowserAnimationsModule,
        MatTableModule,
        SharedModule,
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
        }),
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: PagerdutyService, useValue: mockPagerdutyService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: PageTitleService, useValue: mockPageTitleService },
        CoreService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ListTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should call the getTickets method', () => {
    expect(mockPagerdutyService.getAllTickets).toHaveBeenCalled();
    expect(component.ticketData).toEqual(mockPagerdutyList.tickets);
  });
});
