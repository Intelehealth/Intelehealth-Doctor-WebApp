import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

type Root = {
  results: Array<{
    uuid: string;
    display: string;
    patient: {
      uuid: string;
      display: string;
      links: Array<{
        rel: string;
        uri: string;
        resourceAlias: string;
      }>;
    };
    visitType: {
      uuid: string;
      display: string;
      links: Array<{
        rel: string;
        uri: string;
        resourceAlias: string;
      }>;
    };
    indication: any;
    location: {
      uuid: string;
      display: string;
      links: Array<{
        rel: string;
        uri: string;
        resourceAlias: string;
      }>;
    };
    startDatetime: string;
    stopDatetime: any;
    encounters: Array<{
      uuid: string;
      display: string;
      encounterDatetime: string;
      patient: {
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
      };
      location?: {
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
      };
      form: any;
      encounterType: {
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
      };
      obs: Array<{
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
      }>;
      orders: Array<{
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
        type: string;
        voided?: boolean;
      }>;
      voided: boolean;
      visit: {
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
      };
      encounterProviders: Array<{
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
      }>;
      diagnoses: Array<any>;
      links: Array<{
        rel: string;
        uri: string;
        resourceAlias: string;
      }>;
      resourceVersion: string;
    }>;
    attributes: Array<{
      display: string;
      uuid: string;
      attributeType: {
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
      };
      value: string;
      voided: boolean;
      links: Array<{
        rel: string;
        uri: string;
        resourceAlias: string;
      }>;
      resourceVersion: string;
    }>;
    voided: boolean;
    auditInfo: {
      creator: {
        uuid: string;
        display: string;
        links: Array<{
          rel: string;
          uri: string;
          resourceAlias: string;
        }>;
      };
      dateCreated: string;
      changedBy: any;
      dateChanged: any;
    };
    links: Array<{
      rel: string;
      uri: string;
      resourceAlias: string;
    }>;
    resourceVersion: string;
  }>;
};

@Injectable({
  providedIn: "root",
})
export class VisitEncounterPatientOrderService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  private async fetchData(url: string): Promise<any> {
    try {
      const data = await this.http
        .get<any>(url)
        .pipe(
          catchError((error) => {
            console.error(`Fetch error: ${error}`);
            return of(null); // Return null if there's an error
          })
        )
        .toPromise();
      return data;
    } catch (error) {
      console.error(`Fetch error: ${error}`);
      return null;
    }
  }

  private async getProcessData(
    data: Root,
    visitId: string
  ): Promise<Record<string, any[]> | undefined> {
    const currentVisitData = data.results.filter(
      (item) => item.uuid === visitId
    );

    if (currentVisitData.length === 0) {
      console.log(`Visit with ID ${visitId} not found.`);
      return undefined;
    }

    const results: any[] = [];

    for (const visit of currentVisitData) {
      for (const encounter of visit.encounters) {
        for (const order of encounter.orders) {
          if (!order.voided) {
            const url = order.links.find((link) => link.rel === "self")?.uri;

            if (url) {
              const apiResponse = await this.fetchData(
                `${this.baseURL}/order/${order.uuid}`
              );
              results.push({
                ...order,
                apiResponse,
              });
            } else {
              results.push(order);
            }
          }
        }
      }
    }

    return results.reduce((acc: Record<string, any[]>, order) => {
      if (!acc[order.type]) {
        acc[order.type] = [];
      }
      acc[order.type].push(order);
      return acc;
    }, {});
  }

  public async fetchAndProcessData(
    patientId: string,
    visitId: string
  ): Promise<Record<string, any[]> | undefined> {
    const url = `${this.baseURL}/visit?patient=${patientId}&v=full`;
    const data: Root | null = await this.fetchData(url);
    if (data) {
      return await this.getProcessData(data, visitId);
    } else {
      return undefined;
    }
  }

  deleteOrder(uuid: string): Observable<any> {
    const url = `${this.baseURL}/order/${uuid}`;
    return this.http.delete(url);
  }
  getOrderTypeDisplay(arr: any[], uuid: any) {
    if (arr) {
      const order = arr.find((unit: { uuid: any; }) => unit.uuid === uuid);
      return order?.display ?? "";
    }
    return "";
  }

  getTestResultList(patientId: string): Observable<any> {
    const url = `${this.baseURL}/test-result/result/${patientId}`;
    return this.http.get(url);
  }
  getReferralList(patientId: string): Observable<any> {
    const url = `${this.baseURL}/referral/list/${patientId}`;
    return this.http.get(url);
  }
  getExternalAppointmentList(patientId: string): Observable<any> {
    const url = `${this.baseURL}/external-appointment/findAllByPatient/${patientId}`;
    return this.http.get(url);
  }
  getExternalAppointmentPractitionerList(locationId: string): Observable<any> {
    const url = `${this.baseURL}/external-appointment/practitioners?locationUUID=${locationId}`;
    return this.http.get(url);
  }

  postExternalAppointment(json): Observable<any> {
    const url = `${this.baseURL}/external-appointment/save`;
    return this.http.post(url, json);
  }
  getExternalAppointmentScheduleList(locationId: string, practitionerId: string): Observable<any> {
    const url = `${this.baseURL}/external-appointment/available/schedule?actor=${practitionerId}&locationUUID=${locationId}`;
    return this.http.get(url);
  }
  getExternalAppointmentSlotList(scheduleId: string, locationId: string, start:string): Observable<any> {
    const url = `${this.baseURL}/external-appointment/available/slot?status=free&schedule=${scheduleId}&locationUUID=${locationId}&start=${start}`;
    return this.http.get(url);
  }
  getReferralFacilityLocation(): Observable<any> {
    const url = `${this.baseURL}/location`;
    return this.http.get(url);
  }
}
