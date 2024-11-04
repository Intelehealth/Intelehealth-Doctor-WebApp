import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { getCacheData } from "src/app/utils/utility-functions";
import { doctorDetails} from 'src/config/constant';
import { videoLibraryService } from "src/app/services/video-library.service";

@Component({
  selector: "app-videos",
  templateUrl: "./videos.component.html",
  styleUrls: ["./videos.component.scss"],
})
export class VideosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayColumns: string[] = [
    "video",
    "VideoId",
    "Title",
    "lastUpdate",
    "action",
  ];
  constructor(
    private videoLibararySvc: videoLibraryService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}
  projectId: any;
  dataSource: any;
  categoryId;

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get("categoryId");
    this.getVideos();
  }

  getVideos() {
    this.videoLibararySvc
      .getvideosByCategoryId(this.categoryId)
      .subscribe((res) => {
        this.projectId = res.data.id;
        this.dataSource = new MatTableDataSource(
          res.data?.videos.map((v) => {
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

  addVideo(): void {
    // const dialogRef = this.dialog.open(ModalsComponent, {
    //   data: { title: "Add Video" },
    //   width: "40%",
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     const data = {
    //       title: result?.Title,
    //       projectId: this.projectId,
    //       createdBy: this.user?.uuid,
    //       videoId: result?.videoId,
    //     };
    //     this.videoLibararySvc.creatVideo(data).subscribe({
    //       next: () => {
    //         this.snackbar.open("Video added successfully", null, {
    //           duration: 4000,
    //         });
    //         this.getVideos();
    //       },
    //     });
    //   }
    // });
  }

  updateVideo(video) {
    // const dialogRef = this.dialog.open(ModalsComponent, {
    //   data: {
    //     title: "Update Video",
    //     videoId: video.videoId,
    //     Title: video.title,
    //   },
    //   width: "40%",
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     const data = {
    //       videoId: result?.videoId,
    //       title: result?.Title,
    //       createdBy: this.user?.uuid,
    //     };

    //     this.videoLibararySvc.updateVideo(data, video.id).subscribe({
    //       next: () => {
    //         this.snackbar.open("Video updated successfully", null, {
    //           duration: 4000,
    //         });

    //         this.getVideos();
    //       },
    //     });
    //   }
    // });
  }

  delete(id): void {
    // const dialogRef = this.dialog.open(ModalsComponent, {
    //   data: { title: "Delete Video" },
    //   width: "250px",
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.videoLibararySvc.deleteVideo(id).subscribe({
    //       next: (res) => {
    //         if (res) {
    //           this.snackbar.open("Video deleted successfully", null, {
    //             duration: 4000,
    //           });
    //           this.getVideos();
    //         }
    //       },
    //     });
    //   }
    // });
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
