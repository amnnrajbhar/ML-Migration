import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { EditConfirmation } from './editconfirmation.model';
import { ConfirmationEmployeeSalaryComponent } from '../confirmation-employee-salary/confirmation-employee-salary.component';
import { JobChangeDetails } from '../confirmation-detail/jobChangeDetails.model';
declare var $: any;
declare var toastr: any;
import swal from 'sweetalert';

@Component({
  selector: 'app-edit-confirmation',
  templateUrl: './edit-confirmation.component.html',
  styleUrls: ['./edit-confirmation.component.css'],
  providers: [Util]
})
export class EditConfirmationComponent  implements OnInit {
  @ViewChild(ConfirmationEmployeeSalaryComponent,{static:false})  employeeSalaryComponent: ConfirmationEmployeeSalaryComponent;
  employeeId: any;
  employeeConfirmationId: any;
  employeeDetail: any = {};
  confirmationDetails: any = {};
  objectType: string = "Confirmation";
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "salarychange", "history"];
  currentUser: AuthData;
  isLoading: boolean = false;
  urlPath: string = '';
  errMsg: string = "";
  selectedEffectiveText: string = "";
  today = new Date();
  secondSignatoryRequired = false;

  selectedRoleText: string = "";
  selectedDesignationText: string = "";
  selectedPlantText: string = "";
  selectedPaygroupText: string = "";
  selectedStateText: string = "";
  selectedLocationText: string = "";
  selectedDepartmentText: string = "";
  selectedSubDepartmentText: string = "";
  selectedStaffCategoryText: string = "";

  isDesignationChange: any;
  isRoleChange: any;
  isStaffCategoryChange: any;
  isSalaryChange: any;
  isTransfer: any;

  jobChangeDetailsList: JobChangeDetails[] = [];
  jobChangeDetails: any[] = [];
  isExtension = false;

  filterModel: any = {};
 confirmationType = 
  [
    { type: "Probationary Confirmation" },
      { type: "Trainee Confirmation" },
      { type: "Probationary Retention" },
      { type: "Probation Extension" },
      { type: "Trainee Extension" },
  ];
  reasonList =
    [
      { type: "Performance Improvement" },   
      { type: "Discipline" },
      { type: "Other" }, 
    ];
  newConfirmation: any = {}; //as NewConfirmation;
  performanceType = [{ type: "A+", text: "A+ (Excellent)" }, { type: "A", text: "A (Very Good)" }, { type: "B", text: "B (Good)" }, { type: "C", text: "C (Average)" }, { type: "D", text: "D (Poor)" }];

  salaryProcessingMonths = [{ type: "January", no: 1 }, { type: "February", no: 2 }, { type: "March", no: 3 }, { type: "April", no: 4 }, { type: "May", no: 5 }, { type: "June", no: 6 }, { type: "July", no: 7 }, { type: "August", no: 8 }, { type: "September", no: 9 }, { type: "October", no: 10 }, { type: "November", no: 11 }, { type: "December", no: 12 }];

  selectedPlant: any;
  plantList: any[] = [];
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  selectedPaygroup: any;
  payGroupFullList: any[] = [];
  payGroupList: any[] = [];
  getPayGroupList() {
    if (this.payGroupFullList.length <= 0) {
      this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
        if (data.length > 0) {
          this.payGroupFullList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupFullList = [];
      });
    }  
  }

  onPlantChange(event: any){
    if (event != null) {
      this.selectedPlantText = event.target.options[event.target.options.selectedIndex].text;
    }
    if(this.filterModel.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.filterModel.plantId);
      this.payGroupList = this.payGroupFullList.filter(x=>x.plant == plant.code);
    }else{
      this.payGroupList = [];
      this.filterModel.payGroupId = "";
    }
  }

  onPayGroupChange(event: any){
    this.selectedPaygroupText = event.target.options[event.target.options.selectedIndex].text;
  }

  employeeCategoryList: any[] = [];
  getEmployeeCategoryList() {
    if (this.employeeCategoryList.length <= 0) {
      this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API)
        .then((data: any) => {
          if (data.length > 0) {
            this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
          }
        }).catch(error => {
          this.employeeCategoryList = [];
        });
    }
  }

  selectedLocation: any;
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

  selectedState: any;
  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a, b) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch(error => {
      this.stateList = [];
    });
  }

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

  departmentList: any[] = [];
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }

  qualificationList: any[] = [];
  getQualifications() {
    this.httpService.HRget(APIURLS.EDUCATION_C_M_API_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.qualificationList = data.sort((a, b) => { if (a.educationCourse > b.educationCourse) return 1; if (a.educationCourse < b.educationCourse) return -1; return 0; });
      }
    }).catch(error => {
      this.qualificationList = [];
    });
  }

  subDepartmentFullList: any[] = [];
  subDepartmentList: any[] = [];
  getSubDepartments() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SUB_DEPARTMENTS).then((data: any) => {
      if (data.length > 0) {
        this.subDepartmentFullList = data.sort((a, b) => { if (a.sdptidLtxt > b.sdptidLtxt) return 1; if (a.sdptidLtxt < b.sdptidLtxt) return -1; return 0; });
      }
    }).catch(error => {
      this.subDepartmentFullList = [];
    });
  }

  
signatoryList:any[] = [];  
getSignatories(){
  if (this.employeeDetail && this.employeeDetail.plantId > 0 && this.employeeDetail.payGroupId > 0 && this.employeeDetail.employeeCategoryId > 0){
    this.httpService.HRget(APIURLS.CONFIRMATION_GET_SIGNATORIES + "/" + this.employeeDetail.plantId + "/" + this.employeeDetail.payGroupId +"/"+this.employeeDetail.employeeCategoryId)
    .then((data: any) => {
      if (data.length > 0 && this.signatoryList.length == 0) {
        this.signatoryList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.signatoryList = [];
    });
  }
}

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private util: Util) { }

  ngOnInit() {
    debugger;
    this.urlPath = this.router.url;
    this.filterModel.departmentId = "";
    this.filterModel.designationId = "";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.employeeId = this.route.snapshot.paramMap.get('id2')!;
      this.employeeConfirmationId = this.route.snapshot.paramMap.get('id')!;
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.isLoading = true;
      this.loadDetails();
      this.getAllDropDownValues();
    }
  }


  getAllDropDownValues() {
    this.getDepartments();
    this.getSubDepartments();
    this.getRole();
    this.getDesignation();
    this.getState();
    this.getLocation();
    this.getPlantList();
    this.getPayGroupList();
    this.getEmployeeCategoryList();

  }

  loadDetails() {
    debugger;
    this.isLoading = true;

    this.httpService.HRget(APIURLS.CONFIRMATION_DETAILS_BY_ID + "/" + this.employeeConfirmationId).then((data: any) => {
      if (data) {
        this.employeeDetail = data;
        this.employeeId = data.employeeId;
        //this.newConfirmation = data;
        this.newConfirmation.EmployeeConfirmationId = this.employeeConfirmationId;
        if(data.secondSignatoryId > 0){
          this.secondSignatoryRequired = true;
        }
        //this.newConfirmation.SalaryProcessingYear = new Date().getFullYear();
        this.loadOldDetails();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  loadOldDetails() {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.CONFIRMATION_API, this.employeeConfirmationId).then((data: any) => {
      if (data) {
        this.newConfirmation = data;

        this.isRoleChange = data.isRoleChange;
        this.isDesignationChange = data.isDesignationChange;
        this.isTransfer = data.isTransfer;
        this.isStaffCategoryChange = data.isStaffCategoryChange;
        this.isSalaryChange = data.isSalaryChange;
        $("#appraisedBYEmployeeId").val(data.confirmedById);
        $("#approvedBYEmployeeId").val(data.approvedById);        
        this.employeeDetail.approvingManagerName = data.confirmedByName;
        this.filterModel.appraisedBYEmployeeName = data.confirmedByName;
        this.filterModel.approvedBYEmployeeName = data.approvedByName;
        if(data.secondSignatoryId > 0){
          this.secondSignatoryRequired = true;
        }
        //this.GetEmployeeDetails(data.employeeId);
        this.jobChangeDetails = data.jobChangeDetailsList;       
        
        if(this.jobChangeDetails.find(x=>x.type=="Role") != null)
          this.filterModel.roleId =  this.jobChangeDetails.find(x=>x.type=="Role").newValueId;
          
          if(this.jobChangeDetails.find(x=>x.type=="Designation") != null)
          this.filterModel.designationId =  this.jobChangeDetails.find(x=>x.type=="Designation").newValueId;
          
          if(this.jobChangeDetails.find(x=>x.type=="Department") != null)
          this.filterModel.departmentId =  this.jobChangeDetails.find(x=>x.type=="Department").newValueId;
          
          if(this.jobChangeDetails.find(x=>x.type=="SubDepartment") != null)
          this.filterModel.subDepartmentId =  this.jobChangeDetails.find(x=>x.type=="SubDepartment").newValueId;
          
          if(this.jobChangeDetails.find(x=>x.type=="Plant") != null)
          this.filterModel.plantId =  this.jobChangeDetails.find(x=>x.type=="Plant").newValueId;
          
          if(this.jobChangeDetails.find(x=>x.type=="PayGroup") != null)
          this.filterModel.payGroupId =  this.jobChangeDetails.find(x=>x.type=="PayGroup").newValueId;
          
          if(this.jobChangeDetails.find(x=>x.type=="State") != null)
          this.filterModel.stateId =  this.jobChangeDetails.find(x=>x.type=="State").newValueId;
          
          if(this.jobChangeDetails.find(x=>x.type=="Location") != null)
          this.filterModel.locationId =  this.jobChangeDetails.find(x=>x.type=="Location").newValueId;

          if(this.jobChangeDetails.find(x=>x.type=="StaffCategory") != null)
          this.filterModel.employeeCategoryId =  this.jobChangeDetails.find(x=>x.type=="StaffCategory").newValueId;

          this.onPlantChange(null);
          this.onPayGroupChange(null);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  
  onConfimationTypeChange(){
    if(this.newConfirmation.confirmationType)
      this.isExtension = this.newConfirmation.confirmationType == 'Probation Extension' || this.newConfirmation.confirmationType == 'Trainee Extension';
  }

  lastAppraiseeEmployeekeydown = 0;
  getAppraiserEmployees($event) {
    let text = $('#appraisedBYEmployeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastAppraiseeEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#appraisedBYEmployeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#appraisedBYEmployeeId").val(ui.item.value);
                  $("#appraisedBYEmployeeName").val(ui.item.label);
                }
                else {
                  $("#appraisedBYEmployeeId").val('');
                  $("#appraisedBYEmployeeName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#appraisedBYEmployeeId").val(ui.item.value);
                  $("#appraisedBYEmployeeName").val(ui.item.label);
                }
                else {
                  $("#appraisedBYEmployeeId").val('');
                  $("#appraisedBYEmployeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastAppraiseeEmployeekeydown = $event.timeStamp;
    }
  }

  lastApproverEmployeekeydown = 0;
  getApproverEmployees($event) {
    let text = $('#approvedBYEmployeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApproverEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#approvedBYEmployeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#approvedBYEmployeeId").val(ui.item.value);
                  $("#approvedBYEmployeeName").val(ui.item.label);
                }
                else {
                  $("#approvedBYEmployeeId").val('');
                  $("#approvedBYEmployeeName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#approvedBYEmployeeId").val(ui.item.value);
                  $("#approvedBYEmployeeName").val(ui.item.label);
                }
                else {
                  $("#approvedBYEmployeeId").val('');
                  $("#approvedBYEmployeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApproverEmployeekeydown = $event.timeStamp;
    }
  }

  onDataSaved(result) {
    if (result == 200 || result.success) {
      this.showNext();
    }
    else
      swal(result.message);
  }

  onPrevious() {
    this.showPrevious();
  }

  onNext() {
    if (this.currentTab == "general") {
      this.saveDraft();
    }
    else
      this.showNext();
  }

  showPrevious() {
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];
  }
  showNext() {    
    this.tabIndex++;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  onTabClick(index)
{
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
}
  onStateChange(event: any) {
    this.selectedStateText = event.target.options[event.target.options.selectedIndex].text;
    var selectedState = this.stateList.find(x=>x.id == this.filterModel.stateId);
    if(selectedState)
      this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
  }

  onDepartmentChange(event: any) {
    this.selectedDepartmentText = event.target.options[event.target.options.selectedIndex].text;

    this.subDepartmentList = this.subDepartmentFullList.filter(x => x.departmentId == this.filterModel.departmentId);
  }

  onRoleSelected(event: any) {
    this.selectedRoleText = event.target.options[event.target.options.selectedIndex].text;
  }
  onDesignationSelected(event: any) {
    this.selectedDesignationText = event.target.options[event.target.options.selectedIndex].text;
  }
  onSubDepartmentSelected(event: any) {
    // this.selectedSubDepartmentText = this.subDepartmentList.find(x => x.id == this.filterModel.subDepartmentId).sdptidLtxt;

    this.selectedSubDepartmentText = event.target.options[event.target.options.selectedIndex].text;
  }
  onLocationSelected(event: any) {
    this.selectedLocationText = event.target.options[event.target.options.selectedIndex].text;
  }
  onStaffCategorySelected(event: any) {
    this.selectedStaffCategoryText = event.target.options[event.target.options.selectedIndex].text;
  }

  saveDraft() {
 
    let connection: any;

    this.isLoading = true;
    //swal("Saving...");
    this.newConfirmation.EmployeeId = this.employeeId;
    //let nextCyleDate: Date = new Date(this.newConfirmation.NextCyclePeriod, this.newConfirmation.NextCyleMonth, 1);  

    //let effectiveDate: Date = new Date(this.newConfirmation.EffectiveDateYear, this.newConfirmation.EffectiveDateMonth, 1);   
  
    this.newConfirmation.ModifiedById = this.currentUser.uid;
    if (this.employeeDetail.hodRating != null) {
      this.newConfirmation.ConfirmedById = this.employeeDetail.hodId;
    }
    else {
      this.newConfirmation.ConfirmedById = $("#appraisedBYEmployeeId").val();
    }
    this.newConfirmation.ApprovedById = $("#approvedBYEmployeeId").val();
    this.newConfirmation.ModifiedDate = this.util.getFormatedDateTime(new Date());
    //this.newConfirmation.Status = "Pending Approval";
    this.newConfirmation.IsRoleChange = this.isRoleChange;
    this.newConfirmation.IsDesignationChange = this.isDesignationChange;
    this.newConfirmation.IsTransfer = this.isTransfer;
    this.newConfirmation.IsStaffCategoryChange = this.isStaffCategoryChange;
    this.newConfirmation.IsSalaryChange = this.isSalaryChange;
    this.jobChangeDetailsList = [];

    if (this.isRoleChange) {
      if(this.filterModel.roleId <= 0 || this.filterModel.roleId == null || this.filterModel.roleId == ""){
        toastr.error("Please select a new Role"); return;
      }
      var jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Role";
      jobChangeDetail.oldValueText = this.employeeDetail.role;
      jobChangeDetail.newValueText = this.selectedRoleText;
      jobChangeDetail.newValueId = this.filterModel.roleId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isDesignationChange) {
      if(this.filterModel.designationId <= 0 || this.filterModel.designationId == null || this.filterModel.designationId == ""){
        toastr.error("Please select a new Designation"); return;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Designation";
      jobChangeDetail.oldValueText = this.employeeDetail.designation;
      jobChangeDetail.newValueText = this.selectedDesignationText;
      jobChangeDetail.newValueId = this.filterModel.designationId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isTransfer) {
      if(this.filterModel.departmentId > 0 ){
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Department";
        jobChangeDetail.oldValueText = this.employeeDetail.department;
        jobChangeDetail.newValueText = this.selectedDepartmentText;
        jobChangeDetail.newValueId = this.filterModel.departmentId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if(this.filterModel.subDepartmentId > 0 ){
        this.selectedSubDepartmentText = this.subDepartmentList.find(x => x.id == this.filterModel.subDepartmentId).sdptidLtxt;
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "SubDepartment";
        jobChangeDetail.oldValueText = this.employeeDetail.subDepartmentName;
        jobChangeDetail.newValueText = this.selectedSubDepartmentText;
        jobChangeDetail.newValueId = this.filterModel.subDepartmentId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }

      if(this.filterModel.plantId > 0 ){
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Plant";
        jobChangeDetail.oldValueText = this.employeeDetail.plantName;
        jobChangeDetail.newValueText = this.selectedPlantText;
        jobChangeDetail.newValueId = this.filterModel.plantId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if(this.filterModel.payGroupId > 0 ){
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "PayGroup";
        jobChangeDetail.oldValueText = this.employeeDetail.payGroupName;
        jobChangeDetail.newValueText = this.selectedPaygroupText;
        jobChangeDetail.newValueId = this.filterModel.payGroupId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if(this.filterModel.stateId > 0 ){
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "State";
        jobChangeDetail.oldValueText = this.employeeDetail.state;
        jobChangeDetail.newValueText = this.selectedStateText;
        jobChangeDetail.newValueId = this.filterModel.stateId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if(this.filterModel.locationId > 0 ){
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Location";
        jobChangeDetail.oldValueText = this.employeeDetail.location;
        jobChangeDetail.newValueText = this.selectedLocationText;
        jobChangeDetail.newValueId = this.filterModel.locationId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }      
    }
    if (this.isStaffCategoryChange) {
      if(this.filterModel.employeeCategoryId <= 0 || this.filterModel.employeeCategoryId == null || this.filterModel.employeeCategoryId == ""){
        toastr.error("Please select a new Employee Category"); return;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "StaffCategory";
      jobChangeDetail.oldValueText = this.employeeDetail.employeeCategoryName;
      jobChangeDetail.newValueText = this.selectedStaffCategoryText;
      jobChangeDetail.newValueId = this.filterModel.employeeCategoryId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    this.newConfirmation.JobChangeDetailsList = this.jobChangeDetailsList;
    
    //connection = this.httpService.HRpost(APIURLS.CONFIRMATION_UPDATE_DETAILS, this.newConfirmation);
    connection = this.httpService.HRpost(APIURLS.CONFIRMATION_SAVE_FINAL_DETAILS, this.newConfirmation);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {          
          toastr.success("Details saved successfully.");
          this.showNext();
        }
        else
          toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving Appraisal Details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving Appraisal Details. Error:' + error);
      });
  }

  submit() {
    if (this.newConfirmation.confirmationType != 'Probation Extension' && this.newConfirmation.confirmationType != 'Trainee Extension') {
      if (this.isSalaryChange) {
        this.updateDetails();
        this.employeeSalaryComponent.saveData();
      }
    }
    this.submitForApproval();
  }

  
  updateDetails(){
    let connection: any;

    if(this.newConfirmation.salaryProcessingYear == "" || this.newConfirmation.salaryProcessingYear == undefined || this.newConfirmation.salaryProcessingYear == null){
      toastr.error("Please enter Salary Processing Year."); return;
    }
    if(this.newConfirmation.salaryProcessingYear != "" && this.newConfirmation.salaryProcessingYear != undefined && this.newConfirmation.salaryProcessingYear != null
    && (this.newConfirmation.salaryProcessingYear < (this.today.getFullYear()-1) || this.newConfirmation.salaryProcessingYear > (this.today.getFullYear()+1))){
      toastr.error("Salary Processing Year should be previous or current or next year."); return;
    }
    if(this.newConfirmation.effectiveDateYear == "" || this.newConfirmation.effectiveDateYear == undefined || this.newConfirmation.effectiveDateYear == null){
      toastr.error("Please enter Effective Year."); return;
    }
    if(this.newConfirmation.effectiveDateYear != "" && this.newConfirmation.effectiveDateYear != undefined && this.newConfirmation.effectiveDateYear != null
    && (this.newConfirmation.effectiveDateYear < (this.today.getFullYear()-1) || this.newConfirmation.effectiveDateYear > (this.today.getFullYear()+1))){
      toastr.error("Effective Date Year should be previous or current or next year."); return;
    }
    if(this.newConfirmation.nextRevisionDate == "" || this.newConfirmation.nextRevisionDate == undefined || this.newConfirmation.nextRevisionDate == null){
      toastr.error("Please select Next Revision Date."); return;
    }
    if(this.newConfirmation.nextRevisionDate != "" && this.newConfirmation.nextRevisionDate != undefined && this.newConfirmation.nextRevisionDate != null
    && this.newConfirmation.nextRevisionDate < this.today){
      toastr.error("Next Revision Date cannot be old date."); return;
    }

    this.isLoading = true;
    this.newConfirmation.nextRevisionDate = this.util.getFormatedDateTime(this.newConfirmation.nextRevisionDate);


    connection = this.httpService.HRpost(APIURLS.CONFIRMATION_SAVE_FINAL_DETAILS, this.newConfirmation);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {          
        }
        else
          toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving Appraisal Details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving Appraisal Details. Error:' + error);
      });

  }

  submitForApproval() {
    var request: any = {};
    request.employeeConfirmationId = this.employeeConfirmationId;
    request.submittedById = this.currentUser.uid;
    if (this.newConfirmation.confirmationType == 'Probation Extension' || this.newConfirmation.confirmationType == 'Trainee Extension') {
      request.IsExtension = true;
      request.confirmationType = this.newConfirmation.confirmationType;
      request.NewConfirmationDate = this.getDateFormate(this.newConfirmation.newConfirmationDate);
      request.ExtensionReason = this.newConfirmation.extensionReason;
      request.ExtensionReasonText = this.newConfirmation.extensionReasonText;
    }

    toastr.info("Submitting for approval...");
    this.httpService.HRpost(APIURLS.CONFIRMATION_FINAL_SUBMIT_FOR_APPROVAL, request)
      .then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully submitted for approval.");
          this.router.navigate(['HR/confirmation/list']);
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred while submitting.");
      }).catch(error => {
        toastr.error(error);
      });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  goBack() {
    let route = 'HR/confirmation/list';
    this.router.navigate([route]);
  }

  
  setEffectiveDate()
  {
    var effectiveMonth = this.salaryProcessingMonths.find(x => x.type == this.newConfirmation.effectiveDateMonth);
    this.selectedEffectiveText = effectiveMonth.no + "/" + "1/" +  this.newConfirmation.effectiveDateYear;
    console.log(this.selectedEffectiveText);
    this.employeeSalaryComponent.LoadData();
  }
}
