import { Component, OnInit, Input,Output,EventEmitter } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Util } from '../../Services/util.service';
import { DomSanitizer } from '@angular/platform-browser'

declare var $: any;
declare var toastr: any;
declare var require: any;
@Component({
  selector: 'app-offer-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css'],
  providers: [Util]
})
export class AttachmentsComponent implements OnInit {

  @Input() offerDetails: any;
  @Input() offerId: number;
  @Input() editAllowed: boolean = false;  
  @Input() deleteAllowed: boolean = false;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();  
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();

  fileList: any[]=[];
  attachmentTypes = [{type: 'Salary Slip'},{type: 'Experience Letter'},{type:'Resume'},{type:'Other'}]
  mandatoryTypes = [{ type: "Salary Slip" }, {type: "Experience Letter"}];
  selectedType:any={};
  isLoading: boolean = false;
  errMsgModalPop: string = "";
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util,private readonly sanitizer: DomSanitizer) { }

  ngOnInit() {    
    this.LoadAttachments();
  }

  
  LoadAttachments(){
    if(this.offerId > 0){
      this.isLoading = true;
    
      this.httpService.HRget(APIURLS.OFFER_DETAILS_GET_ATTACHMENT_LIST+"/"+ this.offerId).then((data: any) => {
        if (data) 
            this.fileList = data;
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;      
      });
    }
  }

  Validate(){
    let valid = true;
    // if experience greater than 0, for field staff it is mandatory
    if(this.offerDetails.totalExperience > 0 && this.offerDetails.employeeCategoryId == 2){
      for(var type of this.mandatoryTypes){      
        if(!this.fileList.some(x=>x.attachmentType == type.type)){
          toastr.error("Please upload "+type.type);
          valid = false;
        }
      }
    }
    // for field staff Resume attachment is mandatory
    if(this.offerDetails.employeeCategoryId == 2){
      if(this.fileList == null || this.fileList.length == 0 || !this.fileList.some(x=>x.attachmentType == "Resume"))
      {
        toastr.error("Please upload resume");
        valid = false;
      }
    }
    return valid;
  }

  deleteFile(id, fileName){
    if(!confirm("Are you sure you want to delete the file " +fileName +"?")) return;
   
    let connection: any;
    let data: any = {};    
    data.offerId = this.offerId;
    data.attachmentId = id;
    if(localStorage.getItem('currentUser'))
    {
      let user = JSON.parse(localStorage.getItem('currentUser'));
      data.deletedById =  user.uid;
    }    
      connection = this.httpService.HRpost(APIURLS.OFFER_DELETE_ATTACHMENT, data);

      toastr.info('Deleting...');
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Deleted successfully!');
          this.LoadAttachments();
        }
        else
        toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while deleting the file. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while deleting the file. Error:' + error);
      });
  }

  getFile(id, fileName){
    if(id <= 0) return;
    this.httpService.HRdownloadFile(APIURLS.OFFER_DETAILS_GET_ATTACHMENT_FILE+ "/" + this.offerId + "/"+ id).then((data: any) => {
     
      this.fileList=data;
      if (data != undefined) {
        var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
      }
    }).catch(error => {
      this.isLoading = false;
    });
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
      if(file.size > (5*1024*1024)){
        toastr.error("Maximum file size allowed is 5MB. Please select a different file.");
        return;
      }
      formData.append("attachments["+index+"]", file); 
      index++;
    }
    toastr.info("Uploading attachment files ...");  
    // formData.append("type", this.selectedType.type );

    this.httpService.HRpostAttachmentFile(APIURLS.OFFER_DETAILS_ADD_ATTACHMENTS+"/"+this.offerId+"/"+this.selectedType.type, formData)
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
      .catch(error => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while uploading attachments. Error:' + error;
        toastr.error(this.errMsgModalPop);
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
   if (file) {
    var blob = new Blob([file], {type: 'application/pdf'});
    var urlCreator = window.URL;  // || window.webkitURL;
    var pdfUrl = urlCreator.createObjectURL(blob);      
    this.pdfToShow = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
    $("#PdfModal").modal('show');
   }
  }

  viewFile(id,  fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;

      connection = this.httpService.HRdownloadFile(APIURLS.OFFER_DETAILS_GET_ATTACHMENT_FILE+ "/" +this.offerId + "/"+ id);
    
    connection.then((data: any) => {
      
      if (data != undefined) {
        
        if(fileName.toLowerCase().includes(".jpg") || fileName.toLowerCase().includes(".jpeg") || fileName.toLowerCase().includes(".png")){          
          this.showImageInViewer(data);
        }else if(fileName.toLowerCase().includes(".pdf")){          
          this.showPdfInViewer(data);
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
}
