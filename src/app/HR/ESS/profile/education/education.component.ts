import { Component, Input, OnInit, Output, EventEmitter, ViewChild,OnDestroy } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../../shared/api-url';
import { AuthData } from '../../../../auth/auth.model';
import { AppointmentService } from '../../../Services/appointmentService.service';
import { Util } from '../../../Services/util.service';
import { SharedVar } from '../sharedvar';
import { DomSanitizer } from '@angular/platform-browser';
import { TemporaryProfile } from '../temporaryprofile.model';
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-profile-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css'],
  providers:[Util,AppointmentService]
})
export class EducationComponent implements OnInit {
  @ViewChild(NgForm, { static: false })  educationForm: NgForm;
  @Input() employeeId: number;
  @Input() profileDetails: TemporaryProfile;  
  @Input() editAllowed: boolean ;
  @Input() profileId: number;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  isLoading = false;
  stateList: any[] = [];
  countryList: any[] = [];
  courseList:any[] = [];
  educationTypes:any[] = [];
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedCourse: any = null;
  selectedEducationLevel: any =null;
  selectedState: any = null;
  selectedCountry: any = null;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  educationList:any=[] = [];
  educationLists:any=[] = [];
  item:any={};
  profileDetailsList: any={};
  profileUpdate = false;
  statusList = [
    { type: "Update", color:"info" },    
    { type: "Delete", color:"danger"},
    { type: "Add", color:"success" },   
  ]
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, 
    private route: ActivatedRoute,private service: AppointmentService) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    this.service.getStates().then((data:any)=>{this.stateList = data;});
    this.service.getCountries().then((data:any)=>{
      this.countryList = data;
      this.selectedCountry = this.countryList.find(x=>x.id == 100);
    });
    this.service.getEducationLevels().then((data:any)=>{this.educationTypes = data;});
    this.service.getCourses().then((data:any)=>{this.courseFullList = data;});
      var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
      if (chkaccess == true) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.getData(this.employeeId);
      }
      if (this.profileId>0)
      {
        this.profileUpdate = true;
        this.getProfileData(this.profileId);
      }
  }

 getValues() : TemporaryProfile 
 {
   this.profileDetails.employeeId = this.employeeId;
   this.profileDetails.educationDetails = this.educationLists;
   return this.profileDetails;
 }
  getData(id) {
    this.isLoading = true;
    
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_EDUCATION, id).then((data: any) => {
      if (data) {
        this.educationList = data;
        this.educationLists = this.educationList;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  profileDetailsLists: any={};
  getProfileData(id)
  {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
      if (data) {
        this.profileDetailsList = data;
        this.profileDetailsList.educationDetails = this.profileDetailsList.educationDetails.filter(x => x.action!="None");
        for(var item of this.profileDetailsList.educationDetails){
          item.statusColor = this.statusList.find(x=>x.type == item.action).color;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  courseFullList:any []=[];
  onLevelChange(){
    if(this.selectedEducationLevel){
      // filter course list based on level
      this.courseList = this.courseFullList.filter(x=>x.educationLId == this.selectedEducationLevel.id);
  
      if(this.selectedEducationLevel.id == 1){  // School
        this.selectedCourse = this.courseFullList.find(x=>x.courseId==57);  //Matriculation/Secondary
      }
    }
  }
    onStateChange(){
      if(this.selectedState.id == 1649)  // Nepal
      {
        this.selectedCountry = this.countryList.find(x=>x.id==160); // Nepal
      }
      else 
        this.selectedCountry = this.countryList.find(x=>x.id==100); // India
    }

    courseListFull: any[] = [];  
    appointmentId:any;
    getFile(id, fileName){
      if(id <= 0) return;
      let conn: any;
      if(this.appointmentId > 0)
        conn = this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_EDUCATION_FILE+ "/" + id);

      conn.then((data: any) => {
  
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
    
    onAddLine(files){   
      if (files.length === 0){
        swal("Please select an attachment file.");
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
      this.item.educationLevel = this.selectedEducationLevel.educationLevel;
      this.item.educationLevelId = this.selectedEducationLevel.id;
      this.item.courseId = this.selectedCourse.id;
      this.item.course = this.selectedCourse.educationCourse;
      this.item.stateId = this.selectedState.id;
      this.item.stateName = this.selectedState.bezei;
      this.item.countryId = this.selectedCountry.id;
      this.item.countryName = this.selectedCountry.landx;
      this.item.action = "Add";
      //this.educationLists.push(this.item);
      this.educationList.push(this.item);
      this.addAttachments();
      this.count++;
      this.clearInput();
    }
    
    EditLine(item, index){
      this.selectedEducationLevel = this.educationTypes.find(x=>x.id==item.educationLevelId);
      this.onLevelChange();
      this.selectedCourse = this.courseList.find(x=>x.id==item.courseId);
      this.selectedState = this.stateList.find(x=>x.id==item.stateId);
      this.selectedCountry = this.countryList.find(x=>x.id==item.countryId);
      this.item = Object.assign({}, item);
      this.isEdit = true;
      this.editIndex = index;
    }
  
    onUpdateLine(){
      
      for (const file of this.files) {
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
        this.item.attachmentFileName = file.name;
      }
      if(this.item.yearOfPassing > (new Date().getFullYear()+1)){
        toastr.error("Year of passing cannot be future year.");
          return;
      }
      this.item.educationLevel = this.selectedEducationLevel.educationLevel;
      this.item.educationLevelId = this.selectedEducationLevel.id;
      this.item.courseId = this.selectedCourse.id;
      this.item.course = this.selectedCourse.educationCourse;
      this.item.stateId = this.selectedState.id;
      this.item.stateName = this.selectedState.bezei;
      this.item.countryId = this.selectedCountry.id;
      this.item.countryName = this.selectedCountry.landx;
      this.item.action = "Update";
      this.educationList[this.editIndex] = this.item;
      
      this.clearInput();
    }
  
    RemoveLine(no){
      if(no == this.editIndex && this.isEdit){
        this.clearInput();
      }else if(no < this.editIndex){
        this.editIndex--;
      }
      this.educationLists[no].action = "Delete";
      this.educationList.splice(no,1);
      console.log(this.educationLists);
      this.count--;
    }
  
    clearInput(){
      this.isEdit = false;
      this.item = {};
     // this.item.action = "Delete";
     // this.educationList[this.editIndex] = this.item;
      this.editIndex = -1;    
      this.selectedEducationLevel = null;
      this.selectedCourse = null;
      this.selectedState = null;
      //this.selectedCountry = null;
      this.educationForm.form.markAsPristine();
      this.educationForm.form.markAsUntouched();
    }    
    
    files: any[] = [];
    selectFiles(event) {
      this.files = event.target.files;
    }

    addAttachments(){

      if(this.files.length > 0){
        
        const formData = new FormData();  
        var index =0;
        for (const file of this.files) {      
          formData.append("attachments["+index+"]", file); 
          index++;
        }
        this.isLoading = true;      
        toastr.info("Uploading attachment files ...");  
        this.httpService.HRpostAttachmentFile(APIURLS.TEMPORARY_PROFILE_ATTACHMENTS+"/"+this.employeeId, formData)
        .then(
          (data: any) => {
            this.isLoading = false;       
            if (data == 200 || data.success) 
            { 
              toastr.success('Files uploaded successfully!');
            }
            else
            toastr.error(data.message);
          })
          .catch(error => {
            this.isLoading = false;
            toastr.error('Error occured while uploading attachments. Error:' + error);
          });
      }
    }
  }
