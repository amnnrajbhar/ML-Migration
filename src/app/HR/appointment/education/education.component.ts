import { AppComponent } from '../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-appointment-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  @ViewChild(NgForm) educationForm: NgForm;
  @Input() appointmentId: number;
  @Input() offerId: number;
  @Input() guid: string;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();

  isLoading = false;
  countryList: any[] = [];
  stateList: any[] = [];
  educationList: any[] = [];  
  item: any = {};
  educationTypes: any[] = [];
  courseList: any[] = [];
  courseListFull: any[] = [];  
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedEducationLevel: any = null;
  selectedCourse: any = null;
  selectedState: any = null;
  selectedCountry: any = null;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private readonly sanitizer: DomSanitizer) { }
  

    ngOnInit() {
      this.service.getStates().then((data:any)=>{this.stateList = data;});
      this.service.getCountries().then((data:any)=>{
        this.countryList = data;
        this.selectedCountry = this.countryList.find(x=>x.id == 100);
      });
      this.service.getEducationLevels().then((data:any)=>{this.educationTypes = data;});
      this.service.getCourses().then((data:any)=>{this.courseListFull = data;});
      if(this.appointmentId == null || this.appointmentId == undefined)
        this.appointmentId=0;
      if(this.offerId == null || this.offerId == undefined)
        this.offerId=0;
      this.LoadData();
    }
  
    LoadData() {
      this.isLoading = true;
      let conn;
      if(this.appointmentId > 0)
      conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_EDUCATION_DETAILS + "/" + this.appointmentId);
      else
      conn = this.service.getData(APIURLS.CANDIDATE_GET_EDUCATION_DETAILS + "/" + this.offerId + "/" + this.guid);
      
      conn.then((data: any) => {
        if (data && data.length > 0) {
          this.educationList = data;
          this.count = data.length;
          this.dataLoaded.emit("loaded");
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  
onStateChange(){
  if(this.selectedState.id == 1649)  // Nepal
  {
    this.selectedCountry = this.countryList.find(x=>x.id==160); // Nepal
  }
  else 
    this.selectedCountry = this.countryList.find(x=>x.id==100); // India
}

onLevelChange(){
  if(this.selectedEducationLevel){
    // filter course list based on level
    this.courseList = this.courseListFull.filter(x=>x.educationLId == this.selectedEducationLevel.id);

    if(this.selectedEducationLevel.id == 1){  // School
      this.selectedCourse = this.courseListFull.find(x=>x.courseId==5);  //Matriculation/Secondary
    }
  }
}
    
    saveData(){
      if(!this.educationList.some(x=>x.courseId==5)){
        toastr.error("Please add Matriculation/SSLC/10th Standard education details to continue.");
        return;
      }      
      toastr.success('Details saved successfully!');
      this.dataSaved.emit({success: true});  
    }

    addData(files){
      if (files.length === 0){
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
      if(this.item.yearOfPassing > (new Date().getFullYear()+1)){
        toastr.error("Year of passing cannot be future year.");
          return;
      }
      toastr.info("Adding...");
      formData.append("AppointmentId", this.appointmentId.toString() );
      formData.append("OfferId", this.offerId.toString() );
      formData.append("OfferGuid", this.guid );
      formData.append("AppointmentEducationId", "00");
      formData.append("EducationLevelId", this.selectedEducationLevel.id );
      formData.append("CourseId", this.selectedCourse.id );
      formData.append("Specialisation", this.item.specialisation );
      formData.append("University", this.item.university );
      formData.append("City", this.item.city );
      formData.append("StateId", this.selectedState.id );
      formData.append("CountryId", this.selectedCountry.id );
      formData.append("DurationofCourse", this.item.durationofCourse );
      formData.append("YearOfPassing", this.item.yearOfPassing );
      formData.append("FullorPartTime", this.item.fullorPartTime );
      formData.append("Percentage", this.item.percentage );
      let connection: any;
      if(this.appointmentId > 0)
       connection = this.httpService.HRpostAttachmentFile(APIURLS.APPOINTMENT_SAVE_EDUCATION_DETAILS, formData);
      else
       connection = this.service.postAttachmentFiles(APIURLS.CANDIDATE_SAVE_EDUCATION_DETAILS, formData);

      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
          this.item.appointmentEducationId = data.id;
          this.onAddLine();
          toastr.success("Successfully added the details.");
        }
      }).catch(error => {
        //console.log(error);
        toastr.error('Error adding details...'+ error);
      })
    }

    updateData(files){
            
      const formData = new FormData();  
      if (files.length > 0){
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
      }
      if(this.item.yearOfPassing > (new Date().getFullYear()+1)){
        toastr.error("Year of passing cannot be future year.");
          return;
      }
      toastr.info("Updating...");
      formData.append("AppointmentId", this.appointmentId.toString() );
      formData.append("OfferId", this.offerId.toString() );
      formData.append("OfferGuid", this.guid );
      formData.append("AppointmentEducationId", this.item.appointmentEducationId);
      formData.append("EducationLevelId", this.selectedEducationLevel.id );
      formData.append("CourseId", this.selectedCourse.id );
      formData.append("Specialisation", this.item.specialisation );
      formData.append("University", this.item.university );
      formData.append("City", this.item.city );
      formData.append("StateId", this.selectedState.id );
      formData.append("CountryId", this.selectedCountry.id );
      formData.append("DurationofCourse", this.item.durationofCourse );
      formData.append("YearOfPassing", this.item.yearOfPassing );
      formData.append("FullorPartTime", this.item.fullorPartTime );
      formData.append("Percentage", this.item.percentage );
      let connection: any;
      if(this.appointmentId > 0)
       connection = this.httpService.HRpostAttachmentFile(APIURLS.APPOINTMENT_SAVE_EDUCATION_DETAILS, formData);
      else
       connection = this.service.postAttachmentFiles(APIURLS.CANDIDATE_SAVE_EDUCATION_DETAILS, formData);
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {          
          this.onUpdateLine();
          toastr.success("Successfully updated the details.");
        }
      }).catch(error => {
        //console.log(error);
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
      data.appointmentEducationId = id;
      if(this.appointmentId > 0)
       connection = this.httpService.HRpost(APIURLS.APPOINTMENT_DELETE_EDUCATION_DETAILS, data);
      else
      connection = this.service.postData(APIURLS.CANDIDATE_DELETE_EDUCATION_DETAILS, data);    
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
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while deleting the details. Error:' + error);
        });
    }

    getFile(id, fileName){
      if(id <= 0) return;
      let conn: any;
      if(this.appointmentId > 0)
        conn = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_EDUCATION_FILE+ "/" + id);
      else
        conn = this.httpService.HRdownloadFile(APIURLS.CANDIDATE_GET_EDUCATION_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id);

      conn.then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find(s => s.id == id).name;
        // if(data){
        //   var downloadURL = URL.createObjectURL(data);
        //   window.open(downloadURL);
        // }
  
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
    
    onAddLine(){    
      this.item.educationLevel = this.selectedEducationLevel.educationLevel;
      this.item.educationLevelId = this.selectedEducationLevel.id;
      this.item.courseId = this.selectedCourse.id;
      this.item.course = this.selectedCourse.educationCourse;
      this.item.stateId = this.selectedState.id;
      this.item.stateName = this.selectedState.bezei;
      this.item.countryId = this.selectedCountry.id;
      this.item.countryName = this.selectedCountry.landx;
      this.educationList.push(this.item);
      this.count++;
      this.clearInput();
    }
    
    EditLine(item, index){
      this.selectedEducationLevel = this.educationTypes.find(x=>x.id==item.educationLevelId);
      this.selectedCourse = this.courseListFull.find(x=>x.id==item.courseId);
      this.selectedState = this.stateList.find(x=>x.id==item.stateId);
      this.selectedCountry = this.countryList.find(x=>x.id==item.countryId);
      this.item = Object.assign({}, item);
      this.isEdit = true;
      this.editIndex = index;
    }
  
    onUpdateLine(){
      this.item.educationLevel = this.selectedEducationLevel.educationLevel;
      this.item.educationLevelId = this.selectedEducationLevel.id;
      this.item.courseId = this.selectedCourse.id;
      this.item.course = this.selectedCourse.educationCourse;
      this.item.stateId = this.selectedState.id;
      this.item.stateName = this.selectedState.bezei;
      this.item.countryId = this.selectedCountry.id;
      this.item.countryName = this.selectedCountry.landx;
      this.educationList[this.editIndex] = this.item;
      
      this.clearInput();
    }
  
    RemoveLine(no){
      if(no == this.editIndex && this.isEdit){
        this.clearInput();
      }else if(no < this.editIndex){
        this.editIndex--;
      }
      this.educationList.splice(no,1);
      this.count--;
    }
  
    clearInput(){
      this.isEdit = false;
      this.item = {};
      this.editIndex = -1;    
      this.selectedEducationLevel = null;
      this.selectedCourse = null;
      this.selectedState = null;
      //this.selectedCountry = null;
      this.educationForm.form.markAsPristine();
      this.educationForm.form.markAsUntouched();
    }
    
  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }

  
  viewFile(id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;

    if(this.appointmentId > 0)
    connection = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_EDUCATION_FILE+ "/" + id);
      else
      connection = this.httpService.HRdownloadFile(APIURLS.CANDIDATE_GET_EDUCATION_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id);

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

  
  downloadFile(id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;

    if(this.appointmentId > 0)
    connection = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_EDUCATION_FILE+ "/" + id);
      else
      connection = this.httpService.HRdownloadFile(APIURLS.CANDIDATE_GET_EDUCATION_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id);

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

  }
