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
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatAccordion } from '@angular/material';
import * as moment from 'moment';
import { ExcelService } from '../../shared/excel-service';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
import * as XLSX from 'xlsx';
import * as pdfMake from "pdfmake/build/pdfmake";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
//import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

declare var ActiveXObject: (type: string) => void;



@Component({
  selector: 'app-Reports',
  templateUrl: './Reports.component.html',
  styleUrls: ['./Reports.component.css']
})
export class AttendanceReportsComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;
@ViewChild('table', { static: false }) table: ElementRef;

  // @ViewChild('table1') table1: ElementRef;
  // @ViewChild('table2') table2: ElementRef;
  // @ViewChild('table3') table3: ElementRef;
  //@ViewChild('table4') table4: ElementRef;
@ViewChild('dailyreport', { static: false }) dailyreport: ElementRef;


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
  CalenderYear: string = '';
  path: any;
  fromDate: any;
  toDate: any;
  EmployeeNo: string = null;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private https: HttpClient, private route: ActivatedRoute, private excelService: ExcelService,
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
      this.getUsersList();
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
    this.ViewType = null;
    this.Type = null;
    this.fromDate = null;
    this.toDate = null;
    this.filterSubDepartment = null;
    this.selectedEmployeeList = [];
    this.CalenderYear = new Date().getFullYear().toString();
    this.IntimationReport = [];
    this.EsslPunchReport = [];
    this.EmpShiftAll = [];
  }


  deliveryModeSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  }; onItemDeSelect(item: any) {
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


  getDateFormate(date: any): string {
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
  UserList: any[] = [];
  empListCon: any[] = [];
  getUsersList() {
    let filterModel: any = {};
    filterModel.employeeId = this.currentUser.fkEmpId;
    this.httpService.LApost(APIURLS.GET_AUTHORIZED_EMPLOYEE_LIST, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.UserList = data;
        this.empListCon = data.map((i) => {
          i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation
          i.id = i.employeeId; return i;
        });
      }
    }).catch(error => {
      this.UserList = [];
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
  GetMonthlyMusterReport() {
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
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.pernr = this.selectedEmployeeList.length > 0 ? this.selectedEmployeeList.map(x => x.id).join(',') : null;;
      filterModel.staffCat = this.filterStaffcat;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.viewType = this.AttendanceType;
      filterModel.type = this.AttendanceType;
      filterModel.month = this.filterMonth;
      filterModel.Year = this.CalenderYear;
      filterModel.dept = this.filterDepartment;
      let connection = this.httpService.LApost(APIURLS.BR_GET_MONTHLY_MUSTER_REPORT, filterModel);
      connection.then((data) => {
        if (data.table.length > 0) {
          this.ReportData = data.table;
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
          this.excelService.exportAsExcelFile(this.exportList, date + '_' + 'Muster_Report');
        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      })
    }
  }
  GetMonthlyDetailedReport() {
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
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.pernr = this.selectedEmployeeList.length > 0 ? this.selectedEmployeeList.map(x => x.id).join(',') : null;
      filterModel.staffCat = this.filterStaffcat;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.payGroup = this.filterPayGroup;
      //filterModel.attendanceType=this.filterTY;
      //filterModel.viewType=this.AttendanceType;
      //filterModel.type=this.AttendanceType;  
      filterModel.month = this.filterMonth;
      filterModel.Year = this.CalenderYear;
      filterModel.dept = this.filterDepartment;
      let connection = this.httpService.LApost(APIURLS.BR_GET_MONTHLY_DETAILED_REPORT, filterModel);
      connection.then((data) => {
        if (data.table.length > 0) {
          //this.ReportData=data;
          let rep = data.table.filter(x => x.ord == 0);
          let rep1 = data.table.filter(x => x.ord != 0);
          rep.forEach(element => {
            element.attendance = rep1.filter(x => x.pernr == element.pernr);
          });
          this.ReportData = rep;
          swal({
            title: "Message",
            text: "Are you Sure to export..?",
            icon: "warning",
            dangerMode: false,
            buttons: [true, true]
          }).then((data1) => {
            if (data1) {
              // this.ExportToExcel();
              this.exportToExcel();
            }
          })
        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      })
    }
  }

  GetMonthlyDaywiseReport() {
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
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.pernr = this.selectedEmployeeList.length > 0 ? this.selectedEmployeeList.map(x => x.id).join(',') : null;
      filterModel.category = this.filterStaffcat;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.type = this.ViewType;
      filterModel.month = this.filterMonth;
      filterModel.Year = this.CalenderYear;
      filterModel.dept = this.filterDepartment;
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
              this.generateDayWiseExcel(this.ReportData);
            }
          })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      })
    }

  }
  
  GetLeaveBalanceReport() {
    if (this.filterPlant == null) {
      toastr.error("Please select Plant..");
      return;
    }
    else if (this.filterPayGroup == null) {
      toastr.error("Please select PayGroup..");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.pernr = this.filterEmployee;
      filterModel.staffCat = this.filterStaffcat;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.type = "Detailed";
      filterModel.month = this.filterMonth;
      filterModel.Year = this.CalenderYear;
      filterModel.dept = this.filterDepartment;
      let connection = this.httpService.LApost(APIURLS.GET_YEARLY_LEAVE_REPORT, filterModel);
      connection.then((data) => {
        if (data.length > 0) {
          this.ReportData = data;
        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      })
    }
  }

  GetMonthlySummary() {
    if (this.filterReportingGroup == null) {
      toastr.error("Please select reporting group..");
      return;
    }
    else if (this.filterPlant == null) {
      toastr.error("Please select plant..");
      return;
    }
    else if (this.filterMonth == null) {
      toastr.error("Please select month..");
      return;
    }
    else if (this.CalenderYear == null) {
      toastr.error("Please select Year..");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.reporting = this.filterReportingGroup;
      //filterModel.attendanceType=this.filterTY;
      filterModel.viewType = this.ViewType;
      filterModel.type = this.AttendanceType;
      filterModel.month = this.filterMonth;
      filterModel.Year = this.CalenderYear;
      let connection = this.httpService.LApost(APIURLS.BR_GET_MONTHLY_DETAILED_REPORT, filterModel);
      connection.then((data) => {
        if (data.length > 0) {
          this.ReportData = data;
          swal({
            title: "Message",
            text: "Are you Sure to export..?",
            icon: "warning",
            dangerMode: false,
            buttons: [true, true]
          }).then((data) => {
            if (data) {
              this.ExportToExcel();
            }
          })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }

  orderList: any[] = [
    { id: 1, name: 'REM' },
    { id: 2, name: 'In' },
    { id: 3, name: 'Out' },
    { id: 4, name: 'Late' },
    { id: 5, name: 'Early' },
    { id: 6, name: 'Wk Hours' },
    { id: 7, name: 'Ot Hours' },
    { id: 8, name: 'Shift Code' },
    { id: 91, name: 'Total OT Hours' }
  ]
  getName(id) {
    let temp = this.orderList.find(x => x.id == id);
    return temp ? temp.name : '';
  }


  fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  fileExtension = '.xlsx';
  ExportToExcel() {


    try {
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      /* save to file */
      XLSX.writeFile(wb, 'DetailedReport.xlsx');

    }
    catch (e) {
      console.log(e);
    }
    // var printContents = document.getElementById('excel1').innerHTML;
    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.table.nativeElement);
    // const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    // const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // const data: Blob = new Blob([excelBuffer], {type: this.fileType});
    // fs.saveAs(data, 'DetailedReport.xlsx');
  }
  // ExportLvBalToExcel() {
  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table1.nativeElement);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  //   /* save to file */
  //   XLSX.writeFile(wb, 'YearlyLeaveBalanceReport.xlsx');

  // }

  // exportToExcel() {
  //   var location = 'data:application/vnd.ms-excel;base64,';
  //   var excelTemplate = '<html> ' +
  //     '<head> ' +
  //     '<meta http-equiv="content-type" content="text/plain; charset=UTF-8"/> ' +
  //     '</head> ' +
  //     '<body> ' +
  //     document.getElementById("excel").innerHTML +
  //     '</body> ' +
  //     '</html>'
  //   window.location.href = location + window.btoa(excelTemplate);
  // }

  exportToExcel(): void {
    this.exportList = [];
     this.excelService.exporttableAsExcelFile(document.getElementById('excel'), 'MonthlyDetailedReport');
  }

  DailyReportexportToExcel() {
    // var location = 'data:application/vnd.ms-excel;base64,';
    // var excelTemplate = '<html> ' +
    //   '<head> ' +
    //   '<meta http-equiv="content-type" content="text/plain; charset=UTF-8"/> ' +
    //   '</head> ' +
    //   '<body> ' +
    //   document.getElementById("DailyReport").innerHTML +
    //   '</body> ' +
    //   '</html>'
    // window.location.href = location + window.btoa(excelTemplate);

    this.excelService.exporttableAsExcelFile(document.getElementById('DailyReport'), 'DailyReport');
  }

  ExportDailyReportToExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.dailyreport.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'DailyAttendanceReport.xlsx');

  }

  generateExcel() {

    //Excel Title, Header, Data
    let dt = new Date();
    let date = dt.getFullYear() + '_' + (dt.getMonth() + 1) + '_' + dt.getDay();
    const title = 'Leave Balance Report for the year : ' + this.CalenderYear;
    const header1 = ["", "", "", "", "",
      "Casual Leave", "", "",
      "Sick Leave", "", "",
      "Earned Leave", "", "",
      "Total", "", "", "Previous Year", "", "",]
    const header = ["SNo", "Employee Id", "Employee Name", "Department", "Designation",
      "Opening", "Availed", "Closing",
      "Opening", "Availed", "Closing",
      "Opening", "Availed", "Closing",
      "Opening", "Availed", "Closing",
      "Opening", "Availed", "Closing"]

    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.ReportData.forEach(element => {
      index = index + 1;
      ts = {};
      ts.id = index;
      ts.pernr = element.pernr;
      ts.empFullName = element.fullName;
      ts.department = element.department;
      ts.designation = element.designation;
      ts.cl_open = element.cl_open;
      ts.cl_avail = element.cl_avail;
      ts.cl_close = element.cl_close;
      ts.sl_open = element.sl_open;
      ts.sl_avail = element.sl_avail;
      ts.sl_close = element.sl_close;
      ts.el_open = element.el_open;
      ts.el_avail = element.el_avail;
      ts.el_close = element.el_close;
      ts.tot_open = element.tot_open;
      ts.tot_availed = element.tot_availed;
      ts.tot_close = element.tot_close;
      ts.prev_open = element.prev_open;
      ts.prev_availed = element.prev_availed;
      ts.prev_close = element.prev_close;
      exportList.push(ts);

    });
    let locname = this.locationList.find(x => x.code == this.filterPlant);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + locname.code + '-' + locname.name;
    const data = exportList;
    //Create workbook and worksheet
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Yearly Leave Balance Report for the year : ' + this.CalenderYear);
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    //let subTitleRow = worksheet.addRow(['Yearly Leave Balance Report']);
    //subTitleRow.font = { size: 16, bold: true }
    // subTitleRow.alignment = { horizontal: 'center' }
    //Add Image
    // subTitleRow.font = { size: 12, bold: true }
    worksheet.mergeCells('A1:T1');
    worksheet.mergeCells('A2:T2');
    worksheet.mergeCells('A3:T3');

    //Blank Row 
    // worksheet.addRow([]);
    //Add Header Row
    let headerRow1 = worksheet.addRow(header1);
    let headerRow = worksheet.addRow(header);
    // // Cell Style : Fill and Border
    // worksheet.mergeCells('A4:A5');
    // worksheet.mergeCells('B4:B5');
    // worksheet.mergeCells('C4:C5');
    // worksheet.mergeCells('D4:D5');
    worksheet.mergeCells('F4:H4');
    worksheet.mergeCells('I4:K4');
    worksheet.mergeCells('L4:N4');
    worksheet.mergeCells('O4:Q4');
    worksheet.mergeCells('R4:T4');

    headerRow1.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.alignment = { horizontal: 'center' }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
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

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'LeaveBalanceReport.xlsx');
    })

  }

  generateDayWiseExcel(values) {

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
      ts.date = this.getDateFormate(element.date);
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

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'MonthlyDaywiseReport.xlsx');
    })

  }
  generateEsslReportToExcelExcel() {

    //Excel Title, Header, Data
    let dt = new Date();
    let date = dt.getFullYear() + '_' + (dt.getMonth() + 1) + '_' + dt.getDay();
    const title = 'Daily Biometric Punch Report';
    const header = ["SNo", "Employee No", "Employee Name", "Department", "Designation",
      "Log Date&Time", "Device Name", "Direction",
      "Shift", "IP Address", "Device Location"]

    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.EsslPunchReport.forEach(element => {
      index = index + 1;
      ts = {};
      ts.id = index;
      ts.pernr = element.pernr;
      ts.empName = element.empName;
      ts.department = element.department;
      ts.designation = element.designation;
      ts.logDateTime = this.datePipe.transform(element.logDateTime, 'dd/MM/yyyy HH:mm a');
      ts.deviceFName = element.deviceFName;
      ts.deviceDirection = element.deviceDirection;
      ts.shift = element.shift;
      ts.ipAddress = element.ipAddress;
      ts.deviceLocation = element.deviceLocation;
      exportList.push(ts);

    });
    let locname = this.locationList.find(x => x.code == this.filterPlant);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + locname.code + '-' + locname.name;
    const data = exportList;
    //Create workbook and worksheet
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Daily Biometric Punch Report');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }

    worksheet.mergeCells('A1:K1');
    worksheet.mergeCells('A2:K2');
    worksheet.mergeCells('A3:K3');


    let headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
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

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'DailyBoimetricPunchReport.xlsx');
    })
  }

  generateEsslReportToExcelExcel1() {

    //Excel Title, Header, Data
    let dt = new Date();
    let date = dt.getFullYear() + '_' + (dt.getMonth() + 1) + '_' + dt.getDay();
    const title = 'Daily Biometric Punch Report';
    const header = ["SNo", "Employee No", "Employee Name", "Department", "Designation", "LogDate",
      "Log Date&Time", "Shift", "IP Address"]

    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.EsslPunchReport.forEach(element => {
      index = index + 1;
      ts = {};
      ts.id = index;
      ts.pernr = element.pernr;
      ts.empName = element.empName;
      ts.department = element.department;
      ts.designation = element.designation;
      ts.eventDate = this.datePipe.transform(element.eventDate, 'dd/MM/yyyy');
      ts.eventTime = this.datePipe.transform(element.eventTime, 'HH:mm:ss a');
      ts.shift = element.shift;
      ts.ipAddress = element.ipAddress;
      exportList.push(ts);

    });
    let locname = this.locationList.find(x => x.code == this.filterPlant);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + locname.code + '-' + locname.name;
    const data = exportList;
    //Create workbook and worksheet
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Daily Biometric Punch Report');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }

    worksheet.mergeCells('A1:I1');
    worksheet.mergeCells('A2:I2');
    worksheet.mergeCells('A3:I3');


    let headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
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

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'DailyBoimetricPunchReport.xlsx');
    })


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

  ApprovedLeaves: any[] = [];
  LeavesPendingForApproval: any[] = [];
  ApprovedOnduty: any[] = [];
  OndutyPendingforApproval: any[] = [];
  LatePunch: any[] = [];
  absentEmployees: any[] = [];
  lossofPay: any[] = [];
  attendanceSummary: any[] = [];
  Present: number = 0;
  Absent: number = 0;
  Leave: number = 0;
  PendingLeave: number = 0;
  Onduty: number = 0;
  PendingOnduty: number = 0;
  Lop: number = 0;
  Intimation: number = 0;
  LeaveIntimation: number = 0;
  OnDutyIntimation: number = 0;
  LatepunchCount: number = 0;
  Total: number = 0;
  GetDailyReport(value) {
    if (this.filterPlant == null) {
      toastr.error("Please select plant..");
      return;
    }
    else if (this.fromDate == null) {
      toastr.error("Please select date..");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.dept = this.filterDepartment;
      //filterModel.attendanceType=this.filterTY;
      filterModel.date = new Date(this.fromDate).toLocaleDateString();
      let connection = this.httpService.LApost(APIURLS.GET_DAILY_ATTENDANCE_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          // this.ReportData=data;
          this.lossofPay = data.lossofPay;
          this.Lop = data.lossofPay ? this.lossofPay.length : 0;
          this.ApprovedLeaves = data.approvedLeaves;
          this.Leave = data.approvedLeaves ? this.ApprovedLeaves.length : 0;
          this.LeavesPendingForApproval = data.leavesPendingForApproval;
          this.PendingLeave = data.leavesPendingForApproval ? this.LeavesPendingForApproval.length : 0;
          this.ApprovedOnduty = data.approvedOnduty;
          this.Onduty = data.approvedOnduty ? this.ApprovedOnduty.length : 0;
          this.OndutyPendingforApproval = data.ondutyPendingForApproval;
          this.PendingOnduty = data.ondutyPendingForApproval ? this.OndutyPendingforApproval.length : 0;
          this.absentEmployees = data.absentEmployees;
          this.Absent = (data.absentEmployees ? this.absentEmployees.length : 0) - this.PendingOnduty - this.PendingLeave;
          this.LatePunch = data.latePunches;
          this.LatepunchCount = data.latePunches ? this.LatePunch.length : 0;
          this.Present = data.presentSize ? data.presentSize : 0;

          // swal({
          //   title: "Message",
          //   text: "Are you Sure to export..?",
          //   icon: "warning",
          //   dangerMode: false,
          //   buttons: [true, true]
          // }).then((data) => {
          //   if (data) {
          //     if (value == 'Excel') {
          //       //this.ExportDailyReportToExcel();
          //       this.DailyReportexportToExcel()
          //     }
          //     else {
          //       this.printreport();
          //     }

          //   }
          // })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }

  // ExportDailyExcel() {
  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table4.nativeElement);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  //   /* save to file */
  //   XLSX.writeFile(wb, 'DailyReport.xlsx');

  // }

  ShiftReport: any[] = []
  GetDailyShiftReport() {
    if (this.filterPlant == null) {
      toastr.error("Please select plant..");
      return;
    }
    else if (this.fromDate == null) {
      toastr.error("Please select date..");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.location = this.filterPlant;
      //filterModel.attendanceType=this.filterTY;
      filterModel.date = this.setFormatDateTime(this.fromDate);;
      let connection = this.httpService.LApost(APIURLS.BR_GET_DAILY_SHIFT_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          this.ShiftReport = data;
          // swal({
          //   title: "Message",
          //   text: "Are you Sure to export..?",
          //   icon: "warning",
          //   dangerMode: false,
          //   buttons: [true, true]
          // }).then((data) => {
          //   if (data) {
          //     this.printshiftreport();
          //   }
          // })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }

  EsslPunchReport: any[] = [];
  GetDailyEsslPunchReport() {
    if (this.filterPlant == null) {
      toastr.error("Please select plant..");
      return;
    }
    else if (this.fromDate == null) {
      toastr.error("Please select date..");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.location = this.filterPlant;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.category = this.filterStaffcat;
      filterModel.department = this.filterDepartment;
      filterModel.subdepartment = this.filterSubDepartment;
      filterModel.pernr = this.selectedEmployeeList.length > 0 ? this.selectedEmployeeList.map(x => x.id).join(',') : null;
      //filterModel.attendanceType=this.filterTY;
      filterModel.fromDate = this.setFormatDateTime(this.fromDate);;
      filterModel.toDate = this.setFormatDateTime(this.toDate);;
      let connection = this.httpService.LApost(APIURLS.BR_GET_DAILY_ESSL_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          this.EsslPunchReport = data;
          // swal({
          //   title: "Message",
          //   text: "Are you Sure to export..?",
          //   icon: "warning",
          //   dangerMode: false,
          //   buttons: [true, true]
          // }).then((data) => {
          //   if (data) {
          //     this.printEsslreport();
          //   }
          // })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }

  MonthlyContractualReport: any[] = [];
  GetContractualReport() {
    if (this.filterPlant == null) {
      toastr.error("Please select plant..");
      return;
    }
    // else if (this.fromDate == null) {
    //   toastr.error("Please select date..");
    //   return;
    // }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.location = this.filterPlant;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.staffcat = this.filterStaffcat;
      filterModel.month = this.filterMonth;
      filterModel.year = this.CalenderYear;
      //filterModel.attendanceType=this.filterTY;
      //filterModel.date=this.setFormatDateTime(this.fromDate);;
      let connection = this.httpService.LApost(APIURLS.GET_MONTHLY_CONTRACTUAL_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          this.MonthlyContractualReport = data;
          swal({
            title: "Message",
            text: "Are you Sure to export..?",
            icon: "warning",
            dangerMode: false,
            buttons: [true, true]
          }).then((data) => {
            if (data) {
              this.printEsslreport();
            }
          })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }

  AddAttrReport: any[] = [];
  AdditionReport: any[] = [];
  AttritionReport: any[] = [];
  GetAddAttrReport() {
    if (this.filterPlant == null) {
      toastr.error("Please select plant..");
      return;
    }
    else if (this.filterMonth == null) {
      toastr.error("Please select month..");
      return;
    }
    else if (this.CalenderYear == null) {
      toastr.error("Please select Year..");
      return;
    }
    else if (this.AttendanceType == null) {
      toastr.error("Please select Report Type..");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.location = this.filterPlant;
      filterModel.month = this.filterMonth;
      filterModel.year = this.CalenderYear;
      filterModel.reportType = this.AttendanceType;
      let connection = this.httpService.LApost(APIURLS.GET_MONTHLY_ADDR_ATTR_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          this.AddAttrReport = data;
          this.AttritionReport = data.filter(x => x.reportType == 'Attrition');
          this.AdditionReport = data.filter(x => x.reportType == 'Addition');
          swal({
            title: "Message",
            text: "Are you Sure to export..?",
            icon: "warning",
            dangerMode: false,
            buttons: [true, true]
          }).then((data) => {
            if (data) {
              this.printAddAttrreport();
            }
          })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }
  ManualEntryAuditReport: any[] = [];
  GetManualEntryAuditReport() {
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
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.locid = this.filterPlant;
      filterModel.month = this.filterMonth;
      filterModel.year = this.CalenderYear;
      //filterModel.attendanceType=this.filterTY;
      //filterModel.date=this.setFormatDateTime(this.fromDate);;
      let connection = this.httpService.LApost(APIURLS.GET_MANUAL_ENTRY_AUDIT_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          this.ManualEntryAuditReport = data;
          // swal({
          //   title: "Message",
          //   text: "Are you Sure to export..?",
          //   icon: "warning",
          //   dangerMode: false,
          //   buttons: [true, true]
          // }).then((data) => {
          //   if (data) {
          //     this.printManualreport();
          //   }
          // })

        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }
  MonthlyOTReport: any[] = [];
  MonthlyOTReport1: any[] = [];
  GetMonthlyOTReport() {
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
      toastr.error("Please select attendance type..");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.location = this.filterPlant;
      filterModel.month = this.filterMonth;
      filterModel.year = this.CalenderYear;
      filterModel.type = this.AttendanceType;
      filterModel.reportType = this.ViewType;
      //filterModel.date=this.setFormatDateTime(this.fromDate);;
      let connection = this.httpService.LApost(APIURLS.GET_MONTHLY_OT_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          this.MonthlyOTReport = data;
          if (this.ViewType == 'Summary') {
            this.GetMonthlyDetailedOTReport();
          }

        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }
  GetMonthlyDetailedOTReport() {
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
      toastr.error("Please select attendance type..");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.location = this.filterPlant;
      filterModel.month = this.filterMonth;
      filterModel.year = this.CalenderYear;
      filterModel.type = this.AttendanceType;
      filterModel.reportType = 'Detailed';
      //filterModel.date=this.setFormatDateTime(this.fromDate);;
      let connection = this.httpService.LApost(APIURLS.GET_MONTHLY_OT_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          this.MonthlyOTReport1 = data;


        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }
  details: any[] = [];
  ShowForm(empid) {
    this.details = [];
    this.details = this.MonthlyOTReport1.filter(x => x.pernr == empid);
    this.reInitOTDatatable();
    jQuery('#myModal').modal('show')
  }


  tableWidgetOT: any;
  private initOTDatatable(): void {
    let exampleId: any = jQuery('#OTTable');
    this.tableWidgetOT = exampleId.DataTable({
      "order": []
    });
  }

  private reInitOTDatatable(): void {
    if (this.tableWidgetOT) {
      this.tableWidgetOT.destroy()
      this.tableWidgetOT = null
    }
    setTimeout(() => this.initOTDatatable(), 0)
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

  setFormatDate(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

  cmpimg: any;
  printreport() {
    //this.lineclearancelist1=data;
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED, " + this.filterPlant;
    var pipe = new DatePipe('en-US');
    var ReportHeader = "Daily Attendance Detail Report for the Date: " + this.setFormatedDateTime(this.fromDate);;

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Daily Attendance Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 110, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [80, 320, 90],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], rowspan: 2, bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();
  }
  printshiftreport() {
    //this.lineclearancelist1=data;
    var printContents = document.getElementById('shift').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED, " + this.filterPlant;
    var pipe = new DatePipe('en-US');
    var ReportHeader = "Daily Shift Report for the Date: " + this.setFormatedDateTime(this.fromDate);;

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Daily Shift Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 110, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [90, 320, 90],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowspan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();
  }
  printEsslreport() {
    //this.lineclearancelist1=data;
    var printContents = document.getElementById('essl').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED, " + this.filterPlant;
    var pipe = new DatePipe('en-US');
    var ReportHeader = "Daily Biometric Punch Report ";

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Daily Essl Punch Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 110, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [120, 500, 120],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();
  }
  printAddAttrreport() {
    //this.lineclearancelist1=data;
    var printContents = document.getElementById('AddAttr').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED, " + this.filterPlant;
    var pipe = new DatePipe('en-US');
    var ReportHeader = "Monthly Addition and Attrition " + this.AttendanceType + " Report for Plant: " + this.filterPlant;

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Addition Attrition Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 110, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [90, 320, 90],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowspan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();
  }
  printManualreport() {
    //this.lineclearancelist1=data;
    var printContents = document.getElementById('manualaudit').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED, " + this.filterPlant;
    var pipe = new DatePipe('en-US');
    var ReportHeader = "Monthly Manual Entry Audit Report";

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Manual Entry Audit Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [20, 110, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [120, 500, 120],
            headerRows: 2,
            heights: [40, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowspan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();
  }
  printMonthlyOTreport() {
    //this.lineclearancelist1=data;
    if (this.ViewType == 'Detailed') {
      var printContents = document.getElementById('MonthlyOT').innerHTML;
    }
    else {
      var printContents = document.getElementById('MonthlyOT1').innerHTML;
    }
    var OrganisationName = "MICRO LABS LIMITED, " + this.filterPlant;
    var pipe = new DatePipe('en-US');
    var ReportHeader = "Monthly OT Report";

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Monthly OT Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 110, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [120, 500, 120],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowspan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();
  }
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


  DevBioReport: any[] = [];
  GetDevBio() {
    if (this.filterPlant == null) {
      this.isLoading = true;
      let connection = this.httpService.LAget(APIURLS.GET_ALL_DEV_REPORT);
      connection.then((data) => {
        if (data) {
          this.DevBioReport = data;
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.Plant = this.filterPlant;
      let connection = this.httpService.LApost(APIURLS.GET_DEV_BIO_REPORT, filterModel);
      connection.then((data) => {
        if (data) {
          this.DevBioReport = data;
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;

      });
    }
  }

  GetDevBioReportPdf() {

    var printContents = document.getElementById('pdf110').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var pipe = new DatePipe('en-US');
    var ReportHeader = "Biometric Device Report";

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Biometric Device Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 110, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [120, 500, 120],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();

  }


  EmpShiftAll: any[] = [];
  GetShiftAllowanceReportPdf(value: string) {
    if (this.filterPlant == null) {
      toastr.error("Please select Plant..!");
      return;
    }
    if (this.filterPayGroup == null) {
      toastr.error("Please select PayGroup..!");
      return;
    }
    else if (this.ViewType == null) {
      toastr.error("Please Select Report Type..!");
      return;
    }
    else if (this.fromDate == null) {
      toastr.error("Please Select From Date..!");
      return;
    }
    else if (this.toDate == null) {
      toastr.error("Please Select To Date..!");
      return;
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.Plant = this.filterPlant;
      filterModel.Pernr = this.EmployeeNo;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.reportingGrp = this.filterReportingGroup;
      filterModel.empCat = this.filterStaffcat;
      filterModel.department = this.filterDepartment;
      filterModel.reportType = this.ViewType;
      filterModel.fromDate = this.fromDate ? this.getDateFormate(this.fromDate) : null;
      filterModel.toDate = this.toDate ? this.getDateFormate(this.toDate) : null;

      let connection = this.httpService.LApost(APIURLS.GET_EMP_SHIFT_ALLOWANCE_REPORT, filterModel);
      connection.then((data) => {
        if (data.length > 0) {
          this.EmpShiftAll = data;
          if (value == 'PDF') {
            this.printShiftAllowanceReport();
          }
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      });
    }
  }

  IntimationReport: any[] = [];
  GetIntimationReportPdf(value: string) {
    if (this.filterPlant == null) {
      toastr.error("Please select plant");
      return
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.category = this.filterStaffcat;
      filterModel.department = this.filterDepartment;
      filterModel.reporting = this.filterReportingGroup;
      filterModel.fromDate = this.setFormatDate(this.fromDate);
      filterModel.toDate = this.setFormatDate(this.toDate);
      let connection = this.httpService.LApost(APIURLS.ABSENT_INTIMATION_REPORT, filterModel)
      connection.then((data) => {
        if (data) {
          this.IntimationReport = data;
          if (value == 'PDF') {
            this.printIntimationReport();
          }
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
        this.IntimationReport = [];
      })

    }
  }

  printIntimationReport() {
    var printContents = document.getElementById('Intimation').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var pipe = new DatePipe('en-US');
    var ReportHeader = "Leave & OnDuty Intimation Report";

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Intimation Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 110, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [120, 500, 120],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();

  }

  printShiftAllowanceReport() {
    if (this.ViewType == 'Summary') {
      var printContents = document.getElementById('AllowanceSum').innerHTML;
    }
    else {
      var printContents = document.getElementById('AllowanceDet').innerHTML;
    }

    var OrganisationName = "MICRO LABS LIMITED";
    var ReportHeader = "Shift Allowance Report";

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Shift Allowance Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
                widths: [50, 400, 70],
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
                    , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                    '']

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
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();

  }

  ReimbursementReport: any[] = [];
  GetReimbursementReport(values: string) {
    if (this.filterPlant == null) {
      toastr.error("Please select plant");
      return
    }
    else if (this.fromDate == null) {
      toastr.error("Please select date");
      return
    }
    else {
      this.isLoading = true;
      let filterModel: any = {};
      filterModel.plant = this.filterPlant;
      filterModel.paygroup = this.filterPayGroup;
      filterModel.category = this.filterStaffcat;
      filterModel.fromDate = this.setFormatDateTime(this.fromDate);
      filterModel.toDate = this.setFormatDateTime(this.toDate);
      let connection = this.httpService.LApost(APIURLS.LOP_REIMBURSEMENT_REPORT, filterModel)
      connection.then((data) => {
        if (data) {
          this.ReimbursementReport = data;
          if (values == 'PDF') {
            this.GetReimbursementReportPdf();
          }
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
        this.IntimationReport = [];
      })

    }
  }

  GetReimbursementReportPdf() {
    var printContents = document.getElementById('LOPR').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var pipe = new DatePipe('en-US');
    var ReportHeader = "LOP Reimbursement Report";

    var printedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    var now = Date.now();
    var date = this.setFormatedDateTime(now);
    var logo = this.cmpimg;
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: "Reimbursement Report",
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 110, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [90, 320, 90],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportHeader, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

            //imgData
          ],
          margin: 20
        }
      },

    };
    pdfMake.createPdf(docDefinition).open();

  }
}
