import { Component, Input, OnInit ,Output,EventEmitter,ViewChild,OnDestroy } from '@angular/core';
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
import { TemporaryProfile } from '../temporaryprofile.model';
import { SharedVar } from '../sharedvar';
import { AuthData } from '../../../../auth/auth.model';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-profile-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
  providers:[Util,AppointmentService]
})
export class ExperienceComponent implements OnInit {
  @ViewChild(NgForm , { static: false })   workExperienceForm!: NgForm;
  @Input() employeeId!: number;
  @Input() profileDetails: TemporaryProfile;
  @Input() editAllowed: boolean ;
  @Input() profileId!: number;
  @Input() experience!: number;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  
  isLoading = false;
  workList: any[] = [];
  industryTypes: any[] = [];
  countryTypes: any[] = [];
  count: number = 0;
  experienceList :any[] = [];
  experienceLists :any[] = [];
  item: any = {};
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedIndustry: any = null;
  selectedCountry: any = null;
  currentUser!: AuthData;
  profileDetailsList: any={};
  profileUpdate = false;
  statusList = [
    { type: "Update", color:"info" },    
    { type: "Delete", color:"danger"},
    { type: "Add", color:"success" },   
  ]
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util) { }

  ngOnInit() {

    this.service.getIndustries().then((data:any)=>{this.industryTypes = data;});
    this.service.getCountries().then((data:any)=>{
      this.countryTypes = data;
      this.selectedCountry = this.countryTypes.find(x=>x.id==100);
    });
 
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
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
    this.profileDetails.experienceDetails = this.experienceLists;
    return this.profileDetails;
  }
 

  getData(id:any) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_EXPERIENCE, id).then((data: any) => {
      if (data) {
        this.experienceList = data;
        this.experienceLists = this.experienceList;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
  
  getProfileData(id)
  {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
      if (data) {
        this.profileDetailsList = data;
        this.profileDetailsList.experienceDetails = this.profileDetailsList.experienceDetails.filter((x:any)  => x.action!="None");
        for(var item of this.profileDetailsList.experienceDetails){
          item.statusColor = this.statusList.find(x=>x.type == item.action).color;
        }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
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
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while uploading attachments. Error:' + error);
      });
  }
}

  onAddLine(files){    
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
   
    this.item.industryName = this.selectedIndustry.indDesc;
    this.item.industryId = this.selectedIndustry.id;        
    this.item.countryId = this.selectedCountry.id;
    this.item.countryName = this.selectedCountry.landx;
    this.item.action = "Add";
    //this.experienceLists.push(this.item);    
    this.experienceList.push(this.item);
    this.addAttachments();
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
    const formData = new FormData();  
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
    this.item.industryName = this.selectedIndustry.indDesc;
    this.item.industryId = this.selectedIndustry.id;             
    this.item.countryId = this.selectedCountry.id;
    this.item.countryName = this.selectedCountry.landx;
    this.item.attachmentFileName = this.item.attachment;
    this.item.action = "Update";
    this.experienceList[this.editIndex] = this.item;
    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.experienceLists[no].action = "Delete";
    this.experienceList.splice(no,1);
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

}

