import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnChanges {
  
  @Input() options: {
    fileBaseURL : string,
    uploadMsg: string,
    supportedFileType: string[],
    maxSize: number,
    minSize: number,
    formData: any,
    requestType: 'POST'|'PUT',
    uploadURL: string,
    deleteFileURL: string,
    oprations: string[]
  };
  
  defaultOptions = {
    fileBaseURL : '',
    uploadMsg: 'Upload File',
    supportedFileType: [],
    maxSize: 1024,
    minSize: 50,
    formData: {},
    requestType: 'PUT',
    uploadURL: '',
    deleteFileURL: '',
    operations: ['remove','refresh','download']
  };

  @Input() filePath: string = '';

  @Input() fnValidateFile : Function;

  @Output() onFileupload = new EventEmitter<any>();

  @Output() onFileRemove = new EventEmitter<any>();

  uploadProgress: number = 0;
  fileURL: string = '';
  fileName: string = '';
  isUploadFailed = false;

  constructor(private configService: ConfigService, private toastr: ToastrService){

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.options){
      this.options = Object.assign({},this.defaultOptions,this.options);
    }
    this.setFileURL();
  }

  setFileURL(){
    if(this.filePath != '' && this.options.fileBaseURL != ''){
      this.fileURL = [this.options.fileBaseURL,this.filePath].join("");
      this.fileName = this.filePath.split("/").pop();
    }
  }

  validateFile(file):boolean{
    if(this.fnValidateFile){
      return this.fnValidateFile(file);
    }
    if(this.options.supportedFileType.filter(type=>file.type.includes(type)).length === 0){
      this.toastr.warning("Supported File types ("+this.options.supportedFileType.join(",")+")","Upload Failed");
      return false;
    }
    if(file.size > (this.options.maxSize * 1024)){
      this.toastr.warning("File Size should be less than "+this.options.maxSize+"kb","Upload Failed");
      return false;
    }
    if(file.size < (this.options.minSize * 1024)){
      this.toastr.warning("File Size should be greater than "+this.options.minSize+"kb","Upload Failed");
      return false;
    }
    return true;
  }

  onFileSelected(event){
    const file = event.target.files[0];
    if(file && this.validateFile(file) && this.options.uploadURL){
      this.uploadFile(file);
    }
  }

  uploadFile(file){
    const url = this.options.uploadURL;
    const formData = new FormData();
    if(this.options.formData){
      Object.keys(this.options.formData).forEach(key => {
          formData.append(key, this.options.formData[key]);
      });
    }
    formData.append("file", file);
    let progressInterval = setInterval(()=>{
      if(this.uploadProgress < 100) this.uploadProgress += 10;
    }, 500);
    this.configService.uploadImage(url,this.options.requestType, formData).subscribe(res => {
      clearInterval(progressInterval);
      this.toastr.success("File Uploaded Successfully","Upload successful!");
      this.uploadProgress = 0;
      this.onFileupload.emit(res);
    }, err => {
      clearInterval(progressInterval);
      this.isUploadFailed = true;
      this.toastr.error("File Upload Failed","Upload Failed");
      this.uploadProgress = 0;
    });

  }

  downloadFile(){
    if(this.fileURL !== ''){
      this.configService.downloadImage(this.fileURL).subscribe(res=>{
        let url = window.URL.createObjectURL(res);
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = this.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
    }
  }

  removeFile(){
    if(this.options.deleteFileURL !== ''){
      this.configService.deleteImage(this.options.deleteFileURL,this.filePath).subscribe(res=>{
        this.onFileRemove.emit(res);
      }, err=>{
        this.toastr.error("Unable to remove the file","Remove failed!");
      })
    } else {
      this.onFileRemove.emit({ success : true , filePath : this.filePath});
    }
    
  }

}
