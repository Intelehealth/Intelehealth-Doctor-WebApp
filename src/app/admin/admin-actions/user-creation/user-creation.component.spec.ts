import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreationComponent } from './user-creation.component';

describe('UserCreationComponent', () => {
  let component: UserCreationComponent;
  let fixture: ComponentFixture<UserCreationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserCreationComponent]
    });
    fixture = TestBed.createComponent(UserCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
