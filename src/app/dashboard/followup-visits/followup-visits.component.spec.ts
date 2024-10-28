import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupVisitsComponent } from './followup-visits.component';

describe('FollowupVisitsComponent', () => {
  let component: FollowupVisitsComponent;
  let fixture: ComponentFixture<FollowupVisitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FollowupVisitsComponent]
    });
    fixture = TestBed.createComponent(FollowupVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
