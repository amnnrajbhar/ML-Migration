import { AppComponent } from '../../../app.component';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { Util } from '../../Services/util.service';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser'
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-appointment-workexperience',
  templateUrl: './workexperience.component.html',
  styleUrls: ['./workexperience.component.css']
})
export class WorkexperienceComponent implements OnInit {
  @ViewChild(NgForm  , { static: false }) workExperienceForm!: NgForm;
  @Input() appointmentId!: number;
  @Input() offerId!: number;
  @Input() guid: string
  @Input() editAllowed: boolean = true;
  @Input() experience!: number;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  
  isLoading = false;
  workList: any[] = [];
  industryTypes: any[] = [];
  countryTypes: any[] = [];
  count: number = 0;

  item: any = {};
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedIndustry: any = null;
  selectedCountry: any = null;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util, private readonly sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.service.getIndustries().then((data:any)=>{this.industryTypes = data;});
    this.service.getCountries().then((data:any)=>{
      this.countryTypes = data;
      this.selectedCountry = this.countryTypes.find(x=>x.id==100);
    });
    
    if(this.appointmentId == null || this.appointmentId == undefined)
      this.appointmentId=0;
    
    if(this.offerId == null || this.offerId == undefined)
      this.offerId=0;

    this.LoadData();
  }

  LoadData() {
    this.isLoading = true;
    let conn: any;
    if(this.appointmentId > 0)
      conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_WORK_DETAILS + "/" + this.appointmentId);
    else
      conn = this.service.getData(APIURLS.CANDIDATE_GET_WORK_DETAILS + "/" + this.offerId + "/" + this.guid);

    conn.then((data: any) => {
      if (data && data.length > 0) {
        this.workList = data.sort((a:any, b:any) => { if (a.fromDate > b.fromDate) return 1; if (a.fromDate < b.fromDate) return -1; return 0; });
        this.count = data.length;
        this.dataLoaded.emit("loaded");
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.workList = [];
    });
  }
  
  saveData(){
    if(this.experience > 0 && this.workList.length <= 0){
      toastr.error("Add atleast one work details to continue.");
      return;
    }
    toastr.success('Details saved successfully!');
    this.dataSaved.emit({success: true});  
  }

  
  addData(files){
    if (files.length === 0 && !this.item.currentCompany){
      toastr.error("Please select an attachment file.");
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
      formData.append("Attachment", file);
      this.item.attachmentFileName = file.name;
    }
    var frmDate = new Date(this.item.fromDate);
    var toDate = new Date(this.item.toDate);
    for(var line of this.workList){
      
      if(frmDate >= new Date(line.fromDate) && frmDate <= new Date(line.toDate)){
        toastr.error("From Date cannot overlap with other experience details entered."); return;
      }
      if(toDate >= new Date(line.fromDate) && toDate <= new Date(line.toDate)){
        toastr.error("To Date cannot overlap with other experience details entered."); return;
      }
      if(frmDate <= new Date(line.fromDate) && toDate >= new Date(line.toDate)){
        toastr.error("From Date and To Date cannot overlap with other experience details entered."); return;
      }
    }
    if(this.item.fromDate != "")
      this.item.fromDate = this.util.getFormatedDateTime(this.item.fromDate);        
    if(this.item.toDate != "")
      this.item.toDate = this.util.getFormatedDateTime(this.item.toDate);        
    
    var today = new Date();
    if(this.item.fromDate >= today  ){
      toastr.error("From date should be before today date.");
        return;
    }
    if(!this.item.currentCompany && (this.item.toDate <= this.item.fromDate || this.item.toDate > today )){
      toastr.error("To date should be after the from date and before today date.");
        return;
    }
    if(this.item.currentCompany && this.workList.filter((x:any)=>x.currentCompany == true).length > 0){
      toastr.error("Already work experience added for current working company, cannot add one more.");
      return;
    }
    toastr.info("Adding...");
    formData.append("AppointmentId", this.appointmentId.toString() );
    formData.append("OfferId", this.offerId.toString() );
    formData.append("OfferGuid", this.guid );
    formData.append("AppointmentWorkExperienceId", "00");
    formData.append("IndustryId", this.selectedIndustry.id );
    formData.append("Employer", this.item.employer );
    formData.append("City", this.item.city );
    formData.append("CountryId", this.selectedCountry.id );
    formData.append("Designation", this.item.designation );
    formData.append("JobRole", this.item.jobRole );
    formData.append("FromDate", this.item.fromDate );
    formData.append("ToDate", this.item.toDate );
    formData.append("IsMicroLab", this.item.isMicroLab );
    formData.append("CurrentCompany", this.item.currentCompany != undefined ? this.item.currentCompany : false );
    formData.append("OldEmployeeNumber", this.item.oldEmployeeNumber != undefined ? this.item.oldEmployeeNumber : "" );
    let connection: any;
    if(this.appointmentId > 0)
      connection = this.httpService.HRpostAttachmentFile(APIURLS.APPOINTMENT_SAVE_WORK_DETAILS, formData);
    else 
      connection = this.service.postAttachmentFiles(APIURLS.CANDIDATE_SAVE_WORK_DETAILS, formData);

    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        this.item.appointmentWorkExperienceId = data.id;
        this.onAddLine();
        toastr.success("Successfully added the details.");
      }
    }).catch((error)=> {
      ////console.log(error);
      toastr.error('Error adding details...'+ error);
    })
  }

  updateData(files){
    // if (files.length <= 0){
    //   toastr.error("Please attach Experience letter / Relieving letter.");
    //   return;
    // }
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
      formData.append("Attachment", file);
      this.item.attachmentFileName = file.name;
    }
    var frmDate = new Date(this.item.fromDate);
    var toDate = new Date(this.item.toDate);
    for(var line of this.workList){
      
      if(frmDate >= new Date(line.fromDate) && frmDate <= new Date(line.toDate) && this.item.AppointmentWorkExperienceId != line.AppointmentWorkExperienceId){
        toastr.error("From Date cannot overlap with other experience details entered."); return;
      }
      if(toDate >= new Date(line.fromDate) && toDate <= new Date(line.toDate) && this.item.AppointmentWorkExperienceId != line.AppointmentWorkExperienceId){
        toastr.error("To Date cannot overlap with other experience details entered."); return;
      }
      if(frmDate <= new Date(line.fromDate) && toDate >= new Date(line.toDate) && this.item.AppointmentWorkExperienceId != line.AppointmentWorkExperienceId){
        toastr.error("From Date and To Date cannot overlap with other experience details entered."); return;
      }
    }
    if(this.item.fromDate != "")
      this.item.fromDate = this.util.getFormatedDateTime(this.item.fromDate);        
    if(this.item.toDate != "")
      this.item.toDate = this.util.getFormatedDateTime(this.item.toDate);    
      
    if(this.item.currentCompany && this.workList.filter((x:any)=>x.currentCompany == true 
      && x.AppointmentWorkExperienceId != this.item.AppointmentWorkExperienceId).length > 0){
        toastr.error("Already work experience added for current working company, cannot add one more.");
      return;
    }
    var today = new Date();
    if(!this.item.currentCompany && (this.item.toDate <= this.item.fromDate || this.item.toDate > today )){
      toastr.error("To date should be after the from date and before today date.");
        return;
    }
    
    toastr.info("Updating...");
    formData.append("AppointmentId", this.appointmentId.toString() );
    formData.append("OfferId", this.offerId.toString() );
    formData.append("OfferGuid", this.guid );
    formData.append("AppointmentWorkExperienceId", this.item.appointmentWorkExperienceId);
    formData.append("IndustryId", this.selectedIndustry.id );
    formData.append("Employer", this.item.employer );
    formData.append("City", this.item.city );
    formData.append("CountryId", this.selectedCountry.id );
    formData.append("Designation", this.item.designation );
    formData.append("JobRole", this.item.jobRole );
    formData.append("FromDate", this.item.fromDate );
    formData.append("ToDate", this.item.toDate );
    formData.append("IsMicroLab", this.item.isMicroLab );
    formData.append("CurrentCompany", this.item.currentCompany != undefined ? this.item.currentCompany : false );
    formData.append("OldEmployeeNumber", this.item.oldEmployeeNumber != undefined ? this.item.oldEmployeeNumber : "" );
    let connection: any;
    if(this.appointmentId > 0)
     connection = this.httpService.HRpostAttachmentFile(APIURLS.APPOINTMENT_SAVE_WORK_DETAILS, formData);
     else
     connection = this.service.postAttachmentFiles(APIURLS.CANDIDATE_SAVE_WORK_DETAILS, formData);

    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {          
        this.onUpdateLine();
        toastr.success("Successfully updated the details.");
      }
    }).catch((error)=> {
      ////console.log(error);
      toastr.error('Error updating details...'+ error);
    })
  }

  deleteData(id, no){
    if(id <= 0) return;
    if(!confirm("Are you sure you want to delete this record?")) return;

    let connection: any;
    let data: any = {};
    data.appointmentId = this.appointmentId;
    data.offerId = this.offerId;
    data.offerGuid = this.guid;
    data.AppointmentWorkExperienceId = id;
    if(this.appointmentId > 0)
      connection = this.httpService.HRpost(APIURLS.APPOINTMENT_DELETE_WORK_DETAILS, data);    
    else
      connection = this.service.postData(APIURLS.CANDIDATE_DELETE_WORK_DETAILS, data);    
      toastr.info('Deleting...');
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Deleted successfully!');
          this.RemoveLine(no);
        }
        else
        toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while deleting the details. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while deleting the details. Error:' + error);
      });
  }

  getFile(id, fileName){
    if(id <= 0) return;
    let conn: any;
    if(this.appointmentId > 0)
    conn = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_WORK_FILE+ "/"+ id);
    else 
    conn = this.httpService.HRdownloadFile(APIURLS.CANDIDATE_GET_WORK_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id);

    conn.then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find((s:any) => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }

      if (data != undefined) {
       // var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
    //      FileSaver.saveAs(imageFile);
      }
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
  onAddLine(){    
    this.item.industryName = this.selectedIndustry.indDesc;
    this.item.industryId = this.selectedIndustry.id;        
    this.item.countryId = this.selectedCountry.id;
    this.item.countryName = this.selectedCountry.landx;
    this.workList.push(this.item);
    this.count++;
    this.clearInput();
  }
  
  EditLine(item, index){
    this.selectedIndustry = this.industryTypes.find(x=>x.id==item.industryId);
    this.selectedCountry = this.countryTypes.find(x=>x.id==item.countryId);
    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
  }

  onUpdateLine(){
    this.item.industryName = this.selectedIndustry.indDesc;
    this.item.industryId = this.selectedIndustry.id;             
    this.item.countryId = this.selectedCountry.id;
    this.item.countryName = this.selectedCountry.landx;
    this.workList[this.editIndex] = this.item;
    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.workList.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;    
    this.selectedIndustry = null;
    //this.selectedCountry = null;
    this.workExperienceForm.form.markAsPristine();
    this.workExperienceForm.form.markAsUntouched();
  }

  
  
  viewFile(id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;

    if(this.appointmentId > 0)
    connection = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_WORK_FILE+ "/"+ id);
    else 
    connection = this.httpService.HRdownloadFile(APIURLS.CANDIDATE_GET_WORK_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id);

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

    if(this.appointmentId > 0)
    connection = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_WORK_FILE+ "/"+ id);
    else 
    connection = this.httpService.HRdownloadFile(APIURLS.CANDIDATE_GET_WORK_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id);

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

}

