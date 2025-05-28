import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NewOffer } from '../new-offer/newoffer.model';
import { ChecklistComponent } from '../checklist/checklist.component';
import { OfferSalaryComponent } from '../../offersalary/offersalary.component';
import { AdditionalInfoComponent } from '../additional-info/additional-info.component';
import { Location } from '@angular/common';
import { AttachmentsComponent } from '../attachments/attachments.component';
import { MasterDataService } from '../../Services/masterdata.service';
declare var $: any;
declare var toastr:any;
declare var require: any;

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.component.html',
  styleUrls: ['./edit-offer.component.css'],
  providers: [Util]
})

export class EditOfferComponent implements OnInit {
@ViewChild(ChecklistComponent, { static: false }) checklistDetails: ChecklistComponent;
@ViewChild(OfferSalaryComponent, { static: false }) offerSalaryComponent: OfferSalaryComponent;
@ViewChild(AdditionalInfoComponent, { static: false }) additionalInfoComponent: AdditionalInfoComponent;
@ViewChild('replacingEmployeeNo', { static: false }) replacingEmployeeNoEle!: ElementRef;
@ViewChild(AttachmentsComponent, { static: false }) attachmentDetails: AttachmentsComponent;


  selectedType:any={};
  
  offerId: any;
  objectType: string = "Offer Letter";
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  comments = "";
  isLoading: boolean = false;
  newOffer = {} as NewOffer;
  isEdit: boolean = true;
  selectedPlant:any;
  selectedDesignation: any;
  fileList: any[] = [];
  editAllowed:boolean =true;
  allowSalaryChange:boolean = true;
  secondSignatoryRequired = false;
  countryList: any[] = [];  
  addressStateList: any[] = [];
  stateList: any[] = [];
  stateFullList: any[] = [];

  genders = [{type:"Male"}, {type: "Female"}];
  titles = [{type:"Mr."}, {type: "Mrs."}, {type: "Miss."}, {type: "Ms."}, {type: "Dr."}];
  salaryTypes = [{type:"Annual"}, {type: "Monthly"}];
  packageTypes = [{ type: "Annual CTC" }, { type: "Monthly Gross" }, { type: "Monthly Takehome" }];
  referenceTypes = [{type:"Employee Referral"}, {type:"Job Portal"}, {type:"Direct"}, {type:"Website"}, {type:"Management"}, {type:"Consultancy"}, {type:"Contractor"}];
  recruitmentTypes = [{type:"New Recruitment"}, {type:"Replacement"}];
  attachmentTypes = [{type: 'Salary slip'},{type: 'Expierence letter'},{type:'Resume'},{type:'Other'}];
  currentTab:string = "salary";
  tabIndex: number = 0;
  tabsList: string[] = ["salary", "additionalInfo", "breakup", "checklist", "attachments"];
  
  statusList = [
    { type: "Initial", color:"info" },
    { type: "Updated", color:"info" },
    { type: "Pre-joining Email Sent", color:"primary" },
    { type: "Pre-joining Completed", color:"success" },
    { type: "Pending For Approval", color:"info"},    
    { type: "Approved", color:"warning" },            
    { type: "Rejected", color:"danger" },        
    { type: "Pending For Exception Approval", color:"info"},    
    { type: "Exception Rejected", color:"danger" },        
    { type: "Exception Approved", color:"warning" },        
    { type: "Email Sent", color:"warning" },
    { type: "Accepted", color:"primary" },
    { type: "Not Accepted", color:"danger" },   
    { type: "Withdrawn", color:"danger" },
    { type: "Archived", color:"danger" }, 
  ]

  replacingEmployeeDetails: any = {};

  plantList: any[] = [];
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
        this.LoadOfferDetails(this.offerId);
      }
      this.getSignatories();
    }).catch((error)=> {
      this.plantList = [];
    });2    
  }

  payGroupList: any[] = [];
  getPayGroupList() {
    this.employeeCategoryList = [];
    if (this.selectedPlant.id > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
          this.getEmployeeCategoryList();
        }
        this.getSignatories();
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  employeeCategoryList: any[] = [];
  getEmployeeCategoryList() {
    if (this.selectedPlant.id > 0 && this.newOffer.payGroupId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id + "/" + this.newOffer.payGroupId)
        .then((data: any) => {
          if (data.length > 0) {
            this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
          }
          this.getSignatories();
        }).catch((error)=> {
          this.employeeCategoryList = [];
        });
    }
    else
      this.employeeCategoryList = [];
  }


  locationFullList: any[] = [];
  locationList: any[] = [];
  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a:any,b:any)=>{if(a.name > b.name) return 1; if(a.name < b.name) return -1; return 0;});
        this.loadStateAndLocations();
      }
    }).catch((error)=> {
      this.locationList = [];
    });
  }


  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a:any,b:any)=>{if(a.name > b.name) return 1; if(a.name < b.name) return -1; return 0;});
        this.selectedDesignation = this.designationList.find((x:any)  => x.id == this.newOffer.designationId);
      }
    }).catch((error)=> {
      this.designationList = [];
    });
  }
  
  roleList: any[] = [];
  getRole() {
    this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a:any,b:any)=>{if(a.role_ltxt > b.role_ltxt) return 1; if(a.role_ltxt < b.role_ltxt) return -1; return 0;});
      }
    }).catch((error)=> {
      this.roleList = [];
    });
  }

  departmentList:any[]=[];
  getDepartments(){
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
    });
  }

  qualificationList: any[] = [];
  getQualifications(){
    this.httpService.HRget(APIURLS.EDUCATION_C_M_API_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.qualificationList = data.sort((a:any, b:any) => { if (a.educationCourse > b.educationCourse) return 1; if (a.educationCourse < b.educationCourse) return -1; return 0; });
      }
    }).catch((error)=> {
      this.qualificationList = [];
    });
  }

  signatoryList:any[] = [];  
getSignatories(){
  if (this.selectedPlant && this.selectedPlant.id > 0 && this.newOffer.payGroupId > 0 && this.newOffer.employeeCategoryId > 0){
    this.httpService.HRget(APIURLS.OFFER_GET_SIGNATORIES + "/" + this.selectedPlant.id + "/" + this.newOffer.payGroupId +"/"+this.newOffer.employeeCategoryId)
    .then((data: any) => {
      if (data.length > 0 && this.signatoryList.length == 0) {
        this.signatoryList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch((error)=> {
      this.signatoryList = [];
    });
  }
}

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location,
    private util: Util, private service: MasterDataService) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.offerId = this.route.snapshot.paramMap.get('id')!;
      this.isLoading = true;
      this.getAllDropDownValues();
    }
  }  

  ngAfterViewInit(){
    $(this.replacingEmployeeNoEle.nativeElement).on('change', (e) => {
      this.GetReplacingEmployeeDetails();
    });
  }

  getAllDropDownValues(){
    this.getQualifications();
    this.getDepartments();
    this.getRole();
    this.getDesignation();
    this.getLocation();
    this.getPlantList();    
    
    this.service.getState().then((data:any)=>{this.addressStateList = data;});
    this.service.getCountries().then((data:any)=>{this.countryList = data;});
    this.service.getStateAll().then((data:any)=>{this.stateFullList = data; this.loadStateAndLocations();});
  }

  oldSalary = 0;
  LoadOfferDetails(id){
    this.isLoading = true;
  
    this.httpService.HRgetById(APIURLS.OFFER_DETAILS_API, id).then((data: any) => {
      if (data) {        
          this.newOffer = data;
          // if(data.status != "Initial" && data.status != "Rejected" && data.status != "Not Accepted" && data.status != "Exception Approved" 
          // && data.status != "Exception Rejected" && data.status != "Approved" && data.status != "Email Sent" && data.status != "Accepted")
          //   this.editAllowed = false;
          
          if(data.status == "Pending For Approval" || data.status == "Pending For Exception Approval"){
            this.editAllowed = false;
            this.allowSalaryChange = false;
          }
          
            this.oldSalary = data.offeredSalary;

          $("#approvingManagerId").val(data.approvingManagerId);
          $("#reportingManagerId").val(data.reportingManagerId);
          $("#replacingEmployeeId").val(data.replacingEmployeeId);
          if(data.secondSignatoryId > 0){
            this.secondSignatoryRequired = true;
          }
          //this.fileList = data.attachments;
          this.selectedDesignation = this.designationList.find((x:any)  => x.id == data.designationId);        
          this.loadStateAndLocations();
          this.selectedPlant = this.plantList.find(x=>x.id == this.newOffer.plantId);          
          this.getPayGroupList();
          this.newOffer.statusColor = this.statusList.find(x=>x.type == data.status).color;
          this.replacingEmployeeDetails.plantName = this.newOffer.replacingEmployeePlantCode + " - " + this.newOffer.replacingEmployeePlantName;
          this.replacingEmployeeDetails.department = this.newOffer.replacingEmployeeDepartment;
          this.replacingEmployeeDetails.designation = this.newOffer.replacingEmployeeDesignation;
          this.replacingEmployeeDetails.currentCTC = this.newOffer.replacingEmployeeCurrentCTC;
          this.replacingEmployeeDetails.dateOfResignation = this.newOffer.replacingEmployeeDOR;
          this.replacingEmployeeDetails.dateOfLeaving = this.newOffer.replacingEmployeeDOL;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }

  loadStateAndLocations(){
    if(this.newOffer.countryId > 0){
      var country = this.countryList.find(x=>x.id == this.newOffer.countryId);
      this.stateList = this.stateFullList.filter((x:any)  => x.land1 == country.land1);
    }   
    this.locationList = this.locationFullList.filter((x:any)=>x.stateId == this.newOffer.locationStateId);
  }

  onDesignationChange(){
      this.newOffer.grade = this.designationList.find(x=>x.id == this.newOffer.designationId).grade;
  }

  onDateOfBirthChange(){
    var dob = new Date(this.newOffer.dateOfBirth);
    var today = new Date();
    this.newOffer.age = today.getFullYear() - dob.getFullYear();
  }
  
  onCountryChange(){
    this.stateList = [];    
    this.locationList = [];
    this.newOffer.locationStateId = "";
    this.newOffer.locationId = "";
    if(this.newOffer.countryId > 0){
      var country = this.countryList.find(x=>x.id == this.newOffer.countryId);
      this.stateList = this.stateFullList.filter((x:any)  => x.land1 == country.land1);
    }  
  }

  onStateChange(){
    this.newOffer.locationId = "";
    this.locationList = this.locationFullList.filter((x:any)=>x.stateId == this.newOffer.locationStateId);
}

  submit(){    
    if(!this.attachmentDetails.Validate()) return;

    if(!confirm("Are you sure you want to Submit for Approval?")) return;
    
    this.saveDraft(false, false, null);
    this.newOffer.submitForApproval = true;
    this.submitForApproval(this.newOffer.offerId);
  }

  saveDraft(showNext, submitForExceptionApproval, files){
    let connection: any;    
    var today = new Date();
    var joiningDate = new Date(joiningDate);

    if(this.currentTab == "salary"){
      this.newOffer.replacingEmployeeId = $("#replacingEmployeeId").val();     
      this.newOffer.replacingEmployeeName = $("#replacingEmployeeName").val();           
    }
    
    if(this.newOffer.recruitmentType == "Replacement" 
    && (this.newOffer.replacingEmployeeName == null || this.newOffer.replacingEmployeeName == "" || this.newOffer.replacingEmployeeName == undefined
    || this.newOffer.replacingEmployeeId == null || this.newOffer.replacingEmployeeId == undefined)){
      toastr.error("Please select replacing employee.");
      return;
    }
    if(this.newOffer.totalExperience != 0 && this.newOffer.presentCTC <= 0){
      toastr.error("Please enter a valid present CTC.");
      return;
    }
    if(this.newOffer.age <18){
      toastr.error("Age should be more than or equal to 18.");
      return;
    }
    if(this.newOffer.age - this.newOffer.totalExperience < 18){
      toastr.error("Total experience cannot be greater than "+ (this.newOffer.age - 18));
      return;
    }
    // if(this.newOffer.mobileNo && this.newOffer.mobileNo.startsWith("0")){
    //   toastr.error("Mobile No cannot start with 0");
    //   return;
    // }
    // Present Designation mandatory for experienced non-Field staff candidates
    if(this.newOffer.totalExperience != 0 && this.newOffer.employeeCategoryId != 2 && this.newOffer.presentDesignation == ""){
      toastr.error("Please enter present designation.");
      return;
    }
    if(joiningDate < today){
      toastr.error("Joining Date cannot be before today's date."); return;
    }
    this.isLoading = true;
    this.newOffer.designationId = this.selectedDesignation.id;
    this.newOffer.plantId = this.selectedPlant.id;
    this.newOffer.joiningDate = this.util.getFormatedDateTime(this.newOffer.joiningDate); 
    this.newOffer.dateOfBirth = this.util.getFormatedDateTime(this.newOffer.dateOfBirth);    
    this.newOffer.approvingManagerId = $("#approvingManagerId").val();
    this.newOffer.reportingManagerId = $("#reportingManagerId").val();
    this.newOffer.secondSignatoryId = this.secondSignatoryRequired == true ? this.newOffer.secondSignatoryId : null;
    
    if (!this.isEdit) {
      this.newOffer.createdById = this.currentUser.uid;
      connection = this.httpService.HRpost(APIURLS.OFFER_DETAILS_API, this.newOffer);
    }
    else {
      this.newOffer.modifiedById = this.currentUser.uid;      
      connection = this.httpService.HRpost(APIURLS.OFFER_DETAILS_UPDATE, this.newOffer);
    }
    connection.then(
      (data: any) => {
      this.isLoading = false;
      if (data == 200 || data.success) 
      {                     
        if(showNext){          
          toastr.success("Details saved successfully.");        
          this.showNext();
        }
        if(files && files.length > 0){
          this.addAttachments(files);
        }
        if(submitForExceptionApproval){
          this.submitForExceptionApproval();
        }
      }
      else
      toastr.error(data.message);
    },
    (err)=>{
      this.isLoading = false;
      this.errMsgModalPop = 'Error occured while saving Offer Details. Error:'+ err;
      toastr.error(this.errMsgModalPop);
    })
    .catch((error)=> {
      this.isLoading = false;
      this.errMsgModalPop = 'Error occured while saving Offer Details. Error:'+ error;
      toastr.error(this.errMsgModalPop);
    });
  }

  checkIfInRange(){

    if(this.allowSalaryChange == false || this.oldSalary == this.newOffer.offeredSalary) {
      this.saveDraft(true, false, null);
      return;
    }
    let connection: any;
    var joiningDate = new Date(joiningDate);
    
    this.isLoading = true;
    //swal("Saving...");
    this.newOffer.designationId = this.selectedDesignation.id;
    this.newOffer.plantId = this.selectedPlant.id;
    this.newOffer.joiningDate = this.util.getFormatedDateTime(this.newOffer.joiningDate);    
    this.newOffer.dateOfBirth = this.util.getFormatedDateTime(this.newOffer.dateOfBirth);    
    this.newOffer.createdById = this.currentUser.uid;
    this.newOffer.approvingManagerId = $("#approvingManagerId").val();
    this.newOffer.reportingManagerId = $("#reportingManagerId").val();
    this.newOffer.replacingEmployeeId = $("#replacingEmployeeId").val();     
    connection = this.httpService.HRpost(APIURLS.OFFER_DETAILS_CHECK_SALARY_IN_RANGE, this.newOffer);
    
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {        
          this.saveDraft(true, false, null);
        }
        else{
          toastr.error(data.message);
          $("#ExceptionModal").modal("show");
        }
      },
      (err) => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while checking salary range. Error:' + err;
        toastr.error(this.errMsgModalPop);
      })
      .catch((error)=> {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while checking salary range. Error:' + error;
        toastr.error(this.errMsgModalPop);
      });      
  }

  saveAndSubmitForExceptionApproval(files){
    if(this.comments == "" || this.comments == null || this.comments == undefined){
      toastr.error("Please enter justification."); return;
    }   
    this.saveDraft(false, true, files);
  }
  
  submitForExceptionApproval(){        
   
    this.isLoading = true;
    var request: any = {};
    request.reason = this.comments;
    request.offerId = this.newOffer.offerId;      
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for exception approval...");  
    this.httpService.HRpost(APIURLS.OFFER_DETAILS_SUBMIT_FOR_EXCEPTION_APPROVAL, request)
    .then((data: any) => {
      if(data == 200 || data.success)
      { 
        toastr.success("Successfully submitted for exception approval.");  
        $("#ExceptionModal").modal("hide");
        this.router.navigate(['/HR/offer/offer-list']);
      }else if(!data.success){
        toastr.error(data.message); 
      }else
        toastr.error("Error occurred.");
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error(error);
    });    
}

  submitForApproval(id){        
    var request: any = {};
    request.offerId = id;      
    request.submittedById = this.currentUser.uid;
    if(this.allowSalaryChange == true &&  this.oldSalary != this.newOffer.offeredSalary){
      request.reason = "Salary changed from "+this.oldSalary + " to " + this.newOffer.offeredSalary;
    }
    toastr.info("Submitting for approval...");  
    this.httpService.HRpost(APIURLS.OFFER_DETAILS_SUBMIT_FOR_APPROVAL, request)
    .then((data: any) => {
      if(data == 200 || data.success)
      { 
        toastr.success("Successfully submitted for approval.");  
        this.router.navigate(['/HR/offer/offer-list']);
      }else if(!data.success){
        toastr.error(data.message); 
      }else
      toastr.error("Error occurred while submitting.");
    }).catch((error)=> {
      toastr.error(error);
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
    this.fileList.push({fileName: file.name,type:"Approval"});
    index++;
    console.log('formData',formData)        
  }
  toastr.info("Uploading attachment files ...");  
  this.httpService.HRpostAttachmentFile(APIURLS.OFFER_DETAILS_ADD_ATTACHMENTS+"/"+this.newOffer.offerId+"/Approval", formData)
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
      this.errMsgModalPop = 'Error occured while uploading attachments. Error:' + error;
      toastr.error(this.errMsgModalPop);
    });
}

Done(){
  this.router.navigate(['/HR/offer/offer-list']);
}

goBack() {
  this.location.back();
}

onDataSaved(result){
if(result == 200 || result.success){    
    this.showNext();    
}
else
  toastr.error(result.message);
}

onPrevious(){    
  this.showPrevious();     
}

onNext(){    
  
  if(this.currentTab == "salary"){
    this.checkIfInRange();    
  }
  else if(this.currentTab == "additionalInfo" && this.editAllowed){
    //this.saveDraft(false, false, null);
    this.additionalInfoComponent.SaveData();
  }
  else if(this.currentTab == "breakup" && (this.editAllowed || this.allowSalaryChange)){
    //this.saveDraft(false, false, null);
    this.offerSalaryComponent.saveData();
  }
  else if(this.currentTab == "checklist"){
    //this.saveDraft(false, false, null);
    this.checklistDetails.SaveData();
  }
  else 
    this.showNext(); 
}

onTabClick(index){    

}

showPrevious(){
  this.tabIndex--;
  this.currentTab = this.tabsList[this.tabIndex];
}
showNext(){
  this.tabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

  cancel(){
    this.router.navigate(['/HR/offer/offer-list']);
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
  keyPressAllowOnlyNumberWithDecimal(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 8 && charCode != 46 && charCode > 32 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  
  lastApprovingkeydown = 0;
  getApprovingManager($event) {
    let text = $('#approvingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#approvingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else{
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else{
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApprovingkeydown = $event.timeStamp;
    }
  }
  lastReportingkeydown = 0;
  getReportingManager($event) {
    let text = $('#reportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#reportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#reportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else{
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#reportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else{
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }

  lastkeydown = 0;
  getReplacingEmployeeName($event) {
    let text = $('#replacingEmployeeName').val();    

    if (text.length > 3) {
      if ($event.timeStamp - this.lastkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_ALL_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.employeeName + " ("+item.employeeId+")", value: item };
            })
            $('#replacingEmployeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#replacingEmployeeName").val(ui.item.label);
                  $("#replacingEmployeeId").val(ui.item.value.id);
                  $("#replacingEmployeeNo").val(ui.item.value.employeeId);    
                }
                else{
                  $("#replacingEmployeeName").val('');
                  $("#replacingEmployeeId").val('');
                  $("#replacingEmployeeNo").val('');    
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#replacingEmployeeName").val(ui.item.label);
                  $("#replacingEmployeeId").val(ui.item.value.id);
                  $("#replacingEmployeeNo").val(ui.item.value.employeeId);       
                  $("#replacingEmployeeNo").change();              
                }
                else{
                  $("#replacingEmployeeName").val('');
                  $("#replacingEmployeeId").val('');
                  $("#replacingEmployeeNo").val('');    
                  $("#replacingEmployeeNo").change();                 
                }
                return false;
              }
            });
          }
        });
      }
      this.lastkeydown = $event.timeStamp;
    }
  }

  
  GetReplacingEmployeeDetails(){
    var empNo = $("#replacingEmployeeNo").val();
    if(empNo != ''){
      this.httpService.HRget(APIURLS.OFFER_GET_REPLACING_EMPLOYEE_DETAILS + "/" + empNo)
      .then((data: any) => {
        this.replacingEmployeeDetails = data;
      }).catch((error)=> {
        //console.log(error);
      });
    }
    else{
      this.replacingEmployeeDetails = {};
    }
  }

}
