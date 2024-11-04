import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoLibraryComponent } from './video-library.component';

describe('VideoLibraryComponent', () => {
  let component: VideoLibraryComponent;
  let fixture: ComponentFixture<VideoLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoLibraryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
