import { Component, OnInit, ViewChild } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { MasterDataService } from '../../Services/masterdata.service';
import { NgForm } from '@angular/forms';
import { Util } from '../../Services/util.service';
declare var $: any;
declare var toastr: any;
@Component({
  selector: 'app-workflowapprover-master',
  templateUrl: './workflowapprover-master.component.html',
  styleUrls: ['./workflowapprover-master.component.css'],
  providers: [Util]
})
export class WorkflowapproverMasterComponent implements OnInit {
@ViewChild(NgForm, { static: false }) detailsForm: NgForm;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private excelService: ExcelService, private masterDataService: MasterDataService, private util: Util) { }

  currentUser: AuthData;
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: any = {};
  plantList: any[] = [];
  gradeList: any[] = [];
  payGroupList: any[] = [];
  filterPayGroupList: any[] = [];
  payGroupFullList: any[] = [];
  employeeCategoryList: any[] = [];
  departmentList: any[] = [];
  editIndex: number = -1;
  item: any = {};
  isEdit: boolean = false;
  count: number = 0;
  files: any[] = [];
  errorData: any = {};

  flowTypeList = ["Appointment Approval", "Appointment Verification", "Appraisal Approval", "Confirmation Approval", "Confirmation Extension Approval", "Employee Profile",
    "FNF Approval", "Offer Approval", "Offer Exception Approval", "Recall Approval", "Resignation Approval", "Retirement Approval", "Service Withdrawn Approval", "Transfer Approval"];
  approverTypeList = ["Custom","HOD", "Reporting Manager", "Destination SPOC", "New HOD"];
  approverRuleList = ["Inter Transfer", "Shortfall Notice"];

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.status = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.flowType = "";
    this.filterModel.gradeId = "";
    this.filterModel.departmentId = "";
    this.filterModel.approverType = "";
    this.filterModel.approverRule = "";
    this.filterModel.active = true;

    //this.masterDataService.getPlantListAssigned(this.currentUser.uid).then(data => this.plantList = data);
    this.masterDataService.getPlantList().then((data: any) => { this.plantList = data; });
    this.masterDataService.getPayGroupList().then((data: any) => { this.payGroupFullList = data; });
    this.masterDataService.getEmployeeCategoryList().then((data: any) => { this.employeeCategoryList = data; });
    this.masterDataService.getGrade().then((data: any) => { this.gradeList = data; });
    this.masterDataService.getDepartments().then((data: any) => { this.departmentList = data; });
    this.getListData();

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

  lastApproverEmployeekeydown = 0;
  getEmployeesList($event) {
    let text = $('#employeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApproverEmployeekeydown > 400) {
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
      this.lastApproverEmployeekeydown = $event.timeStamp;
    }
  }

  oldApproverEmployeekeydown = 0;
  getOldEmployeesList($event) {
    let text = $('#oldEmployeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApproverEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#oldEmployeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#oldEmployeeId").val(ui.item.value);
                  $("#oldEmployeeName").val(ui.item.label);
                }
                else {
                  $("#oldEmployeeId").val('');
                  $("#oldEmployeeName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#oldEmployeeId").val(ui.item.value);
                  $("#oldEmployeeName").val(ui.item.label);
                }
                else {
                  $("#oldEmployeeId").val('');
                  $("#oldEmployeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.oldApproverEmployeekeydown = $event.timeStamp;
    }
  }


  newApproverEmployeekeydown = 0;
  getNewEmployeesList($event) {
    let text = $('#newEmployeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApproverEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#newEmployeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#newEmployeeId").val(ui.item.value);
                  $("#newEmployeeName").val(ui.item.label);
                }
                else {
                  $("#newEmployeeId").val('');
                  $("#newEmployeeName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#newEmployeeId").val(ui.item.value);
                  $("#newEmployeeName").val(ui.item.label);
                }
                else {
                  $("#newEmployeeId").val('');
                  $("#newEmployeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.newApproverEmployeekeydown = $event.timeStamp;
    }
  }

  clearInput() {
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;
    this.detailsForm.form.markAsPristine();
    this.detailsForm.form.markAsUntouched();
  }

  addData() {
    if(this.item.autoApprove && this.item.approveInDays == undefined) {
      toastr.error("Please enter Approve in Days.");
      return;
    }
    if(!this.item.autoApprove && this.item.approveInDays == undefined) {
      this.item.approveInDays = 0;
    }
    if(this.item.autoReject && this.item.rejectInDays == undefined)
    {
      toastr.error("Please enter Reject in Days.");
      return;
    }
    if(!this.item.autoReject && this.item.rejectInDays == undefined) {
      this.item.rejectInDays = 0;
    }
    toastr.info("Adding...");
    this.isLoading = true;
    this.item.approverId = $("#employeeId").val();
    this.item.createdById = this.currentUser.uid;
    this.item.createdDate = this.util.getFormatedDateTime(new Date());
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());

    this.httpService.HRpost(APIURLS.BR_WORKFLOWAPPROVER, this.item)
      .then((data: any) => {
        //console.log(data);
        if (data == 200 || data.flowApproverId > 0) {
          this.item.id = data.flowApproverId;         
          toastr.success("Successfully added the details.");
          $("#detailsModal").modal("hide");
          this.getData();
        }
        else
        {
          toastr.error(data.validationMessage);
        }
        console.log(data);
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error adding details...' + error);
      })
  }

  updateData() {
    if(this.item.autoApprove && this.item.approveInDays == undefined) {
      toastr.error("Please enter Approve in Days.");
      return;
    }
    if(!this.item.autoApprove && this.item.approveInDays == undefined) {
      this.item.approveInDays = 0;
    }
    if(this.item.autoReject && this.item.rejectInDays == undefined)
    {
      toastr.error("Please enter Reject in Days.");
      return;
    }
    if(!this.item.autoReject && this.item.rejectInDays == undefined) {
      this.item.rejectInDays = 0;
    }
    toastr.info("Updating...");
    this.isLoading = true;

    this.item.approverId = $("#employeeId").val();
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());

    this.httpService.HRpost(APIURLS.HR_WORKFLOW_APPROVERS_UPDATE_APPROVER, this.item)
      .then((data: any) => {
        if (data == 200 || data.success) {          
          toastr.success("Successfully updated the details.");
          $("#detailsModal").modal("hide");
          this.getData();
        }
        else
        {
          toastr.error(data.message);
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error updating details...' + error);
      })
  }

  getListData() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_WORKFLOW_APPROVER_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;

      this.isLoading = false;
    }).catch(error => {
      toastr.error("Error while fetching the list. Error: " + error);
      this.isLoading = false;
    });
  }

    onAddClick() {
    this.clearInput();
    $("#detailsModal").modal("show");
  }

  onBulkUploadClick() {
    this.clearInput();
    $("#bulkUploadModal").modal("show");
  }

  onReplaceClick() {
    this.clearInput();
    $("#replaceApproversModal").modal("show");
  }
  

  EditLine(item, index) {
    this.item = Object.assign({}, item);

    $("#employeeId").val(this.item.approverId);
    $("#employeeName").val(this.item.approverName);
    this.onPlantChange();

    this.isEdit = true;
    this.editIndex = index;
    $("#detailsModal").modal("show");
  }

  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_WORKFLOW_APPROVER_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "PLANT_ID": item.plantId,
          "PLANT_CODE": item.plantCode,
          "PLANT": item.plantName,
          "PAY_GROUP_ID": item.payGroupId,
          "PAY_GROUP": item.payGroupName,
          "CATEGORY_ID": item.employeeCategoryId,
          "CATEGORY": item.employeeCategoryName,
          "GRADE": item.gradeCode,
          "DEPARTMENT_ID": item.departmentId,
          "DEPARTMENT_NAME": item.departmentName,
          "FLOW_TYPE": item.flowType,
          "APPROVER_ENO": item.approverEmployeeNo,
          "APPROVER_NAME": item.approverName,
          "APPROVER_TYPE": item.approverType,
          "APPROVER_RULE": item.approverRule,
          "APPROVER_ORDER": item.approverOrder,
          "AUTO_APPROVE": item.autoApprove == true ? "Yes" : "No",
          "AUTO_APPROVE_DAYS": item.approveInDays,
          "AUTO_REJECT": item.autoReject == true ? "Yes" : "No",
          "AUTO_REJECT_DAYS": item.rejectInDays,
          "ALLOW_EDIT": item.allowEdit == true ? "Yes" : "No",
          // "Created By": item.createdByName,
          // "Created On": this.setDateFormate(item.createdOn),
          // "Modified By": item.modifiedByName,
          // "Modified On": this.setDateFormate(item.modifiedOn),
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'WorkflowApprovers_List');
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

  errorCount = 0;
  delete() {
    var selectedList = this.filterData.list.filter(x => x.selected);
    if (selectedList.length <= 0) {
      toastr.error("Please select at least one record to delete.");
      return;
    }

    if (!confirm("Are you sure you want to delete the selected records?")) return;

    this.errorCount = 0;
    toastr.info("Deleting...");
    for (var t of selectedList) {

      this.httpService.HRdelete(APIURLS.BR_WORKFLOWAPPROVER, t.flowApproverId).then((data: any) => {
        if (data) {
          if (!data.success) {
            this.errorCount++;
          }
          else {
            toastr.success("Records deleted successfully");
          }
        }
      }).catch(error => {
        this.errorCount++;
      });
    }
    setTimeout(() => { this.getData(); }, 3000);

  }

  deleteAll() {

    if (!confirm("Are you sure you want to delete all the records?")) return;

    toastr.info("Deleting...");
      this.httpService.HRpost(APIURLS.BR_DELETE_ALL_WORKFLOW_APPROVER, this.filterModel).then((data: any) => {
        if (data) {
          if (!data.success) {
            toastr.info("Error occurred while deleting records.");
          }
          else {
              toastr.success("Records deleted successfully");              
          }
          this.getData();
        }
      }).catch(error => {

      });    
    
  }

  getFiles(event: any) {
    this.files = event.target.files;
  }

  public uploadFile(): void {
    if (this.files.length === 0) {
      return;
    }
    const formData = new FormData();
    formData.append('file', this.files[0]);
    let userId = this.currentUser.uid;
    this.httpService.HRpostAttachmentFileWithReturn(APIURLS.HR_WORKFLOW_APPROVERS_BULK_UPLOAD + "?userId=" + userId, formData).then((data: any) => {
      this.isLoading = false;

      if (data.length > 0) {
        this.errorData = data;
        swal('Invalid data encountered in Upload file, The error file is being downloaded for review');
        this.getErrorFile();
      }
      else
        {
          swal('Details saved successfully!');     
          $("#bulkUploadModal").modal("hide");
        }
        this.getData();

    }).catch(error => {
      this.isLoading = false;
    });
  }

  getErrorFile() {
    //this.filterModel.export = true;
    this.isLoading = true;

    // this.filterModel.export = false;
    var exportList = [];
    let index = 0;
    this.errorData.forEach(item => {
      index = index + 1;
      let exportItem = {
        "Row No": item.rowNo,
        "Approver Employee No": item.employeeNo,
        "Error Message": item.errorMessage,
      };
      exportList.push(exportItem);
    });
    this.excelService.exportAsExcelFile(exportList, 'Upload_Error_List');
    this.isLoading = false;
  }

  getInitialErrorFile() {
    //this.filterModel.export = true;
    this.isLoading = true;

    // this.filterModel.export = false;
    var exportList = [];
    let index = 0;
    this.errorData.forEach(item => {
      index = index + 1;
      let exportItem = {
        "Row No": item.rowNo,
        "Error Type": item.employeeNo,
        "Error Message": item.errorMessage,
      };
      exportList.push(exportItem);
    });
    this.excelService.exportAsExcelFile(exportList, 'Upload_Error_List');
    this.isLoading = false;
  }

  request: any = {};
  replaceApprovers() {
    if (this.item.oldEmployeeName == undefined) {
      toastr.error("Please enter old Approver.");
      return;
    }
    if (this.item.newEmployeeName == undefined) {
      toastr.error("Please enter new Approver.");
      return;
    }
    this.request.oldApproverEmployeeId = $("#oldEmployeeId").val();
    this.request.newApproverEmployeeId = $("#newEmployeeId").val();
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_WORKFLOW_APPROVERS_REPLACE_APPROVER, this.request).then((data: any) => {
      if (data == 200 || data.success) {
        toastr.success("Successfully replaced approvers.");
        $("#replaceApproversModal").modal("hide");
      }
      else
      {
        toastr.error(data.message);
      }
      this.getData();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error('Error adding details...' + error);
    })
  }

  onPlantChange(){
    if(this.item.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.item.plantId)
      this.payGroupList = this.payGroupFullList.filter(x=>x.plant == plant.code);
    }
    else
      this.payGroupList = [];
  }
  
  onFilterPlantChange(){
    if(this.filterModel.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.filterModel.plantId)
      this.filterPayGroupList = this.payGroupFullList.filter(x=>x.plant == plant.code);
    }
    else
      this.filterPayGroupList = [];
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
}
