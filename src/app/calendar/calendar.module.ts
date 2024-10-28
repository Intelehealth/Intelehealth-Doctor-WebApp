import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarComponent } from './calendar.component';
import { SetupCalendarComponent } from './setup-calendar/setup-calendar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule as MwlCalenderModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [
    CalendarComponent,
    SetupCalendarComponent
  ],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    MatIconModule,
    MatButtonModule,
    NgSelectModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MwlCalenderModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MatTabsModule,
    SharedModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class CalendarModule { }
