import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupTrackerComponent } from './followup-tracker.component';

describe('FollowupTrackerComponent', () => {
  let component: FollowupTrackerComponent;
  let fixture: ComponentFixture<FollowupTrackerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FollowupTrackerComponent]
    });
    fixture = TestBed.createComponent(FollowupTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
