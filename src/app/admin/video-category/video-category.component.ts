import { Component, OnInit, ViewChild } from "@angular/core";
import { videoLibraryService } from "src/app/services/video-library.service";
import { PageTitleService } from "src/app/core/page-title/page-title.service";
import { TranslateService } from "@ngx-translate/core";
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { CoreService } from "src/app/services/core/core.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-video-category",
  templateUrl: "./video-category.component.html",
  styleUrls: ["./video-category.component.scss"],
})
export class VideoCategoryComponent implements OnInit {
  categories = [];

  constructor(
    private videoLibararySvc: videoLibraryService,
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private coreService: CoreService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: 'Video Library', imgUrl: 'assets/svgs/videolibrary.svg' })
    this.getAllCategories();
  }

  getAllCategories() {
    this.videoLibararySvc.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data?.sort((a, b) => new Date(b.updatedAt) < new Date(a.updatedAt) ? -1 : 1);;
      },
    });
  }

  openVideoLibraryModal(mode:string, selectedCategoryategory ?:any): void {
    this.coreService.openVideoLibraryModal((mode == 'edit') ?  selectedCategoryategory : null).subscribe((result) => {
      if (result) {
        const payload = {
                name: result?.title,
              };
             if(mode == 'add') {
              this.videoLibararySvc.creatCategory(payload).subscribe({
                next: () => {
                  this.toastr.success(`${this.translateService.instant("Category has been added successfully")}`,
                   this.translateService.instant('Category Added'));
                  this.getAllCategories();
                },
              });
             } else {
              this.videoLibararySvc.updateCategory(payload, selectedCategoryategory?.id).subscribe({
                next: () => {
                  this.toastr.success(`${this.translateService.instant("Category has been updated successfully")}`,
                   this.translateService.instant('Category Updated'));
                  this.getAllCategories();
                },
              });
             }
             
      }
    });
  }

  delete(category): void {
    this.coreService.openConfirmationDialog({ confirm: "Are you sure?", confirmationMsg: `All files within the '${category?.name}' category will be permanently removed.`,
       cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' })
    .afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.videoLibararySvc.deleteCategory(category?.id).subscribe({
                next: (res) => {
                  if (res) {
                    this.toastr.success(`${this.translateService.instant("Category has been deleted successfully")}`,
                    this.translateService.instant('Category Deleted'));
                    this.getAllCategories();
                  }
                },
              });
      }
    });
  }

  /**
  * Apply filter
  * @param {Event} event - Input's change event
  * @return {void}
  */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    let arr = this.categories.filter(category => (category.name).toLowerCase().includes(filterValue.trim().toLowerCase()) ||
    (category.updatedAt).toLowerCase().includes(filterValue.trim().toLowerCase()) )
    if (filterValue) {
      this.categories = arr;
    } else {
      this.getAllCategories();
    }

  }
}
