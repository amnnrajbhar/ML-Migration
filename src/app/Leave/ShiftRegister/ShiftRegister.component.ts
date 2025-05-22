import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';

declare var toastr: any;
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';


import * as _ from "lodash";
import { Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-ShiftRegister',
  templateUrl: './ShiftRegister.component.html',
  styleUrls: ['./ShiftRegister.component.css']
})
export class ShiftRegisterComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;

  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;


  public tableWidget: any;
  departmentList: any[] = [];
  locListCon = [];
  locListCon1 = [];
  genders: any[] = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }];
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  path: string;
  filterEmployeeName: string = null;
  filterEmployeeId: string = null;
  filterLocation: string = null;
  EmployeeNo: any = null;
  filterPayGroup: string = null;
  filterDepartment: string = null;
  filterSubDepartment: string = null;
  filterReportingGroup: string = null;
  filterCategory: string = null;
  filterStatus: boolean = null;
  filterType: any = null;
  ShiftAssignmentList: any[] = [];
  ShiftList: any[] = [];
  AssignedShift: any;
  AssignedCount: any;
  month: any;
  calYear: any;
  ShiftAssignmentList1: any[] = [];


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private excelService: ExcelService) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#location');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }

  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }

  getLocationMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
        //this.filterLocation = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
        // this.getpayGroupList();
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  clearFilter() {
    this.filterLocation = this.currentUser.baselocation.toString();
    this.selectedEmployeeList = [];
    this.filterEmployeeName = '';
    this.filterDepartment = '';
    this.filterPayGroup = '';
    this.filterSubDepartment = '';
    this.filterReportingGroup = '';
    this.filterCategory = '';
    this.month = null;
    this.filterStatus = null;
    this.filterType = null;
  }

  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }

  deliveryModeSettings = {
    singleSelection: false,
    idField: 'employeeNo',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  onItemDeSelect(item: any) {
  }

  onDeSelectAll(items: any) {
    this.selectedEmployeeList = [];
  }

  onSelectAll(items: any) {
    this.selectedEmployeeList = items;
  }

  selectedEmployeeList: any[] = [];
  empListCon: any[] = [];
  getUsersList() {
    if (this.filterLocation == null || this.filterLocation == '') {
      toastr.error("Please select Plant..!");
      return;
    }
    else if (this.filterPayGroup == null || this.filterPayGroup == '') {
      toastr.error("Please select Paygroup..!");
      return;
    }
    else if (this.filterCategory == null || this.filterCategory == '') {
      toastr.error("Please select Emp Category..!");
      return;
    }
    let filterModel: any = {};
    filterModel.baseLocation = this.filterLocation;
    filterModel.payGroup = this.filterPayGroup;
    filterModel.category = this.filterCategory;
    filterModel.department = this.filterDepartment;
    filterModel.reportingGroup = this.filterReportingGroup;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LIST_FOR_REPORT, filterModel).then((data: any) => {
      this.empListCon = data.table;
      this.empListCon.forEach(element => {
        element.name = element.employeeNo + ' - ' + element.name;
      });
    }).catch(error => {
      this.empListCon = [];
      this.isLoading = false;

    });
  }


  BloodGroupList: any[] = [];
  selectedEmployee: any[] = [];
  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.calYear = new Date().getFullYear().toString();
    this.filterLocation = this.currentUser.baselocation.toString();

    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getLocationMaster();
      this.getReportingGroupList();
      this.getDepartList();
      this.getDesignationList();
      this.getsubDeptList();
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getempCatList();
      this.filterLocation = this.currentUser.baselocation.toString();
      this.GetEmpDetails(this.currentUser.employeeId);
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();

  }
  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.plantList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.getpayGroupList();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  getShiftMasterList() {
    this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
      if (data.length > 0) {
        this.ShiftList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.ShiftList = [];
    });
  }
  EmployeeList: any[] = [];

  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
        let temp = this.locationList.find(x => x.id == this.filterLocation);
        this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);

      }
      //this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }
  payGroupList1: any[] = [];
  onplantchange() {
    this.filterPayGroup = null;
    let temp = this.plantList.find(x => x.fkPlantId == this.filterLocation);
    this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
  }
  empCatList: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.empCatList = [];
    });
  }

  subDeptList: any[] = [];
  getsubDeptList() {
    this.errMsg = "";
    this.get("SubDeptMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.subDeptList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.subDeptList = [];
    });
  }

  ReportingGroupList: any[] = [];
  getReportingGroupList() {
    this.errMsg = "";
    this.get("ReportingGroupM/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.ReportingGroupList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.ReportingGroupList = [];
    });
  }

  GetReportingEmployeeList() {
    this.httpService.LAgetByParam(APIURLS.GET_EMP_OF_REPORTING, this.currentUser.employeeId).then((data: any) => {
      if (data.length > 0) {
        this.EmployeeList = data;
        this.empListCon = data.map((i) => { i.name = i.fullName + '-' + i.employeeId, i.id = i.employeeId, i.empName = i.fullName; return i; });

        this.EmployeeList.sort((a, b) => {
          if (a.fullName > b.fullName) return 1;
          if (a.fullName < b.fullName) return -1;
          return 0;

        })
      }
      else {
        this.EmployeeList = [];
      }
    }).catch(error => {
      this.isLoading = false;
      this.EmployeeList = [];
    });
  }

  Department: any;
  Designation: any;
  FullName: any;
  JoiningDate: any;
  EmployeeId: any;
  GetEmpDetails(val) {

    let connection = this.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, val);
    connection.then((data: any) => {
      if (data) {
        let result = data.filter(x => { return x.employeeId != null });
        this.Department = result[0].department;
        this.Designation = result[0].designation;
        this.FullName = result[0].fullName;
        this.EmployeeId = result[0].employeeId;
        this.JoiningDate = result[0].joiningDate;
      }
    }).catch(error => {
    });
  }

  designationList: any[] = [];
  getDesignationList() {
    this.errMsg = "";
    this.get("DesignationMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.designationList = [];
    });
  }

  getDepartList() {
    this.httpService.LAget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.departmentList = [];
      this.isLoading = false;

    });
  }

  lastReportingkeydown = 0;
  getReportingManager($event) {
    let text = $('#reportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
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
                else {
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#reportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else {
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

  getFilteredList() {
    if (this.filterLocation == null) {
      toastr.error("Please select Plant.");
      return;
    }
    if (this.filterPayGroup == null) {
      toastr.error("Please select PayGroup.");
      return;
    }
    if (this.filterCategory == null) {
      toastr.error("Please select Category.");
      return;
    }
    else if (this.month == null) {
      toastr.error("Please select Month.");
      return;
    }
    else {
      let filterModel: any = {};
      filterModel.plant = this.filterLocation;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.empCat = this.filterCategory;
      filterModel.department = this.filterDepartment;
      filterModel.subDept = this.filterSubDepartment;
      filterModel.employeeId = this.selectedEmployeeList.length > 0 ? this.selectedEmployeeList.map(x => x.employeeNo).join(',') : null;
      filterModel.month = this.month;
      filterModel.rotational = this.filterStatus;
      filterModel.Year = this.calYear;
      let connection = this.httpService.LApost(APIURLS.GET_EMP_SHIFT_DATA_FOR_REGISTER, filterModel);
      connection.then((data: any) => {
        if (data) {
          this.ShiftAssignmentList = data;
        }
        else {
          swal({
            title: "Message",
            text: 'No Data Found !!',
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
        }
        this.reInitDatatable();
      }).catch(error => {
        this.errMsgPop = 'Error uploading file ..';
        this.ShiftAssignmentList = [];
      });
    }

  }

  onItemSelectM(item: any) {
  }

  onItemSelectB(item: any) {
  }

  onItemSelectRM(item: any) {
  }

  lastReportingkeydown1 = 0;
  getEmployee($event) {
    let text = $('#empNo').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#empNo').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#empNo").val(ui.item.value);
                  $("#empNo").val(ui.item.value);
                }
                else {
                  $("#empNo").val('');
                  $("#empNo").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#empNo").val(ui.item.value);
                  $("#empNo").val(ui.item.value);
                }
                else {
                  $("#empNo").val('');
                  $("#empNo").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown1 = $event.timeStamp;
    }
  }


  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.ShiftAssignmentList.length; i++) {
      this.ShiftAssignmentList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.ShiftAssignmentList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.ShiftAssignmentList.length; i++) {
      if (this.ShiftAssignmentList[i].isSelected)
        this.checkedlist.push(this.ShiftAssignmentList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }


  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }
  exportList: any[];
  exportExcel() {
    let filterModel: any = {};
    filterModel.plant = this.filterLocation;
    filterModel.payGroup = this.filterPayGroup;
    filterModel.empCat = this.filterCategory;
    filterModel.department = this.filterDepartment
    filterModel.subDept = this.filterSubDepartment;
    filterModel.employeeId = this.selectedEmployeeList.length > 0 ? this.selectedEmployeeList.map(x => x.employeeNo).join(',') : null;
    filterModel.month = this.month;
    filterModel.status = this.filterStatus;
    filterModel.Year = this.calYear;
    let connection = this.httpService.LApost(APIURLS.GET_EMP_SHIFT_DATA, filterModel);
    connection.then((data: any) => {
      if (data.length > 0) {
        this.ShiftAssignmentList1 = data;
        this.exportList = [];
        let index = 0;
        this.ShiftAssignmentList1.forEach(item => {
          index = index + 1;
          let exportItem = {
            "SNo": index,
            "Plant": item.plant,
            "Pay Group": item.payGroup,
            "Employee Id": item.employeeId,
            "Employee Name": item.empName,
            "Designation": item.designation,
            "Role": item.role,
            "Department": item.department,
            "Date": this.setDateFormate(item.joiningDate),
            "Day": item.day,
            "Status": item.status,
            "Shift": item.shiftCode + '-' + item.shiftname,
            "Shift Start Time": item.shiftstarttime,
            "Shift End Time": item.shiftendtime,
            "Rotational": item.rotational == true ? 'Yes' : 'No',
          }
          this.exportList.push(exportItem);
        });

        this.excelService.exportAsExcelFile(this.exportList, 'Emp_shift_Register');
      }
      else {
        swal({
          title: "Message",
          text: 'No data to export for selected filters..!!',
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      //this.reInitDatatable();
    }).catch(error => {
      this.errMsgPop = 'Error exporting to excel..';
    });
  }


  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }

  getFormattedTime(date: any) {
    let dtStartTime = new Date(date);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
  }


  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res);
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }

getHeader(): { headers: HttpHeaders } {
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

}

