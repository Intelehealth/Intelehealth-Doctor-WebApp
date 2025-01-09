import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { IhLibraryComponent } from './ih-library.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { CommonModule } from '@angular/common';
import { IhLibraryMaterialModule } from './material.module'; // Material modules imports
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [
    IhLibraryComponent,
    AppointmentsComponent
  ],
  imports: [
    IhLibraryMaterialModule,
    RouterModule,
    CommonModule
  ],
  exports: [
    IhLibraryComponent,
    AppointmentsComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class IhLibraryModule { }
