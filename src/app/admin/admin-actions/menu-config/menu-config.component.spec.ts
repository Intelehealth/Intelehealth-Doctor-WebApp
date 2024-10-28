import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuConfigComponent } from './menu-config.component';

describe('MenuConfigComponent', () => {
  let component: MenuConfigComponent;
  let fixture: ComponentFixture<MenuConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MenuConfigComponent]
    });
    fixture = TestBed.createComponent(MenuConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
