import { AuthData } from '../../../auth/auth.model'
import { APIURLS } from '../../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../../app.component';
import { HttpService } from '../../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
//import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import swal from 'sweetalert';
import * as moment from 'moment';
import { ExcelService } from '../../../shared/excel-service';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
import * as XLSX from 'xlsx';
import * as pdfMake from "pdfmake/build/pdfmake";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
//import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';



@Component({
  selector: 'app-Daywiseattendancestatus',
  templateUrl: './Daywiseattendancestatus.component.html',
  styleUrls: ['./Daywiseattendancestatus.component.css']
})
export class DaywiseattendancestatusComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;

  @ViewChild('myInput') myInputVariable: ElementRef;
  @ViewChild('table') table: ElementRef;
  @ViewChild('dailyreport') dailyreport: ElementRef;

  public tableWidget: any;
  public tableWidgetlv: any;

  errMsg: string = '';
  departmentList: any[] = [];
  ReportData: any[] = [];
  locationList: any[] = [];
  isLoading: boolean;
  StaffCategoryList: any[] = [];
  PayGroupList: any[] = [];
  ReportingGroupList: any[] = [];
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


  filterReport: any = null;
  filterPlant: any = null;
  filterStaffcat: any = null;
  filterPayGroup: any = null;
  filterDepartment: any = null;
  filterSubDepartment: any = null;
  filterReportingGroup: any = null;
  filterMonth: any = null;
  filterEmployee: any = null;
  AttendanceType: any = null;
  ViewType: any = null;
  Type: any = null;
  subdepartmentList: any[] = [];
  selectedTypeList: any = null;
  CalenderYear: string = '';
  path: any;
  fromDate: any = null;
  toDate: any = null;
  EmployeeNo: string = null;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
 private https: HttpClient, private route: ActivatedRoute, private excelService: ExcelService,
    private datePipe: DatePipe) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

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


  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }

  locationname: any;
  getLocationMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.filterPlant = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
        this.locationname = this.filterPlant + '-' + this.locationList.find(x => x.id == this.currentUser.baselocation).name;
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
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


  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let today = new Date();
    this.CalenderYear = new Date().getFullYear().toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      //  this.getLocationMaster();
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getempCatList();
      this.getpayGroupList();
      this.getReportingGroupList();
      this.getDepartList();
      this.getbase64image();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }



  ClearData() {
    this.filterPlant = null;
    this.filterStaffcat = null;
    this.filterPayGroup = null;
    this.filterDepartment = null;
    this.filterReportingGroup = null;
    this.filterMonth = null;
    this.filterEmployee = null;
    this.AttendanceType = null;
    this.selectedTypeList = null;
    this.ViewType = null;
    this.Type = null;
    this.fromDate = null;
    this.toDate = null;
    this.filterSubDepartment = null;
    this.selectedEmployeeList = [];
    this.CalenderYear = new Date().getFullYear().toString();
  }


  deliveryModeSettings = {
    singleSelection: false,
    idField: 'employeeNo',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 4,
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

  view: boolean = false;
  binddatetime(time) {
    let datetime = new Date();
    let times = time.split(':');
    let tm = times[1].toString().substring(2, 4);
    if (tm == 'PM') {
      times[0] = +times[0] + +12;
    }
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1].toString().substring(0, 2)));
    datetime.setSeconds(parseInt('00'));
    return datetime;
  }

  transform(value: any, args?: any): any {
    return moment(value, 'HH:mm').format("HH:mm A");
  }
  binddatetime1(time) {
    let datetime = new Date();
    let times = time.split(':');
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1]));
    datetime.setSeconds(parseInt(times[2]));
    return datetime;
  }


  getDateFormate(date) {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  getpayGroupList() {
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.PayGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.PayGroupList = [];
    });
  }
  payGroupList1: any[] = [];
  getPaygroupsBasedOnPlant() {
    this.filterPayGroup = null;
    let temp = this.locationList.find(x => x.code == this.filterPlant);
    this.payGroupList1 = this.PayGroupList.filter(x => x.plant == temp.code);
  }

  payGroupList11: any[] = [];
  getPaygroupsBasedOnPlant1() {
    this.filterPayGroup = null;
    let temp = this.locationList.find(x => x.fkPlantId == this.filterPlant);
    this.payGroupList11 = this.PayGroupList.filter(x => x.plant == temp.code);
  }

  getempCatList() {
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.StaffCategoryList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.StaffCategoryList = [];
    });
  }
  getReportingGroupList() {
    this.get("ReportingGroupM/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.ReportingGroupList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.ReportingGroupList = [];
    });
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
      this.lastReportingkeydown = $event.timeStamp;
    }
  }

  selectedEmployeeList: any[] = [];
  empListCon: any[] = [];
  getUsersList() {
    if (this.filterPlant == null || this.filterPlant == '') {
      toastr.error("Please select Plant..!");
      return;
    }
    let filterModel: any = {};
    filterModel.baseLocation = this.locationList.find(x => x.code == this.filterPlant).fkPlantId;
    filterModel.payGroup = this.filterPayGroup;
    filterModel.category = this.filterStaffcat;
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
  exportList: any[];

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

  GetMonthlyDaywiseReport(Action: string) {
    if (this.filterPlant == null) {
      toastr.error("Please select plant..");
      return;
    }
    else if (this.filterMonth == null) {
      toastr.error("Please select month..");
      return;
    }
    else if (this.CalenderYear == null) {
      toastr.error("Please select year..");
      return;
    }
    else if (this.AttendanceType == null) {
      toastr.error("Please select report type..");
      return;
    }
    else if (Action == "Mail" && (this.email == null || this.email == '')) {
      toastr.error("Please enter email id to send mail..");
      return;
    }
    else if (Action == "Mail" && !this.email.includes("microlabs.in")) {
      toastr.error("Please enter valid email id to send mail..");
      return;
    }
    else {
      this.isLoading = true;
      swal({
        title: "Message",
        text: "Report downloading has Started. Please wait.. Screen will close automatically ..!",
        timer: 2000,
        icon: "info",
        dangerMode: false,
        buttons: [false, false]
      });
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.employeeId = this.selectedEmployeeList.length > 0 ? this.selectedEmployeeList.map(x => x.employeeNo).join(',') : null;
      filterModel.category = this.filterStaffcat;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.type = this.ViewType;
      filterModel.month = this.filterMonth;
      filterModel.Year = this.CalenderYear;
      filterModel.dept = this.filterDepartment;
      filterModel.typel = this.selectedTypeList;
      let connection = this.httpService.LApost(APIURLS.GET_MONTHLY_DAYWISE_REPORT, filterModel);
      connection.then((data) => {
        if (data.length > 0) {
          this.ReportData = data;

          swal({
            title: "Message",
            text: "Are you Sure to export..?",
            icon: "warning",
            dangerMode: false,
            buttons: [true, true]
          }).then((data1) => {
            if (data1) {
              // this.ExportToExcel();
              this.generateDayWiseExcel(this.ReportData, Action);
            }
          })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      })
    }

  }

  generateDayWiseExcel(values, action: string) {

    //Excel Title, Header, Data
    let dt = new Date();
    let date = dt.getFullYear() + '_' + (dt.getMonth() + 1) + '_' + dt.getDay();
    const title = 'Monthly Attendance Report';

    const header = ["SNo", "Date", "Employee No", "Employee Name", "In",
      "Out", "Status", "From Date", "To Date",
      "Department", "Designation", "Remarks", "Pay Group"]

    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.ReportData = values;
    this.ReportData.forEach(element => {
      index = index + 1;
      ts = {};
      ts.id = index;
      ts.date = this.datePipe.transform(element.date,'yyyy-MM-dd');
      ts.employeeId = element.employeeId;
      ts.empName = element.empName;
      ts.inTime = element.inTime,
      ts.outTime = element.outTime,
      ts.status = element.status,
      ts.fromDate = element.fromDate,
      ts.toDate = element.toDate,
      ts.department = element.department;
      ts.designation = element.designation;
      ts.remarks = element.remarks;
      ts.payGroup = element.payGroup;
      exportList.push(ts);

    });
    let locname = this.locationList.find(x => x.code == this.filterPlant);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + locname.code + '-' + locname.name;
    const data = exportList;
    //Create workbook and worksheet
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let mon = this.MonthsList.find(x => x.id == this.filterMonth);
    let worksheet = workbook.addWorksheet('Monthly Attendance Detail Report for the Month of ' + mon.name + '-' + this.CalenderYear);
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:M1');
    worksheet.mergeCells('A2:M2');
    worksheet.mergeCells('A3:M3');

    //Blank Row 
    // worksheet.addRow([]);
    //Add Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.alignment = { horizontal: 'center' }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    //  worksheet.addRows(data);
    // Add Data and Conditional Formatting
    //data.forEach()

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

    if (action == 'Mail') {
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        this.upload(blob, 'MonthlyDaywiseReport.xlsx');
      })
    }
    else {
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, 'MonthlyDaywiseReport.xlsx');
      })
    }
    //Generate Excel File with given name


  }

  GetMonthlyMusterReport(Action: string) {
    if (this.filterPlant == null) {
      toastr.error("Please select plant..");
      return;
    }
    else if (this.CalenderYear == null) {
      toastr.error("Please select year..");
      return;
    }
    else if (this.filterMonth == null) {
      toastr.error("Please select month..");
      return;
    }
    else if (this.AttendanceType == null) {
      toastr.error("Please select report type..");
      return;
    }
    else if (Action == "Mail" && (this.email == null || this.email == '')) {
      toastr.error("Please enter email id to send mail..");
      return;
    }
    else if (Action == "Mail" && !this.email.includes("microlabs.in")) {
      toastr.error("Please enter valid email id to send mail..");
      return;
    }
    else {
      this.isLoading = true;
      swal({
        title: "Message",
        text: "Report downloading has Started. Please wait.. Screen will close automatically ..!",
        timer: 2000,
        icon: "info",
        dangerMode: false,
        buttons: [false, false]
      });
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.pernr = this.selectedEmployeeList.length > 0 ? this.selectedEmployeeList.map(x => x.employeeNo).join(',') : null;
      filterModel.staffCat = this.filterStaffcat;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.viewType = this.AttendanceType;
      filterModel.type = this.AttendanceType;
      filterModel.month = this.filterMonth;
      filterModel.Year = this.CalenderYear;
      filterModel.dept = this.filterDepartment;
      let connection = this.httpService.LApost(APIURLS.BR_GET_MONTHLY_MUSTER_REPORT, filterModel);
      connection.then((data1) => {
        if (data1.table.length > 0) {
          this.ReportData = data1.table;
          this.exportList = [];
          let index = 0;
          this.ReportData.forEach(item => {
            index = index + 1;
            let exportItem = {
              "SNo": index,
              "Employee Id": item.pernr,
              "Employee Name": item.emP_FULLNAME,
              "Designation": item.desg,
              "Department": (item.dept),
              "Sub Department": item.sub_Dept,
              "Exempted Employee": 'No',
              "DOJ": this.getDateFormate(item.doj),
              "Month": item.month,
              "Year": item.year,
              "Day1": item.day1,
              "Day2": item.day2,
              "Day3": item.day3,
              "Day4": item.day4,
              "Day5": item.day5,
              "Day6": item.day6,
              "Day7": item.day7,
              "Day8": item.day8,
              "Day9": item.day9,
              "Day10": item.day10,
              "Day11": item.day11,
              "Day12": item.day12,
              "Day13": item.day13,
              "Day14": item.day14,
              "Day15": item.day15,
              "Day16": item.day16,
              "Day17": item.day17,
              "Day18": item.day18,
              "Day19": item.day19,
              "Day20": item.day20,
              "Day21": item.day21,
              "Day22": item.day22,
              "Day23": item.day23,
              "Day24": item.day24,
              "Day25": item.day25,
              "Day26": item.day26,
              "Day27": item.day27,
              "Day28": item.day28,
              "Day29": item.day29,
              "Day30": item.day30,
              "Day31": item.day31,
              "Present": item.pp,
              "CL": item.cl,
              "SL": item.sl,
              "EL": item.el,
              "WO": item.wo,
              "SS": item.ss,
              "PH": item.ph,
              "OD": item.od,
              "SH": item.sh,
              "LOP": item.lp,
              "LastMonthLOP": item.lastYearLP,
              "Reimbursement Days": item.reimbursementDays,
              "BDOJ": 0,
              "Paid Days": item.totpaid,
              "Total": 31
            }
            this.exportList.push(exportItem);
          });

          let dt = new Date();
          let date = dt.getFullYear() + '_' + dt.getMonth() + '_' + dt.getDay();
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.exportList);

          const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
          const blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
          //FileSaver.saveAs(data, date + '_' + 'Muster_Report' + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
          //const file =FileSaver.saveAs(data, date + '_' + 'Muster_Report' + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
          //this.formData.append('file',blob)
          if (Action == 'Mail') {
            this.upload(blob, "SummaryReport.xlsx");
          }
          else {
            this.excelService.exportAsExcelFile(this.exportList, date + '_' + 'Muster_Report');
          }
        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      })
    }
  }

  email: string = null;
  upload(blob: Blob, filename: string) {
    swal("Sending Mail....");
    let connection: any;
    const formData = new FormData();
    formData.append('file', blob, filename);
    connection = this.httpService.LAExcelUpload(APIURLS.SEND_REPORT_MAIL_FILE, this.email, formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data) {
        this.isLoading = false;
        swal({
          title: "Message",
          text: "Mail Sent Successfully..!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });

      }
      else {
        toastr.error("Error uploading file ..");
      }
    }).catch(error => {
      this.errMsg = 'Error uploading file ..';
    });
  }

  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear();
    return formateddate;
  }
  setFormatDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2)
      + ' ' + ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);;
    return formateddate;
  }
  cmpimg: any;



  getbase64image() {
    this.https.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          var base64data = reader.result;
          this.cmpimg = base64data;
          console.log(base64data);
        }

        reader.readAsDataURL(res);
        console.log(res);
      });
  }



}
