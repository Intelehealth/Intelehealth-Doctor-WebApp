import { Component } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ToastrService } from 'ngx-toastr';
import { PagerDutyDetail } from 'src/app/model/model';
import { CoreService } from 'src/app/services/core/core.service';
import { PagerdutyService } from 'src/app/services/pagerduty.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent {
  ticketData: any;
  statuses = { 'triggered' : 'To Do', 'resolved': "Done", "acknowledged": "In Progress" };

  constructor(
    private translateService: TranslateService,
    private pagerdutyService: PagerdutyService,
    private pageTitleService: PageTitleService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private coreService: CoreService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    const id = this.activeRoute.snapshot.paramMap.get('id');
    this.pageTitleService.setTitle(null);
    this.getTicket(id);
  }
  
  /**
  * Get Ticket
  * @return {void}
  */
  getTicket(id: string): void{
    this.pagerdutyService.getTicket(id).subscribe((res:PagerDutyDetail)=>{
      this.ticketData = res?.incident;
    })
  }

  /**
  * Reopen Ticket
  * @return {void}
  */
  onReopenTicket(id: string): void{
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Are you sure to reopen this ticket?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' }).
    afterClosed().subscribe((res: boolean) => {
      if(res){
        let ticketObj = {
          title : "Re - "+this.ticketData.title,
          priority: this.ticketData.priority,
          description: this.ticketData.description
        }
        this.pagerdutyService.createTicket(ticketObj).subscribe((res)=>{
          this.toastr.success('Ticket has been Reopened successfully!', 'Ticket Reopened');
          this.router.navigate(["help"]);
        });
      }
    });
  }
}


