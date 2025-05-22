import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Recall } from './recall.model';
import { JobChangeDetails } from './jobChangeDetails.Model';
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
import swal from 'sweetalert';

@Component({
  selector: 'app-recall',
  templateUrl: './recall.component.html',
  styleUrls: ['./recall.component.css'],
  providers: [Util]
})
export class RecallComponent implements OnInit {
@ViewChild(EmployeeSalaryComponent, { static: false }) employeeSalaryComponent: EmployeeSalaryComponent;

  currentUser: AuthData;
  employeeId: any;
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
  tabsList: string[] = ["details", "jobchange", "salarychange", "history"];
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

  jobChangeDetailsList: JobChangeDetails[] = [];
  resignationDetails = {} as Resignation;
  lastWorkingDate: any;
  offerDetails: any = {};
  replacementStatus: string;
  replacementId: string;
  item: any = {};
  isDraftSaved: boolean = false;
  files: any[] = [];

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
      this.employeeId = this.route.snapshot.paramMap.get('id')!;
      this.recallDetails.hodApproval = true;
      this.recallDetails.reportingManagerApproval = true;
      this.recallDetails.recallDate = this.DateToday;

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
    }
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

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
        console.log(data);
        this.GetReplacementOfferDetails(this.employeeDetails.employeeNo);
        this.lastWorkingDate = this.getDateFormate(this.employeeDetails.dateOfLeaving);
        this.getRecallDetails(id);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }


  getRecallDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.RECALL_GET_STATUS_BY_ID, id).then((data: any) => {
      if (data) {
        this.recallDetails = data;

        if (this.recallDetails.status == 'Pending For Approval') {
          toastr.error("Recall is " + this.recallDetails.status);
          this.router.navigate(['/HR/recall/select-employee']);
        }

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

  goBack() {
    this.location.back();
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

    if (this.employeeDetails.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.employeeDetails.plantId).then((data: any) => {
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
    if (this.employeeDetails.plantId > 0 && this.employeeDetails.payGroupId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/" + this.employeeDetails.plantId + "/" + this.employeeDetails.payGroupId)
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
      if (this.recallDetails.reason == undefined || this.recallDetails.reason == '') {
        toastr.error('Enter Reason For Recall');
        return;
      }
      if (this.recallDetails.recruitmentType == undefined || this.recallDetails.recruitmentType == '') {
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
      for (const file of this.files) {
        var ext = file.name.split('.').pop();
        if (ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png") {
          toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
          return;
        }
        if (file.size > (2 * 1024 * 1024)) {
          toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
          return;
        }
      }
    }
    if (this.currentTab == "jobchange" && this.isDraftSaved == false) {
      this.saveDraft();
    }
    else
      this.showNext();
  }
  selectFiles(event) {
    this.files = event.target.files;
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
  addAttachments() {

    if (this.files.length > 0) {

      const formData = new FormData();
      var index = 0;
      for (const file of this.files) {
        formData.append("attachments[" + index + "]", file);
        index++;
      }
      this.isLoading = true;
      toastr.info("Uploading attachment files ...");
      this.httpService.HRpostAttachmentFile(APIURLS.RECALL_ADD_ATTACHMENTS + "/" + this.recallDetails.recallId, formData)
        .then(
          (data: any) => {
            this.isLoading = false;
            if (data == 200 || data.success) {
              toastr.success('Files uploaded successfully!');
              this.showNext();
            }
            else
              toastr.error(data.message);
          })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while uploading attachments. Error:' + error);
        });
    }
    else {
      this.showNext();
    }
  }
  saveDraft() {
    let connection: any;

    this.isLoading = true;
    this.recallDetails.employeeId = this.employeeId;
    this.recallDetails.createdById = this.currentUser.uid;
    this.recallDetails.createdDate = new Date();
    this.recallDetails.recallDate = this.util.getFormatedDateTime(this.recallDetails.recallDate);
    this.recallDetails.status = "Recall Initiated";
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
      if (this.selectedDesignation == undefined || this.selectedDesignation == null || this.selectedDesignation.id <= 0) {
        toastr.error("Please select a new Designation"); return;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Designation";
      jobChangeDetail.oldValueText = this.employeeDetails.designation;
      jobChangeDetail.newValueText = this.selectedDesignationText;
      jobChangeDetail.newValueId = this.selectedDesignation.id;
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
    connection = this.httpService.HRpost(APIURLS.RECALL_SAVE_DETAILS, this.recallDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          //if (data.employeeRecallId > 0) {
          this.isDraftSaved = true;
          this.recallDetails.recallId = data.recallId;
          toastr.success("Details saved successfully.");
          this.addAttachments();
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
    request.employeeRecallId = id;
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

}
