import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import { time } from 'console';
import { now } from 'moment';
import { shiftInitState } from '@angular/core/src/view';

@Component({
  selector: 'app-ManualEntry',
  templateUrl: './ManualEntry.component.html',
  styleUrls: ['./ManualEntry.component.css']
})
export class ManualEntryComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;
  @ViewChild('myInput') myInputVariable: ElementRef;


  public tableWidget: any;
  departmentList: any[] = [];
  locListCon = [];
  locListCon1 = [];
  genders: any[] = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }];
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  isLoading: boolean = false;
  MonthsList: any[] = [
    { id: 1, name: 'January' }
    , { id: 2, name: 'February' }
    , { id: 3, name: 'March' }
    , { id: 4, name: 'April' }
    , { id: 5, name: 'May' }
    , { id: 6, name: 'June' }
    , { id: 7, name: 'July' }
    , { id: 8, name: 'August' }
    , { id: 9, name: 'September' }
    , { id: 10, name: 'October' }
    , { id: 11, name: 'November' }
    , { id: 12, name: 'December' }]

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
  filterLocation: string = null;;
  filterPayGroup: string = null;
  filterDepartment: string = null;
  filterSubDepartment: string = null;
  filterReportingGroup: string = null;
  filterCategory: string = null;
  filterStatus: number = 1;
  filterType: any = null;
  filterweek: any = null;
  fromDate: any;
  SwipeType: any = null;
  Reason: any = null;
  Time: any = null;
  Remarks: any = null;
  LateCount: any = null;


  ManualEntryList: any[] = [];
  ShiftList: any[] = [];
  AssignedShift: any;
  AssignedCount: any;
  month: any;
  calYear: any;
  ManualEntryList1: any[] = [];


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: Http, private excelService: ExcelService) { }

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


  dropdownSettings1 = {
    singleSelection: true,
    idField: 'id',
    textField: 'name1',
    allowSearchFilter: true
  };
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
        this.getpayGroupList();
      }
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  onSelectAll() {

  }

  clearFilter() {
    this.filterLocation = this.currentUser.baselocation.toString();
    this.filterEmployeeId = '';
    this.filterEmployeeName = '';
    this.filterDepartment = '';
    this.filterPayGroup = '';
    this.filterSubDepartment = '';
    this.filterReportingGroup = '';
    this.filterCategory = '';
    this.calYear = new Date().getFullYear().toString();
    this.filterStatus = 1;
    this.filterType = null;
    this.ManualEntryList = [];
    this.reInitDatatable();
    this.attendanceDetails = [];
    this.ManualEntryEmpList = [];
  }
  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }

  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let today = new Date();
    this.calYear = new Date().getFullYear().toString();
    //this.filterLocation = this.currentUser.baselocation.toString();

    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getLocationMaster();

      this.getempCatList();
      this.getDepartList();
      this.getsubDeptList();
      //this.filterLocation=this.currentUser.baselocation.toString();
      //this.getUsersList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();

  }

  ManualEntryEmpList: any[] = [];
  getFilteredList() {
    if (this.filterLocation == null) {
      toastr.error("Please select plant.");
      return;
    }
    if (this.filterPayGroup == null) {
      toastr.error("Please select Paygroup.");
      return;
    }
    else if (this.filterType == 0 && this.filterEmployeeId == null) {
      toastr.error("Please enter employeeId .");
      return;
    }
    else {
      let filterModel: any = {};
      filterModel.plant = this.filterLocation;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.empCat = this.filterCategory;
      filterModel.department = this.filterDepartment
      filterModel.month = this.month;
      filterModel.year = this.calYear;
      let connection = this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LIST_FOR_SHIFT, filterModel);
      connection.then((data: any) => {
        if (data) {
          this.ManualEntryEmpList = data;
        }
        this.reInitDatatable();
      }).catch(error => {
        this.errMsgPop = 'Error uploading file ..';
      });
    }

  }
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
        let temp = this.locationList.find(x => x.id == this.currentUser.baselocation);
        this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
      }
      // this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }
  payGroupList1: any[] = [];
  onlocationSelect() {
    this.filterPayGroup = null;
    let temp = this.locationList.find(x => x.id == this.filterLocation);
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



  GetEmpDetails(val) {
    var self = this;
    $('#EmployeeId').autocomplete({
      source: function (request, response) {
        var searchTerm1 = val;
        let connection = self.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, searchTerm1);
        connection.then((data: any) => {
          if (data) {
            let result = data.filter(x => { return x.employeeId != null });
            response(result.map((i) => {
              i.label = i.fullName + '-' + i.department + '-' + i.designation,
                i.fullName = i.fullName, i.baseLocation = i.baseLocation, i.baseLocation = i.baseLocation,
                i.division = i.division; return i;
            }));
          }
        }).catch(error => {
        });
      },
      select: function (event, ui) {
        self.filterEmployeeName = ui.item.fullName;
        self.filterLocation = ui.item.baselocation;
        self.filterCategory = ui.item.roleId;
        self.filterPayGroup = ui.item.division;
        return false;
      }
    });
  }

  today = new Date();
  getManualEntryList() {
    let srchstr: any = {};
    srchstr.userId = this.filterEmployeeId;
    let d1 = new Date(this.fromDate);
    srchstr.date = this.getDateFormate(this.fromDate);
    srchstr.pernr = this.filterEmployeeId;
    this.httpService.LApost(APIURLS.GET_MANUAL_ENTRY_LIST, srchstr).then((data: any) => {
      if (data) {
        this.ManualEntryList = data;
        this.LateCount = data[0].lateCount;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.attendanceDetails = [];
    });
  }

  formData: FormData = new FormData();
  file: File;

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  attendanceDetails: any[] = [];
  showAttendance: boolean = false;
  DisableUpdate: boolean = false;
  getAttendanceDetails() {
    this.attendanceDetails = [];
    this.ManualEntryList = [];
    if (this.filterEmployeeId == null) {
      toastr.error("Please enter employee No");
      return;
    }
    if (this.fromDate == null) {
      toastr.error("Please select date");
      return;
    }
    else {
      this.showAttendance = true;
      this.DisableUpdate = false;
      this.errMsg = "";
      this.isLoading = true;
      let srchstr: any = {};
      srchstr.userId = this.filterEmployeeId;
      let d1 = new Date(this.fromDate);
      srchstr.date = this.getDateFormate(this.fromDate);
      srchstr.location = this.currentUser.baselocation;
      this.httpService.LApost(APIURLS.BR_GET_ATTENDANCE_FOR_PER, srchstr).then((data: any) => {
        if (data) {
          this.attendanceDetails.push(data);
          if ((data.inTime != "00:00" && data.inTime != null) && (data.outTime != "00:00" && data.outTime != null)
          ) {
            this.DisableUpdate = true;
            //toastr.error("Punch Details Available for the Selected Date. Please go for Payroll Regularization Option.")
            swal({
              title: "Message",
              text: "Punch Details Available for the Selected Date. Please go for Payroll Regularization Option.",
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            });
            this.getManualEntryList();
          }
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.attendanceDetails = [];
      });

    }
  }

  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.ManualEntryList.length; i++) {
      this.ManualEntryList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.ManualEntryList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.ManualEntryEmpList.length; i++) {
      if (this.ManualEntryEmpList[i].isSelected)
        this.checkedlist.push(this.ManualEntryEmpList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  weekCount: number;
  GetWeeksCount(year, month_number) {
    var firstOfMonth = new Date(year, month_number - 1, 1);
    var day = firstOfMonth.getDay() || 6;
    day = day === 1 ? 0 : day;
    if (day) { day-- }
    var diff = 7 - day;
    var lastOfMonth = new Date(year, month_number, 0);
    var lastDate = lastOfMonth.getDate();
    if (lastOfMonth.getDay() === 1) {
      diff--;
    }
    var result = Math.ceil((lastDate - diff) / 7);
    this.weekCount = result + 1;
  };


  MassUpdate() {
    if (this.checkedRequestList.length <= 0 && this.filterType == 2) {
      toastr.error("Please select atleast one employee to update..");
      return;
    }
    else {
      let filterModel: any = {};
      filterModel.changedBy = this.currentUser.employeeId;
      filterModel.lostEntryReasonType = this.Reason;
      filterModel.remarks = this.Remarks;
      filterModel.inOut = this.SwipeType == 'In' ? 'I' : 'O';
      if (this.filterType == 0) {
        filterModel.pernr = this.filterEmployeeId;
      }
      else {
        filterModel.pernr = this.checkedRequestList.map(x => x.employeeId).join();
      }
      //  filterModel.shiftCode = this.attendanceDetails[0].shift;
      filterModel.date = this.setFormatedDate(this.fromDate);
      filterModel.startDate = this.setFormatedDate(this.fromDate);
      filterModel.Start = this.getFormattedTime(this.Time);

      let connection = this.httpService.LApost(APIURLS.INSERT_MANUAL_ENTRY_SWIPE, filterModel);
      connection.then((data: any) => {
        this.isLoading = false;
        if (data) {
          //toastr.success("Manual Entry updated successfully..Please process the attendance..!");
          swal({
            title: "Message",
            text: "Manual Entry data uploaded..Please process the attendance ...!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.clearFilter();
        }
        else {
          toastr.error("Error updating data ..");
        }
      }).catch(error => {
        this.errMsgPop = 'Error uploading file ..';
      });
    }

  }


  uploadfiles(files: File) {
    // debugger;
    // this.id='VM001';
    this.file = files[0];

  }

  upload() {
    if (this.file == undefined || this.file == null) {
      toastr.error("Please attach a excel file for updating manual details of the employees..!");
      return;
    }
    let connection: any;
    this.formData = new FormData();
    this.formData.append('file', this.file);
    connection = this.httpService.LAExcelUpload(APIURLS.BR_UPLOAD_MANUAL_ENTRY_FILE, this.currentUser.employeeId, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data.type == 'S') {
        this.isLoading = false;
        swal({
          title: "Message",
          text: data.message,
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.reset();
      }

      else if (data.type == 'E') {
        this.isLoading = false;
        swal({
          title: "Error",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.reset();
      }
    }).catch(error => {
      this.errMsgPop = 'Error uploading file ..';
    });
  }

  reset() {
    console.log(this.myInputVariable.nativeElement.files);

    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }

    console.log(this.myInputVariable.nativeElement.files);
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

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }
  exportList: any[];
  exportExcel() {
    let filterModel: any = {};
    filterModel.plant = this.filterLocation;
    filterModel.payGroup = this.filterPayGroup;
    filterModel.empCat = this.filterCategory;
    filterModel.department = this.filterDepartment
    filterModel.subDept = this.filterSubDepartment;
    filterModel.employeeId = this.filterEmployeeId;
    filterModel.month = this.month;
    filterModel.status = this.filterStatus;
    let connection = this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LIST_FOR_SHIFT, filterModel);
    connection.then((data: any) => {
      if (data.length > 0) {
        this.ManualEntryList1 = data;
        this.exportList = [];
        let index = 0;
        this.ManualEntryList1.forEach(item => {
          index = index + 1;
          let exportItem = {
            "SNo": index,
            "Plant": item.plant,
            "Employee Id": item.employeeId,
            "Employee Name": item.empName,
            "Pay Group": item.payGroup,
            "Staff Category": (item.empCat),
            "Designation": item.designation,
            "Department": item.department,
            "Joining Date": this.setDateFormate(item.joiningDate),
            "Shift Code ": item.shift,
            "Swipe Count": item.swipecount,

          }
          this.exportList.push(exportItem);
        });
        this.excelService.exportAsExcelFile(this.exportList, 'Emp_shift_Register');

      }
      else {
        toastr.error("No data to export for selected filters.")
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
            resolve(res.json());
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }

  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
  }

}

