import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NewConfirmation } from './newconfirmation.model';
import { ConfirmationEmployeeSalaryComponent } from '../confirmation-employee-salary/confirmation-employee-salary.component';
import { JobChangeDetails } from './jobChangeDetails.model';
declare var $: any;
declare var toastr: any;

import swal from 'sweetalert';
@Component({
  selector: 'app-confirmation-detail',
  templateUrl: './confirmation-detail.component.html',
  styleUrls: ['./confirmation-detail.component.css'],
  providers: [Util]
})
export class ConfirmationDetailComponent implements OnInit {
  @ViewChild(ConfirmationEmployeeSalaryComponent) employeeSalaryComponent: ConfirmationEmployeeSalaryComponent;
  employeeId: any;
  employeeConfirmationId: any;
  employeeDetail: any = {};
  objectType: string = "Confirmation";
  currentTab: string = "general";
  tabIndex: number = 0;
  tabsList: string[] = ["general", "salary", "attachment", "history"];
  currentUser: AuthData;
  isLoading: boolean = false;
  urlPath: string = '';
  errMsg: string = "";
  today = new Date();
  selectedEffectiveText: string = "";
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

  employeeAppraisalId: number;
  jobChangeDetailsList: JobChangeDetails[] = [];
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

  onPlantChange(event: any) {
    if (event != null) {
      this.selectedPlantText = event.target.options[event.target.options.selectedIndex].text;
    }
    if (this.filterModel.plantId > 0) {
      let plant = this.plantList.find(x => x.id == this.filterModel.plantId);
      this.payGroupList = this.payGroupFullList.filter(x => x.plant == plant.code);
    } else {
      this.payGroupList = [];
      this.filterModel.payGroupId = "";
    }
  }

  onPayGroupChange(event: any) {
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


  signatoryList: any[] = [];
  getSignatories() {
    if (this.employeeDetail && this.employeeDetail.plantId > 0 && this.employeeDetail.payGroupId > 0 && this.employeeDetail.employeeCategoryId > 0) {
      this.httpService.HRget(APIURLS.CONFIRMATION_GET_SIGNATORIES + "/" + this.employeeDetail.plantId + "/" + this.employeeDetail.payGroupId + "/" + this.employeeDetail.employeeCategoryId)
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
    this.urlPath = this.router.url;
    this.filterModel.departmentId = "";
    this.filterModel.designationId = "";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.noticePeriod = null;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.employeeId = this.route.snapshot.paramMap.get('id')!;
      this.employeeConfirmationId = this.route.snapshot.paramMap.get('id2')!;
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
    this.isLoading = true;

    this.httpService.HRget(APIURLS.CONFIRMATION_DETAILS_BY_ID + "/" + this.employeeConfirmationId).then((data: any) => {
      if (data) {
        this.employeeDetail = data;
        this.employeeId = data.employeeId;
        this.newConfirmation.confirmationType = data.confirmationType;
        this.newConfirmation.rating = data.rating;
        this.newConfirmation.employeeConfirmationId = this.employeeConfirmationId;
        this.newConfirmation.salaryProcessingYear = new Date().getFullYear();
        this.newConfirmation.confirmationDate = this.employeeDetail.dateOfConfirmation;
        if (data.secondSignatoryId > 0) {
          this.secondSignatoryRequired = true;
        }
        this.isExtension = data.confirmationType && data.confirmationType.includes("Extension") ? true : false;

        //make employee HOD as default Confirmed By 
        if(data.confirmationType == null){
          $("#appraisedBYEmployeeId").val(data.approvingManagerId);
          this.filterModel.appraisedBYEmployeeId = data.approvingManagerId;
          this.filterModel.appraisedBYEmployeeName = data.approvingManagerName;
        }
        // if (this.filterModel.hodId == 0 || this.filterModel.hodId == null) {
        //   this.filterModel.hodId = this.employeeDetail.approvingManagerId;
        //   this.filterModel.hodName = this.employeeDetail.approvingManagerName;
        // }
        // if (this.filterModel.rmId == 0 || this.filterModel.rmId == null) {
        //   this.filterModel.rmId = this.employeeDetail.reportingManagerId;
        //   this.filterModel.rmName = this.employeeDetail.reportingManagerName;
        // }
        //this.getEmployeeCategoryList();
        this.loadOldDetails();
        this.getSignatories();
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
        this.newConfirmation.employeeConfirmationId = this.employeeConfirmationId;
        this.isRoleChange = data.isRoleChange;
        this.isDesignationChange = data.isDesignationChange;
        this.isTransfer = data.isTransfer;
        this.isStaffCategoryChange = data.isStaffCategoryChange;
        this.isSalaryChange = data.isSalaryChange;
        
        if(data.confirmedById > 0)
        {  
          $("#appraisedBYEmployeeId").val(data.confirmedById);
          this.filterModel.appraisedBYEmployeeId = data.confirmedById;
          this.filterModel.appraisedBYEmployeeName = data.confirmedByName;
        }
        
        //this.employeeDetail.approvingManagerName = data.confirmedByName;
        $("#approvedBYEmployeeId").val(data.approvedById);
        this.filterModel.approvedBYEmployeeId = data.approvedById;        
        this.filterModel.approvedBYEmployeeName = data.approvedByName;
        if (data.secondSignatoryId > 0) {
          this.secondSignatoryRequired = true;
        }
        this.isExtension = data.confirmationType.includes("Extension");
        //this.GetEmployeeDetails(data.employeeId);
        this.jobChangeDetailsList = data.jobChangeDetailsList;
        //this.getPayGroupList(null);
        if (this.jobChangeDetailsList.find(x => x.type == "Role") != null)
          this.filterModel.roleId = this.jobChangeDetailsList.find(x => x.type == "Role").newValueId;

        if (this.jobChangeDetailsList.find(x => x.type == "Designation") != null)
          this.filterModel.designationId = this.jobChangeDetailsList.find(x => x.type == "Designation").newValueId;

        if (this.jobChangeDetailsList.find(x => x.type == "Department") != null)
          this.filterModel.departmentId = this.jobChangeDetailsList.find(x => x.type == "Department").newValueId;
        this.getSubDepartments();
        this.subDepartmentList = this.subDepartmentFullList.filter(x => x.departmentId == this.filterModel.departmentId);
        if (this.jobChangeDetailsList.find(x => x.type == "SubDepartment") != null)
          this.filterModel.subDepartmentId = this.jobChangeDetailsList.find(x => x.type == "SubDepartment").newValueId;

        if (this.jobChangeDetailsList.find(x => x.type == "Plant") != null)
          this.filterModel.plantId = this.jobChangeDetailsList.find(x => x.type == "Plant").newValueId;
        this.onPlantChange(null);
        if (this.jobChangeDetailsList.find(x => x.type == "PayGroup") != null)
          this.filterModel.payGroupId = this.jobChangeDetailsList.find(x => x.type == "PayGroup").newValueId;
        this.onPayGroupChange(null);
        if (this.jobChangeDetailsList.find(x => x.type == "State") != null)
          this.filterModel.stateId = this.jobChangeDetailsList.find(x => x.type == "State").newValueId;
        this.getLocation();
        var selectedState = this.stateList.find(x => x.id == this.filterModel.stateId);
        if (selectedState)
          this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
        if (this.jobChangeDetailsList.find(x => x.type == "Location") != null)
          this.filterModel.locationId = this.jobChangeDetailsList.find(x => x.type == "Location").newValueId;

        if (this.jobChangeDetailsList.find(x => x.type == "StaffCategory") != null)
          this.filterModel.employeeCategoryId = this.jobChangeDetailsList.find(x => x.type == "StaffCategory").newValueId;

        if (this.jobChangeDetailsList.find(x => x.type == "HOD") != null) {
          this.filterModel.hodId = this.jobChangeDetailsList.find(x => x.type == "HOD").newValueId;
          this.filterModel.hodName = this.jobChangeDetailsList.find(x => x.type == "HOD").oldValueText;
        }

        if (this.jobChangeDetailsList.find(x => x.type == "RM") != null) {
          this.filterModel.rmId = this.jobChangeDetailsList.find(x => x.type == "RM").newValueId;
          this.filterModel.rmName = this.jobChangeDetailsList.find(x => x.type == "RM").oldValueText;
        }

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  onConfimationTypeChange() {
    if (this.newConfirmation.confirmationType)
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
                  //this.filterModel.appraisedBYEmployeeId = ui.item.value;
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
                  //this.filterModel.approvedBYEmployeeId = ui.item.value;
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
      //this.submitForApproval(this.newConfirmation.employeeConfirmationId);
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
    else if (this.currentTab == "salary" && (this.newConfirmation.confirmationType != 'Probation Extension' && this.newConfirmation.confirmationType != 'Trainee Extension')) {
      if (this.isSalaryChange) {
        this.updateDetails();
      }
      else
        this.showNext();
    }
    else
      this.showNext();
  }

  onTabClick(index) {
    if (index == 1 || index == 2) return;
    //if (this.tabIndex == 2 || index == 2) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
    //}
  }

  showPrevious() {
    this.loadDetails();
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];
  }
  showNext() {
    this.tabIndex++;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  onStateChange(event: any) {
    this.selectedStateText = event.target.options[event.target.options.selectedIndex].text;
    var selectedState = this.stateList.find(x => x.id == this.filterModel.stateId);
    if (selectedState)
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


    //swal("Saving...");
    this.newConfirmation.EmployeeId = this.employeeId;
    //let nextCyleDate: Date = new Date(this.newConfirmation.NextCyclePeriod, this.newConfirmation.NextCyleMonth, 1);  

    //let effectiveDate: Date = new Date(this.newConfirmation.EffectiveDateYear, this.newConfirmation.EffectiveDateMonth, 1);   
    if (this.newConfirmation.confirmationDate == null || this.newConfirmation.confirmationDate == "") {
      toastr.error("Please enter Confirmation Date it is required.");
      return;
    }
    if (this.newConfirmation.confirmationDate < new Date(this.employeeDetail.dateOfJoining)) {
      toastr.error("Confirmation Date cannot be before Joining Date.");
      return;
    }
    this.newConfirmation.ModifiedById = this.currentUser.uid;
    // if (this.employeeDetail.hodRating != null) {
    //   this.newConfirmation.ConfirmedById = this.employeeDetail.hodId;
    // }
    //else {
    console.log(this.filterModel.approvedBYEmployeeId);
    console.log(this.filterModel.appraisedBYEmployeeId);
    this.isLoading = true;
    this.newConfirmation.confirmedById = $("#appraisedBYEmployeeId").val();
    this.filterModel.appraisedBYEmployeeName = $("#appraisedBYEmployeeName").val();
    //}
    this.newConfirmation.approvedById = $("#approvedBYEmployeeId").val();
    this.filterModel.approvedBYEmployeeName = $("#approvedBYEmployeeName").val();
    this.newConfirmation.confirmationDate = this.util.getFormatedDateTime(this.newConfirmation.confirmationDate);

    this.newConfirmation.modifiedDate = this.util.getFormatedDateTime(new Date());
    //this.newConfirmation.Status = "Pending Approval";
    this.newConfirmation.isRoleChange = this.isRoleChange;
    this.newConfirmation.isDesignationChange = this.isDesignationChange;
    this.newConfirmation.isTransfer = this.isTransfer;
    this.newConfirmation.isStaffCategoryChange = this.isStaffCategoryChange;
    this.newConfirmation.isSalaryChange = this.isSalaryChange;
    this.jobChangeDetailsList = null;
    this.jobChangeDetailsList = [];

    if (this.isRoleChange) {
      if (this.filterModel.roleId <= 0 || this.filterModel.roleId == null || this.filterModel.roleId == "") {
        toastr.error("Please select a new Role"); return;
      }
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
      if (this.filterModel.designationId <= 0 || this.filterModel.designationId == null || this.filterModel.designationId == "") {
        toastr.error("Please select a new Designation"); return;
      }
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
      if (this.filterModel.departmentId > 0) {
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
      }
      if (this.filterModel.subDepartmentId > 0) {
        this.selectedSubDepartmentText = this.subDepartmentList.find(x => x.id == this.filterModel.subDepartmentId).sdptidLtxt;
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "SubDepartment";
        jobChangeDetail.oldValueText = this.employeeDetail.subDepartmentName;
        jobChangeDetail.newValueText = this.selectedSubDepartmentText;
        jobChangeDetail.newValueId = this.filterModel.subDepartmentId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }

      if (this.filterModel.plantId > 0) {
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
      }
      if (this.filterModel.payGroupId > 0) {
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
      }
      if (this.filterModel.stateId > 0) {
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
      }
      if (this.filterModel.locationId > 0) {
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
      }
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
        jobChangeDetail.newValueId = $('#hodId').val();
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
      if (this.filterModel.employeeCategoryId <= 0 || this.filterModel.employeeCategoryId == null || this.filterModel.employeeCategoryId == "") {
        toastr.error("Please select a new Employee Category"); return;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "StaffCategory";
      jobChangeDetail.oldValueText = this.employeeDetail.employeeCategoryName;
      jobChangeDetail.newValueText = this.selectedStaffCategoryText;
      jobChangeDetail.newValueId = this.filterModel.employeeCategoryId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    this.newConfirmation.jobChangeDetailsList = this.jobChangeDetailsList;

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
    // if (this.newConfirmation.confirmationType != 'Probation Extension' && this.newConfirmation.confirmationType != 'Trainee Extension') {
    //   if (this.isSalaryChange) {
    //     this.updateDetails();
    //   }
    //   else
    //     this.submitForApproval(this.newConfirmation.employeeConfirmationId);
    // }
    // else
    //   this.submitForApproval(this.newConfirmation.employeeConfirmationId);
    if (this.currentTab == "attachment") {
      this.submitForApproval(this.newConfirmation.employeeConfirmationId);
    }
  }

  updateDetails() {
    let connection: any;

    if (this.newConfirmation.salaryProcessingYear == "" || this.newConfirmation.salaryProcessingYear == undefined || this.newConfirmation.salaryProcessingYear == null) {
      toastr.error("Please enter Salary Processing Year."); return;
    }
    if (this.newConfirmation.salaryProcessingYear != "" && this.newConfirmation.salaryProcessingYear != undefined && this.newConfirmation.salaryProcessingYear != null
      && (this.newConfirmation.salaryProcessingYear < (this.today.getFullYear() - 1) || this.newConfirmation.salaryProcessingYear > (this.today.getFullYear() + 1))) {
      toastr.error("Salary Processing Year should be previous or current or next year."); return;
    }
    if (this.newConfirmation.effectiveDateYear == "" || this.newConfirmation.effectiveDateYear == undefined || this.newConfirmation.effectiveDateYear == null) {
      toastr.error("Please enter Effective Year."); return;
    }
    if (this.newConfirmation.effectiveDateYear != "" && this.newConfirmation.effectiveDateYear != undefined && this.newConfirmation.effectiveDateYear != null
      && (this.newConfirmation.effectiveDateYear < (this.today.getFullYear() - 1) || this.newConfirmation.effectiveDateYear > (this.today.getFullYear() + 1))) {
      toastr.error("Effective Date Year should be previous or current or next year."); return;
    }
    // if(this.newConfirmation.nextRevisionDate == "" || this.newConfirmation.nextRevisionDate == undefined || this.newConfirmation.nextRevisionDate == null){
    //   toastr.error("Please select Next Revision Date."); return;
    // }
    if (this.newConfirmation.nextRevisionDate != "" && this.newConfirmation.nextRevisionDate != undefined && this.newConfirmation.nextRevisionDate != null
      && this.newConfirmation.nextRevisionDate < this.today) {
      toastr.error("Next Revision Date cannot be old date."); return;
    }

    this.isLoading = true;
    this.newConfirmation.nextRevisionDate = this.util.getFormatedDateTime(this.newConfirmation.nextRevisionDate);

    connection = this.httpService.HRpost(APIURLS.CONFIRMATION_SAVE_FINAL_DETAILS, this.newConfirmation);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          this.employeeSalaryComponent.saveData();
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

  submitForApproval(id) {
    this.isLoading = true;
    var request: any = {};
    request.employeeConfirmationId = id;
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

        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
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

  setEffectiveDate() {
    var effectiveMonth = this.salaryProcessingMonths.find(x => x.type == this.newConfirmation.effectiveDateMonth);
    this.selectedEffectiveText = effectiveMonth.no + "/" + "1/" + this.newConfirmation.effectiveDateYear;
    console.log(this.selectedEffectiveText);
    this.employeeSalaryComponent.LoadData();
  }
}
