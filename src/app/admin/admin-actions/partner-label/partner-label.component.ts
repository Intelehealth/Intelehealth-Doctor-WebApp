import { Component, OnInit } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { ConfigService } from 'src/app/services/config.service';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-partner-label',
  templateUrl: './partner-label.component.html',
  styleUrls: ['./partner-label.component.scss']
})
export class PartnerLabelComponent implements OnInit{
  baseURL = environment.configURL;
  themeConfigURL = `${this.baseURL}/theme_config/updateThemeConfig`;
  uploadImageURL = `${this.baseURL}/theme_config/uploadImage`;
  deleteImageURL = `${this.baseURL}/theme_config/deleteImage`;
  isJsonValid: boolean = false;

  commonUploadImageOptions = { 
    uploadMsg : 'File size (5-50kb), Image size (512x512px), Format (PNG)', 
    fileBaseURL: environment.configPublicURL,
    maxSize: 50,
    minSize: 5,
    supportedFileType: ['png']
  };

  logoUploadImageOptions = {
    formData:{
      key: 'logo',
      value: ''
    },
    uploadURL: this.themeConfigURL,
    ...this.commonUploadImageOptions
  }

  thumbnailLogoUploadImageOptions = {
    formData:{
      key: 'thumbnail_logo',
      value: ''
    },
    uploadURL: this.themeConfigURL,
    ...this.commonUploadImageOptions
  }

  slideImageUploadOptions={
    uploadURL: this.uploadImageURL,
    ...this.commonUploadImageOptions
  }

  themeConfigData = {
    logo: '',
    thumbnail_logo: '',
    primary_color: '',
    secondary_color: '',
    images_with_text: [],
    help_tour_config: ''
  }

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService){

  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getThemConfigData();
  }

  getThemConfigData(){
    this.configService.getThemeConfig().subscribe(res=>{
      res.theme_config.forEach(config=>{
        this.themeConfigData[config.key]=config.value;
      });
      if(this.themeConfigData.images_with_text.length === 0){
        this.addSlides();
      }
    });
    
  }
  
  onLogoUpload(event){
    if(event.success){
      this.themeConfigData.logo = event.data.value;
    }
  }

  onThumbnailLogoUpload(event){
    if(event.success){
      this.themeConfigData.thumbnail_logo = event.data.value;
    }
  }

  onLogoFileDelete(type){
    this.themeConfigData[type] = '';
    this.updateThemeConfig(type,'');
  }

  updateThemeConfig(key,value){
    const formData = new FormData();
    formData.append('key',key);
    formData.append('value',value);
    this.configService.uploadImage(this.themeConfigURL,'PUT',formData).subscribe(res=>{

    })
  }

  onColorChange(value:string,key:string){
    var regex = new RegExp("^#([A-Fa-f0-9]{6})$");
    if(regex.test(value)){
      this.updateThemeConfig(key,value);
    }
  }

  addSlides(){
    this.themeConfigData.images_with_text.push({text:"",image:""});
  }

  saveSlides(){
    this.configService.updateImagesWithText({ data: this.themeConfigData.images_with_text }).subscribe(res=>{
      this.toastr.success("Images & text updated successfully", "Updated Successfully");
    }, err=>{
      this.toastr.error("Images & text update failed", "Updated Failed");
    })
  }

  onSlideUploadImage(event,item){
    if(event.success){
      item.image = event.data.image_path;
    }
  }

  onDeleteSlides(index){
    this.themeConfigData.images_with_text.splice(index, 1);
  }

  onSlideImageDelete(event, item){
    if(event.success){
      item.image = '';
    }
  }

  validateSildesData(): boolean{
    return this.themeConfigData.images_with_text.filter(item=>item.image === '').length === 0;
  }

  /**
  * Publish langauge changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Partner White Labelling has been successfully published", "Publish successfull!");
    });
  }

  validateJson(json: string): void {
    try {
      this.isJsonValid = Array.isArray(JSON.parse(json));
    } catch (e) {
      this.isJsonValid = false;
      return e.message;
    }
  }

  saveHelpTourConfig(): void {
    if (this.isJsonValid) {
      this.configService.updateHelpTour(JSON.parse(this.themeConfigData.help_tour_config)).subscribe(res => {
        this.toastr.success("Help Tour Config updated successfully", "Updated Successfully");
      });
    }
  }
}
