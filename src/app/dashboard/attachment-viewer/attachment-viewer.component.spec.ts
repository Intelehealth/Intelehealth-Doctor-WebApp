import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentViewerComponent } from './attachment-viewer.component';

describe('AttachmentViewerComponent', () => {
  let component: AttachmentViewerComponent;
  let fixture: ComponentFixture<AttachmentViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttachmentViewerComponent]
    });
    fixture = TestBed.createComponent(AttachmentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
