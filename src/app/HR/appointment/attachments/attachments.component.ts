import { AppComponent } from '../../../app.component';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-appointment-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  @Input() appointmentId: number;
  @Input() offerId: number;
  @Input() guid: string;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();  
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
    
  types = [{ type: "Passport size Photo", note: "Recent colour photograph with white background" }, { type: "Aadhar Card", note: "Number, Name and DOB should be visible" }, 
  { type: "PAN Card", note: "Photo and number should be visible" }, 
  { type: "PF-UAN Ac Details", note: "" }, { type: "ESI Number", note: "" }, { type: "UAN Details", note: "" }, 
  { type: "Bank Passbook / Cheque", note: "Cheque leaf or pass book with Bank Name and IFSC code clearly visible" }, { type: "Medical Certificate", note: "" }, 
  { type: "Previous Employer Relieving Letter", note: "" }, 
  { type: "Previous Employer 3 months payslip", note: "" }, { type: "Previous Employer Form 16", note: "" }, { type: "Previous Employer Offer Letter", note: "" }, 
  { type: "Other", note: "attach any other document" }];
  
  isLoading = false;
  item: any = {};
  count: number = 0;
  fileList: any[] = [];
  selectedType:any={};
  officialDetails: any;
  offerDetails: any;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private readonly sanitizer: DomSanitizer) { }

    errMsgPop: string = "";

  ngOnInit() {
    
    if(this.appointmentId == null || this.appointmentId == undefined)
      this.appointmentId=0;      
    
    if(this.offerId == null || this.offerId == undefined)
      this.offerId=0;

    this.LoadData();
  }

  LoadData() {
    this.isLoading = true;
    let connection: any;
    this.getOfferData();
    if(this.appointmentId > 0)
      connection = this.httpService.HRget(APIURLS.APPOINTMENT_GET_ATTACHMENT_DETAILS + "/" + this.appointmentId);
    else
      connection = this.service.getData(APIURLS.CANDIDATE_GET_ATTACHMENT_DETAILS + "/" + this.offerId + "/" + this.guid);

    connection.then((data: any) => {
      if (data && data.length > 0) {
        this.dataLoaded.emit("loaded");
        this.fileList = data;
        this.count = data.length;
        this.getOfficialData();       
      }   
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.fileList = [];
    });
  }

  
  getOfficialData(){
    this.isLoading = false;
    if(this.appointmentId > 0){      
      this.isLoading = true;
      this.httpService.HRget(APIURLS.APPOINTMENT_GET_OFFICIAL_DETAILS + "/" + this.appointmentId)
      .then((data: any) => {
        if (data) {
          this.officialDetails = data;          
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  }

  
  getOfferData(){
      let  conn;
      this.isLoading = true;
      if(this.offerId > 0){    
        conn = this.service.getData(APIURLS.CANDIDATE_GET_OFFER_BY_ID + "/" + this.offerId + "/" + this.guid);
      }
      else
        conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_OFFER_BY_APPOINTMENT_ID + "/" + this.appointmentId);

      conn.then((data: any) => {
        if (data) {
          this.offerDetails = data;          
        }
        // else
        //   toastr.error("Offer details not found, please check the link.");

        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });    
  }
  
  upload(files) {
    
    if (files.length === 0){
      toastr.error("Please select a file.");
      return;
    }  
    
    const formData = new FormData();  
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
      formData.append(file.name, file);
      this.item.fileName = file.name;
    }    
    
    this.item.attachmentType = this.selectedType.type;
    if(!this.item.attachmentType || this.item.attachmentType == ""){
      toastr.error("Please select attachment type.");
      return;
    }
    toastr.info("Uploading...");
    formData.append("appointmentId", this.appointmentId.toString() );
    formData.append("offerId", this.offerId.toString() );
    formData.append("guid", this.guid );
    formData.append("type", this.item.attachmentType );
    formData.append("note", this.item.note != undefined ? this.item.note : "" );
    let connection: any;
    if(this.appointmentId > 0)
      connection = this.httpService.HRpostAttachmentFile(APIURLS.APPOINTMENT_SAVE_ATTACHMENT_DETAILS, formData);
    else
     connection = this.service.postAttachmentFiles(APIURLS.CANDIDATE_SAVE_ATTACHMENT_DETAILS, formData);

    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        this.item.attachmentId = data.id;
        this.onAddLineClick();
        toastr.success("Successfully uploaded the file.");
      }
    }).catch(error => {
      //console.log(error);
      toastr.error('Error uploading Files...'+ error);
    })
  }

  viewFile(id, offerId, attachmentType, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;

    if(attachmentType == "Offer Attachment")
      connection = this.httpService.HRdownloadFile(APIURLS.OFFER_DETAILS_GET_ATTACHMENT_FILE+ "/" + offerId + "/"+ id);
    else if(this.appointmentId > 0)
      connection = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_ATTACHMENT_FILE+ "/" + id);
    else
    connection = this.httpService.HRdownloadFile(APIURLS.CANDIDATE_GET_ATTACHMENT_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id);

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

  
  downloadFile(id, offerId, attachmentType, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;

    if(attachmentType == "Offer Attachment")
      connection = this.httpService.HRdownloadFile(APIURLS.OFFER_DETAILS_GET_ATTACHMENT_FILE+ "/" + offerId + "/"+ id);
    else if(this.appointmentId > 0)
      connection = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_ATTACHMENT_FILE+ "/" + id);
    else
    connection = this.httpService.HRdownloadFile(APIURLS.CANDIDATE_GET_ATTACHMENT_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id);

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
showPdfInViewer(file: Blob) {  
  //  let reader = new FileReader();
  //  reader.addEventListener("load", () => {
  //     this.pdfToShow = new Uint8Array(reader.result as ArrayBuffer);
  //     $("#PdfModal").modal('show');
  //  }, false);

   if (file) {
    //reader.readAsArrayBuffer(file);
    //let blobFile = new Blob([file], {type: file.type});

    // this.pdfToShow = window.URL.createObjectURL(file);
    // $("#PdfModal").modal('show');

    var blob = new Blob([file], {type: 'application/pdf'});
    var urlCreator = window.URL;  // || window.webkitURL;
    var pdfUrl = urlCreator.createObjectURL(blob);      
    this.pdfToShow = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
    $("#PdfModal").modal('show');

 }
}

  onAddLineClick(){    
    this.fileList.push(this.item);
    this.count++;
    this.clearInput();
  }

  removeLine(no){
    var data = this.fileList[no];
    if(confirm("Are you sure you want to delete this file?"))
      this.deleteFile(data.attachmentId, no);    
  }

  clearInput(){
    this.item = {};    
  }

  deleteFile(id, no){
    if(id <= 0) return;
    let connection: any;
    let data: any = {};    
    data.appointmentId = this.appointmentId;
    data.offerId = this.offerId;
    data.offerGuid = this.guid;
    data.attachmentId = id;
    if(localStorage.getItem('currentUser'))
    {
      let user = JSON.parse(localStorage.getItem('currentUser'));
      data.deletedById =  user.uid;
    }    
    if(this.appointmentId > 0)
      connection = this.httpService.HRpost(APIURLS.APPOINTMENT_DELETE_ATTACHMENT_DETAILS, data);
    else
      connection = this.service.postData(APIURLS.CANDIDATE_DELETE_ATTACHMENT_DETAILS, data);    

      toastr.info('Deleting...');
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Deleted successfully!');
          this.fileList.splice(no,1);
          this.count--;
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

  validateAttachments(){
    var valid = true;
    var mandatoryTypes = [{ type: "passport size photo" }, {type: "bank passbook / cheque"}];
    if(this.offerDetails && this.offerDetails.stateId > 0 && this.offerDetails.stateId != 1649 && !this.fileList.some(x=>x.attachmentType.toLowerCase() == "pan card")){
      toastr.error("Please upload pan card");
        valid = false;
    }
    // if(this.officialDetails && this.officialDetails.stateId!=1649 && !this.fileList.some(x=>x.attachmentType.toLowerCase() == "pan card")){
    //   toastr.error("Please upload pan card");
    //     valid = false;
    // }
    if(this.offerDetails && this.offerDetails.stateId > 0 && this.offerDetails.stateId != 1649 && !this.fileList.some(x=>x.attachmentType.toLowerCase() == "aadhar card")){
      toastr.error("Please upload aadhar card");
        valid = false;
    }
    // if(this.officialDetails && this.officialDetails.stateId!=1649 && !this.fileList.some(x=>x.attachmentType.toLowerCase() == "aadhar card")){
    //   toastr.error("Please upload aadhar card");
    //     valid = false;
    // }

    for(var type of mandatoryTypes){      
      if(!this.fileList.some(x=>x.attachmentType.toLowerCase() == type.type)){
        toastr.error("Please upload "+type.type);
        valid = false;
      }
    } 
    return valid;
  }
  
  saveData(){
    if(this.validateAttachments()){
      toastr.success('Details saved successfully!');
      this.dataSaved.emit({success: true});  
    }
  }
}
