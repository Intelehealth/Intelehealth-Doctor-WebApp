import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVisitSummaryComponent } from './view-visit-summary.component';

describe('ViewVisitSummaryComponent', () => {
  let component: ViewVisitSummaryComponent;
  let fixture: ComponentFixture<ViewVisitSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewVisitSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewVisitSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
