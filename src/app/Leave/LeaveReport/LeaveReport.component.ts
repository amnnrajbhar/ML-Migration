import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
import * as fs from 'file-saver';
// //import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatAccordion } from '@angular/material/expansion';
import { LeaveDetails } from './LeaveReport.model';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";

declare var ActiveXObject: (type: string) => void;

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, DecimalPipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { ExcelService } from '../../shared/excel-service';


@Component({
  selector: 'app-LeaveReport',
  templateUrl: './LeaveReport.component.html',
  styleUrls: ['./LeaveReport.component.css']
})
export class LeaveReportComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;

  @ViewChild('myInput') myInputVariable: ElementRef;

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
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  path: string;
  selectedBaseLocation: any[] = [];
  employeeId: any = null;
  userMasterItem: any = {};
  year: any;
  appDet: any[] = [];
  CalenderYear: string = '';
  CalYear: any;
  lvType: number = null;
  StartDate: string = null;
  EndDate: string = null;
  Duration1: string = null;
  Duration2: string = null;
  NoOfDays: any;
  LvReason: string = null;
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  LeaveRequestList: any[] = [];
  LeaveRequestList1: any[] = [];
  ApplyFor: any = null;
  userId: string = null;
  appliedDate: any;
  today = new Date();
  fromDate: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  toDate: any = this.today;
  startDur: any;
  endDur: any;
  numDays: any;
  reason: any;
  detReason: any;
  EmployeeNo: any;
  EmployeeNo1: any[] = [];
  Plant: any = null;
  filterPayGroup: string = null;
  filterDepartment: string = null;
  filterCategory: string = null;
  filterappStatus: string = null;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
 private https: HttpClient, private route: ActivatedRoute, private excelService: ExcelService) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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

  private initlvDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidgetlv = exampleId.DataTable({
      "order": []
    });
  }

  private reInitlvDatatable(): void {
    if (this.tableWidgetlv) {
      this.tableWidgetlv.destroy()
      this.tableWidgetlv = null
    }
    setTimeout(() => this.initlvDatatable(), 0)
  }

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
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
    if (this.EmployeeNo.length <= 0) this.notFirst = false;
  }
  checkStatusRep() {
    // console.log(this.EmployeeNo.length+'<->'+this.rmnotFirst);
    if (this.EmployeeNo.length <= 0) this.rmnotFirst = false;
  }

  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAll() {
  }

  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
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

      }
      //this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }

  filterLocation: string = '';
  payGroupList1: any[] = [];
  getPaygroupsBasedOnPlant() {
    this.filterPayGroup = null;
    let temp = this.locationList.find(x => x.fkPlantId == this.Plant);
    this.payGroupList1 = temp ? this.payGroupList.filter(x => x.plant == temp.code) : [];
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
  GetCat(id) {
    let temp = this.empCatList.find(x => x.id == id);
    return temp ? temp.catltxt : '';
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

  date1 = new FormControl(new Date());

  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    this.getbase64image();
    this.GetEmpDetails(this.currentUser.employeeId);
    this.GetReportingEmployeeList();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getpayGroupList();
    this.getempCatList();
    this.getDepartList();
  }

  ngAfterViewInit() {
    this.initDatatable();
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
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#userId').autocomplete({
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
      this.lastReportingkeydown = $event.timeStamp;
    }
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

  isValid: boolean = false;
  validatedForm: boolean = true;
  empName: string;
  upcomingLeaves: any[] = [];
  GetLeaveList() {
    if (this.Plant == null) {
      toastr.error("Please select Plant..!");
      return;
    }
    if (this.filterPayGroup == null) {
      toastr.error("Please select Paygroup..!");
      return;
    }
    else {
      this.errMsg = "";
      this.isLoading = true;
      let srchstr: any = {};
      if (this.router.url == '/LeaveReportEss') {
        if (this.EmployeeNo1.length <= 0 || this.EmployeeNo1.length == null) {
          srchstr.userId = this.currentUser.employeeId;
          this.empName = this.currentUser.fullName;
        }
        else {
          srchstr.userId = this.EmployeeNo1.map(x => x.id).join();
          this.empName = this.EmployeeList.find(x => x.employeeId == this.EmployeeNo1[0].id).fullName;
        }
      }
      else {
        srchstr.userId = this.EmployeeNo;
      }
      srchstr.type = 'Leave'
      srchstr.plant = this.Plant;
      srchstr.paygroup = this.filterPayGroup;
      srchstr.department = this.filterDepartment;
      srchstr.category = this.filterCategory;
      srchstr.approvelStatus = this.filterappStatus;
      srchstr.startDate = this.fromDate ? this.setFormatedDate(this.fromDate) : null;
      srchstr.endDate = this.toDate ? this.setFormatedDate(this.toDate) : null;
      this.httpService.LApost(APIURLS.BR_GET_LEAVE_REQUESTS, srchstr).then((data: any) => {
        if (data) {
          this.LeaveRequestList = data;
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.LeaveRequestList = [];
      });
    }
  }

  clearAll() {
    this.Plant = '';
    this.filterPayGroup = '';
    this.filterCategory = '';
    this.filterDepartment = '';
    this.filterappStatus = '';
    this.fromDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 100);
    this.toDate = this.today;
    this.EmployeeNo1 = null;
    this.EmployeeNo = null;
    this.LeaveRequestList = [];

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

   getHeader(): any {
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
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
  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
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

  PrintLeave(values) {
    swal({
      title: "Message",
      text: "Are you sure to export?",
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
    const title = ' Employee Leave Report';
    const header = ["SNo", "Request No", "Employee Name", "Employee Number", "Designation", "Role", "Department", "Leave Type", "Request Date", "Start Date", "Start Duration", "End Date", "End Duration", "No Of Days",
      "Reason", "Status", "Pending Approver", "Last Approver"]
    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.LeaveRequestList.forEach(item => {
      index = index + 1;
      ts = {};
      ts.slno = index;
      ts.reqId = item.reqId;
      ts.empName = item.empName;
      ts.userId = item.userId;
      ts.designation = item.designation;
      ts.role = item.role;
      ts.department = item.department;
      ts.leaveType = item.leaveType;
      ts.submitDate = item.submitDate;
      ts.startDate = this.setFormatedDate(item.startDate);
      ts.startDuration = item.startDuration;
      ts.endDate = this.setFormatedDate(item.endDate);
      ts.endDuration = item.endDuration;
      ts.noOfDays = +item.noOfDays;
      ts.reason = item.reason;
      ts.approvelStatus = item.approvelStatus;
      ts.pendingApprover = item.pendingApprover;
      ts.lastApprover = item.lastApprover;
      exportList.push(ts);
    });
    var OrganisationName = "MICRO LABS LIMITED";
    const data = exportList;
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Employee Leave Report');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:R1');
    worksheet.mergeCells('A2:R2');
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
      fs.saveAs(blob, 'Emp_Leave_Report.xlsx');
    });
  }


  Print() {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "EMPLOYEE LEAVE CARD";
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
        title: 'Leave card',
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
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {

          columns: [
            {
              pageMargins: [60, 80, 60, 80],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [90, 350, 90],
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

}
