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
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css'],
  providers: [Util]
})
export class ChecklistComponent implements OnInit {

@ViewChild(NgForm, { static: false }) detailsForm!: NgForm;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private excelService: ExcelService, private masterDataService: MasterDataService, private util: Util) { }

  currentUser!: AuthData;
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

  checklistTypeList = ["Joining Checklist", "Employee-Exit Checklist"];


  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.checklistType = "";
    this.filterModel.gradeId = "";
    this.filterModel.departmentId = "";
    this.filterModel.title = "";
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
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#employeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else {
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }
              },
              select: function (event:any, ui:any) {
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

  clearInput() {
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;
    this.detailsForm.form.markAsPristine();
    this.detailsForm.form.markAsUntouched();
  }

  addData() {
    toastr.info("Adding...");
    this.isLoading = true;
    this.item.spocEmployeeId = $("#employeeId").val();
    this.item.createdById = this.currentUser.uid;
    this.item.createdDate = this.util.getFormatedDateTime(new Date());
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());

    this.httpService.HRpost(APIURLS.BR_CHECKLISTCONFIG, this.item)
      .then((data: any) => {
        //console.log(data);
        if (data == 200 || data.checklistConfigId > 0) {
          this.item.id = data.checklistConfigId;
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
      }).catch((error)=> {
        this.isLoading = false;
        toastr.error('Error adding details...' + error);
      })
  }
  
  updateData() {
    toastr.info("Updating...");
    this.isLoading = true;

    this.item.spocEmployeeId = $("#employeeId").val();
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());

    this.httpService.HRpost(APIURLS.HR_CHECKLIST_CONFIG_UPDATE, this.item)
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
      }).catch((error)=> {
        this.isLoading = false;
        toastr.error('Error updating details...' + error);
      })
  }

  onUpdateLine() {
    this.filterData.list[this.editIndex] = this.item;
    this.clearInput();
  }

  onAddLine() {
    this.filterData.list.push(this.item);
    this.count++;
    this.clearInput();
  }

  getListData() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_CHECKLIST_CONFIG_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;

      this.isLoading = false;
    }).catch((error)=> {
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
  

  EditLine(item:any, index:any) {
    this.item = Object.assign({}, item);

    $("#employeeId").val(this.item.spocEmployeeId);
    $("#employeeName").val(this.item.spocEmployeeName);
    console.log(this.item.employeeName);
    console.log(this.item.employeeId);

    this.isEdit = true;
    this.editIndex = index;
    $("#detailsModal").modal("show");
  }

  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_CHECKLIST_CONFIG_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach((item :any) => {
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
          "CHECKLIST_TYPE": item.checklistType,
          "TITLE": item.title,
          "SPOC_ENO": item.spocEmployeeNo,
          "SPOC_NAME": item.spocEmployeeName,
          "Created By": item.createdByName,
          "Created Date": this.setDateFormate(item.createdDate),
          "Modified By": item.modifiedByName,
          "Modified Date": this.setDateFormate(item.modifiedDate),
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'ChecklistConfig_List');
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

  errorCount = 0;
  delete() {
    var selectedList = this.filterData.list.filter((x:any)  => x.selected);
    if (selectedList.length <= 0) {
      toastr.error("Please select at least one record to delete.");
      return;
    }

    if (!confirm("Are you sure you want to delete the selected records?")) return;

    this.errorCount = 0;
    toastr.info("Deleting...");
    for (var t of selectedList) {

      this.httpService.HRdelete(APIURLS.BR_CHECKLISTCONFIG, t.checklistConfigId).then((data: any) => {
        if (data) {
          if (!data.success) {
            this.errorCount++;
          }
          else {
            toastr.info("Records deleted successfully");
          }
        }
      }).catch((error)=> {
        this.errorCount++;
      });
    }
    setTimeout(() => { this.getData(); }, 3000);

  }

  deleteAll() {

    if (!confirm("Are you sure you want to delete all the records?")) return;

    toastr.info("Deleting...");
      this.httpService.HRpost(APIURLS.BR_DELETE_ALL_CHECKLIST_CONFIGS, this.filterModel).then((data: any) => {
        if (data) {
          if (!data.success) {
            toastr.info("Some error occurred");
          }
          else {
            toastr.info("Records deleted successfully");
          }
        }
        this.getData();
      }).catch((error)=> {

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
    this.httpService.HRpostAttachmentFileWithReturn(APIURLS.HR_CHECKLIST_CONFIGS_BULK_UPLOAD + "?userId=" + userId, formData).then((data: any) => {
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
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  getErrorFile() {
    this.isLoading = true;
    var exportList = [];
    let index = 0;
    this.errorData.forEach((item :any) => {
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
    this.isLoading = true;
    var exportList = [];
    let index = 0;
    this.errorData.forEach((item :any) => {
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

  onPlantChange(){
    if(this.item.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.item.plantId)
      this.payGroupList = this.payGroupFullList.filter((x:any)=>x.plant == plant.code);
    }
    else
      this.payGroupList = [];
  }
  
  onFilterPlantChange(){
    if(this.filterModel.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.filterModel.plantId)
      this.filterPayGroupList = this.payGroupFullList.filter((x:any)=>x.plant == plant.code);
    }
    else
      this.filterPayGroupList = [];
  }
}
