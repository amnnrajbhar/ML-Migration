import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
//import { HttpClient } from '@angular/common/http';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
// import Swal from 'sweetalert2';
import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import { EmpShiftMaster } from '../EmpShiftMaster/EmpShiftMaster.model';
// import { element } from '@angular/core/src/render3/instructions';
import { DataRowOutlet } from '@angular/cdk/table';

@Component({
  selector: 'app-ShiftAssig131794nment',
  templateUrl: './ShiftAssignment.component.html',
  styleUrls: ['./ShiftAssignment.component.css']
})
export class ShiftAssignmentComponent implements OnInit {
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


  ShiftAssignmentList: any[] = [];
  ShiftList: EmpShiftMaster[] = [];
  AssignedShift: string;
  AssignedCount: any;
  month: string = null;
  calYear: any;
  ShiftAssignmentList1: any[] = [];


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
 private excelService: ExcelService) { }

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
      }
      //this.reInitDatatable();
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
        this.plantList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.plantList.sort((a, b) => { return collator.compare(a.code, b.code) });

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  payGroupList1: any[] = [];
  getPaygroupsBasedOnPlant() {
    this.filterPayGroup = null;
    let temp = this.plantList.find(x => x.fkPlantId == this.filterLocation);
    this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
  }
  onSelectAll() {

  }

  clearFilter() {
    this.filterLocation = '';
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
    this.ShiftAssignmentList = [];
    this.AssignedShift = '';
    this.month = '';
    this.reInitDatatable();
  }

  ClearEmployee() {
    this.filterEmployeeId = '';
  }
  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true
  };

  BloodGroupList: any[] = [];

  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.calYear = new Date().getFullYear().toString();
    this.AssignedCount = 2;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getReportingGroupList();
      this.getDepartList();
      this.getDesignationList();
      this.getsubDeptList();
      this.getLocationMaster();
      this.getempCatList();
      this.getShiftMasterList();
      //this.getUsersList();
      this.getpayGroupList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();

  }
  ShiftList1: EmpShiftMaster[] = [];
  GetShift() {
    this.getPaygroupsBasedOnPlant();
    let temp = this.locationList.find(x => x.id == this.filterLocation)
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
        // let temp = this.plantList.find(x => x.fkPlantId == this.filterLocation);
        // this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
      }
      // this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
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

  subdepartmentList: any[] = [];
  getsubDeptList() {
    this.get("SubDeptMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.subdepartmentList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.subdepartmentList = [];
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
      toastr.error("Please select Plant...");
      return;
    }
    if (this.filterPayGroup == null) {
      toastr.error("Please select PayGroup...");
      return;
    }
    if (this.filterCategory == null) {
      toastr.error("Please select Emp Category...");
      return;
    }
    if (this.month == null) {
      toastr.error("Please select Month...");
      return;
    }
    if (this.filterType == '' || this.filterType == null) {
      toastr.error("Please select Assignment Type...");
      return;
    }
    else if (this.filterType == 0 && (this.filterEmployeeId == null || this.filterEmployeeId == '')) {
      toastr.error("Please enter Employee Id...");
      return;
    }
    else {
      let filterModel: any = {};
      filterModel.plant = this.filterLocation;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.empCat = this.filterCategory;
      filterModel.department = this.filterDepartment
      filterModel.subDept = this.filterSubDepartment;
      filterModel.employeeId = this.filterEmployeeId;
      filterModel.year = this.calYear;
      filterModel.month = this.month;
      filterModel.status = this.filterStatus;
      let connection = this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LIST_FOR_SHIFT, filterModel);
      connection.then((data: any) => {
        if (data) {
          this.ShiftAssignmentList = data;
        }
        this.reInitDatatable();
      }).catch(error => {
        this.errMsgPop = 'Error getting data ..';
      });
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
    if (this.checkedRequestList.length <= 0) {
      toastr.error("Please select the employees to update shift.");
    }
    else if (this.month == null || this.month == undefined) {
      toastr.error("Please select Month.");
    }
    else if (this.AssignedShift == null || this.AssignedShift == undefined || this.AssignedShift == '') {
      toastr.error("Please select Shift to be updated.");
    }
    else {
      let filterModel: any = {};
      filterModel.employeeId = this.checkedRequestList.map(x => x.employeeId).join();
      filterModel.shiftCode = this.AssignedShift;
      filterModel.swipecount = this.AssignedCount;
      filterModel.doneBy = this.currentUser.employeeId;
      filterModel.month = this.month;
      filterModel.year = this.calYear;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.empCat = this.filterCategory;
      let connection = this.httpService.LApost(APIURLS.BR_UPDATE_EMPLOYEE_SHIFT, filterModel);
      connection.then((data: any) => {
        this.isLoading = false;
        if (data) {
          swal({
            title: "Success..",
            text: "Shift Data Updated Successfully...!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.clearFilter();
        }
        else {
          swal({
            title: "Success..",
            text: "Shift Data Updated Successfully...!",
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
          this.clearFilter();
        }
        this.clearFilter();
      }).catch(error => {
        this.errMsgPop = 'Error updating data ..';
      });
    }
  }

  GetData() {
    if (this.filterLocation == null || this.filterLocation == '') {
      toastr.error("Please select Plant...");
      return;
    }
    if (this.filterPayGroup == null || this.filterPayGroup == '') {
      toastr.error("Please select PayGroup...");
      return;
    }
    if (this.filterCategory == null || this.filterCategory == '') {
      toastr.error("Please select Emp Category...");
      return;
    }
    if (this.month == null || this.month == '') {
      toastr.error("Please select Month...");
      return;
    }
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.plant = this.filterLocation;
    filterModel.payGroup = this.filterPayGroup;
    filterModel.empCat = this.filterCategory;
    filterModel.department = this.filterDepartment;
    filterModel.month = this.month;
    filterModel.year = this.calYear;

    let connection = this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE, filterModel);
    connection.then((data: any) => {
      if (data != null) {
        this.downloadTemplate(data);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  binddatetime(time) {
    let datetime = new Date();
    let times = time.split(':');
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1]));
    datetime.setSeconds(parseInt(times[2]));
    return datetime;
  }

  downloadTemplate(data) {

    //Shift Codes Data
    const header = ["Shift Code", "Shift Name", "Shift Start Time", "Shift End Time"]

    var exportList = [];
    var ts: any = {};
    let index = 0;

    data.table.forEach(element => {
      index = index + 1;
      ts = {};
      ts.shift_Code = element.shift_Code;
      ts.shift_Name = element.shift_Name;
      ts.shift_start_time = element.shift_start_time;
      ts.shift_End_Time = element.shift_End_Time;
      exportList.push(ts);
    });
    const data1 = exportList;

    //Employee Shift Data
    const header1 = ["Employee No", "Employee Name", "Month", "Year", "Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7", "Day8", "Day9",
      "Day10", "Day11", "Day12", "Day13", "Day14", "Day15", "Day16", "Day17", "Day18", "Day19", "Day20", "Day21", "Day22", "Day23", "Day24",
      "Day25", "Day26", "Day27", "Day28", "Day29", "Day30", "Day31"]

    var exportList1 = [];
    var ts1: any = {};
    let index1 = 0;

    data.table1.forEach(element => {
      index1 = index1 + 1;
      ts1 = {};
      ts1.pernr = element.pernr;
      ts1.empName = element.empName;
      ts1.month = element.month;
      ts1.year = element.year;
      ts1.day1 = element.day1;
      ts1.day2 = element.day2;
      ts1.day3 = element.day3;
      ts1.day4 = element.day4;
      ts1.day5 = element.day5;
      ts1.day6 = element.day6;
      ts1.day7 = element.day7;
      ts1.day8 = element.day8;
      ts1.day9 = element.day9;
      ts1.day10 = element.day10;
      ts1.day11 = element.day11;
      ts1.day12 = element.day12;
      ts1.day13 = element.day13;
      ts1.day14 = element.day14;
      ts1.day15 = element.day15;
      ts1.day16 = element.day16;
      ts1.day17 = element.day17;
      ts1.day18 = element.day18;
      ts1.day19 = element.day19;
      ts1.day20 = element.day20;
      ts1.day21 = element.day21;
      ts1.day22 = element.day22;
      ts1.day23 = element.day23;
      ts1.day24 = element.day24;
      ts1.day25 = element.day25;
      ts1.day26 = element.day26;
      ts1.day27 = element.day27;
      ts1.day28 = element.day28;
      ts1.day29 = element.day29;
      ts1.day30 = element.day30;
      ts1.day31 = element.day31;
      exportList1.push(ts1);
    });
    const data11 = exportList1;

    //Informative Text
    const header3 = ["FOR", "MORE", "SHIFT", "CODES", "AND", "TIMINGS", "REFER", "SHEET-2", "(SHIFT CODES)"]

    //Create workbook and worksheet
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet1 = workbook.addWorksheet('Shift Assignemt Template');
    let worksheet2 = workbook.addWorksheet('Shift Codes');

    //Add Row and formatting

    //Add Header Row

    //Shift Codes Header
    let headerRow = worksheet2.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    for (let x1 of data1) {
      let x2 = Object.keys(x1);
      let temp = []
      for (let y of x2) {
        temp.push(x1[y])
      }
      worksheet2.addRow(temp)
    }

    worksheet2.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet2.addRow([]);

    //Informative Header
    worksheet1.addRow([]);

    let headerRow2 = worksheet1.addRow(header3);
    headerRow2.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thick' }, left: { style: 'thick' }, bottom: { style: 'thick' }, right: { style: 'thick' } }
    })

    worksheet1.addRow([]);

    //EMployee Shift Data header
    let headerRow1 = worksheet1.addRow(header1);
    headerRow1.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    for (let x1 of data11) {
      let x2 = Object.keys(x1);
      let temp = []
      for (let y of x2) {
        temp.push(x1[y])
      }
      worksheet1.addRow(temp)
    }

    worksheet1.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet1.addRow([]);


    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Shift_Assignment_Template.xlsx');
    })
  }

  formData: FormData = new FormData();
  file: File;
  uploadfiles(files: File) {
    this.file = files[0];
  }

  errorString: any;
  TotalShifts: number;
  upload() {
    if (this.file == null) {
      toastr.error("Please upload a valid file first..!");
      return;
    }
    else {
      this.isLoading = true;
      swal({
        title: "Message",
        text: "Shift Schedule Processing has started... Please wait as the screen will close automatically ..!",
        timer: 7000,
        icon: "info",
        dangerMode: false,
        buttons: [false, false]
      });

      let connection: any;
      this.formData = new FormData();
      this.formData.append('file', this.file);
      connection = this.httpService.LAExcelUpload(APIURLS.BR_UPLOAD_EXCEL_FILE, this.currentUser.employeeId, this.formData);
      connection.then((data: any) => {
        this.isLoading = false;

        if (data.type == 'E') {
          this.isLoading = false;
          swal({
            title: "ERROR",
            text: data.message,
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
          this.reset();
        }
        if (data[0].type == 'S') {
          this.isLoading = false;
          swal({
            title: "Message",
            text: data[0].message,
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.reset();
        }
        else if (data[0].type == 'E') {
          this.isLoading = false;
          this.errorString = "Shift Data not uploaded. Find the error list below: " + '\n';
          data.forEach(element => {
            this.errorString = this.errorString + '\n' + '\n' + element.message;
          })
          swal({
            title: "ERROR",
            text: this.errorString,
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
  }

  reset() {
    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
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
    filterModel.employeeId = this.filterEmployeeId;
    filterModel.month = this.month;
    filterModel.status = this.filterStatus;
    let connection = this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LIST_FOR_SHIFT, filterModel);
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

}

