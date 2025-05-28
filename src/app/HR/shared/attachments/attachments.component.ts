import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
declare var require: any;
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-employee-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  @Input() objectId: any;
  @Input() objectType: string
  @Input() employeeId: any;
  @Input() editAllowed!: boolean;
  @Input() deleteAllowed!: boolean;

  currentUser!: AuthData;
  urlPath: string = '';
  isLoading: boolean = false;
  attachmentsList: any[] = [];
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if(this.objectId == undefined) this.objectId = "";
    if(this.objectType == undefined) this.objectType = "";
    if(this.employeeId == undefined) this.employeeId = "";
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.LoadAttachments();
    }    
  }

  LoadAttachments() {
    if(this.objectId > 0 || this.employeeId > 0){
      this.isLoading = true;

      this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_ATTACHMENTS + "?objectId=" + this.objectId +"&objectType="+this.objectType+"&employeeId="+this.employeeId).then((data: any) => {
        if (data) {
          this.attachmentsList = data;
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
      });
    } 
  }

    
  addAttachments(files){

    if(files.length <= 0){
      toastr.error('Select files to upload');     
      return;
    }
    
    const formData = new FormData();  
    var index =0;
    for (const file of files) {
      var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png")
        {
          toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
          return;
        }
        if(file.size > (2*1024*1024)){
          toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
          return;
        }
      formData.append("attachments["+index+"]", file);  
      index++;
    }
    toastr.info("Uploading attachment files ...");  
    this.isLoading = true;
    this.httpService.HRpostAttachmentFile(APIURLS.HR_EMPLOYEE_ADD_ATTACHMENTS+"?objectId="+this.objectId+"&objectType="+this.objectType+"&createdById="+this.currentUser.uid+"&employeeId="+this.employeeId, formData)
    .then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
          { 
            toastr.success('Files uploaded successfully!');
            this.LoadAttachments();
          }
          else
          toastr.error(data.message);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while uploading attachments. Error:' + error);
      });
  }


  viewFile(id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;
    connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_ATTACHMENT_FILE+ "?objectId=" + this.objectId + "&objectType="+ this.objectType+"&attachmentId="+id);

    connection.then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find((s:any) => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }
      
      if (data != undefined) {
        
        if(fileName.toLowerCase().includes(".jpg") || fileName.toLowerCase().includes(".jpeg") || fileName.toLowerCase().includes(".png")){          
          this.showImageInViewer(data);
        }else if(fileName.toLowerCase().includes(".pdf")){          
          this.showPdfInViewer(fileName, data);
        }
        else{
         // var FileSaver = require('file-saver');
          const imageFile = new File([data], fileName);
          //const imageFile = new File([data], fileName, { type: 'application/doc' });
          // console.log(imageFile);
      //      FileSaver.saveAs(imageFile);
        }        
      }      
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  
  downloadFile(id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;
    connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_ATTACHMENT_FILE+ "?objectId=" + this.objectId + "&objectType="+ this.objectType+"&attachmentId="+id);
   
    connection.then((data: any) => {
            
      if (data != undefined) {        
         // var FileSaver = require('file-saver');
          const imageFile = new File([data], fileName);
          //const imageFile = new File([data], fileName, { type: 'application/doc' });
          // console.log(imageFile);
      //      FileSaver.saveAs(imageFile);
      }      
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  imageToShow: any;
showImageInViewer(image: Blob) {  
   let reader = new FileReader();
   reader.addEventListener("load", () => {
      const imageBase64String = reader.result; 
      this.imageToShow = this.sanitizer.bypassSecurityTrustUrl(imageBase64String.toString());
      $("#ImageModal").modal('show');
   }, false);

   if (image) {
      reader.readAsDataURL(image);
   }
}

pdfToShow: any;
showPdfInViewer(fileName:any, file: Blob) {  
  //  let reader = new FileReader();
  //  reader.addEventListener("load", () => {
  //     this.pdfToShow = new Uint8Array(reader.result as ArrayBuffer);
  //     $("#PdfModal").modal('show');
  //  }, false);

   if (file) {
      //reader.readAsArrayBuffer(file);
      //let blobFile = new Blob([file], {type: file.type});
      
      //this.pdfToShow = window.URL.createObjectURL(file);
      var blob = new Blob([file], {type: 'application/pdf'});
      var urlCreator = window.URL;    // || window.webkitURL;
      var pdfUrl = urlCreator.createObjectURL(blob);      
      this.pdfToShow = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      $("#PdfModal").modal('show');

      // var blob = new Blob([file], {type: 'application/pdf'});
      // var win = window.open('', '_blank');
      // var urlCreator = window.URL || window.webkitURL;
      // var pdfUrl = urlCreator.createObjectURL(blob);
      // win.location.href = pdfUrl;
      
      // var link = document.createElement("a");
      // link.href = window.URL.createObjectURL(file);
      // link.download = fileName;
      // link.target = "_blank";
      // link.click();

      //var url = window.URL.createObjectURL(file);
      //window.open(url);
   }
}

  removeLine(no){
    var data = this.attachmentsList[no];
    if(confirm("Are you sure you want to delete this file?"))
      this.deleteFile(data.employeeAttachmentId, no);    
  }

  
  deleteFile(id, no){
    if(id <= 0) return;
    let connection: any;
    let data: any = {};    
    data.objectId = this.objectId;
    console.log(this.objectId);
    console.log(data.objectId);
    data.objectType = this.objectType;
    data.employeeId = this.employeeId;
    data.attachmentId = id;
    data.deletedById = this.currentUser.uid
    connection = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_DELETE_ATTACHMENT, data);
    
    toastr.info('Deleting...');
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Deleted successfully!');
          this.attachmentsList.splice(no,1);
        }
        else
        toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while deleting the file. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while deleting the file. Error:' + error);
      });
  }

}
