import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import { AppraisalInitialRequest } from './appraisalinitialrequest.model';
//import { InitialAppraisalUpdateRequest } from './initialappraisalupdaterequest.model';


import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-appraisal-employeelist',
  templateUrl: './appraisal-employeelist.component.html',
  styleUrls: ['./appraisal-employeelist.component.css']
})
export class AppraisalEmployeelistComponent implements OnInit {

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, 
    private dataStore: DataStorageService, private excelService: ExcelService) { }

  currentUser!: AuthData;
  isLoading: boolean = false;
  action: string
  employeeId!: number;
  employeeInitialAppraisalDetailId!: number;
  comment: string
  hrcomment: string
  filterData: any = {};
  filterModel: any = {};
  plantlist: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  employeeInitialAppraisalrequests: AppraisalInitialRequest[] = [];
  initiatedFor: any;
  initialApproverType: any;
  predefinedApproversExists!: boolean;
  statusList = [
    { type: "Appraisal Initiated", color: "info" },
    { type: "Pending For Recommendation", color: "warning" },
    { type: "Recommendation Submitted", color: "info" },
    { type: "Pending for Approval", color: "warning" },
    { type: "Approved", color: "success" },
    { type: "Rejected", color: "danger" },
    { type: "Withdrawn", color: "danger" },
    { type: "Email Sent", color: "success" },

  ];  
  empStatusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Service Withdrawn", color: "danger" },
    { type: "Retired", color: "danger" },
    { type: "FNF Settled", color: "danger" },
  ];
  selectedAppraisalType: any;
  selectedBulkAppraisalType: any;
  appraisalTypes = [{ type: "Regular" }, { type: "Ad-Hoc" }, { type: "Retention" }, { type: "VP and Above" }];
  appraisalInitiatorTypes = [{ type: "HOD" }, { type: "HR" }, { type: "Reporting Manager and HOD" }, { type: "Predefined Initiators" }];
  selectedAppraisalPeriod: any;
  appraisalPeriodDates = [{ type: "2023-24" }, { type: "2024-25" }, { type: "2025-26" }, { type: "2026-27" }, { type: "2027-28" }];
  approvalInitiatorTypes = [{ type: "HOD" }, { type: "Reporting Manager and HOD" }, { type: "Predefined Initiators" }];

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.status = "";
    this.filterModel.departmentId = "";
    this.filterModel.subDepartmentId = "";
    this.filterModel.designationId = "";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.employeeStatus = "";
    this.selectedBulkAppraisalType = "HOD";
    this.getAllDropDownValues();
    
    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("AppraisalEmployeeList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
      this.filterModel.employeeId = this.currentUser.uid;
      this.getData();
    }
    //this.getData();

  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  getEmployeeList() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getAllDropDownValues() {

    this.getDepartments();
    this.getRole();
    this.getDesignation();
    this.getState();
    this.getLocation();
    this.getPlantList();
    this.getPayGroupList();
    this.getDesignation();
    this.getSubDepartments();
    this.getEmployeeCategoryList();
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantlist = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantlist = [];
    });
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.employeeCategoryList = [];
      });
  }

  getPayGroupList() {
    
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    if (this.filterModel.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
    else{
      this.payGroupList = [];
      
    }
  }

  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch((error)=> {
      this.designationList = [];
    });
  }

  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a:any, b:any) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch((error)=> {
      this.stateList = [];
    });
  }

  locationFullList: any[] = [];
  locationList: any[] = [];
  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch((error)=> {
      this.locationList = [];
    });
  }

  departmentList: any[] = [];
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
    });
  }

  subDepartmentFullList: any[] = [];
  subDepartmentList: any[] = [];
  getSubDepartments() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SUB_DEPARTMENTS).then((data: any) => {
      if (data.length > 0) {
        this.subDepartmentFullList = data.sort((a:any, b:any) => { if (a.sdptidLtxt > b.sdptidLtxt) return 1; if (a.sdptidLtxt < b.sdptidLtxt) return -1; return 0; });
      }
    }).catch((error)=> {
      this.subDepartmentFullList = [];
    });
  }

  onDepartmentChange() {
    this.subDepartmentList = this.subDepartmentFullList.filter((x:any)  => x.departmentId == this.filterModel.departmentId);
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_EMPLOYEELIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        if (this.statusList.find((x:any)  => x.type == item.employeeAppraisalStatus) != null)
          item.statusColor = this.statusList.find((x:any)  => x.type == item.employeeAppraisalStatus).color;
          
          var empStatusData = this.empStatusList.find((x:any)  => x.type == item.status);
          if (empStatusData)
            item.empStatusColor = empStatusData.color;
      }      
      // store the filter model
      this.dataStore.SetData("AppraisalEmployeeList", this.filterModel);
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  onStateChange() {
    this.locationList = this.locationFullList.filter((x:any)  => x.stateId == this.filterModel.locationStateId);
  }

  roleList: any[] = [];
  getRole() {
    this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a:any, b:any) => { if (a.role_ltxt > b.role_ltxt) return 1; if (a.role_ltxt < b.role_ltxt) return -1; return 0; });
      }
    }).catch((error)=> {
      this.roleList = [];
    });
  }

  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_EMPLOYEELIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach((item :any) => {
        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Status": item.employeeAppraisalStatus,
          "Appraisal Period": item.appraisalPeriod,
          "Appraisal Type": item.appraisalType,
          "Employee No": item.employeeNo,
          "Plant Name": item.plantName,
          "Plant Code": item.plantCode,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Department": item.department,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Manager": item.reportingManagerName,
          "HOD": item.approvingManagerName,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Employment Type": item.employmentType,
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_List');
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  toggleColumns() {
    $(".columnGroup").on("click", function () {
      var group = $(this).attr("data-group");
      if (group == "all") {
        $(".columnGroup").removeClass('active').addClass('active');
        $("#data th, #data td").show();
      }
      else {
        $(this).toggleClass('active');
        $("#data ." + group).toggle();
      }
    });
  }

  lastAppraiseeEmployeekeydown = 0;
  getAppraiserEmployees($event) {
    let text = $('#approverName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastAppraiseeEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#approverName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approverId").val(ui.item.value);
                  $("#approverName").val(ui.item.label);
                }
                else {
                  $("#approverId").val('');
                  $("#approverName").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approverId").val(ui.item.value);
                  $("#approverName").val(ui.item.label);
                }
                else {
                  $("#approverId").val('');
                  $("#approverName").val('');
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

  initiateappraisalviahod(id:any) {
    this.employeeId = id;
    this.comment = this.comment;
    this.action = "Appraisal Initiated via Hod";
    this.initiatedFor = "Hod";
  }
  initiateappraisal(id:any) {
    this.employeeId = id;
    this.comment = $('#approverComments').val();
    this.action = "Appraisal Initiated via Hr";
    this.initiatedFor = "Hr";
    this.initialApproverType == "Hr"
  }
  initiateselectedviahod() {
    this.comment = $('#approverComments').val();
    this.action = "Initiate Selected via Hod";
    this.initiatedFor = "Hod";
  }
  initiateappraisalviaapprovers(id:any) {
    this.employeeId = id;
    this.initiatedFor = "";
  }
  initiateappraisalviarmandhod(id:any) {
    this.employeeId = id;
    this.comment = $('#approverComments').val();
    this.action = "Appraisal Initiated via Reporting Manager and HOD";
    this.initiatedFor = "Reporting Manager and HOD";
  }
  initiateselected() {
    this.comment = $('#hrapproverComments').val();
    this.action = "Initiate selected via Hr";
    this.initiatedFor = "Hr";
  }
  // initiateallviahod() {
  //   this.comment = $('#approverComments').val();
  //   this.action = "Initiate All Via Hod";
  // }
  // initiateall() {
  //   this.comment = $('#approverComments').val();
  //   this.action = "Initiate All";
  // }
  withdraw(id:any) {
    this.employeeInitialAppraisalDetailId = id;
    this.comment = "";
    this.action = "Withdrawn";
  }
  initiateappraisalviaconfigapprovers(id:any) {
    this.employeeId = id;
    this.comment = $('#approverComments').val();
    this.action = "Appraisal Initiated via Predefined Initiators";
    this.initiatedFor = "Predefined Initiators";
  }

  initiateselectedviarmandhod() {
    this.comment = $('#approverComments').val();
    this.action = "Initiate Selected via Reporting Manager and HOD";
    this.initiatedFor = "Reporting Manager and HOD";
  }

  initiateselectedviaconfigapprovers() {
    this.comment = $('#approverComments').val();
    this.action = "Initiate Selected via Predefined Initiators";
    this.initiatedFor = "Predefined Initiators";
  }

  CheckifPreDefinedApproversExistsForEmployee(id:any) {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.HR_EMPLOYEE_APPRAISAL_CHECK_PREDEFINED_INITIATORS_EXISTS + "/" + id).then((data: any) => {
      this.predefinedApproversExists = data;
      if (!this.predefinedApproversExists) {
        swal("Predefined Approvers don't exist for this employee");
        this.isLoading = false;
        return;
      }
      else {
        this.callSaveService();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;

    });
  }

  performTask() {
    if (this.initiatedFor != "Hr"
      && this.action != "Initiate Selected Via Hod"
      && this.action != "Initiate Selected via Predefined Initiators"
      && this.action != "Initiate Selected via Reporting Manager and HOD"
      && this.initialApproverType == null) {
      toastr.error("Please select approver type"); return;
    }
    var confirmMsg = "Are you sure you want to initiate Appraisal?";
    this.employeeInitialAppraisalrequests = [];

    if (this.initialApproverType == "HOD") {
      this.comment = $('#approverComments').val();
      this.action = "Appraisal Initiated via Hod";
      this.initiatedFor = "HOD";
    }
    else if (this.initialApproverType == "Reporting Manager and HOD") {
      this.comment = $('#approverComments').val();
      this.action = "Appraisal Initiated via Reporting Manager and HOD";
      this.initiatedFor = "Reporting Manager and HOD";
    }
    if (this.initialApproverType == "Predefined Initiators") {
      this.comment = $('#approverComments').val();
      this.action = "Appraisal Initiated via Predefined Initiators";
      this.initiatedFor = "Predefined Initiators";
    }


    var employeesList = this.filterData.list;
    if (confirm(confirmMsg)) {
      this.isLoading = true;
      if (this.action == "Initiate Selected via Predefined Initiators"
        || this.action == "Appraisal Initiated via Predefined Initiators") {
        this.CheckifPreDefinedApproversExistsForEmployee(this.employeeId);
      }
      else {
        this.callSaveService();
      }
      $("#AppraisalManagerModal").modal('hide');
      $("#AppraisalManagerModalWithoutHod").modal('hide');
    }

  }

  callSaveService() {
    if (this.action == "Appraisal Initiated via Hod"
      || this.action == "Appraisal Initiated via Hr"
      || this.action == "Appraisal Initiated via Reporting Manager and HOD"
      || this.action == "Appraisal Initiated via Predefined Initiators") {
      var request = {} as AppraisalInitialRequest;
      request.employeeid = this.employeeId;
      //request.hodid = $("#approverId").val();
      request.appraisalinitiatortype = this.initiatedFor;
      request.status = "Appraisal Initiated";
      request.initiatedByid = this.currentUser.uid;
      request.initiateddate = this.getDateFormate(new Date());
      request.appraisaltype = this.selectedAppraisalType;
      request.appraisalPeriod = this.selectedAppraisalPeriod;
      request.rating = null;
      request.responsibilities = null;
      request.specialachievement = null;
      request.nextyearkra = null;
      request.recommendedDesignationid = null;
      request.recommendedRoleid = null;
      request.recommendedsalary = null;
      request.initialappraisalapproveddate = null;
      request.comment = this.comment;
      this.employeeInitialAppraisalrequests.push(request);
    }
    else if (this.action == "Initiate Selected Via Hod"
      || this.action == "Initiate selected via Hr"
      || this.action == "Initiate Selected via Reporting Manager and HOD"
      || this.action == "Initiate Selected via Predefined Initiators") {
      var selectedList = this.filterData.list.filter((x:any)  => x.selected);
      console.log(selectedList);
      selectedList.forEach((element:any)=> {

        var request = {} as AppraisalInitialRequest;
        request.employeeid = element.employeeId;
        //request.hodid = $("#approverId").val();
        request.appraisalinitiatortype = this.initiatedFor;
        request.status = "Appraisal Initiated";
        request.initiatedByid = this.currentUser.uid;
        request.initiateddate = this.getDateFormate(new Date());
        request.appraisaltype = this.selectedAppraisalType;
        request.appraisalPeriod = this.selectedAppraisalPeriod;
        request.rating = null;
        request.responsibilities = null;
        request.specialachievement = null;
        request.nextyearkra = null;
        request.recommendedDesignationid = null;
        request.recommendedRoleid = null;
        request.recommendedsalary = null;
        request.initialappraisalapproveddate = null;
        request.comment = this.comment;
        this.employeeInitialAppraisalrequests.push(request);
      });
    }
    swal("Initiating Appraisal...");
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_SAVE_INITIAL_APPRAISAL_DETAILS, this.employeeInitialAppraisalrequests).then((data: any) => {
      if (data == 200 || data.success) {
        this.filterData = [];
        this.getData();
        // if (data.employeeinitialappraisaldetailId > 0) {
        //   request.employeeinitialappraisaldetailId = data.EmployeeInitialAppraisalDetailId;
        swal("Appraisal Initiated Successfully " + this.action);
        $("#AppraisalManagerModal").on("hidden.bs.modal", function () {
          $(".modal-body").html("");
        });
        $("#CommentsModal").on("hidden.bs.modal", function () {
          $(".modal-body").html("");
        });
        //}
      } else if (!data.success) {
        swal(data.message);
      } else
        swal("Error occurred.");
    }).catch((error)=> {
      swal(error);
    });
  }

  changeStatus() {
    var confirmMsg = "Are you sure you want to withdraw this?";

    $("#CommentsModal").modal('hide');
    if (confirm(confirmMsg)) {
      var request: any = {};
      request.employeeInitialAppraisalDetailId = this.employeeInitialAppraisalDetailId;
      request.comment = this.comment;
      request.status = this.action;

      swal("Updating...");
      this.httpService.HRpost(APIURLS.HR_EMPLOYEE_INITIAL_APPRAISAL_UPDATE_STATUS, request).then((data: any) => {
        if (data == 200 || data.success) {
          this.filterData = [];
          this.getEmployeeList();
          swal("Successfully " + this.action);
        } else if (!data.success) {
          swal(data.message);
        } else
          swal("Error occurred.");
      }).catch((error)=> {
        swal(error);
      });
    }
  }
  viewAppraisalDetails(eid: any, id: any) {
    let route = 'HR/actions/appraisal-view-only/' + eid + "/" + id;
    this.router.navigate([route]);
  }

  viewAppraisalLetters(id: any) {
    let route = 'HR/actions/appraisal-print/' + id;
    this.router.navigate([route]);
  }
}
