import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NewAppraisal } from './newappraisal.model';
import { EmployeeSalaryComponent } from '../employee-salary/employee-salary.component';
import { JobChangeDetails } from './jobChangeDetails.model';
declare var $: any;
declare var toastr: any;

import swal from 'sweetalert';
@Component({
  selector: 'app-appraisal',
  templateUrl: './appraisal.component.html',
  styleUrls: ['./appraisal.component.css'],
  providers: [Util]
})
export class AppraisalComponent implements OnInit {
  @ViewChild(EmployeeSalaryComponent) employeeSalaryComponent: EmployeeSalaryComponent;
  tenure: string = "";
  employeeId: any;
  employeeInitialAppraisalDetailId: any;
  employeeName: string = "";
  employeeDetail: any = {};
  currentTab: string = "general";
  tabIndex: number = 0;
  tabsList: string[] = ["general", "salary","attachment", "history"];
  currentUser: AuthData;
  isLoading: boolean = false;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  selectedEffectiveText: string = "";
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

  employeeAppraisalId: number;
  jobChangeDetailsList: JobChangeDetails[] = [];

  secondSignatoryRequired = false;

  salaryType: any;
  salaryAmount: any;
  oneTimeSalaryType: any;
  oneTimeSalaryAmount: any;

  filterModel: any = {};
  appraisalType = [{ type: "Regular" }, { type: "Ad-Hoc" }, { type: "Retention" }, { type: "VP and Above" }];   //, { type: "Service Extension" }
  appraisalCategory = [{ type: "General Appraisal" }, { type: "Promotion" }, { type: "Demotion" }];
  newAppraisal = {} as NewAppraisal;
  //performanceType = [{ type: "A+ - Excellent" }, { type: "A - Very Good" }, { type: "B - Good" }, { type: "C - Average" }, { type: "D - Poor" }];
  performanceType = [{ type: "A+" }, { type: "A" }, { type: "B" }, { type: "C" }, { type: "D" }];

  monthsList = [{ type: "January", no: 1 }, { type: "February", no: 2 }, { type: "March", no: 3 }, { type: "April", no: 4 }, { type: "May", no: 5 }, { type: "June", no: 6 }, { type: "July", no: 7 }, { type: "August", no: 8 }, { type: "September", no: 9 }, { type: "October", no: 10 }, { type: "November", no: 11 }, { type: "December", no: 12 }];

  selectedPerformance: any;
  selectedAppraisalType: any;
  selectedPlant: any;
  selectedStatus: any;
  selectedAppraisalCategory: any;
  objectType: string = "Appraisal";
  plantList: any[] = [];
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  selectedPaygroup: any;
  payGroupList: any[] = [];
  payGroupFullList: any[] = [];
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

    if(event != null)
    {
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
    if(event != null)
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
    this.httpService.HRget(APIURLS.HR_APPRAISAL_GET_SIGNATORIES + "/" + this.employeeDetail.plantId + "/" + this.employeeDetail.payGroupId +"/"+this.employeeDetail.employeeCategoryId)
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
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    //this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.status = "";
    this.filterModel.departmentId = "";
    this.filterModel.designationId = "";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.hodId = "";
    this.filterModel.rmId = "";
    this.filterModel.noticePeriod = null;
    //this.filterModel.employeeId = $("#employeeId").val();
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.employeeId = this.route.snapshot.paramMap.get('id')!;
      this.employeeInitialAppraisalDetailId = this.route.snapshot.paramMap.get('id2')!;
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.isLoading = true;
      this.isSalaryChange = true;
      this.loadEmployeeData();
      this.getAllDropDownValues();
      //this.isLoading = false;


      //this.selectedDesignation = this.departmentList.filter(x => x.name == this.employeeDetail.designation);
      //this.submitForApproval(25);
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

  onStateChange(event: any) {
    this.selectedStateText = event.target.options[event.target.options.selectedIndex].text;
    var selectedState = this.stateList.find(x => x.id == this.filterModel.stateId);
    if (selectedState)
      this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
  }

  loadEmployeeData() {
    this.isLoading = true;
    // this.filterModel.employeeId = $("#employeeId").val();
    //this.loadEmployeeDetails($("#employeeId").val());
    this.filterModel.employeeId = this.employeeId;
    //this.employeeId = 25;
    this.loadEmployeeDetails(this.employeeInitialAppraisalDetailId);
    //this.isLoading = false;
  }

  loadEmployeeDetails(id) {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_APPRAISAL_DETAILS_API + "/" + id).then((data: any) => {
      if (data) {

        this.employeeDetail = data;
        //Default Bindings
        this.newAppraisal.EffectiveDateYear = (new Date()).getFullYear().toString();
        this.newAppraisal.SalaryProcessingYear = (new Date()).getFullYear().toString();
        this.newAppraisal.NextCyclePeriod = ((new Date()).getFullYear() + 1) .toString();

        this.newAppraisal.EmployeeInitialAppraisalDetailId = this.employeeInitialAppraisalDetailId;
        this.newAppraisal.AppraisalType = this.employeeDetail.appraisalType;
        this.getSignatories();
        
        // Change
        if (this.employeeDetail.appraisalDetails != null) {          
          this.newAppraisal.NextCyleMonth = this.employeeDetail.appraisalDetails.nextCyleMonth;
          this.newAppraisal.NextCyclePeriod = this.employeeDetail.appraisalDetails.nextCyclePeriod;
          this.newAppraisal.EffectiveDateMonth = this.employeeDetail.appraisalDetails.effectiveDateMonth;
          this.newAppraisal.EffectiveDateYear = this.employeeDetail.appraisalDetails.effectiveDateYear;
          this.newAppraisal.SalaryProcessingMonth = this.employeeDetail.appraisalDetails.salaryProcessingMonth;
          this.newAppraisal.SalaryProcessingYear = this.employeeDetail.appraisalDetails.salaryProcessingYear;
          this.newAppraisal.PerformanceRating = this.employeeDetail.appraisalDetails.performanceRating;

          if(this.employeeDetail.appraisalDetails.secondSignatoryId > 0){
            this.secondSignatoryRequired = true;
            this.newAppraisal.SecondSignatoryId = this.employeeDetail.appraisalDetails.secondSignatoryId;
          }
       
          this.isRoleChange = this.employeeDetail.appraisalDetails.isRoleChange;
          this.isDesignationChange = this.employeeDetail.appraisalDetails.isDesignationChange;
          this.isTransfer = this.employeeDetail.appraisalDetails.isTransfer;
          this.isStaffCategoryChange = this.employeeDetail.appraisalDetails.isStaffCategoryChange;
          this.isSalaryChange = this.employeeDetail.appraisalDetails.isSalaryChange;
          console.log(this.isSalaryChange);
          if (this.employeeDetail.appraisalDetails.jobChangeDetails != null) {
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Role") != null) {
              this.filterModel.roleId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Role").newValueId
            }
           
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "State") != null) {
              console.log('state');
              this.filterModel.stateId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "State").newValueId
            }
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Department") != null) {
              this.filterModel.departmentId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Department").newValueId
            }
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Designation") != null) {
              this.filterModel.designationId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Designation").newValueId
            }
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Plant") != null) {
              this.filterModel.plantId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Plant").newValueId
            }
            this.onPlantChange(null);
            console.log(this.payGroupList);
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "PayGroup") != null) {
              this.filterModel.payGroupId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "PayGroup").newValueId
            }
            this.onPayGroupChange(null);
            this.getLocation();
            var selectedState = this.stateList.find(x => x.id == this.filterModel.stateId);
            console.log(this.filterModel.stateId);
            console.log(selectedState);
            if (selectedState)
            this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
            console.log(this.locationFullList);
            console.log(this.locationList);
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Location") != null) {
              this.filterModel.locationId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Location").newValueId
            }
            console.log(this.filterModel.locationId);
            this.getSubDepartments();
            this.subDepartmentList = this.subDepartmentFullList.filter(x => x.departmentId == this.filterModel.departmentId);
   
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "SubDepartment") != null) {
              this.filterModel.subDepartmentId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "SubDepartment").newValueId
            }            
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "StaffCategory") != null) {
              this.filterModel.employeeCategoryId = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "StaffCategory").newValueId
            }

            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "HOD") != null)
            {
              this.filterModel.hodId =  this.employeeDetail.appraisalDetails.jobChangeDetails.find(x=>x.type=="HOD").newValueId;
              this.filterModel.hodName =  this.employeeDetail.appraisalDetails.jobChangeDetails.find(x=>x.type=="HOD").newValueText;
            }
  
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "RM") != null)
            {
            this.filterModel.rmId =  this.employeeDetail.appraisalDetails.jobChangeDetails.find(x=>x.type=="RM").newValueId;
            this.filterModel.rmName =  this.employeeDetail.appraisalDetails.jobChangeDetails.find(x=>x.type=="RM").newValueText;
            }
            
            if (this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Notice Period") != null)
              {
              this.filterModel.noticePeriod =  this.employeeDetail.appraisalDetails.jobChangeDetails.find(x=>x.type=="Notice Period").newValueId;
              this.filterModel.noticePeriod =  this.employeeDetail.appraisalDetails.jobChangeDetails.find(x=>x.type=="Notice Period").newValueText;
              }
        
         
          }
          console.log('Change End');
          //Change End

          //console.log(this.employeeDetail.employeeIntialAppraisalRecommendedRating);
          // if (this.employeeDetail.employeeIntialAppraisalRecommendedRating != null) {

          //   this.filterModel.AppraisedById = this.employeeDetail.reportingManagerId;
          //   this.filterModel.appraisedBYEmployeeName = this.employeeDetail.reportingManagerName;
          // }
          // else
          // {
          $("#appraisedBYEmployeeId").val(this.employeeDetail.appraisalDetails.appraisedById);
          console.log(this.employeeDetail.appraisalDetails.appraisedByName);
          $("#approvedBYEmployeeId").val(this.employeeDetail.appraisalDetails.approvedById);
          this.filterModel.AppraisedById = this.employeeDetail.appraisalDetails.appraisedById;;
          this.filterModel.appraisedBYEmployeeId = this.employeeDetail.appraisalDetails.appraisedById;
          this.filterModel.appraisedBYEmployeeName = this.employeeDetail.appraisalDetails.appraisedByName;
          this.filterModel.approvedBYEmployeeId = this.employeeDetail.appraisalDetails.approvedById;
          this.filterModel.approvedBYEmployeeName = this.employeeDetail.appraisalDetails.approvedByName;

         if(this.filterModel.rmId == 0 || this.filterModel.rmId == null)
         {
          this.filterModel.rmId = this.employeeDetail.reportingManagerId;
          this.filterModel.rmName = this.employeeDetail.reportingManagerName;
          
         }
         if(this.filterModel.hodId == 0 || this.filterModel.hodId == null)
         {
          this.filterModel.hodId = this.employeeDetail.approvingManagerId;
          this.filterModel.hodName = this.employeeDetail.approvingManagerName;
         }


          this.salaryType = this.employeeDetail.appraisalDetails.packageType;
          this.salaryAmount = this.employeeDetail.appraisalDetails.salaryAmount;
          this.oneTimeSalaryType = this.employeeDetail.appraisalDetails.oneTimeSalaryType;
          this.oneTimeSalaryAmount = this.employeeDetail.appraisalDetails.oneTimeSalaryAmount;
        }
        // else if (this.employeeDetail.employeeIntialAppraisalRecommendedRating != null) {
        //   console.log('one');
        //   $("#appraisedBYEmployeeId").val(this.employeeDetail.approvingManagerId);
        //   console.log($("#appraisedBYEmployeeId").val());
        //   this.filterModel.AppraisedById = this.employeeDetail.approvingManagerId;
        //   this.filterModel.appraisedBYEmployeeName = this.employeeDetail.approvingManagerName;
        // }

      }

      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  onDepartmentChange(event: any) {
    this.selectedDepartmentText = event.target.options[event.target.options.selectedIndex].text;

    this.subDepartmentList = this.subDepartmentFullList.filter(x => x.departmentId == this.filterModel.departmentId);
  }

  lastEmployeekeydown = 0;
  getEmployees($event) {
    let text = $('#employeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#employeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else {
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else {
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastEmployeekeydown = $event.timeStamp;
    }
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
                  this.filterModel.AppraisedById = ui.item.value;
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

  lastrmEmployeekeydown = 0;
  getRMEmployees($event) {
    let text = $('#rmName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastrmEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#rmName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#rmId").val(ui.item.value);
                  $("#rmName").val(ui.item.label);
                  //this.filterModel.rmId = ui.item.value;
                }
                else {
                  $("#rmId").val('');
                  $("#rmName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#rmId").val(ui.item.value);
                  $("#rmName").val(ui.item.label);
                }
                else {
                  $("#rmId").val('');
                  $("#rmName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastrmEmployeekeydown = $event.timeStamp;
    }
  }

  lastHodEmployeekeydown = 0;
  getHodEmployees($event) {
    let text = $('#hodName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastAppraiseeEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#hodName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#hodId").val(ui.item.value);
                  $("#hodName").val(ui.item.label);
                  //this.filterModel.hodId = ui.item.value;
                }
                else {
                  $("#hodId").val('');
                  $("#hodName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#hodId").val(ui.item.value);
                  $("#hodName").val(ui.item.label);
                }
                else {
                  $("#hodId").val('');
                  $("#hodName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastHodEmployeekeydown = $event.timeStamp;
    }
  }

  onDataSaved(result) {
    if (result == 200 || result.success) {
      if (this.currentTab == "salary") {
        this.showNext();
      }      
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
    else if (this.currentTab == "salary") {
      if (this.isSalaryChange) {
        console.log('salary');
        this.employeeSalaryComponent.saveData();
      } 
      else
      this.showNext();
    }
    else
      this.showNext();
  }

  onTabClick(index) {
   // if (this.tabIndex != 3 && index != 3) return;
    //if (this.tabIndex == 3 && index != 0) return;
    if(index == 1 || index == 2) return;
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  showPrevious() {
    this.loadEmployeeData();
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];
  }
  showNext() {
    this.tabIndex++;
    this.currentTab = this.tabsList[this.tabIndex];
  }


  onRoleSelected(event: any) {
    this.selectedRoleText = event.target.options[event.target.options.selectedIndex].text;
  }
  onDesignationSelected(event: any) {
    this.selectedDesignationText = event.target.options[event.target.options.selectedIndex].text;
  }
  onSubDepartmentSelected(event: any) {
    // this.selectedSubDepartmentText = this.subDepartmentList.find(x => x.id == this.filterModel.subDepartmentId).sdptidLtxt;

    //this.selectedSubDepartmentText = event.target.options[event.target.options.selectedIndex].text;
  }
  onLocationSelected(event: any) {
    this.selectedLocationText = event.target.options[event.target.options.selectedIndex].text;
  }
  onStaffCategorySelected(event: any) {
    this.selectedStaffCategoryText = event.target.options[event.target.options.selectedIndex].text;
  }

  saveDraft() {
    let connection: any;

    var effectiveMonth = this.monthsList.find(x => x.type == this.newAppraisal.EffectiveDateMonth);
    var salaryProcessingMonth = this.monthsList.find(x => x.type == this.newAppraisal.SalaryProcessingMonth);
    var nextRevisionMonth = this.monthsList.find(x => x.type == this.newAppraisal.NextCyleMonth);

    if (effectiveMonth && nextRevisionMonth && (nextRevisionMonth.no <= effectiveMonth.no && this.newAppraisal.NextCyclePeriod <= this.newAppraisal.EffectiveDateYear)
      || (this.newAppraisal.NextCyclePeriod < this.newAppraisal.EffectiveDateYear)) {
      toastr.error("Next Revision Month-Year should be after Effective Month-Year."); return;
    }
    if (effectiveMonth && salaryProcessingMonth && (salaryProcessingMonth.no < effectiveMonth.no && this.newAppraisal.SalaryProcessingYear <= this.newAppraisal.EffectiveDateYear)
      || (this.newAppraisal.SalaryProcessingYear < this.newAppraisal.EffectiveDateYear)) {
      toastr.error("Salary Processing Month-Year should be same as or after Effective Month-Year."); return;
    }

    let currentYear = new Date().getFullYear();
    let allowedYear = currentYear + 2;
    if (this.newAppraisal.NextCyclePeriod <= currentYear.toString() ||
      this.newAppraisal.NextCyclePeriod > allowedYear.toString()) {
      toastr.error("Next Revision Year should not be current or previous year and should be max upto two years from current Year."); return;

    }

    this.selectedEffectiveText = effectiveMonth.no + "/" + "1/" +  this.newAppraisal.EffectiveDateYear;
    console.log(this.selectedEffectiveText);
    this.isLoading = true;
    this.newAppraisal.EmployeeId = this.employeeId;
    this.newAppraisal.CreatedById = this.currentUser.uid;
    if (this.employeeDetail.employeeIntialAppraisalRecommendedRating != null) {
      this.newAppraisal.AppraisedById = this.filterModel.AppraisedById
    }
    else {
      this.newAppraisal.AppraisedById = $("#appraisedBYEmployeeId").val();
      console.log('two');
      console.log(this.newAppraisal.AppraisedById);
    }

    //this.newAppraisal.AppraisedById = $("#appraisedBYEmployeeId").val();
    this.newAppraisal.ApprovedById = $("#approvedBYEmployeeId").val();
    //this.newAppraisal.SalaryProcessingMonth = this.util.getFormatedDateTime(this.newAppraisal.SalaryProcessingMonth);
    //this.newAppraisal.AppraisalType = this.selectedAppraisalType;
    this.newAppraisal.CreatedDate = this.getDateFormate(new Date());
    this.newAppraisal.Status = "Appraisal Initiated";
    //this.newAppraisal.IsTransfer = 0;
    //if (this.isRoleChange = "true") {
    this.newAppraisal.IsRoleChange = this.isRoleChange;
    //}
    //if (this.isDesignationChange = "true") {
    this.newAppraisal.IsDesignationChange = this.isDesignationChange;
    //}
    //if (this.isTransfer = "true") {
    this.newAppraisal.IsTransfer = this.isTransfer;
    //}
    //if (this.isStaffCategoryChange = "true") {
    this.newAppraisal.IsStaffCategoryChange = this.isStaffCategoryChange;
    //}
    //if (this.isSalaryChange = "true") {
    this.newAppraisal.IsSalaryChange = this.isSalaryChange;
    //}
    this.newAppraisal.Note = this.newAppraisal.Note;
    this.newAppraisal.AdHocNote = this.newAppraisal.AdHocNote;
    this.newAppraisal.PackageType = "CTC";
    this.jobChangeDetailsList = [];

    if (this.isRoleChange) {
      if (this.roleList.find(x => x.id == this.filterModel.roleId) != null) {
        this.selectedRoleText = this.roleList.find(x => x.id == 
          this.filterModel.roleId).role_ltxt;
      }
      var jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Role";
      jobChangeDetail.oldValueText = this.employeeDetail.role;
      jobChangeDetail.newValueText = this.selectedRoleText;
      jobChangeDetail.newValueId = this.filterModel.roleId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isDesignationChange) {
      if (this.designationList.find(x => x.id == this.filterModel.designationId) != null) {
        this.selectedDesignationText = this.designationList.find(x => x.id == 
          this.filterModel.designationId).name;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Designation";
      jobChangeDetail.oldValueText = this.employeeDetail.designation;
      jobChangeDetail.newValueText = this.selectedDesignationText;
      jobChangeDetail.newValueId = this.filterModel.designationId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isTransfer) {
      if (this.departmentList.find(x => x.id == this.filterModel.departmentId) != null) {
        this.selectedDepartmentText = this.departmentList.find(x => x.id == 
          this.filterModel.departmentId).description;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Department";
      jobChangeDetail.oldValueText = this.employeeDetail.department;
      jobChangeDetail.newValueText = this.selectedDepartmentText;
      jobChangeDetail.newValueId = this.filterModel.departmentId;
      this.jobChangeDetailsList.push(jobChangeDetail);

      if (this.subDepartmentList.find(x => x.id == this.filterModel.subDepartmentId) != null) {
        this.selectedSubDepartmentText = this.subDepartmentList.find(x => x.id == this.filterModel.subDepartmentId).sdptidLtxt;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "SubDepartment";
      jobChangeDetail.oldValueText = this.employeeDetail.subDepartmentName;
      jobChangeDetail.newValueText = this.selectedSubDepartmentText;
      jobChangeDetail.newValueId = this.filterModel.subDepartmentId;
      this.jobChangeDetailsList.push(jobChangeDetail);

      if (this.plantList.find(x => x.id == this.filterModel.plantId) != null) {
        this.selectedPlantText = this.plantList.find(x => x.id == 
          this.filterModel.plantId).name;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Plant";
      jobChangeDetail.oldValueText = this.employeeDetail.plantName;
      jobChangeDetail.newValueText = this.selectedPlantText;
      jobChangeDetail.newValueId = this.filterModel.plantId;
      this.jobChangeDetailsList.push(jobChangeDetail);

      if (this.payGroupList.find(x => x.id == this.filterModel.payGroupId) != null) {
        this.selectedPaygroupText = this.payGroupList.find(x => x.id == 
          this.filterModel.payGroupId).long_Desc;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "PayGroup";
      jobChangeDetail.oldValueText = this.employeeDetail.payGroupName;
      jobChangeDetail.newValueText = this.selectedPaygroupText;
      jobChangeDetail.newValueId = this.filterModel.payGroupId;
      this.jobChangeDetailsList.push(jobChangeDetail);

      if (this.stateList.find(x => x.id == this.filterModel.stateId) != null) {
        this.selectedStateText = this.stateList.find(x => x.id == 
          this.filterModel.stateId).bezei;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "State";
      jobChangeDetail.oldValueText = this.employeeDetail.state;
      jobChangeDetail.newValueText = this.selectedStateText;
      jobChangeDetail.newValueId = this.filterModel.stateId;
      this.jobChangeDetailsList.push(jobChangeDetail);

      if (this.locationList.find(x => x.id == this.filterModel.locationId) != null) {
        this.selectedLocationText = this.locationList.find(x => x.id == 
          this.filterModel.locationId).name;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Location";
      jobChangeDetail.oldValueText = this.employeeDetail.location;
      jobChangeDetail.newValueText = this.selectedLocationText;
      jobChangeDetail.newValueId = this.filterModel.locationId;
      this.jobChangeDetailsList.push(jobChangeDetail);

      if (this.filterModel.rmId > 0) {
  
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "RM";
      jobChangeDetail.oldValueText = this.employeeDetail.reportingManagerName;
      jobChangeDetail.newValueText = $('#rmName').val();
      jobChangeDetail.newValueId = $('#rmId').val();
      this.jobChangeDetailsList.push(jobChangeDetail);
      }

     
      if (this.filterModel.hodId > 0) {
  
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "HOD";
      jobChangeDetail.oldValueText = this.employeeDetail.approvingManagerName;
      jobChangeDetail.newValueText = $('#hodName').val();
      jobChangeDetail.newValueId = $('#hodId').val();;
      this.jobChangeDetailsList.push(jobChangeDetail);
      }

      if (this.filterModel.noticePeriod == null || this.filterModel.noticePeriod == "")
        {
          toastr.error("Please select a new Notice Period"); 
          return;
        }
        if (this.filterModel.noticePeriod >= 0) {
          jobChangeDetail = {} as JobChangeDetails;
          jobChangeDetail.type = "Notice Period";
          jobChangeDetail.oldValueText = this.employeeDetail.noticePeriod;
          jobChangeDetail.newValueText = this.filterModel.noticePeriod;
          jobChangeDetail.newValueId = this.filterModel.noticePeriod;
          this.jobChangeDetailsList.push(jobChangeDetail);
        }
    }
    if (this.isStaffCategoryChange) {
      if (this.employeeCategoryList.find(x => x.id == this.filterModel.employeeCategoryId) != null) {
        this.selectedStaffCategoryText = this.employeeCategoryList.find(x => x.id == 
          this.filterModel.employeeCategoryId).catltxt;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "StaffCategory";
      jobChangeDetail.oldValueText = this.employeeDetail.employeeCategoryName;
      jobChangeDetail.newValueText = this.selectedStaffCategoryText;
      jobChangeDetail.newValueId = this.filterModel.employeeCategoryId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    this.newAppraisal.JobChangeDetails = this.jobChangeDetailsList;
 
    console.log(this.newAppraisal.JobChangeDetails);
    connection = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_SAVE_APPRAISAL_DETAILS, this.newAppraisal);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          //if (data.employeeAppraisalId > 0) {
          this.newAppraisal.EmployeeAppraisalId = data.employeeAppraisalId;
          toastr.success("Details saved successfully.");
          this.showNext();
          //}
          //else
          //toastr.error("Error occured while saving details.");
        }
        else
          toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while saving Appraisal Details. Error:' + err;
        toastr.error(this.errMsgModalPop);
      })
      .catch(error => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while saving Appraisal Details. Error:' + error;
        toastr.error(this.errMsgModalPop);
      });
  }

  submit() {
    // if (this.isSalaryChange) {
    //   this.employeeSalaryComponent.saveData();
    // }    
    if (this.currentTab == "attachment") {
      this.submitForApproval(this.newAppraisal.EmployeeInitialAppraisalDetailId);
    }
  }

  submitForApproval(id) {
    var request: any = {};
    request.employeeInitialAppraisalDetailId = id;
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");
    this.httpService.HRpost(APIURLS.HR_APPRAISAL_DETAILS_SUBMIT_FOR_APPROVAL, request)
      .then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully submitted for approval.");
          this.router.navigate(['HR/actions/appraisal-initialreviewlist']);
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred while submitting.");
      }).catch(error => {
        toastr.error(error);
      });
  }

  getTenure(sDate, eDate) {
    var startDate = new Date(sDate);
    var endDate = new Date(eDate);

    var Time = endDate.getTime() - startDate.getTime();
    var Day = 1000 * 60 * 60 * 24;

    var Days = Math.floor(Time / Day);
    var Years = Math.abs((Time / (1000 * 3600 * 24)) / 365);
    var Months = Math.floor((Time / (1000 * 3600 * 24)) / 365) * 12;

    return Years + ' Years ' + Months + ' Months ' + Days + ' Days '.toString();
  }


  dateDiff(startingDate, endingDate) {
    let startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
    if (!endingDate) {
      endingDate = new Date().toISOString().substr(0, 10); // need date in YYYY-MM-DD format
    }
    let endDate = new Date(endingDate);
    if (startDate > endDate) {
      const swap = startDate;
      startDate = endDate;
      endDate = swap;
    }
    const startYear = startDate.getFullYear();
    const february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
    const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }

    return yearDiff + ' Years ' + monthDiff + ' Months ' + dayDiff + ' Days ';
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  goBack() {
    let route = 'HR/actions/appraisal-initialreviewlist';
    this.router.navigate([route]);
  }
}