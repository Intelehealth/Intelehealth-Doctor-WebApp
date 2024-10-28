import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PageTitleItem } from '../core/models/page-title-model';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AuthService } from '../services/auth.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { CoreService } from '../services/core/core.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { ActivatedRoute, ActivatedRouteSnapshot, Event, NavigationEnd, Router, RouterStateSnapshot } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { HelpMenuComponent } from '../modal-components/help-menu/help-menu.component';
import { SocketService } from '../services/socket.service';
import { SwPush } from '@angular/service-worker';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { TranslateService } from '@ngx-translate/core';
import { RaiseTicketComponent } from '../modal-components/raise-ticket/raise-ticket.component';
import { ProfileService } from '../services/profile.service';
import { getCacheData } from '../utils/utility-functions';
import { languages, doctorDetails, notifications } from 'src/config/constant';
import { ApiResponseModel, BreadcrumbModel, PatientModel, PatientVisitSummaryConfigModel, ProviderAttributeModel, ProviderModel, SerachPatientApiResponseModel, UserModel } from '../model/model';
import { AppConfigService } from '../services/app-config.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit, AfterContentChecked, OnDestroy {

  collapsed = false;
  baseUrl: string = environment.baseURL;
  configPublicUrl: string = environment.configPublicURL;
  baseURLLegacy: string = environment.baseURLLegacy;
  username = '';
  header: PageTitleItem;
  _mode = 'side';
  isMobile = false;
  _opened = true;
  _showBackdrop = false;
  _closeOnClickOutside = false;
  sidebarClosed = false;
  subscription: Subscription;
  subscription1: Subscription;
  subscription2: Subscription;
  searchForm: FormGroup;
  public breadcrumbs: BreadcrumbModel[];
  @ViewChild('drawer') drawer: MatDrawer;
  dialogRef: MatDialogRef<HelpMenuComponent>;
  dialogRef2: MatDialogRef<RaiseTicketComponent>;
  routeUrl = '';
  adminUnread = 0;
  drUnread = 0;
  notificationEnabled = false;
  interval: any;
  interval2: any;
  snoozed: any = '';
  profilePic: string;
  profilePicSubscription;
  logoImageURL: string = '';
  thumbnailLogoURL: string = '';
  pvs: PatientVisitSummaryConfigModel;
  sidebarMenus: any;

  constructor(
    private cdref: ChangeDetectorRef,
    private authService: AuthService,
    private pageTitleService: PageTitleService,
    private breakpointObserver: BreakpointObserver,
    private coreService: CoreService,
    private toastr: ToastrService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private _swPush: SwPush,
    private translateService: TranslateService,
    private profileService: ProfileService,
    private appConfigService: AppConfigService
  ) {
    this.searchForm = new FormGroup({
      keyword: new FormControl('', Validators.required)
    });
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    this.routeUrl = this.breadcrumbs[0]?.url;
    this.pvs = { ...this.appConfigService.patient_visit_summary };
    this.sidebarMenus = this.appConfigService.sidebar_menus
  }

  ngOnInit(): void {
    this.logoImageURL = this.appConfigService.theme_config.find(obj=>obj.key==='logo')?.value;
    this.thumbnailLogoURL = this.appConfigService.theme_config.find(obj=>obj.key==='thumbnail_logo')?.value;
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.title.subscribe((val: PageTitleItem) => {
      this.header = val;
    });

    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe((result: BreakpointState) => {
      if (result.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
      this._mode = (this.isMobile) ? 'over' : 'side';
      this._closeOnClickOutside = (this.isMobile) ? true : false;
      this._showBackdrop = (this.isMobile) ? true : false;
      this._opened = !this.isMobile;
      this.sidebarClosed = false;
    });

    this.subscription = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      distinctUntilChanged(),
    ).subscribe(() => {
        this.routeUrl = this.router.url;
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
        document.getElementsByClassName('admin-sidenav-content')[0]?.scrollTo(0, 0);
    });

    this.subscription1 = this.socketService.adminUnread.subscribe(res => {
      this.adminUnread = res;
    });

    this.subscription2 = this.socketService.drUnread.subscribe(res => {
      this.drUnread = res;
    });

    if (getCacheData(false, doctorDetails.ROLE) === 'doctor') {
      setTimeout(() => {
        this.socketService.emitEvent(notifications.GET_DOCTOR_UNREAD_COUNT, this.user?.uuid);
      }, 1500);
      this.interval2 = setInterval(() => {
        this.socketService.emitEvent(notifications.GET_DOCTOR_UNREAD_COUNT, this.user?.uuid);
      }, 60000);
    }

    if(this.appConfigService?.webrtc_section && this.appConfigService?.webrtc?.chat) {
      this.getSubscription();
      this.getNotificationStatus();
    }

    this.profilePic = this.baseUrl + '/personimage/' + this.provider?.person.uuid;
    this.profilePicSubscription = this.profileService.profilePicUpdateEvent.subscribe(img => {
      this.profilePic = img;
    });
  }

  /**
  * Request subscription object for push notification and strore it to the server
  * @return {void}
  */
  requestSubscription() {
    if (!this._swPush.isEnabled) {
      return;
    }
    this._swPush.subscription.subscribe(async (sub) => {
      if (!sub) {
        await this._swPush.requestSubscription({
          serverPublicKey: environment.vapidPublicKey
        }).then(async (_) => {
            // Get the visitor identifier when you need it.
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            this.authService.subscribePushNotification(
              _,
              this.user.uuid,
              result.visitorId,
              this.provider.person.display,
              this.getSpecialization()
            ).subscribe(_response => {
            });
        }).catch((_) => console.log);
      } else {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        this.authService.subscribePushNotification(
          sub,
          this.user.uuid,
          result.visitorId,
          this.provider.person.display,
          this.getSpecialization()
        ).subscribe(_response => {
        });
        this._swPush.messages.subscribe(_payload => {
        });
      }
    });
  }

  /**
  * Get logged-in user notification status
  * @return {void}
  */
  getNotificationStatus() {
    this.authService.getNotificationStatus(this.user?.uuid).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.notificationEnabled = res.data?.notification_status;
        this.snoozed = res.data?.snooze_till;
        this.interval = setInterval(()=>{
          if (this.snoozed) {
            if (new Date().valueOf() > this.snoozed) {
              this.snoozed = 0;
            }
          }
        }, 30000);
      }
    });
  }

  /**
  * Check and request notification permission
  * @return {void}
  */
  getSubscription() {
    if(Notification.permission === 'default') {
      Notification.requestPermission().then(() => {
        this.requestSubscription();
      }).catch(() => {
        // show permission denied error
      });
    }
    else if(Notification.permission === 'denied') {
      // show permission is denied, please allow it error
    } else {
      this.requestSubscription();
    }
  }

  /**
  * Get logged-in doctor speciality
  * @param {ProviderAttributeModel[]} attr - Array of provider attributes
  * @return {string} - Doctor speciality
  */
  getSpecialization(attr: ProviderAttributeModel[] = this.provider.attributes): string {
    let specialization: string = null;
    for (let x = 0; x < attr.length; x++) {
      if (attr[x].attributeType.uuid === 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !attr[x].voided) {
        specialization = attr[x].value;
        break;
      }
    }
    return specialization;
  }

  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  /**
  * Open select language modal
  * @return {void}
  */
  selectLanguage(): void {
    this.coreService.openSelectLanguageModal().subscribe((res) => {
    });
  }

  /**
  * Redirect user to change-password screen
  * @return {void}
  */
  changePassword() {
    this.router.navigate(['/dashboard/change-password']);
  }

  /**
  * Get url for minimize-maximize icon of sidebar w.r.t. side bar status
  * @return {string} - URL for minimize-maximize icon
  */
  getUrl(): string {
    return `assets/icons/dashboard-icons/Vector${this.collapsed ? '2' : ''}.png`;
  }

  /**
  * Open confirm logout modal
  * @return {void}
  */
  logout() {
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Are you sure you want to logout?', cancelBtnText: 'No', confirmBtnText: 'Yes' }).afterClosed().subscribe(res => {
      if (res) {
        this.authService.logOut();
      }
    });
  }

  /**
  * Search patient
  * @return {void}
  */
  search(): void {
    if (this.searchForm.value.keyword === null || this.searchForm.value.keyword.length < 3) {
      this.toastr.warning(this.translateService.instant('Please enter minimum 3 characters to search patient....'), this.translateService.instant('Warning'));
    } else {
      const url = `${this.baseUrl}/patient?q=${this.searchForm.value.keyword}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
      this.http.get(url).subscribe((response: SerachPatientApiResponseModel) => {
        const values = [];
        response['results'].forEach((value: PatientModel) => {
          if (value) {
            if (value.identifiers.length) {
              values.push(value);
            }
          }
        });
        this.coreService.openSearchedPatientModal(values).subscribe((result) => {});
        this.searchForm.reset();
      },
        (err) => {
          // if (err.error instanceof Error) {
          //   this.toastr.error('Client-side error', null, { timeOut: 2000 });
          // } else {
          //   this.toastr.error('Server-side error', null, { timeOut: 2000 });
          // }
        }
      );
    }
  }

  /**
  * Get the breadcrumbs from the router url
  * @return {string} - URL for minimize-maximize icon
  */
  buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbModel[] = []): BreadcrumbModel[] {
    // If no routeConfig is avalailable we are on the root path
    const breadcrumbArr = route.routeConfig && route.routeConfig.data ? route.routeConfig.data.breadcrumb : ''
    let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';
    // If the route is dynamic route such as ':id', remove it
    const lastRoutePart = path.split('/').pop();
    const isDynamicRoute = lastRoutePart.startsWith(':');
    const rs = (route.snapshot) ? route.snapshot : this.searchData(this.router.routerState.snapshot, path);
    if (isDynamicRoute && !!rs) {
      const paramName = lastRoutePart.split(':')[1];
      path = path.replace(lastRoutePart, rs.params[paramName]);
    }

    // In the routeConfig the complete path is not available,
    // so we rebuild it each time
    const nextUrl = path ? `${url}/${path}` : url;
    const label = breadcrumbArr && typeof breadcrumbArr == 'string' ? breadcrumbArr : '';
    
    const breadcrumb: BreadcrumbModel = {
      label: label,
      url: nextUrl,
    };
    // Only adding route with non-empty label
    const newBreadcrumbs = breadcrumb.label ? [ ...breadcrumbs, breadcrumb ] : [ ...breadcrumbs];

    if(breadcrumbArr && typeof breadcrumbArr !== 'string') {
      this.createBreadcrumFromArr(breadcrumbArr, newBreadcrumbs, rs)
    }
    
    if (route.firstChild) {
        // If we are not on our current path yet,
        // there will be more children to look after, to build our breadcumb
        return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }

  createBreadcrumFromArr(breadcrumbArr: BreadcrumbModel[], newBreadcrumbs: BreadcrumbModel[], rs: ActivatedRouteSnapshot) {
    breadcrumbArr.forEach((breadcrumb: any) => {
      if(!breadcrumb?.label?.trim()) return;

      if (breadcrumb?.url?.startsWith(':id') && !!rs) {
        const paramName = breadcrumb?.url.split(':')[1];
        breadcrumb.url = breadcrumb.replace(breadcrumb.url, rs.params[paramName]);
      }
      let label = breadcrumb?.label;
      if (label?.startsWith(':') && !!rs) {
        label = rs.params[label?.split(':')[1]]
      }
      if(!label) return;

      newBreadcrumbs.push({
        label: label,
        url: breadcrumb.url,
      })
    })
  }

  /**
  * Search the path from routerstate snapshot
  * @return {ActivatedRouteSnapshot} - Expected child
  */
  searchData(state: RouterStateSnapshot, path: string): ActivatedRouteSnapshot {
    let expectedChild: ActivatedRouteSnapshot | null;
    let child: ActivatedRouteSnapshot | null;
    child = state.root.firstChild;
    while (child != null) {
        if (child.routeConfig.path === path) {
          expectedChild = child;
          break;
        }
        child = child.firstChild;
    }
    return expectedChild;
  }

  /**
  * Toggle sidebar if on mobile
  * @return {void}
  */
  toggleSidebar() {
    if (this.isMobile) {
      this.drawer.toggle();
    }
  }

  /**
  * Open Help Chat modal
  * @return {void}
  */
  openHelpMenu() {
    if (this.dialogRef) {
      this.dialogRef.close();
      return;
    }
    this.dialogRef = this.coreService.openHelpMenuModal();
    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = undefined;
    });
  }

  /**
  * Open Raise Ticket modal
  * @return {void}
  */
  openRaiseTicketModal() {
    if (this.dialogRef2) {
      this.dialogRef2.close();
      return;
    }
    this.dialogRef2 = this.coreService.openRaiseTicketModal();
    this.dialogRef2.afterClosed().subscribe(result => {
      this.dialogRef2 = undefined;
    });
  }

  /**
  * Toggle notification status for the logged-in user
  * @return {void}
  */
  toggleNotification() {
    this.authService.toggleNotificationStatus(this.user.uuid).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.notificationEnabled = res.data?.notification_status;
        this.snoozed = '';
        this.toastr.success(`${this.translateService.instant('Notifications turned')} ${ this.notificationEnabled ? this.translateService.instant('On') : this.translateService.instant('Off')} ${this.translateService.instant('successfully!')}`,
         `${this.translateService.instant('Notifications')} ${ this.notificationEnabled ? this.translateService.instant('On') : this.translateService.instant('Off') }`);
      }
    });
  }

  /**
  * Update the notification snooze period
  * @param {string} period - Snooze period for which notification to be snoozed
  * @return {void}
  */
  snoozeNotification(period: string) {
    this.authService.snoozeNotification(period, this.user?.uuid).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.snoozed = res.data?.snooze_till;
      }
    });
  }

  /**
  * Get user from localstorage
  * @return {UserModel} - User
  */
  get user(): UserModel {
    return getCacheData(true, doctorDetails.USER);
  }

  /**
  * Get provider from localstorage
  * @return {ProviderModel} - Provider
  */
  get provider(): ProviderModel {
    return getCacheData(true, doctorDetails.PROVIDER);
  }

  /**
  * Reset patient search input
  * @return {void}
  */
  resetSearch() {
    this.searchForm.patchValue({ keyword: ''});
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.profilePicSubscription.unsubscribe();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    if (this.dialogRef2) {
      this.dialogRef2.close();
    }
    if (this.interval2) {
      clearInterval(this.interval);
    }
  }
}
