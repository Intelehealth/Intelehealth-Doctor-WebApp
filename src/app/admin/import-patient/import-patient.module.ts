import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ImportPatientComponent } from './import-patient.component';


const routes: Routes = [
  { path: "", component: ImportPatientComponent },
];
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [ImportPatientComponent],
  imports: [
    RouterModule.forChild(routes),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    MatButtonToggleModule,
    MatNativeDateModule,
    NgSelectModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatCheckboxModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatGridListModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatTableModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
  ],
  exports: [RouterModule, ],
})
export class ImportPatientModule { }
