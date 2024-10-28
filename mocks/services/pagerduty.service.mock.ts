/// <reference types="jasmine" />

import { mockPagerdutyList, mockPagerdutyObject} from "mocks/data/pagerduty";
import { of } from "rxjs";
import { PagerdutyService } from "src/app/services/pagerduty.service";


const pagerdutyService = jasmine.createSpyObj<PagerdutyService>('pagerdutyService', [
    'getAllTickets',
    'createTicket'
]);

pagerdutyService.createTicket.and.returnValue(of(mockPagerdutyObject));

pagerdutyService.getAllTickets.and.returnValue(of(mockPagerdutyList));

export { pagerdutyService };