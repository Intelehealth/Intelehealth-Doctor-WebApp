import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { AppointmentLibraryComponent } from "./appointment-library.component";
import { AppointmentTableComponent } from "./appointment-table/appointment-table.component";

import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

// Material modules imports
import { MyLibraryMaterialModule } from "./material.module";

@NgModule({
  declarations: [AppointmentLibraryComponent, AppointmentTableComponent],
  imports: [MyLibraryMaterialModule, RouterModule, CommonModule],
  exports: [AppointmentLibraryComponent, AppointmentTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppointmentLibraryModule {}
