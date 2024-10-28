import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { catchError, map, mergeMap } from "rxjs/operators";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { NgxPermissionsService, NgxRolesService } from "ngx-permissions";
import examples from 'libphonenumber-js/examples.mobile.json';
import { CountryCode, AsYouType, getExampleNumber } from "libphonenumber-js";
import { deleteCacheData, getCacheData, setCacheData } from "../utils/utility-functions";
import { doctorDetails } from "src/config/constant";
import { AuthGatewayLoginResponseModel, LoginResponseModel, PrivilegesModel, RequestOtpModel, RolesModel, VerifyOtpModel } from "../model/model";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  private gatewayURL = environment.authGatwayURL.replace('/v2', '');
  private baseUrl = environment.baseURL;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private base64Cred: string;
  private mindmapUrl: string = environment.mindmapURL;
  private notificationUrl: string = environment.notificationURL;
  public rememberMe: boolean = false;

  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
    private router: Router,
    private rolesService: NgxRolesService,
    private permissionsService: NgxPermissionsService
  ) {
    let locStorageUser = getCacheData(true,'currentUser');
    this.currentUserSubject = new BehaviorSubject<any>(getCacheData(true,'currentUser'));
    this.currentUser = this.currentUserSubject.asObservable();
    if (locStorageUser) {
      this.permissionsService.loadPermissions(this.extractPermissions(locStorageUser.user.privileges));
      this.rolesService.addRoles(this.extractRolesAndPermissions(locStorageUser.user.privileges, locStorageUser.user.roles));
    }
    this.base64Cred = getCacheData(false,'xsddsdass');
  }
  public fingerPrint;

  /**
  * Get device fingerprint
  * @return {void}
  */
  getFingerPrint(): void {
    (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      this.fingerPrint = result.visitorId;
    })();
  }

  /**
  * Getter for current user from currentUser behaviour subject
  * @return {any} - Current user value
  */
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /**
  * Login
  * @param {string} credBase64 - Base64 encoded credential(username and password)
  * @return {Observable<any>}
  */
  login(credBase64: string): Observable<any> {
    this.base64Cred = credBase64;
    setCacheData('xsddsdass', credBase64);
    this.cookieService.deleteAll();
    return this.http.delete(`${this.baseUrl}/session`).pipe(
      catchError((err) => throwError(err)),
      map(res => res),
      mergeMap((item) => {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Authorization', 'Basic ' + credBase64);
        return this.http.get(`${this.baseUrl}/session`, { headers }).pipe(
          map((user: LoginResponseModel) => {
            if (user.authenticated) {
              user.verified = false;
              setCacheData('currentUser', JSON.stringify(user));
              setCacheData(doctorDetails.USER, JSON.stringify(user.user));
              this.permissionsService.loadPermissions(this.extractPermissions(user.user.privileges));
              this.rolesService.addRoles(this.extractRolesAndPermissions(user.user.privileges, user.user.roles));
              this.currentUserSubject.next(user);
              if (user.sessionId) {
                this.cookieService.set('JSESSIONID', user.sessionId);
              }
            }
            return user;
          }));
      })
    );
  }

  /**
  * Get auth token from auth gateway
  * @param {string} username - Username
  * @param {string} password - Password
  * @return {Observable<any>}
  */
  getAuthToken(username: string, password: string): Observable<any> {
    return this.http.post(`${this.gatewayURL}auth/login`, { username, password }).pipe(
      map((res: AuthGatewayLoginResponseModel) => {
        setCacheData('token', res.token);
        return res;
      })
    );
  }

  /**
  * Getter for auth JWT token from localstorage
  * @return {string} - JWT auth token
  */
  get authToken() {
    return getCacheData(false,'token') || '';
  }

  /**
  * Get provider
  * @param {string} userId - User uuid
  * @return {Observable<any>}
  */
  getProvider(userId: string): Observable<any> {
    return this.http.get(`${this.gatewayURL}auth/provider/${userId}`);
  }

  /**
  * Logout
  * @return {void}
  */
  logOut() {
    // remove user from local storage to log user out
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.set('Authorization', `Basic ${this.base64Cred}`);
    this.http.delete(`${this.baseUrl}/session`, { headers }).subscribe(() => {
      deleteCacheData('currentUser');
      deleteCacheData(doctorDetails.USER);
      deleteCacheData(doctorDetails.PROVIDER);
      deleteCacheData(doctorDetails.DOCTOR_NAME);
      deleteCacheData(doctorDetails.ROLE);
      deleteCacheData('xsddsdass');
      deleteCacheData('token');
      deleteCacheData('socketQuery');
      this.cookieService.deleteAll();
      this.currentUserSubject.next(null);
      this.permissionsService.flushPermissions();
      this.rolesService.flushRoles();
      this.router.navigate(['/session/login']);
    });
  }

  /**
  * Extract privileges
  * @param {PrivilegesModel[]} perm - Array of privileges
  * @return {string[]} - Array of Permissions
  */
  extractPermissions(perm: PrivilegesModel[]) {
    let extractedPermissions = perm.map((val) => {
      return val.name;
    });
    return extractedPermissions;
  }

  /**
  * Extract roles and privileges
  * @param {PrivilegesModel[]} perm - Array of privileges
  * @param {RolesModel[]} roles - Array of roles
  * @return {any} - Roles and permissions object
  */
  extractRolesAndPermissions(perm: PrivilegesModel[], roles: RolesModel[]) {
    let extractedPermissions = perm.map((val) => {
      return val.name;
    });
    let extractedRoles = roles.map((val) => {
      return val.name.toUpperCase();
    });
    let rolesObj = {};
    extractedRoles.forEach(r => {
      rolesObj[r] = extractedPermissions;
    });
    return rolesObj;
  }

  /**
  * Update verification status
  * @return {void}
  */
  updateVerificationStatus() {
    this.currentUserSubject.next({ ...this.currentUserValue, verified: true });
    setCacheData('currentUser', JSON.stringify({ ...this.currentUserValue, verified: true }));
  }

  /**
  * Check if username exists
  * @param {string} username - Username
  * @return {Observable<any>}
  */
  checkIfUsernameExists(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user?q=${username}&v=custom:(uuid,display,username,person:(uuid,display))`);
  }

  /**
  * Change password
  * @param {string} oldPassword - Old password
  * @param {string} newPassword - New password
  * @return {Observable<any>}
  */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/password`, { oldPassword, newPassword });
  }

  /**
  * Get international mask by country code
  * @param {CountryCode} countryCode - Country code
  * @param {boolean} withPrefix - With prefix true/false
  * @return {string[]} - Mask
  */
  getInternationalMaskByCountryCode(countryCode: CountryCode, withPrefix: boolean = true) {
    const number = getExampleNumber(countryCode, examples);
    const asYouType = new AsYouType(countryCode);
    asYouType.input(number.formatInternational());
    const template = asYouType.getTemplate();
    const templateWithoutPlus = template.substr(1);
    const mask = [];
    let prefix = number.countryCallingCode.split("").reverse();
    for (const char of templateWithoutPlus) {
      if (char == 'x') {
        if (withPrefix) {
          if (prefix.length) {
            mask.push(prefix.pop());
          } else {
            mask.push(/\d/);
          }
        } else {
          if (prefix.length) {
            prefix.pop();
          } else {
            mask.push(/\d/);
          }
        }
      } else {
        if (withPrefix) {
          mask.push(char);
        } else {
          if (mask.length) {
            mask.push(char);
          }
        }
      }
    }
    return withPrefix ? ["+", ...mask] : mask;
  }

  /**
  * Request OTP
  * @param {RequestOtpModel} payload - Payload for request otp
  * @return {Observable<any>}
  */
  requestOtp(payload: RequestOtpModel): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/auth/requestOtp`, payload);
  }

  /**
  * Verify OTP
  * @param {VerifyOtpModel} payload - Payload for verify otp
  * @return {Observable<any>}
  */
  verifyOtp(payload: VerifyOtpModel): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/auth/verifyOtp`, payload);
  }

  /**
  * Reset password
  * @param {string} userUuid - User uuid
  * @param {string} newPassword - New password to set
  * @return {Observable<any>}
  */
  resetPassword(userUuid: string, newPassword: string) {
    return this.http.post(`${this.mindmapUrl}/auth/resetPassword/${userUuid}`, { newPassword });
  }

  /**
  * Replcae the string charaters with *
  * @param {string} str - Original string
  * @return {string} - Modified string
  */
  replaceWithStar(str: string, type) {
    let n = str?.length;
    return str.replace(str.substring(5, (type == 'phone') ? n - 2 : n - 4), "*****");
  }

  /**
  * Check if session exists
  * @return {Observable<any>}
  */
  checkSession() {
    return this.http.get(`${this.mindmapUrl}/auth/check?ngsw-bypass=true`)
  }

  /**
  * Set remember me
  * @param {string} userUuid - User uuid
  * @return {Observable<any>}
  */
  setRememberMe(userUuid = this.userId): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/auth/rememberme?ngsw-bypass=true`, { userUuid })
  }

  /**
  * Reset session
  * @param {string} userUuid - User uuid
  * @return {Observable<any>}
  */
  resetSession(userUuid = this.userId): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/auth/reset?ngsw-bypass=true`, { userUuid })
  }

  /**
  * Get user uuid from localstorage user
  * @return {string} - User uuid
  */
  get userId() {
    try {
      return getCacheData(true, doctorDetails.USER).uuid;
    } catch (error) {
      return null;
    }
  }

  /**
  * Validate provider attribute
  * @param {string} attributeType - Provider attribute type
  * @param {any} attributeValue - Value for attribute
  * @param {string} providerUuid - Provider uuid
  * @return {Observable<any>}
  */
  validateProviderAttribute(attributeType: string, attributeValue: any, providerUuid: string): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/auth/validateProviderAttribute`, { attributeType, attributeValue, providerUuid });
  }

  /**
  * Reschedule appointment
  * @param {PushSubscription} sub - Push subscription object
  * @param {string} user_uuid - User uuid
  * @param {string} finger_print - Fingerprint of the system
  * @param {string} providerName - Provider name
  * @param {string} speciality - Speciality
  * @return {Observable<any>}
  */
  subscribePushNotification(sub: PushSubscription, user_uuid: string, finger_print: string, providerName: string, speciality: string): Observable<any> {
    return this.http.post(`${this.notificationUrl}/subscribe`, { sub, user_uuid, finger_print, speciality, providerName  });
  }

  /**
  * Get notification status
  * @param {string} user_uuid - User uuid
  * @return {Observable<any>}
  */
  getNotificationStatus(user_uuid: string): Observable<any> {
    return this.http.get(`${environment.mindmapURL}/mindmap/getNotificationStatus/${user_uuid}`);
  }

  /**
  * Toggle notification status
  * @param {string} user_uuid - User uuid
  * @return {Observable<any>}
  */
  toggleNotificationStatus(user_uuid: string): Observable<any> {
    return this.http.put(`${environment.mindmapURL}/mindmap/toggleNotificationStatus/${user_uuid}`, null);
  }

  /**
  * Snooze notification
  * @param {string} snooze_for - Snooze for time
  * @param {string} user_uuid - User uuid
  * @return {Observable<any>}
  */
  snoozeNotification(snooze_for: string, user_uuid: string): Observable<any> {
    return this.http.put(`${environment.mindmapURL}/mindmap/snooze_notification/${user_uuid}`, { snooze_for });
  }

  /**
  * Get users
  * @return {Observable<any>}
  */
  getUsers(): Observable<any> {
    const url = `${this.gatewayURL}auth/users`;
    return this.http.get(url);
  }

  /**
  * validate username
  * @return {Observable<any>}
  */
  validateUser(username): Observable<any> {
    const url = `${this.gatewayURL}auth/validateUser`;
    return this.http.post(url,{username});
  }

  /**
  * Get User Details
  * @param {string} user_uuid - User uuid
  * @return {Observable<any>}
  */
  getUser(user_uuid: string): Observable<any> {
    return this.http.get(`${this.gatewayURL}auth/user/${user_uuid}`);
  }

  /**
  * Set Provider Details
  * @param {string} uuid - User uuid
  * @param {any} data - Payload
  * @return {Observable<any>}
  */
  setProvider(uuid: string, data: any): Observable<any> {
    return this.http.post(`${this.gatewayURL}auth/provider/${uuid}`,data);
  }

  /**
  * Get Provider Details
  * @param {string} user_uuid - User uuid
  * @return {Observable<any>}
  */
  createUser(data: any): Observable<any> {
    return this.http.post(`${this.gatewayURL}auth/createUser`,data);
  }

  /**
  * Rest User Password
  * @param {string} user_uuid - User uuid
  * @param {any} data - password & confirm password
  * @return {Observable<any>}
  */
  resetUserPassword(user_uuid: string, data: any): Observable<any> {
    return this.http.post(`${this.gatewayURL}auth/user/reset-password/${user_uuid}`,data);
  }

  /**
  * Delete user
  * @param {string} uuid - User uuid
  * @return {Observable<any>}
  */
  deleteUser(uuid: string): Observable<any> {
    return this.http.delete(`${this.gatewayURL}auth/user/${uuid}`);
  }
}
