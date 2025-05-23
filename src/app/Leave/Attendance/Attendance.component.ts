import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatExpansionModule } from '@angular/material/expansion';

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, DecimalPipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';

declare var ActiveXObject: (type: string) => void;



@Component({
  selector: 'app-Attendance',
  templateUrl: './Attendance.component.html',
  styleUrls: ['./Attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  public tableWidget: any;
  public tableWidgetlv: any;
  //designationList: any[] = [];
  roleList: any[] = [];
  departmentList: any[] = [];
  profileList: any[] = []; managerList: any[] = []; reporting_managerList: any[] = [];
  projectList: any[] = [];
  userDivisionList: any[] = [];
  empListCon = [];
  empListCon1 = [];
  locListCon = [];
  locListCon1 = [];
  genders: any[] = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }];
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  addressList: any[];
  empOtherDetailList: any[];
  employeePayrollList: any[];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  path: string;
  selectedBaseLocation: any[] = [];
  employeeId: any = null;
  userMasterItem: any = {};
  year: any;

  CalenderYear: string = '';
  CalYear: any;
  AttendanceList: any[] = [];
  EmployeeNo: any = null;
  selectedEmployee: any[] = [];
  MonthorYear: any = null;
  SwipeType: any = null;
  Reason: any = null;
  Time: any = null;
  Remarks: any = null;
  LateCount: any = null;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private https: HttpClient, private route: ActivatedRoute) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
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
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }


  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.baseLocation = this.currentUser.baselocation;
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getLocationMaster();
      this.getholidaysList();
      this.monthslist();
      this.GetReportingEmployeeList();
      this.getRoleList();

      //this.GetAttendance();
      this.GetEmpDetails(this.currentUser.employeeId);
      this.getbase64image();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  holidaysList: HolidayMaster[] = [];
  getholidaysList() {
    this.errMsg = "";
    let filterModel: any = {};
    filterModel.employeeId = this.currentUser.employeeId;
    filterModel.year = this.year;
    this.httpService.LApost(APIURLS.GET_HOLIDAYS_LIST_BASED_ON_EMPLOYEES, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.holidaysList = data;
        this.holidaysList = this.holidaysList.sort((a, b) => {
          if (a.date > b.date) return 1;
          if (a.date < b.date) return -1;
          return 0;

        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.holidaysList = [];
    });
  }



  MonthorYearList: any[] = [];
  monthslist() {
    let today = new Date();
    for (let i = 0; i < 10; i++) {
      let model: any = {};

      model.mon = new Date(today.getFullYear(), today.getMonth() - i, today.getDate())
      this.MonthorYearList.push(model)
    }
    this.MonthorYear = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  colors = [{ status: "AA", color: "red" }, { status: "PP", color: "black" }, { status: "SS", color: "#90EE90" }, { status: "TS", color: "#90EE90" },
  { status: "PH", color: "#Ffff00" }, { status: "WO", color: "#b2d1e5" }]

  //#cc9c00
  getTheColor(status) {
    if (status.instatus == 'WO') {
      return this.colors.filter(item => item.status === status.instatus)[0].color
    }
    if (status.day == 'Sun') {
      return this.colors.filter(item => item.status === 'WO')[0].color
    }
    if (status.instatus == 'SS') {
      return this.colors.filter(item => item.status === status.instatus)[0].color
    }
    if (status.instatus == 'TS') {
      return this.colors.filter(item => item.status === status.instatus)[0].color
    }
    if (status.instatus == 'PH') {
      return this.colors.filter(item => item.status === status.instatus)[0].color
    }
    else {
      return '';
    }


  }

  getStatusColor1(day) {
    if (day == 'Sun') {
      return this.colors.filter(item => item.status === 'WO')[0].color
    }
    else {
      return '';
    }
  }
  getStatusColor(val) {
    if (val == 'AA') {
      return this.colors.filter(item => item.status === val)[0].color
    }
    else {
      return 'black';
    }

  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    let dt = d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
    return dt;
  }

  getDateFormate1(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2)
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

  TotalDays: any = 0;
  WorkingDays: any = 0;
  WorkedDays: any = 0;
  Lopdays: any = 0;
  LeaveDays: any = 0;

  empName: string;
  GetAttendance() {
    this.errMsg = "";
    this.TotalDays = 0;
    this.WorkingDays = 0;
    this.WorkedDays = 0;
    this.Lopdays = 0;
    this.LeaveDays = 0;
    this.isLoading = true;
    let srchstr: any = {};
    if (this.router.url == '/attendanceEss') {
      if (this.selectedEmployee.length <= 0) {
        srchstr.pernr = this.currentUser.employeeId;
        this.empName = this.currentUser.fullName;
      }
      else {
        srchstr.pernr = this.selectedEmployee[0].id;
        this.empName = this.EmployeeList.find(x => x.employeeId == this.selectedEmployee[0].id).fullName;
      }
    }
    else {
      if (this.EmployeeNo == null) {
        srchstr.pernr = this.currentUser.employeeId;
        this.empName = this.currentUser.fullName;
      }
      else {
        srchstr.pernr = this.EmployeeNo;
        //this.empName = this.EmployeeList.find(x=>x.employeeId == this.EmployeeNo).fullName;
      }
    }
    this.isLoading = true;
    this.getSummary();
    this.GetEmpDetails(srchstr.pernr);
    srchstr.year = new Date(this.MonthorYear).getFullYear();
    srchstr.month = new Date(this.MonthorYear).getMonth() + 1;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_ATTENDANCE, srchstr).then((data: any) => {
      if (data) {
        this.AttendanceList = data;
        this.AttendanceList.forEach(element => {
          let temp = this.holidaysList.find(x => this.getDateFormate(x.date) == this.getDateFormate(element.date1));
          if (element.leaveApprvStatus != null && element.leaveApprvStatus == 'Approved') {
            element.note = element.leaveReason
          }
          else if (element.leaveApprvStatus != null && element.leaveApprvStatus != '') {
            element.note = 'Leave Pending For Approval'
          }
          if (element.onDutyApprvStatus != null && element.onDutyApprvStatus == 'Approved') {
            element.note = element.ondutyReason
          }
          else if (element.onDutyApprvStatus != null && element.onDutyApprvStatus != '') {
            element.note = 'On Duty Pending For Approval'
          }
          else if (element.instatus == 'AA' && element.outstatus == 'AA') {
            element.intime = '00:00';
            element.outtime = '00:00';
            element.instatus = 'AA';
            element.outstatus = 'AA';
          }
          else if (temp) {
            element.note = temp.holidayName;
          }
        });
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.AttendanceList = [];
    });
  }

  getSummary() {
    this.errMsg = "";
    this.TotalDays = 0;
    this.WorkingDays = 0;
    this.WorkedDays = 0;
    this.Lopdays = 0;
    this.LeaveDays = 0;
    this.isLoading = true;
    let srchstr: any = {};
    if (this.router.url == '/attendanceEss') {
      if (this.selectedEmployee.length <= 0) {
        srchstr.pernr = this.currentUser.employeeId;
        this.empName = this.currentUser.fullName;
      }
      else {
        srchstr.pernr = this.selectedEmployee[0].id;
        this.empName = this.EmployeeList.find(x => x.employeeId == this.selectedEmployee[0].id).fullName;
      }
    }
    else {
      if (this.EmployeeNo == null) {
        srchstr.pernr = this.currentUser.employeeId;
        this.empName = this.currentUser.fullName;
      }
      else {
        srchstr.pernr = this.EmployeeNo;
        //this.empName = this.EmployeeList.find(x=>x.employeeId == this.EmployeeNo).fullName;
      }
    }
    srchstr.year = new Date(this.MonthorYear).getFullYear();
    srchstr.month = new Date(this.MonthorYear).getMonth() + 1;
    this.httpService.LApost(APIURLS.GET_ATTENDANCE_SUMMARY_REPORT, srchstr).then((data: any) => {
      if (data) {
        this.TotalDays = 0;
        this.WorkingDays = 0;
        this.WorkedDays = 0;
        this.Lopdays = 0;
        this.LeaveDays = 0;
        this.TotalDays = data[0].totalDays;

        this.WorkingDays = data[0].working;
        this.WorkedDays = data[0].paidDays;
        this.Lopdays = data[0].lp;
        this.LeaveDays = data[0].leaveAvailed;

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }


  ApproversList: any[] = [];
  getApproversList(id) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_PERMISSION_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          toastr.error("Approvers Not Assigned");
        }
        else {
          this.ApproversList = data;
        }
      }
    }).catch(error => {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }


  selecteddate: any;
  AllPunchesList: any[] = [];
  DisplayAllPunches(val) {
    this.errMsg = "";
    let model: any = {};
    if (this.router.url == '/attendanceEss') {
      if (this.selectedEmployee.length <= 0) {
        model.userId = this.currentUser.employeeId;
        this.empName = this.currentUser.fullName;
      }
      else {
        model.userId = this.selectedEmployee[0].id;
        this.empName = this.EmployeeList.find(x => x.employeeId == this.selectedEmployee[0].id).fullName;
      }
    }
    else {
      if (this.EmployeeNo == null) {
        model.userId = this.currentUser.employeeId;
        this.empName = this.currentUser.fullName;
      }
      else {
        model.userId = this.EmployeeNo;
        //this.empName = this.EmployeeList.find(x=>x.employeeId == this.EmployeeNo).fullName;
      }
    }
    model.date = this.getDateFormate(val.date1);
    this.httpService.LApost(APIURLS.GET_ALL_PUNCHES_LIST, model).then((data: any) => {
      if (data.length > 0) {
        this.selecteddate = this.getDateFormate(data[0].date);
        this.AllPunchesList = data;
        jQuery("#myModal").modal('show');
      }
      else {
        swal({
          title: "Message",
          text: "No Data Found...",
          icon: "error",
          dangerMode: false,
          buttons: [true, true]
        })
      }
    }).catch(error => {
      this.isLoading = false;
      this.holidaysList = [];
    });
  }

  EmployeeList: any[] = [];
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

    
  Rolelist: any[] = [];
  getRoleList() {
    this.errMsg = "";
    this.get("RoleMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.Rolelist = data.filter(x => x.isActive);
      }
    }).catch(error => {
      this.isLoading = false;
      this.Rolelist = [];
    });
  }

  getRole(id) {
    let temp = this.Rolelist.find(x => x.id == id);
    return temp ? temp.role_Stxt : '';
  }

  Department: any;
  Designation: any;
  FullName: any;
  RoleId: any;
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
        this.RoleId = result[0].roleId;
      }
    }).catch(error => {
    });
  }



  image: string;
  getbase64image() {
    this.https.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
        };

      });
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
  setFormatedTime(date: any) {
    let dt = new Date(date);
    let formateddate =
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  Print() {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "ATTENDANCE CARD";
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
    var logo = this.image;
    var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>
  ${printContents}
  <div>     
  </div>
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: 'Attendance card',
      },

      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
        bold: false,
        table: {
          width: '*',
        },
        th: { bold: true, fillColor: '#8B0000' }
      },
      stack: [{
        unbreakable: true,
      }],
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 90, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {

          columns: [
            {
              pageMargins: [60, 80, 60, 80],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [120, 530, 120],
                headerRows: 2,
                keepWithHeaderRows: 1,
                body: [
                  [{
                    rowSpan: 2, image: logo,
                    width: 50,
                    alignment: 'center'
                  }
                    , { text: OrganisationName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' },
                  {
                    rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                      { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                  }],
                  [''
                    ,
                    { text: ReportName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' }
                    , '']
                ]
              }
            }
          ],
          margin: 20
        }
      },
      footer: function (currentPage, pageCount) {
        return {

          columns: [

            {
              alignment: 'right',
              stack: [
                { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString() }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

          ],
          margin: 20
        }
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  month: any;

  regularizationModel: any = {};
  OpenRegularizationForm(data: any) {
    if (data.instatus == 'AA') {
      this.SwipeType = 'In';
    }
    else if (data.outstatus == 'AA') {
      this.SwipeType = 'Out';
    }
    this.regularizationModel.pernr = data.pernr;
    this.getApproversList(data.pernr);
    this.regularizationModel.date = data.dt;
    this.selecteddate = this.regularizationModel.date;
    jQuery("#RegularizeModal").modal('show');
  }

  getFormattedTime(date: any) {
    let dtStartTime = new Date(date);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
  }

  OnSaveRequest(status) {
    let filterModel: any = {};
    if (this.router.url == '/attendance') {
      filterModel.userId = this.EmployeeNo;
    }
    else {
      filterModel.userId = this.selectedEmployee.map(x => x.employeeId).join();;
    }
    filterModel.requestedBy = this.currentUser.employeeId;
    filterModel.date = this.getDateFormate1(this.selecteddate);
    filterModel.time = this.Time;
    filterModel.reasonType = this.Remarks;
    filterModel.reason = this.Reason;
    filterModel.pendingApprover = this.ApproversList[0].employeeId;
    filterModel.status = 'Pending';
    filterModel.swipeType = this.SwipeType;
    let connection = this.httpService.LApost(APIURLS.INSERT_REGULARIZATION_REQUEST, filterModel);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data.type == 'S') {
        alert("Regularization Request Details Submitted Sucessfully With Req Id : " + data.requestNo);
        jQuery("#myModal").modal('hide');
      }
      else {
        toastr.error(data.message);
      }
    }).catch(error => {
      this.errMsgPop = 'Error submitting request ..';
    });

  }

}
