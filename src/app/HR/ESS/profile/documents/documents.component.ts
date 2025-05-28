import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../../shared/api-url';
import { AppointmentService } from '../../../Services/appointmentService.service';
import { Util } from '../../../Services/util.service';
import { DomSanitizer } from '@angular/platform-browser'
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-profile-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css'],
  providers: [Util]
})
export class DocumentsComponent implements OnInit {
  @Input() employeeId!: number;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  isLoading = false;
  documentsList: any[] = [];
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util, private readonly sanitizer: DomSanitizer) { }

  ngOnInit() {
    
    this.LoadData();
  }

  LoadData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_DOCUMENTS + "?employeeId=" + this.employeeId ).then((data: any) => {
      if (data && data.length > 0) {
        this.documentsList = data;
        this.dataLoaded.emit("loaded");
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      swal("Error occurred while fetching details, please check the link.");
    });
  }

    
  viewFile(id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;
    
    connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_DOCUMENT_FILE+"/"+this.employeeId+ "/" + id);

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
          this.showPdfInViewer(data);
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

    connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_DOCUMENT_FILE+"/"+this.employeeId+ "/" + id);

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
showPdfInViewer(file: Blob) {  
  //  let reader = new FileReader();
  //  reader.addEventListener("load", () => {
  //     this.pdfToShow = new Uint8Array(reader.result as ArrayBuffer);
  //     $("#PdfModal").modal('show');
  //  }, false);

  //  if (file) {
  //     reader.readAsArrayBuffer(file);
  //  }

   var blob = new Blob([file], {type: 'application/pdf'});
   var urlCreator = window.URL;   // || window.webkitURL;
   var pdfUrl = urlCreator.createObjectURL(blob);      
   this.pdfToShow = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
   $("#PdfModal").modal('show');

}

}
