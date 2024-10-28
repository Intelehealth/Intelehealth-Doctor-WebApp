import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedVisitsComponent } from './completed-visits.component';

describe('CompletedVisitsComponent', () => {
  let component: CompletedVisitsComponent;
  let fixture: ComponentFixture<CompletedVisitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompletedVisitsComponent]
    });
    fixture = TestBed.createComponent(CompletedVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
