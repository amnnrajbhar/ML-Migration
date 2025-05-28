import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Recall } from '../recall/recall.model';
import { JobChangeDetails } from '../recall/jobChangeDetails.model';
import { EmployeeSalaryComponent } from '../employee-salary/employee-salary.component';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Resignation } from '../../separation/resignation/resignation.model';
import { NewOffer } from '../../Offer/new-offer/newoffer.model';
import { Location } from '@angular/common';
declare var $: any;
declare var toastr: any;
declare var require: any;
import swal from 'sweetalert';
@Component({
  selector: 'app-edit-recall',
  templateUrl: './edit-recall.component.html',
  styleUrls: ['./edit-recall.component.css'],
  providers: [Util]
})
export class EditRecallComponent implements OnInit {
  @ViewChild(EmployeeSalaryComponent) employeeSalaryComponent: EmployeeSalaryComponent;
  currentUser: AuthData;
  employeeId: any;
  employeeRecallId: any;
  resignationId: any;
  isLoading: boolean = false;
  isVisible: boolean = true;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  recallStatus: any;
  recallDetails = {} as Recall;
  employeeDetails: any = {};
  recruitmentTypes = [{ type: "New Recruitment" }, { type: "Self Replacement" }, { type: "Replacement" }];
  DateToday: Date;
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "jobchange", "salarychange", "attachments", "history"];
  objectType: string = "Recall";
  filterModel: any = {};
  selectedRoleText: string = "";
  selectedDesignationText: string = "";
  selectedPlantText: string = "";
  selectedPaygroupText: string = "";
  selectedStateText: string = "";
  selectedLocationText: string = "";
  selectedDepartmentText: string = "";
  selectedSubDepartmentText: string = "";
  selectedStaffCategoryText: string = "";
  selectedPlant: any;
  selectedHOD: string = "";
  selectedReportingManager: string = "";

  isDesignationChange: any;
  isRoleChange: any;
  isStaffCategoryChange: any;
  isSalaryChange: any;
  isTransfer: any;
  isHODChange: any;
  isreportingManagerChange: any;
  isJobDetailsChanged: boolean = false;

  jobChangeDetailsList: JobChangeDetails[] = [];
  resignationDetails = {} as Resignation;
  lastWorkingDate: any;
  offerDetails: any = {};
  replacementStatus: string;
  replacementId: string;
  item: any = {};
  isDraftSaved: boolean = false;
  recallDetail: any = {};

  oldRole: any;
  newRole: any;
  newRoleId: any;
  oldDepartment: any;
  newDepartment: any;
  newDepartmentId: any;
  oldSubDepartment: any;
  newSubDepartment: any;
  newSubDepartmentId: any;
  oldPlant: any;
  newPlant: any;
  newPlantId: any;
  oldDesignation: any;
  newDesignation: any;
  newDesignationId: any;
  oldCategory: any;
  newCategory: any;
  newCategoryId: any;
  oldLocation: any;
  newLocation: any;
  newLocationId: any;
  oldPayGroup: any;
  newPayGroup: any;
  newPayGroupId: any;
  oldState: any;
  newState: any;
  newStateId: any;
  oldHOD: any;
  newHOD: any;
  newHODId: any;
  oldRM: any;
  newRM: any;
  newRMId: any;


  monthlyComponents: any[] = [];
  monthlyTotal = 0;
  monthlyAnnualTotal = 0;
  annualComponents: any[] = [];
  variableComponents: any[] = [];

  headTypes = [{ type: "I", value: "Income" }, { type: "D", value: "Deduction" }, { type: "R", value: "Reimbursement" }, { type: "B", value: "Other Benefit" }, { type: "O", value: "One Time" }, { type: "V", value: "Variable Pay" }];
  frequency = [{ type: "M", value: "Monthly" }, { type: "Q", value: "Quarterly" }, { type: "H", value: "Half-Yearly" }, { type: "A", value: "Annually" }, { type: "D", value: "Daily" }, { type: "O", value: "One Time" }];
  fileList: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private fb: FormBuilder,
    private util: Util, private location: Location) {
  }

  ngOnInit() {
    this.DateToday = new Date();

    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.employeeRecallId = this.route.snapshot.paramMap.get('id')!;
      this.employeeId = this.route.snapshot.paramMap.get('id2')!;
      this.recallDetails.hodApproval = true;
      this.recallDetails.reportingManagerApproval = true;
      if (!this.employeeId || this.employeeId <= 0) {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/recall/recall-list']);
      }
      this.GetemployeeDetails(this.employeeId);
      this.GetResignationDetails(this.employeeId);
      this.getDepartments();
      this.getSubDepartments();
      this.getRole();
      this.getDesignation();
      this.getState();
      this.getLocation();
      this.getPlantList();
      this.getRecallDetails(this.employeeRecallId);
    }
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

  }
  getRecallDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.RECALL_GET_DETAILS_BY_ID, id).then((data: any) => {
      if (data) {
        this.recallDetail = data;
        this.fileList = data.attachments;
        console.log(data);
        if (this.recallDetail.recallSalaryHeadDetails.length > 0) {
          for (var item of this.recallDetail.recallSalaryHeadDetails) {
            item.salaryTypeName = this.headTypes.find(x => x.type == item.salaryType).value;
            item.frequencyName = this.frequency.find(x => x.type == item.frequency).value;
          }
          this.monthlyComponents = this.recallDetail.recallSalaryHeadDetails.filter(x => x.salaryType == "I" && x.frequency == "M");
          this.annualComponents = this.recallDetail.recallSalaryHeadDetails.filter(x => x.salaryType != "V" && x.frequency == "A");
          this.variableComponents = this.recallDetail.recallSalaryHeadDetails.filter(x => x.salaryType == "V");
          this.calculateTotals();
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "Role") != null) {
          this.oldRole = this.recallDetail.jobChangeDetails.find(x => x.type == "Role").oldValueText
          this.newRole = this.recallDetail.jobChangeDetails.find(x => x.type == "Role").newValueText
          this.newRoleId = this.recallDetail.jobChangeDetails.find(x => x.type == "Role").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "StaffCategory") != null) {
          this.oldCategory = this.recallDetail.jobChangeDetails.find(x => x.type == "StaffCategory").oldValueText
          this.newCategory = this.recallDetail.jobChangeDetails.find(x => x.type == "StaffCategory").newValueText
          this.newCategoryId = this.recallDetail.jobChangeDetails.find(x => x.type == "StaffCategory").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "State") != null) {
          this.oldState = this.recallDetail.jobChangeDetails.find(x => x.type == "State").oldValueText
          this.newState = this.recallDetail.jobChangeDetails.find(x => x.type == "State").newValueText
          this.newStateId = this.recallDetail.jobChangeDetails.find(x => x.type == "State").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "Department") != null) {
          this.oldDepartment = this.recallDetail.jobChangeDetails.find(x => x.type == "Department").oldValueText
          this.newDepartment = this.recallDetail.jobChangeDetails.find(x => x.type == "Department").newValueText
          this.newDepartmentId = this.recallDetail.jobChangeDetails.find(x => x.type == "Department").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "Designation") != null) {
          this.oldDesignation = this.recallDetail.jobChangeDetails.find(x => x.type == "Designation").oldValueText
          this.newDesignation = this.recallDetail.jobChangeDetails.find(x => x.type == "Designation").newValueText
          this.newDesignationId = this.recallDetail.jobChangeDetails.find(x => x.type == "Designation").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "PayGroup") != null) {
          this.oldPayGroup = this.recallDetail.jobChangeDetails.find(x => x.type == "PayGroup").oldValueText
          this.newPayGroup = this.recallDetail.jobChangeDetails.find(x => x.type == "PayGroup").newValueText
          this.newPayGroupId = this.recallDetail.jobChangeDetails.find(x => x.type == "PayGroup").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "Location") != null) {
          this.oldLocation = this.recallDetail.jobChangeDetails.find(x => x.type == "Location").oldValueText
          this.newLocation = this.recallDetail.jobChangeDetails.find(x => x.type == "Location").newValueText
          this.newLocationId = this.recallDetail.jobChangeDetails.find(x => x.type == "Location").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "SubDepartment") != null) {
          this.oldSubDepartment = this.recallDetail.jobChangeDetails.find(x => x.type == "SubDepartment").oldValueText
          this.newSubDepartment = this.recallDetail.jobChangeDetails.find(x => x.type == "SubDepartment").newValueText
          this.newSubDepartmentId = this.recallDetail.jobChangeDetails.find(x => x.type == "SubDepartMent").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "Plant") != null) {
          this.oldPlant = this.recallDetail.jobChangeDetails.find(x => x.type == "Plant").oldValueText
          this.newPlant = this.recallDetail.jobChangeDetails.find(x => x.type == "Plant").newValueText
          this.newPlantId = this.recallDetail.jobChangeDetails.find(x => x.type == "Plant").newValueId
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "HOD") != null) {
          this.oldHOD = this.recallDetail.jobChangeDetails.find(x => x.type == "HOD").oldValueText
          this.newHOD = this.recallDetail.jobChangeDetails.find(x => x.type == "HOD").newValueText
          this.isJobDetailsChanged = true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "ReportingManager") != null) {
          this.oldRM = this.recallDetail.jobChangeDetails.find(x => x.type == "ReportingManager").oldValueText
          this.newRM = this.recallDetail.jobChangeDetails.find(x => x.type == "ReportingManager").newValueText
          this.isJobDetailsChanged = true;
        }

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  goBack() {
    this.location.back();
  }

  GetResignationDetails(id) {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.RESIGNATION_DATE_GET_BYEMPID, id).then((data: any) => {
      if (data) {
        this.resignationDetails = data;
        //this.lastWorkingDate = this.getDateFormate(this.resignationDetails.lastWorkingDate);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  GetemployeeDetails(id) {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
        this.lastWorkingDate = this.getDateFormate(this.employeeDetails.dateOfLeaving);
        this.GetReplacementOfferDetails(this.employeeDetails.employeeNo);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }

  GetReplacementOfferDetails(id) {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.RECALL_OFFER_REPLACEMENTID, id).then((data: any) => {
      if (data) {
        this.offerDetails = data;
        this.replacementId = this.offerDetails.replacementEmployeeNo;
        if (this.replacementId != null || this.replacementId != undefined || this.replacementId != "") {
          this.replacementStatus = "Replaced";
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }

  onTabClick(index) {

  }

  lastApprovingkeydown = 0;
  getEmployeeName($event) {
    let text = $('#newReportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if (item.fullName != null)
                return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
              else
                return { label: item.employeeId, value: item.id };
            })
            $('#newReportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#newReportingManagerId").val(ui.item.value);
                  $("#newReportingManager").val(ui.item.label);
                }
                else {
                  $("#newReportingManagerId").val('');
                  $("#newReportingManager").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#newReportingManagerId").val(ui.item.value);
                  $("#newReportingManager").val(ui.item.label);
                }
                else {
                  $("#newReportingManagerId").val('');
                  $("#newReportingManager").val('');
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


  getEmployeeHODName($event) {
    let text = $('#newHOD').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if (item.fullName != null)
                return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
              else
                return { label: item.employeeId, value: item.id };
            })
            $('#newHOD').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#newHODId").val(ui.item.value);
                  $("#newHOD").val(ui.item.label);
                }
                else {
                  $("#newHODId").val('');
                  $("#newHOD").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#newHODId").val(ui.item.value);
                  $("#newHOD").val(ui.item.label);
                }
                else {
                  $("#newHODId").val('');
                  $("#newHOD").val('');
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

  selectedPaygroup: any;
  payGroupList: any[] = [];
  getPayGroupList(event: any) {
    this.employeeCategoryList = [];
    this.selectedPlantText = event.target.options[event.target.options.selectedIndex].text;

    if (this.selectedPlant.id > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  employeeCategoryList: any[] = [];
  getEmployeeCategoryList(event: any) {
    this.selectedPaygroupText = event.target.options[event.target.options.selectedIndex].text;
    if (this.selectedPlant.id > 0 && this.employeeDetails.payGroupId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id + "/" + this.employeeDetails.payGroupId)
        .then((data: any) => {
          if (data.length > 0) {
            this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
          }
        }).catch(error => {
          this.employeeCategoryList = [];
        });
    }
    else
      this.employeeCategoryList = [];
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
  onPrevious() {
    this.showPrevious();
  }

  onNext() {
    if (this.currentTab == "details") {
      if (this.replacementStatus == "Replaced") {
        if (!confirm("Already replaced. Would you like to continue?")) {
          return;
        }
      }
      if (this.recallDetail.reason == undefined || this.recallDetail.reason == '') {
        toastr.error('Enter Reason For Recall');
        return;
      }
      if (this.recallDetail.recruitmentType == undefined || this.recallDetail.recruitmentType == '') {
        toastr.error('Enter Recruitment Type');
        return;
      }
      var lstWorkingDate = new Date(this.lastWorkingDate);
      if (this.recallDetails.recallDate < lstWorkingDate) {
        toastr.error("Date Of Recall cannot be less than last working date.");
        return;
      }
      if (this.recallDetails.recallDate > new Date()) {
        toastr.error("Date Of Recall cannot be future date.");
        return;
      }
    }
    if (this.currentTab == "jobchange" && this.isDraftSaved == false) {
      this.updateDraft();
    }
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


  onRoleSelected(event: any) {
    this.selectedRoleText = event.target.options[event.target.options.selectedIndex].text;
  }
  onDesignationSelected(event: any) {
    this.selectedDesignationText = event.target.options[event.target.options.selectedIndex].text;
  }
  onSubDepartmentSelected(event: any) {
    this.selectedSubDepartmentText = event.target.options[event.target.options.selectedIndex].text;
  }
  onLocationSelected(event: any) {
    this.selectedLocationText = event.target.options[event.target.options.selectedIndex].text;
  }
  onStaffCategorySelected(event: any) {
    this.selectedStaffCategoryText = event.target.options[event.target.options.selectedIndex].text;
  }

  updateDraft() {
    let connection: any;

    this.isLoading = true;
    if (this.isRoleChange || this.isDesignationChange || this.isTransfer || this.isStaffCategoryChange || this.isreportingManagerChange || this.isHODChange) {
      this.recallDetail.jobChangeDetails = null;
    }
    this.recallDetails.hodApproval = true;
    this.recallDetails.reportingManagerApproval = true;

    this.recallDetails = this.recallDetail;
    this.recallDetails.employeeId = this.employeeId;
    this.recallDetails.createdById = this.currentUser.uid;
    this.recallDetails.recallDate = this.util.getFormatedDateTime(this.recallDetails.recallDate);
    this.recallDetails.createdDate = new Date();
    this.recallDetails.status = "Recall Updated";
    this.recallDetails.reason = this.recallDetails.reason;


    this.recallDetails.IsRoleChange = this.isRoleChange;
    this.recallDetails.IsDesignationChange = this.isDesignationChange;
    this.recallDetails.IsTransfer = this.isTransfer;
    this.recallDetails.IsStaffCategoryChange = this.isStaffCategoryChange;
    this.recallDetails.IsSalaryChange = this.isSalaryChange;

    this.jobChangeDetailsList = [];

    if (this.isRoleChange) {
      if (this.employeeDetails.roleId == undefined || this.employeeDetails.roleId == null || this.employeeDetails.roleId.id <= 0) {
        toastr.error("Please select a new Role"); return;
      }
      var jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Role";
      jobChangeDetail.oldValueText = this.employeeDetails.role;
      jobChangeDetail.newValueText = this.selectedRoleText;
      jobChangeDetail.newValueId = this.employeeDetails.roleId.id;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isDesignationChange) {
      if (this.employeeDetails.designationId == undefined || this.employeeDetails.designationId == null || this.employeeDetails.designationId.id <= 0) {
        toastr.error("Please select a new Designation"); return;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Designation";
      jobChangeDetail.oldValueText = this.employeeDetails.designation;
      jobChangeDetail.newValueText = this.selectedDesignationText;
      jobChangeDetail.newValueId = this.employeeDetails.designationId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isTransfer) {
      if (this.employeeDetails.departmentId > 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Department";
        jobChangeDetail.oldValueText = this.employeeDetails.department;
        jobChangeDetail.newValueText = this.selectedDepartmentText;
        jobChangeDetail.newValueId = this.employeeDetails.departmentId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.employeeDetails.subDepartmentId > 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "SubDepartment";
        jobChangeDetail.oldValueText = this.employeeDetails.subDepartmentName;
        jobChangeDetail.newValueText = this.selectedSubDepartmentText;
        jobChangeDetail.newValueId = this.employeeDetails.subDepartmentId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.employeeDetails.plantId > 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Plant";
        jobChangeDetail.oldValueText = this.employeeDetails.plantName;
        jobChangeDetail.newValueText = this.selectedPlantText;
        jobChangeDetail.newValueId = this.employeeDetails.plantId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.employeeDetails.payGroupId > 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "PayGroup";
        jobChangeDetail.oldValueText = this.employeeDetails.payGroupName;
        jobChangeDetail.newValueText = this.selectedPaygroupText;
        jobChangeDetail.newValueId = this.employeeDetails.payGroupId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.employeeDetails.stateId > 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "State";
        jobChangeDetail.oldValueText = this.employeeDetails.state;
        jobChangeDetail.newValueText = this.selectedStateText;
        jobChangeDetail.newValueId = this.employeeDetails.stateId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.selectedLocation > 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Location";
        jobChangeDetail.oldValueText = this.employeeDetails.location;
        jobChangeDetail.newValueText = this.selectedLocationText;
        jobChangeDetail.newValueId = this.selectedLocation;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
    }
    if (this.isStaffCategoryChange) {
      if (this.employeeDetails.employeeCategoryId <= 0 || this.employeeDetails.employeeCategoryId == null || this.employeeDetails.employeeCategoryId == "") {
        toastr.error("Please select a new Employee Category"); return;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "StaffCategory";
      jobChangeDetail.oldValueText = this.employeeDetails.employeeCategoryName;
      jobChangeDetail.newValueText = this.selectedStaffCategoryText;
      jobChangeDetail.newValueId = this.employeeDetails.employeeCategoryId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isHODChange) {
      if ($("#newHODId").val() <= 0 || $("#newHODId").val() == null || $("#newHODId").val() == "") {
        toastr.error("Please select a new HOD"); return;
      }
      var jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "HOD";
      jobChangeDetail.oldValueText = this.employeeDetails.approvingManagerName;
      jobChangeDetail.newValueText = $("#newHOD").val();
      jobChangeDetail.newValueId = $("#newHODId").val();
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isreportingManagerChange) {
      if ($("#newReportingManagerId").val() <= 0 || $("#newReportingManagerId").val() == null || $("#newReportingManagerId").val() == "") {
        toastr.error("Please select a new Reporting Manager"); return;
      }
      var jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "ReportingManager";
      jobChangeDetail.oldValueText = this.employeeDetails.reportingManagerName;
      jobChangeDetail.newValueText = $("#newReportingManager").val();
      jobChangeDetail.newValueId = $("#newReportingManagerId").val();
      this.jobChangeDetailsList.push(jobChangeDetail);
    }

    this.recallDetails.JobChangeDetails = this.jobChangeDetailsList;
    console.log(this.recallDetails.JobChangeDetails);
    connection = this.httpService.HRpost(APIURLS.RECALL_UPDATE, this.recallDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          //if (data.employeeRecallId > 0) {
          this.isDraftSaved = true;
          this.recallDetails.recallId = data.recallId;
          toastr.success("Details saved successfully.");
          this.tabIndex = 1;
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
        this.errMsgModalPop = 'Error occured while saving Recall Details. Error:' + err;
        toastr.error(this.errMsgModalPop);
      })
      .catch(error => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while saving Recall Details. Error:' + error;
        toastr.error(this.errMsgModalPop);
      });
  }
  onStateChanged(event: any) {
    this.selectedStateText = event.target.options[event.target.options.selectedIndex].text;
    var selectedState = this.stateList.find(x => x.id == this.employeeDetails.stateId);
    if (selectedState)
      this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
  }
  onDepartmentChanged(event: any) {
    this.selectedDepartmentText = event.target.options[event.target.options.selectedIndex].text;

    this.subDepartmentList = this.subDepartmentFullList.filter(x => x.departmentId == this.employeeDetails.departmentId);
  }
  onDataSaved(result) {
    if (result == 200 || result.success) {
      this.submitForApproval(this.recallDetails.recallId);
    }
    else
      swal(result.message);
  }
  submit() {
    if (this.isSalaryChange) {
      this.employeeSalaryComponent.saveData();
    }
    else
      this.submitForApproval(this.recallDetails.recallId);
  }

  submitForApproval(id) {
    var request: any = {};
    request.employeeRecallId = this.employeeRecallId;
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");
    this.httpService.HRpost(APIURLS.RECALL_SUBMIT_FOR_APPROVAL, request)
      .then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully submitted for approval.");
          this.router.navigate(['HR/recall/recall-list']);
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred while submitting.");
      }).catch(error => {
        toastr.error(error);
      });
  }
  totalCTC = 0;
  variableTotal = 0;
  onetimeTotal = 0;
  calculateTotals() {
    this.recallDetail.totalIncome = 0;
    this.recallDetail.totalDeductions = 0;
    this.recallDetail.totalOtherBenefits = 0;
    this.recallDetail.totalReimbursements = 0;

    for (var i = 0; i < this.recallDetail.recallSalaryHeadDetails.length; i++) {
      var head = this.recallDetail.recallSalaryHeadDetails[i];
      if (head.salaryType == "I") {
        this.recallDetail.totalIncome += head.annualAmount;
        this.totalCTC += head.annualAmount;
        if (head.frequency == "M") {
          this.monthlyTotal += head.amount;
          this.monthlyAnnualTotal += head.annualAmount;
        }
      }
      else if (head.salaryType == "D")
        this.recallDetail.totalDeductions += head.annualAmount;
      else if (head.salaryType == "R") {
        this.recallDetail.totalReimbursements += head.annualAmount;
        this.totalCTC += head.annualAmount;
      }
      else if (head.salaryType == "B") {
        this.recallDetail.totalOtherBenefits += head.annualAmount;
        this.totalCTC += head.annualAmount;
      }
      else if (head.salaryType == "V") {
        this.variableTotal += head.annualAmount;
      }
      else if (head.salaryType == "O") {
        this.onetimeTotal += head.annualAmount;
      }
    }
    this.recallDetail.totalCTC = this.recallDetail.totalIncome + this.recallDetail.totalReimbursements + this.recallDetail.totalOtherBenefits;
  }
}
