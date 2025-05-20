import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
//import { ConfirmEmployeeModel } from './confirmemployee.model';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app--initiate-confirmation',
  templateUrl: './confirmemployeelist.component.html',
  styleUrls: ['./confirmemployeelist.component.css']
})
export class ConfirmedemployeelistListComponent implements OnInit {
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private dataStore: DataStorageService, private excelService: ExcelService) { }

  currentUser: AuthData;
  isLoading: boolean = false;
  employeeId: number;
  filterData: any = {};
  filterModel: any = {};
  plantlist: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  action: string;
  comment: string;
  predefinedApproversExists: any;
  confirmEmployeeModel: any[] = [];
  selectedInitiatorType: any;
  initiatedFor: any;
  commentIdentifier: any;
  initialApproverType: any;
  selectAll = false;
  approvalInitiatorTypes = [{ type: "HOD" }, { type: "Reporting Manager and HOD" }, { type: "Predefined Initiators" }];

  confirmationType = [{ type: "Probationary Confirmation " }, { type: "Management Trainee" }, { type: "Retention" }];
  statusList = [
    { type: "Initiated", color: "info" },
    { type: "Pending For Recommendation", color: "warning" },
    { type: "Recommendation Submitted", color: "warning" },
    { type: "Pending for Approval", color: "warning" },
    { type: "Confirmation Approved", color: "success" },
    { type: "Confirmation Rejected", color: "danger" },
    { type: "Pending for Extension Approval", color: "warning" },
    { type: "Extension Approved", color: "success" },
    { type: "Extension Rejected", color: "danger" },
    { type: "Email Sent", color: "success" },
    { type: "Withdrawn", color: "danger" },
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

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.status = "";
    this.filterModel.departmentId = "";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    this.filterModel.employeeStatus = "";

    // set default to date to one month from today
    var todate = new Date();
    todate.setMonth((todate.getMonth() * 1) + 1);

    if (todate != null)
      this.filterModel.todate = this.getDateFormate(todate);

    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("ConfEmpList");
    if (oldFilter) {
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }

    this.filterModel.employeeId = this.currentUser.uid;
    this.getAllDropDownValues();
    this.getData();
  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  getEmployeeList() {
    // this.filterModel.fromdate = null;
    // this.filterModel.todate = null;

    // if (this.from_date != null)
    //   this.filterModel.fromdate = this.getDateFormate(this.from_date);
    // if (this.to_date != null)
    //   this.filterModel.todate = this.getDateFormate(this.to_date);
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getAllDropDownValues() {

    this.getDepartments();
    this.getState();
    this.getLocation();
    this.getPlantList();
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
        this.plantlist = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantlist = [];
    });
  }

  getPayGroupList() {
    
    if (this.filterModel.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else {
      this.payGroupList = [];
      this.filterModel.payGroupId = "";
      this.filterModel.employeeCategoryId = "";
    }
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch(error => {
        this.employeeCategoryList = [];
      });
  }


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

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_EMPLOYEE_LIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        var statusData = this.statusList.find(x => x.type == item.status);
        if (statusData)
          item.statusColor = statusData.color;
        
        var empStatusData = this.empStatusList.find(x => x.type == item.employeeStatus);
        if (empStatusData)
          item.employeeStatusColor = empStatusData.color;
      }
      // store the filter model
      this.dataStore.SetData("ConfEmpList", this.filterModel);
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  view(id) {
    let route = 'HR/confirmation/view/' + id;
    this.router.navigate([route]);
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
    this.filterModel.locationId = "";
    var selectedState = this.stateList.find(x => x.id == this.filterModel.stateId);
    if (selectedState)
      this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
  }


  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_EMPLOYEE_LIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem = {
          "SNo": index,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "Employee No": item.employeeNo,

          "First Name": item.firstName,
          "Middle Name": item.middleName,
          "Last Name": item.lastName,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probation Period": item.probationPeriod,
          "Confirmation Due": this.setDateFormate(item.dateOfConfirmation),
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
          "HOD": item.approvingManagerName,
          "Reporting Manager": item.reportingManagerName,

          "Employment Type": item.employmentType,
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_List');
      this.isLoading = false;
    }).catch(error => {
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


  viewConfirmationLetters(id: any) {
    let route = 'HR/confirmation/confirmation-print/' + id;
    this.router.navigate([route]);
  }

  editConfirmation(employeeId: any, id: any) {
    let route = 'HR/confirmation/confirmation-detail/' + employeeId + "/" + id;
    this.router.navigate([route]);
  }

  initiateselectedviahod() {
    this.action = "Initiate Selected Via Hod";
    this.commentIdentifier = "#hrComments";
    this.initiatedFor = "HOD";
  }

  initiateselected() {
    this.action = "Initiate Selected Via Hr";
    this.commentIdentifier = "#hrComments";
    this.initiatedFor = "Hr";
  }

  initiatconfirmation(id) {
    this.employeeId = id;
    this.action = "Initiate Confirmation";
    this.initiatedFor = "Hr";
    this.commentIdentifier = "#hrComments";
    this.initialApproverType == "Hr"
  }

  initiateConfirmationviahod(id) {
    this.employeeId = id;
    this.action = "Initiate Confirmation Via Hod";
    this.initiatedFor = "Hod";
    this.commentIdentifier = "#approverComments";
  }

  initiateconfirmationviarmandhod(id) {
    this.employeeId = id;
    this.comment = $('#approverComments').val();
    this.action = "Appraisal Initiated via Reporting Manager and HOD";
    this.initiatedFor = "Reporting Manager and HOD";
    this.commentIdentifier = "#approverComments";
  }

  initiateconfirmationviaconfigapprovers() {
    this.comment = $('#approverComments').val();
    this.action = "Appraisal Initiated via Predefined Initiators";
    this.initiatedFor = "Predefined Initiators";
    this.commentIdentifier = "#approverComments";
  }

  initiateselectedviarmandhod() {
    this.comment = $('#approverComments').val();
    this.action = "Initiate Selected via Reporting Manager and HOD";
    this.initiatedFor = "Reporting Manager and HOD";
    this.commentIdentifier = "#hrComments";
  }

  initiateselectedviaconfigapprovers() {
    this.comment = $('#approverComments').val();
    this.action = "Initiate Selected via Predefined Initiators";
    this.initiatedFor = "Predefined Initiators";
    this.commentIdentifier = "#hrComments";
  }

  initiateconfirmationviaapprovers(id) {
    this.employeeId = id;
    this.initiatedFor = "";
  }

  lastApprovingkeydown = 0;
  getConfirmerEmployees($event) {
    let text = $('#approverName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#approverName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#approverId").val(ui.item.value);
                  $("#approverName").val(ui.item.label);
                }
                else {
                  $("#approverId").val('');
                  $("#approverName").val('');
                }
              },
              select: function (event, ui) {
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
      this.lastApprovingkeydown = $event.timeStamp;
    }
  }

  CheckifPreDefinedApproversExistsForEmployee(id) {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.CONFIRMATION_CHECK_PREDEFINED_INITIATORS_EXISTS + "/" + id).then((data: any) => {
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
    }).catch(error => {
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
    var confirmMsg = "Are you sure you want to initiate Confirmation?";

    this.confirmEmployeeModel = [];


    if (this.initialApproverType == "HOD") {
      this.comment = $('#approverComments').val();
      this.action = "Initiate Confirmation Via Hod";
      this.initiatedFor = "HOD";
      this.commentIdentifier = "#approverComments";
    }
    else if (this.initialApproverType == "Reporting Manager and HOD") {
      this.comment = $('#approverComments').val();
      this.action = "Confirmation Initiated via Reporting Manager and HOD";
      this.initiatedFor = "Reporting Manager and HOD";
      this.commentIdentifier = "#approverComments";
    }
    if (this.initialApproverType == "Predefined Initiators") {
      this.comment = $('#approverComments').val();
      this.action = "Confirmation Initiated via Predefined Initiators";
      this.initiatedFor = "Predefined Initiators";
      this.commentIdentifier = "#approverComments";
    }

    if (confirm(confirmMsg)) {
      this.isLoading = true;
      if (this.action == "Initiate Selected via Predefined Initiators"
        || this.action == "Confirmation Initiated via Predefined Initiators") {
        this.CheckifPreDefinedApproversExistsForEmployee(this.employeeId);
      }
      else
      {
        this.callSaveService();
      }
      $("#ConfirmationModal").modal('hide');
      $("#ConfirmationModalWithoutHod").modal('hide');
    }
  }

  callSaveService() {
    if (this.action == "Initiate Confirmation"
      || this.action == "Initiate Confirmation Via Hod"
      || this.action == "Confirmation Initiated via Reporting Manager and HOD"
      || this.action == "Confirmation Initiated via Predefined Initiators") {
      if ($(this.commentIdentifier).val() == "" || $(this.commentIdentifier).val() == null
        || $(this.commentIdentifier).val() == undefined) {
        toastr.error("Please enter comments"); return;
      }
      var request: any = {};
      request.employeeId = this.employeeId;
      request.comments = $(this.commentIdentifier).val();
      request.status = "Initiated";
      request.initiatorType = this.initiatedFor;
      request.submitedById = this.currentUser.uid;
      request.hodid = null;
      request.createdDate = this.getDateFormate(new Date());
      request.createdById = this.currentUser.uid;
      request.modifiedById = this.currentUser.uid;
      request.modifiedDate = this.getDateFormate(new Date());
      this.confirmEmployeeModel.push(request);
    }
    else if (this.action == "Initiate Selected Via Hod"
      || this.action == "Initiate Selected Via Hr"
      || this.action == "Initiate Selected via Reporting Manager and HOD"
      || this.action == "Initiate Selected via Predefined Initiators") {
      // if($("#approverId").val() == "" || $("#approverId").val() == null || $("#approverId").val() == undefined || $("#approverId").val() == 0){
      //   toastr.error("Plese select the HOD"); return;
      // }
      if ($(this.commentIdentifier).val() == "" || $(this.commentIdentifier).val() == null
        || $(this.commentIdentifier).val() == undefined) {
        toastr.error("Plese enter comments"); return;
      }

      var selectedList = this.filterData.list.filter(x => x.selected);
      selectedList.forEach(element => {
        var request: any = {};
        request.employeeId = element.employeeId;
        request.comments = $(this.commentIdentifier).val();
        request.status = "Initiated";
        request.submitedById = this.currentUser.uid;
        request.initiatorType = this.initiatedFor;
        //request.hodid = $("#approverId").val();
        request.createdDate = this.getDateFormate(new Date());
        request.createdById = this.currentUser.uid;
        request.modifiedById = this.currentUser.uid;
        request.modifiedDate = this.getDateFormate(new Date());
        this.confirmEmployeeModel.push(request);
      });
    }


    swal("Initiating...");
    this.httpService.HRpost(APIURLS.CONFIRMATION_SAVE_EMPLOYEE_CONFIRMATION_DETAILS, this.confirmEmployeeModel).then((data: any) => {
      if (data == 200 || data.success) {
        this.filterData = [];
        this.getData();
        swal("Confirmation Initiated Successfully.");
      } else if (!data.success && data.message) {
        swal(data.message);
      } else
        swal("Error occurred.");

        this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      swal(error);
    });
  }

  selectAllChange(){
    for (var t of this.filterData.list) {
      if (t.status != "Confirmation Approved" && t.status != "Email Sent")
        t.selected = this.selectAll;
    }
  }
}
