import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncModuleConfigurationComponent } from './sync-module-configuration.component';

describe('SyncModuleConfigurationComponent', () => {
  let component: SyncModuleConfigurationComponent;
  let fixture: ComponentFixture<SyncModuleConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SyncModuleConfigurationComponent]
    });
    fixture = TestBed.createComponent(SyncModuleConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
