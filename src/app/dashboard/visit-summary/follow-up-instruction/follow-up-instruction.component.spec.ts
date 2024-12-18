import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpInstructionComponent } from './follow-up-instruction.component';

describe('FollowUpInstructionComponent', () => {
  let component: FollowUpInstructionComponent;
  let fixture: ComponentFixture<FollowUpInstructionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FollowUpInstructionComponent]
    });
    fixture = TestBed.createComponent(FollowUpInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
