import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { id } from "date-fns/locale";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class videoLibraryService {
  private baseURL = environment.mindmapURL;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<any> {
    const url = `${this.baseURL}/video-library/getAllCategories`;
    return this.http.get(url);
  }

  deleteCategory(id: any): Observable<any> {
    const url = `${this.baseURL}/video-library/deleteCategory/${id}`;
    return this.http.delete(url);
  }

  creatCategory(payload): Observable<any> {
    const url = `${this.baseURL}/video-library/createCategory`;
    return this.http.post(url, payload);
  }

  updateCategory(payload, id): Observable<any> {
    const url = `${this.baseURL}/video-library/updateCategory/${id}`;
    return this.http.patch(url, payload);
  }

  getvideosByCategoryId(id): Observable<any> {
    const url = `${this.baseURL}/video-library/getVideosByCategoryId/${id}`;
    return this.http.get(url);
  }

  deleteVideo(id: any): Observable<any> {
    const url = `${this.baseURL}/video-library/deleteVideo/${id}`;
    return this.http.delete(url);
  }

  creatVideo(payload): Observable<any> {
    const url = `${this.baseURL}/video-library/createVideo`;
    return this.http.post(url, payload);
  }

  updateVideo(payload, id): Observable<any> {
    const url = `${this.baseURL}/video-library/updateVideo/${id}`;
    return this.http.patch(url, payload);
  }
}
