import { AfterViewInit, Component, inject, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { getCacheData } from "src/app/utils/utility-functions";
import { doctorDetails} from 'src/config/constant';
import { videoLibraryService } from "src/app/services/video-library.service";
import { PageTitleService } from "src/app/core/page-title/page-title.service";
import { TranslateService } from "@ngx-translate/core";
import { languages } from 'src/config/constant';
import { CoreService } from "src/app/services/core/core.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-videos",
  templateUrl: "./videos.component.html",
  styleUrls: ["./videos.component.scss"]
})
export class VideosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = [
    "srNo",
    "title",
    "videoId",
    "updatedAt",
    "move",
    "edit",
    "delete",
  ];
  category: any;
  dataSource = new MatTableDataSource([]);
  categoryId: string;

  constructor(
    private videoLibararySvc: videoLibraryService,
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private coreService: CoreService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: 'Video Library', imgUrl: 'assets/svgs/videolibrary.svg' })
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.categoryId = this.route.snapshot.paramMap.get("categoryId");
    this.getVideos();
  }


  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getVideos() {
    this.videoLibararySvc
      .getvideosByCategoryId(this.categoryId)
      .subscribe((res) => {
        this.category = res.data;
        res.data?.videos.sort((a, b) => new Date(b.updatedAt) < new Date(a.updatedAt) ? -1 : 1);
        this.dataSource = new MatTableDataSource(
          res.data?.videos.map((v, i) => {
            v.srNo = i+1;
            v.videoURL = this.getSafeUrl(v.videoId);
            return v;
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  getSafeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  saveVideo(mode:string, selectedVideo?:any): void {
    selectedVideo ? selectedVideo['isVideo'] = true : null;
    this.coreService.openVideoLibraryModal((mode == 'edit') ?  selectedVideo : {isVideo: true}).subscribe((result) => {
      if (result) {
        const payload = {
                title: result?.title,
                categoryId: this.categoryId,
                createdBy: this.user?.uuid,
                videoId: result?.videoId,
              };
             if(mode == 'add') {
              this.videoLibararySvc.creatVideo(payload).subscribe({
                next: () => {
                  this.toastr.success(`${this.translateService.instant("Video has been added successfully")}`,
                   this.translateService.instant('Video Added'));
                  this.getVideos();
                },
              });
             } else {
              this.videoLibararySvc.updateVideo(payload, selectedVideo?.id).subscribe({
                next: () => {
                  this.toastr.success(`${this.translateService.instant("Video has been updated successfully")}`,
                   this.translateService.instant('Video Updated'));
                  this.getVideos();
                },
              });
             }
             
      }
    });
  }

  moveVideo(selectedVideo?:any): void {
    this.videoLibararySvc.getAllCategories().subscribe({
      next: (res: any) => {
        this.coreService.openVideoLibraryModal({isMove: true, categories: res.data}).subscribe((result) => {
          if (result) {
            const payload = {
                    oldCategoryId: this.categoryId,
                    newCategoryId: result?.selectedCategory?.id
                  };
                  this.videoLibararySvc.moveVideo(payload, selectedVideo?.id).subscribe({
                    next: () => {
                      this.toastr.success(`${this.translateService.instant("Video has been moved successfully")}`,
                       this.translateService.instant('Video Moved'));
                      this.getVideos();
                    },
            });
          }
        });
      },
    });
  }

  deleteVideo(videoId: Number): void {
    this.coreService.openConfirmationDialog({ confirm: "Are you sure?", confirmationMsg: `The video will be permanently deleted from the category.`,
      cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' })
   .afterClosed().subscribe((res: boolean) => {
     if (res) {
       this.videoLibararySvc.deleteVideo(videoId).subscribe({
               next: (res) => {
                 if (res) {
                   this.toastr.success(`${this.translateService.instant("Video has been deleted successfully")}`,
                   this.translateService.instant('Video Deleted'));
                   this.getVideos();
                 }
               },
             });
     }
   });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  get user() {
    return getCacheData(true, doctorDetails.USER);
  }
}
