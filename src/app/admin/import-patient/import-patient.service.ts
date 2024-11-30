import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors } from "@angular/forms";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ImportPatientService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) {}

  objectToQueryString(
    params: Record<string, string | number | boolean | undefined | null>
  ): string {
    const queryString = Object.keys(params)
      .filter(
        (key) =>
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
      ) // Filter out empty, undefined, or null values
      .map((key) => {
        const value = encodeURIComponent(params[key]!.toString());
        return `${encodeURIComponent(key)}=${value}`;
      })
      .join("&");

    return `?${queryString}`;
  }

  parseToJsonRecursive(input: any): any {
    try {
      if (typeof input === "string") {
        try {
          input = JSON.parse(input);
        } catch {
          return input; // Return the original string if parsing fails
        }
      }

      if (typeof input === "object" && input !== null) {
        Object.keys(input).forEach((key) => {
          input[key] = this.parseToJsonRecursive(input[key]);
        });
      }

      return input;
    } catch (error) {
      console.error("Parsing error:", error);
      return null;
    }
  }

  searchPatient(data): Observable<any> {
    return this.http.get(
      `${this.baseURL}/member/Patient${this.objectToQueryString(data)}`
    );
  }

  importPatient(
    patientId: any,
    locationId: string = "513f5ae0-29c5-4b7d-990d-dd73eb571e76"
  ): Observable<any> {
    return this.http.get(
      `${this.baseURL}/member/import/${patientId}/${locationId}`
    );
  }

  // Custom validator to validate UUID format
  uuidValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (control.value && !uuidRegex.test(control.value)) {
        return { invalidUuid: true };
      }
      return null;
    };
  }
}
