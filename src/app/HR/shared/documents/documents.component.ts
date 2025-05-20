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
  selector: 'app-employee-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  @Input() objectId: any;
  @Input() objectType: string;
  @Input() employeeId: any;
  @Input() editAllowed: boolean;
  @Input() deleteAllowed: boolean;

  currentUser: AuthData;
  urlPath: string = '';
  isLoading: boolean = false;
  documentsList: any[] = [];
  
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
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.LoadDocuments();
    }    
  }

  LoadDocuments() {
    if(this.objectId > 0 || this.employeeId > 0){
      this.isLoading = true;

      this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_DOCUMENTS + "?objectId=" + this.objectId +"&objectType="+this.objectType+"&employeeId="+this.employeeId).then((data: any) => {
        if (data) {
          this.documentsList = data;
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
      });
    } 
  }

  
  viewFile(id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;
    connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_DOCUMENT_FILE+"?employeeId="+this.employeeId+"&objectId="+this.objectId+ "&documentId=" + id);

    connection.then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find(s => s.id == id).name;
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
          var FileSaver = require('file-saver');
          const imageFile = new File([data], fileName);
          //const imageFile = new File([data], fileName, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);
        }        
      }      
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  
  downloadFile(id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;
    connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_DOCUMENT_FILE+"?employeeId="+this.employeeId+"&objectId="+this.objectId+ "&documentId=" + id);
   
    connection.then((data: any) => {
            
      if (data != undefined) {        
          var FileSaver = require('file-saver');
          const imageFile = new File([data], fileName);
          //const imageFile = new File([data], fileName, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);
      }      
      this.isLoading = false;
    }).catch(error => {
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

}
