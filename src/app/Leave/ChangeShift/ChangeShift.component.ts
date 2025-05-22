import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { ChangeShift } from './ChangeShift.model';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { DatePipe } from '@angular/common';
declare var jQuery: any;
declare var $: any;
import * as moment from 'moment';
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from '../../masters/auditlog.model';
import { EmpShiftMaster } from '../EmpShiftMaster/EmpShiftMaster.model';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';


export class actionItemModel {
  CalenderYear: string = '';
  CalYear: any;
}
@Component({
  selector: 'app-ChangeShift',
  templateUrl: './ChangeShift.component.html',
  styleUrls: ['./ChangeShift.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ChangeShiftComponent implements OnInit {
  public tableWidget: any;
@ViewChild(NgForm, { static: false }) ChangeShiftForm: NgForm;

  isLoading: boolean = false;
  errMsg: string = "";
  path: string = '';
  currentUser: AuthData;
  CalenderYear: string = '';
  CalYear: any;
  year: any;
  isEdit: boolean = false;
  FromDateforCS: string = null;
  ToDateforCS: string = null;
  preShift: string = null;
  updShift: string = null;
  ReasonforCS: string = null;
  errMsgPop: string = "";
  isLoadingPop: boolean = false;
  selectedEmployee: any[] = [];
  MonthorYear: any = null;
  EmployeeNo: any = null;
  EmployeeList: any[] = [];
  empListCon = [];
  filterMonth: string = null;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private http: HttpClient,
    private datePipe: DatePipe) { }


  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
    $('#userTable').on('click', '.toggleTest', function () {
      console.log('click');
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }

  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      let today = new Date();
      this.year = today.getFullYear();
      this.CalenderYear = new Date().getFullYear().toString();
      this.CalYear = new Date().getFullYear().toString();
      this.getApproversList(this.currentUser.employeeId);
      this.getLocationMaster();
      this.getShiftMasterList();
      this.monthslist();
      this.GetReportingEmployeeList();
      //this.GetAttendance();
      this.GetEmpDetails(this.currentUser.employeeId);
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  locListCon = [];
  locationList: any[] = [[]];
  ShiftList: EmpShiftMaster[] = [];
  ShiftList1: EmpShiftMaster[] = [];
  loccode: string;

  GetShift() {
    let temp = this.locationList.find(x => x.id == this.currentUser.baselocation)
    this.ShiftList1 = this.ShiftList.filter(x => x.loc.includes(temp.code));
  }
  getShiftMasterList() {
    this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
      if (data.length > 0) {
        this.ShiftList = data.filter(x => x.isActive == true);

      }
    }).catch(error => {
      this.isLoading = false;
      this.ShiftList = [];
    });
  }

  SubmitShiftRequest() {
    let temp = this.ChangeShiftList.filter(x => x.newShift != null);
    if (temp.length <= 0) {
      toastr.error("Please select new shift for atleast one day")
      return;
    }
    else {
      temp.forEach(element => {
        this.OnUpdateShift(element);
      });
    }
  }
  lastReportingkeydown = 0;
  getEmployee($event) {
    let text = $('#empNo').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId, name: item.fullName };
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
                  this.empName = ui.item.name;
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
                  this.empName = ui.item.name;
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
      this.lastReportingkeydown = $event.timeStamp;
    }
  }

  notFirst = true;
  rmnotFirst = true;
  checkStatus() {
    // console.log(this.EmployeeNo.length+'<->'+this.notFirst);
    if (this.selectedEmployee.length <= 0) this.notFirst = false;
  }
  checkStatusRep() {
    // console.log(this.EmployeeNo.length+'<->'+this.rmnotFirst);
    if (this.selectedEmployee.length <= 0) this.rmnotFirst = false;
  }

  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAll() {
  }

  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          err => {
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

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true
  };

  onItemSelectM(item: any) {
  }

  onItemSelectB(item: any) {
  }

  onItemSelectRM(item: any) {
  }

  MonthorYearList: any[] = [];
  monthslist() {
    let today = new Date();
    for (let i = 0; i < 4; i++) {
      let model: any = {};

      model.mon = new Date(today.getFullYear(), today.getMonth() - i, today.getDate())
      this.MonthorYearList.push(model)
    }
    this.MonthorYear = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
      }
      //this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }

  binddatetime(time) {
    let datetime = new Date();
    let times = time.split(':');
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1]));
    datetime.setSeconds(parseInt(times[2]));
    return datetime;
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  getFormattedTime(date: any) {
    let dtStartTime = new Date(date);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }


  empName: string;
  getEmpShiftRequests() {
    if (this.filterMonth == null) {
      toastr.error("Please select Month..!");
      return;
    }
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    if (this.router.url == '/ChangeShiftEss') {
      if (this.selectedEmployee.length <= 0) {
        srchstr.employeeId = this.currentUser.employeeId;
        this.getApproversList(this.currentUser.employeeId);
        this.empName = this.currentUser.fullName;
      }
      else {
        srchstr.employeeId = this.selectedEmployee[0].id;
        this.getApproversList(srchstr.employeeId);
        this.empName = this.EmployeeList.find(x => x.employeeId == this.selectedEmployee[0].id).fullName;
      }
    }
    else {
      if (this.EmployeeNo == null) {
        srchstr.employeeId = this.currentUser.employeeId;
        this.getApproversList(this.currentUser.employeeId);
        this.empName = this.currentUser.fullName;
      }
      else {
        srchstr.employeeId = this.EmployeeNo;
    this.getApproversList(this.EmployeeNo);
        //this.empName = this.EmployeeList.find(x=>x.employeeId == this.EmployeeNo).fullName;
      }
    }
    //this.GetEmpDetails(srchstr.requestedBy);
    srchstr.plant = this.currentUser.baselocation;
    srchstr.Year = this.CalenderYear;
    srchstr.Month = this.filterMonth;
    this.httpService.LApost(APIURLS.GET_EMP_SHIFT_DATA, srchstr).then((data: any) => {
      if (data) {
        this.ChangeShiftList = data;
        //this.upcomingShift = this.ChangeShiftList.filter(x => new Date(x.startDate) > new Date());
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.ChangeShiftList = [];
    });

  }

  Department: any;
  Designation: any;
  FullName: any;
  GetEmpDetails(val) {
    let emp: any;

    let connection = this.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, val);
    connection.then((data: any) => {
      if (data) {
        let result = data.filter(x => { return x.employeeId != null });
        this.EmployeeNo = result[0].employeeId;
        this.Department = result[0].department;
        this.Designation = result[0].designation;
        this.FullName = result[0].fullName;
        this.empName = this.FullName;
      }
    }).catch(error => {
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

  isValid: boolean = false;
  validatedForm: boolean = true;
  ChangeShiftList: any[] = [];
  upcomingShift: any[] = [];

  ApproversList: any[] = [];
  getApproversList(id) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          toastr.error("Approvers Not Assigned");
        }
        else {
          this.ApproversList = data;
        }
        //this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }

  ClearData() {
    this.filterMonth = '';
    this.ChangeShiftList = [];
  }

  FromDate: any;
  ToDate: any;
  view: boolean = false;
  SeeShiftRequests(isedit: boolean, data: any, value: string) {
    this.view = false;
    this.isEdit = isedit;
    this.errMsgPop = "";
    this.ClearData();
    if (this.isEdit) {
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }

  ChangeRequestsList: any[] = [];
  getEmpChangeShiftRequests() {
    if (this.FromDate == null) {
      toastr.error("Please mention from date...!");
      return;
    }
    else if (this.ToDate == null) {
      toastr.error("Please mention to date...!");
      return;
    }
    this.errMsg = "";
    let srchstr: any = {};
    srchstr.fromDate = this.setFormatedDate(this.FromDate);
    srchstr.toDate = this.setFormatedDate(this.ToDate);
    srchstr.requestedBy = this.currentUser.employeeId;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_CHANGESHIFT_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.ChangeRequestsList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.ChangeRequestsList = [];
    });
  }

  ChangeEmpShift = {} as ChangeShift;

  OnUpdateShift(data) {
    if (data.shiftCode == data.newShift) {
      toastr.error("Previous Shift and Updated Shift cannot be the same....!");
      data.newShift = "";
      data.note = "";
      return;
    }
    this.errMsg = "";
    let connection: any;
    if (this.router.url == '/ChangeShift') {
      this.ChangeEmpShift.requestedBy = this.EmployeeNo;
    } 
    else {
      this.ChangeEmpShift.requestedBy = this.currentUser.employeeId;

    }
    this.ChangeEmpShift.fromDate = this.setFormatedDate(data.joiningDate);
    this.ChangeEmpShift.toDate = this.setFormatedDate(data.joiningDate);
    this.ChangeEmpShift.previousShift = data.shiftCode;
    this.ChangeEmpShift.updatedShift = data.newShift;
    this.ChangeEmpShift.reason = data.note;
    this.ChangeEmpShift.approvalStatus = 'Pending';
    this.ChangeEmpShift.pendingApprover = this.ApproversList[0].employeeId;
    this.ChangeEmpShift.approverId = '';
    connection = this.httpService.LApost(APIURLS.BR_GET_CHANGE_SHIFT_REQUESTS, this.ChangeEmpShift);

    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output.typ == 'S') {
        swal({
          title: "Message",
          text: "Request generated successfully...!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.ClearData();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  PrintCS(values) {
    if (this.filterMonth == null) {
      toastr.error("Please select Month and get the details..!");
      return;
    }
    swal({
      title: "Message",
      text: "Are you sure to print?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {
        this.onUserActions1();
      }
    });
  }

  exportList: any[];
  onUserActions1() {
    const title = ' Employee Shift Report';
    const header = ["SNo", "Employee Id", "Employee Name", "Department", "Date", "Day", "Status", "Shift Code",
      "Shift Name", "Shift StartTime", "Shift EndTime"]
    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.ChangeShiftList.forEach(item => {
      index = index + 1;
      ts = {};
      ts.slno = index;
      ts.employeeId = item.employeeId;
      ts.empName = item.empName;
      ts.department = item.department;
      ts.joiningDate = this.setFormatedDate(item.joiningDate);
      ts.day = item.day;
      ts.status = item.status;
      ts.shiftCode = item.shiftCode;
      ts.shiftname = item.shiftname;
      ts.shiftstarttime = item.shiftstarttime;
      ts.shiftendtime = item.shiftendtime;
      exportList.push(ts);
    });
    var OrganisationName = "MICRO LABS LIMITED";
    const data = exportList;
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Employee_Shift_Report');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:K1');
    worksheet.mergeCells('A2:K2');
    //Add Header Row
    let headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    for (let x1 of data) {
      let x2 = Object.keys(x1);
      let temp = []
      for (let y of x2) {
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet.addRow([]);
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Shift_Report.xlsx');
    });
  }

}
