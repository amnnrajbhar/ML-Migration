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
import { LeaveDetails } from './CompOffReport.model';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';

declare var ActiveXObject: (type: string) => void;

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, DecimalPipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';


@Component({
  selector: 'app-CompOffReport',
  templateUrl: './CompOffReport.component.html',
  styleUrls: ['./CompOffReport.component.css']
})

export class CompOffReportComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  public tableWidget: any;
  public tableWidgetlv: any;
  //designationList: any[] = [];
  roleList: any[] = [];
  departmentList: any[] = [];
  profileList: any[] = []; managerList: any[] = []; reporting_managerList: any[] = [];
  empListCon = [];
  locListCon = [];
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
  CompOffRequestList: any[] = [];
  userId: string = null;
  EmployeeNo: any;
  EmployeeName: string = null;
  EmployeeNo1: any[] = [];
  filterPayGroup: string = null;
  filterDepartment: string = null;
  filterCategory: string = null;
  today = new Date();
  fromDate: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  toDate: any = this.today;
  Plant: any = null;
  filterappStatus: string = null;

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
    if (this.EmployeeNo1.length <= 0) this.notFirst = false;
  }
  checkStatusRep() {
    // console.log(this.EmployeeNo.length+'<->'+this.rmnotFirst);
    if (this.EmployeeNo1.length <= 0) this.rmnotFirst = false;
  }

  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAll() {
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

  payGroupList: any[] = [];
  payGroupList1: any[] = [];

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

  getpaygroupbasedonplant() {
    this.filterPayGroup = null;
    this.payGroupList1 = this.payGroupList.filter(x => x.plant == this.Plant);
  }


  GetPaYGroup(id) {
    let temp = this.payGroupList.find(x => x.id == id);
    return temp ? temp.short_desc : '';
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
    // var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {
    this.getbase64image();
    this.GetEmpDetails(this.currentUser.employeeId);
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.GetReportingEmployeeList();
    this.getLocationMaster();
    this.getpayGroupList();
    this.getempCatList();
    this.getDepartList();
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
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  lastReportingkeydown = 0;
  getEmployee($event) {
    let text = $('#empNo').val();

    if (text.length > 2) {
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
                  $("#emp1").val(ui.item.value);
                  $("#empNo").val(ui.item.label);

                }
                else {
                  $("#emp1").val('');
                  $("#empNo").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#emp1").val(ui.item.value);
                  $("#empNo").val(ui.item.label);

                }
                else {
                  $("#emp1").val('');
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

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  clearFilter() {
    this.fromDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.Plant = null;
    this.filterPayGroup = null;
    this.filterCategory = null;
    this.filterDepartment = null;
    this.filterappStatus = null;
    this.EmployeeNo = null;
    this.EmployeeNo1 = null;
    this.toDate = this.today;
  }

  isValid: boolean = false;
  validatedForm: boolean = true;
  empName: string;
  upcomingLeaves: any[] = [];
  getEmpCompOffList() {
    this.isLoading = true;
    if (this.Plant == null) {
      this.isLoading = false;
      toastr.error("Please select plant..!");
      return;
    }
    else if (this.fromDate == null) {
      this.isLoading = false;
      toastr.error("Please select from Date..!");
      return;
    }
    else if (this.toDate == null) {
      this.isLoading = false;
      toastr.error("Please select to date..!");
      return;
    }
    else {
      this.errMsg = "";
      this.isLoading = true;
      let srchstr: any = {};
      if (this.router.url == '/CompOffReportEss') {
        if (this.EmployeeNo1.length <= 0) {
          srchstr.pernr = this.currentUser.employeeId;
          this.empName = this.currentUser.fullName;
        }
        else {
          srchstr.pernr = this.EmployeeNo1.map(x => x.id).join();
          this.empName = this.EmployeeList.find(x => x.employeeId == this.EmployeeNo1[0].id).fullName;
        }
      }
      else {
        srchstr.pernr = this.EmployeeNo;
      }
      srchstr.plant = this.Plant;
      srchstr.paygroup = this.filterPayGroup;
      srchstr.department = this.filterDepartment;
      srchstr.category = this.filterCategory;
      srchstr.apprvrStatus = this.filterappStatus;
      srchstr.fromDate = this.fromDate ? this.getDateFormate(this.fromDate) : null;
      srchstr.toDate = this.toDate ? this.getDateFormate(this.toDate) : null;
      this.httpService.LApost(APIURLS.GET_COMP_OFF_REPORT, srchstr).then((data: any) => {
        if (data.length > 0) {
          this.CompOffRequestList = data;
        }
        else {
          this.CompOffRequestList = [];
        }
        this.reInitDatatable();
        this.isLoading = false;
        
      }).catch(error => {
        this.isLoading = false;
        this.CompOffRequestList = [];
      });

    }
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

getHeader(): { headers: HttpHeaders } {
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
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

  PrintCompOff(values) {
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
    const title = ' Comp-Off Report';
    const header = ["SNo", "Request No", "Employee Name", "Department", "Designation", "Role", "Requested Date", "Worked Date",
      "Shift Code", "In Time", "Out Time", "Reason", "Status", "Balance Status"]
    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.CompOffRequestList.forEach(item => {
      index = index + 1;
      ts = {};
      ts.slno = index;
      ts.reqNo = item.reqNo;
      ts.empName = item.empName;
      ts.department = item.department;
      ts.designation = item.desig;
      ts.role = item.role;
      ts.requestedDate = this.getDateFormate(item.requestedDate);
      ts.fromDate = this.getDateFormate(item.fromDate);
      ts.shift = item.shift;
      ts.intime = item.intime;
      ts.outtime = item.outtime;
      ts.reason = item.reason;
      ts.apprvrStatus = item.apprvrStatus;
      ts.balancestatus = item.sapApproved == 1 ? 'Credited' : 'Pending';
      exportList.push(ts);
    });
    var OrganisationName = "MICRO LABS LIMITED";
    const data = exportList;
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Comp-Off Report');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:L1');
    worksheet.mergeCells('A2:L2');
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
      fs.saveAs(blob, 'Compoff_Report.xlsx');
    });
  }

}
