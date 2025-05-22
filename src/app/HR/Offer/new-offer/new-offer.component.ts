import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NewOffer } from './newoffer.model';
import { ChecklistComponent } from '../checklist/checklist.component';
import { OfferSalaryComponent } from '../../offersalary/offersalary.component';
import { AdditionalInfoComponent } from '../additional-info/additional-info.component';
import {AttachmentsComponent} from '../attachments/attachments.component'
import { MasterDataService } from '../../Services/masterdata.service';
import { AppointmentService } from '../../Services/appointmentService.service';
declare var $: any;
declare var toastr: any;
declare var require: any;

@Component({
  selector: 'hr-new-offer',
  templateUrl: './new-offer.component.html',
  styleUrls: ['./new-offer.component.css'],
  providers: [Util]
})

export class NewOfferComponent implements OnInit {
  @ViewChild(ChecklistComponent) checklistDetails: ChecklistComponent;
  @ViewChild(OfferSalaryComponent) offerSalaryComponent: OfferSalaryComponent;
  @ViewChild(AdditionalInfoComponent) additionalInfoComponent: AdditionalInfoComponent;
  @ViewChild('replacingEmployeeNo') replacingEmployeeNoEle: ElementRef;
  @ViewChild(AttachmentsComponent) attachmentDetails:AttachmentsComponent

  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  newOffer = {} as NewOffer;
  isEdit: boolean = false;
  comments = "";
  secondSignatoryRequired = false;

  genders = [{ type: "Male" }, { type: "Female" }];
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  salaryTypes = [{ type: "Annual" }, { type: "Monthly" }];
  packageTypes = [{ type: "Annual CTC" }, { type: "Monthly Gross" }, { type: "Monthly Takehome" }];
  referenceTypes = [{ type: "Employee Referral" }, { type: "Job Portal" }, { type: "Direct" }, { type: "Website" }, { type: "Management" }, { type: "Consultancy" }, { type: "Contractor" }];
  recruitmentTypes = [{ type: "New Recruitment" }, { type: "Replacement" }];
  attachmentTypes = [{type: 'Salary slip'},{type: 'Expierence letter'},{type:'Resume'},{type:'Other'}]
  currentTab:string = "salary";
  tabIndex: number = 0;
  tabsList: string[] = ["salary", "additionalInfo", "breakup", "checklist", "attachments"];
  fileList: any[]=[];
  selectedType:any={};
  countryList: any[] = [];
  
  addressStateList: any[] = [];
  stateList: any[] = [];
  stateFullList: any[] = [];
  
  selectedPlant: any;
  plantList: any[] = [];
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {      
      this.plantList = [];
    });
  }

  payGroupList: any[] = [];
  getPayGroupList() {
    this.employeeCategoryList = [];
    if (this.selectedPlant.id > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
        this.getSignatories();
      }).catch(error => {
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
            this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
          }
          this.getSignatories();
        }).catch(error => {
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
        this.locationFullList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.locationList = [];
    });
  }

  selectedDesignation: any;
  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.designationList = [];
    });
  }

  roleList: any[] = [];
  getRole() {
    this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a, b) => { if (a.role_ltxt > b.role_ltxt) return 1; if (a.role_ltxt < b.role_ltxt) return -1; return 0; });
      }
    }).catch(error => {
      this.roleList = [];
    });
  }

departmentList:any[]=[];
getDepartments(){
  this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
    if (data.length > 0) {
      this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
    }
  }).catch(error => {
    this.departmentList = [];
  });
}

qualificationList: any[] = [];
getQualifications(){
  this.httpService.HRget(APIURLS.EDUCATION_C_M_API_GETALL).then((data: any) => {
    if (data.length > 0) {
      this.qualificationList = data.sort((a, b) => { if (a.educationCourse > b.educationCourse) return 1; if (a.educationCourse < b.educationCourse) return -1; return 0; });
    }
  }).catch(error => {
    this.qualificationList = [];
  });
}

signatoryList:any[] = [];  
getSignatories(){
  if (this.selectedPlant && this.selectedPlant.id > 0 && this.newOffer.payGroupId > 0 && this.newOffer.employeeCategoryId > 0){
    this.httpService.HRget(APIURLS.OFFER_GET_SIGNATORIES + "/" + this.selectedPlant.id + "/" + this.newOffer.payGroupId +"/"+this.newOffer.employeeCategoryId)
    .then((data: any) => {
      if (data.length > 0 && this.signatoryList.length == 0) {
        this.signatoryList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.signatoryList = [];
    });
  }
}

replacingEmployeeDetails: any = {};

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util, private service: MasterDataService) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.isLoading = true;
      this.getAllDropDownValues();
      this.isLoading = false;      
      this.newOffer.preJoiningInitiation = "Before Offer Release";
      this.newOffer.pfApplicable = "Yes";      
      
      // default Counry selected in India
      this.newOffer.countryId= 100;
      this.onCountryChange();
    }
  }

  ngAfterViewInit(){
    $(this.replacingEmployeeNoEle.nativeElement).on('change', (e) => {
      this.GetReplacingEmployeeDetails();
    });
  }
  
  getAllDropDownValues() {
    this.getQualifications();
    this.getDepartments();
    this.getRole();
    this.getDesignation();
    this.getLocation();
    this.getPlantList();
    this.service.getState().then((data:any)=>{this.addressStateList = data; });
    this.service.getCountries().then((data:any)=>{this.countryList = data; this.onCountryChange();});
    this.service.getStateAll().then((data:any)=>{this.stateFullList = data; this.onCountryChange();});
  }

  onDesignationChange() {
    this.newOffer.grade = this.selectedDesignation.grade;
  }
 
  onDateOfBirthChange(){
    var dob = new Date(this.newOffer.dateOfBirth);
    var today = new Date();
    this.newOffer.age = today.getFullYear() - dob.getFullYear();
  }

  onCountryChange(){
    this.stateList = [];
    this.newOffer.locationStateId = "";
    this.newOffer.locationId = "";
    this.locationList = [];

    if(this.newOffer.countryId > 0){
      var country = this.countryList.find(x=>x.id == this.newOffer.countryId);
      this.stateList = this.stateFullList.filter(x => x.land1 == country.land1);
    }   
  }

  onStateChange() {
    this.newOffer.locationId = "";
    this.locationList = this.locationFullList.filter(x => x.stateId == this.newOffer.locationStateId);
  }

  onEmployeeCategoryChange(){
    this.getSignatories();
    if(this.newOffer.employeeCategoryId == 1 || this.newOffer.employeeCategoryId == 7)  // OS or Factory Staff
      this.newOffer.preJoiningInitiation = "After Offer Release";
    else 
      this.newOffer.preJoiningInitiation = "Before Offer Release";
  }

  submit() {
    
    if(!this.attachmentDetails.Validate()) return;

    if(!confirm("Are you sure you want to Submit for Approval?")) return;

    this.saveDraft(false, false, null);
    this.newOffer.submitForApproval = true;
    this.submitForApproval(this.newOffer.offerId);
  }

  saveDraft(showNext, submitForExceptionApproval, files) {
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
    if(this.newOffer.totalExperience != 0 && !(this.newOffer.presentCTC > 0)){
      toastr.error("Please enter a valid present CTC.");
      return;
    }
    if(this.newOffer.age < 18){
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
    //swal("Saving...");
    this.newOffer.designationId = this.selectedDesignation.id;
    this.newOffer.plantId = this.selectedPlant.id;
    this.newOffer.joiningDate = this.util.getFormatedDateTime(this.newOffer.joiningDate);    
    this.newOffer.dateOfBirth = this.util.getFormatedDateTime(this.newOffer.dateOfBirth);    
    this.newOffer.createdById = this.currentUser.uid;
    this.newOffer.approvingManagerId = $("#approvingManagerId").val();
    this.newOffer.reportingManagerId = $("#reportingManagerId").val();
    this.newOffer.secondSignatoryId = this.secondSignatoryRequired == true ? this.newOffer.secondSignatoryId : null;
    
    connection = this.httpService.HRpost(APIURLS.OFFER_DETAILS_CREATE, this.newOffer);
    
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {        
          if (data.offerDetails.offerId > 0)
          {  
            this.newOffer = data.offerDetails;     
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
            toastr.error("Error occured while saving details.");
        }
        else
        toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while saving Offer Details. Error:' + err;
        toastr.error(this.errMsgModalPop);
      })
      .catch(error => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while saving Offer Details. Error:' + error;
        toastr.error(this.errMsgModalPop);
      });
  }

  
  checkIfInRange(){
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
      .catch(error => {
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
    }).catch(error => {
      this.isLoading = false;
      toastr.error(error);
    });    
}

  submitForApproval(id){        
    this.isLoading = true;
      var request: any = {};
      request.offerId = id;      
      request.submittedById = this.currentUser.uid;
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
        toastr.error("Error occurred.");
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
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
      console.log('filelist', this.fileList)
      index++;
    }
    toastr.info("Uploading attachment files ...");  
    // formData.append("type", this.selectedType.type );

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
      .catch(error => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while uploading attachments. Error:' + error;
        toastr.error(this.errMsgModalPop);
      });
  }
  
  Done(){
    this.router.navigate(['/HR/offer/offer-list']);
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
  else if(this.currentTab == "additionalInfo"){
    this.saveDraft(false, false, null);
    this.additionalInfoComponent.SaveData();
  }
  else if(this.currentTab == "breakup"){
    this.saveDraft(false, false, null);
    this.offerSalaryComponent.saveData();
  }
  else if(this.currentTab == "checklist"){
    this.saveDraft(false, false, null);
    this.checklistDetails.SaveData();
  }
  else 
    this.showNext(); 
}

onTabClick(index){  
  // this.tabIndex = index;
  //   this.currentTab = this.tabsList[this.tabIndex];
}


showPrevious(){
  this.tabIndex--;
  this.currentTab = this.tabsList[this.tabIndex];
}
showNext(){
  this.tabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

  cancel() {
    this.newOffer = {} as NewOffer;
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
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
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
              change: function (event, ui) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else{
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }                  
              },
              select: function (event, ui) {
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
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
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
              change: function (event, ui) {
                if (ui.item) {
                  $("#reportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else{
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }                  
              },
              select: function (event, ui) {
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
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.employeeName + " ("+item.employeeId+")", value: item };
            })
            $('#replacingEmployeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
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
              select: function (event, ui) {
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
      }).catch(error => {
        console.log(error);
      });
    }
    else{
      this.replacingEmployeeDetails = {};
    }
  }

}


