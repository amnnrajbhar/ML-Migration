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
import { PermissionDetails } from './PermissionReport.model';
import moment from 'moment'
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// import htmlToPdfmake from 'html-to-pdfmake';
//import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
//import * as fs from 'file-saver';

declare var ActiveXObject: (type: string) => void;

@Component({
  selector: 'app-PermissionReport',
  templateUrl: './PermissionReport.component.html',
  styleUrls: ['./PermissionReport.component.css']
})
export class PermissionReportComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm!: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;

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
  addressList!: any[];
  empOtherDetailList!: any[];
  employeePayrollList!: any[];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string
  path!: string
  selectedBaseLocation: any[] = [];
  employeeId: any = null;
  userMasterItem: any = {};
  year: any;

  CalenderYear: string = '';
  CalYear: any;
  NoOfDays: number = 0;
  LvReason: string = ' ';
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  PermissionRequestList: any[] = [];
  Starttime: any;
  EndTime: any;
  today = new Date();
  fromDate: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  toDate: any = this.today;
  fromTime: any;
  toTime: any;
  Plant: any = null;
  SwipeType: any = null;
  PermissionType: any = null;
  permissionDate: any;
  perType: any;
  strTime: any;
  endTime: any;
  swipeType: any;
  status: any;
  reqDate: any;
  perReason: any;
  EmployeeNo: any;
  EmployeeNo1: any[] = [];
  filterPayGroup: string = ' ';
  filterDepartment: string = ' ';
  filterCategory: string = ' ';
  filterappStatus: string = ' ';

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private https: HttpClient, private route: ActivatedRoute) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
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

  plantList: any[] = [];
  getPlantsassigned(id:any) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  getLocationName(id:any) {
    let t = this.locationList.find((s:any) => s.id == id);
    return t.code + ' - ' + t.name;
  }

  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a:any, b:any) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });

      }
      //this.reInitDatatable();
    }).catch((error)=> {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }

  filterLocation: string = '';
  payGroupList1: any[] = [];
  getPaygroupsBasedOnPlant() {
   // this.filterPayGroup = null;
  this.filterPayGroup = '';

    let temp = this.locationList.find((x:any)  => x.fkPlantId == this.Plant);
    this.payGroupList1 = temp ? this.payGroupList.filter((x:any)  => x.plant == temp.code) : [];
  }


  empCatList: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatList = data;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.empCatList = [];
    });
  }
  GetCat(id:any) {
    let temp = this.empCatList.find((x:any)  => x.id == id);
    return temp ? temp.catltxt : '';
  }

  getDepartList() {
    this.httpService.LAget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.departmentList = [];
      this.isLoading = false;

    });
  }

  currentUser!: AuthData;
  ngOnInit() {
    this.path = this.router.url;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getbase64image();
      this.GetReportingEmployeeList();
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getpayGroupList();
      this.getempCatList();
      this.getDepartList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  isValid: boolean = false;
  validatedForm: boolean = true;
  PermissionCount: number = 0;
  empName: string
  totalCount: any;

  GetPermissionList() {
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
      if (this.router.url == '/PermissionReportEss') {
        if (this.EmployeeNo1.length <= 0) {
          srchstr.userId = this.currentUser.employeeId;
          this.empName = this.currentUser.fullName;
        }
        else {
          srchstr.userId = this.EmployeeNo1.map((x:any)  => x.id).join();
          this.empName = this.EmployeeList.find((x:any)  => x.employeeId == this.EmployeeNo1[0].id).fullName;
        }
      }
      else {
        srchstr.userId = this.EmployeeNo;
      }
      srchstr.type = 'Permission'
      srchstr.plant = this.Plant;
      srchstr.paygroup = this.filterPayGroup;
      srchstr.department = this.filterDepartment;
      srchstr.category = this.filterCategory;
      srchstr.approverStatus = this.filterappStatus;
      srchstr.startDate = this.fromDate ? this.setFormatedDate(this.fromDate) : null;
      srchstr.endDate = this.toDate ? this.setFormatedDate(this.toDate) : null;
      this.httpService.LApost(APIURLS.BR_GET_PERMISSION_REQUESTS, srchstr).then((data: any) => {
        if (data) {
          this.PermissionRequestList = data;
          this.PermissionCount = this.PermissionRequestList.filter((x:any)  => x.approverStatus == 'Completed' || x.approverStatus == 'Pending').length + 1;
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.PermissionRequestList = [];
      });
    }
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
    this.PermissionRequestList = [];

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

  ApplyFor: any = null;
  userId: string = ' ';
  lastReportingkeydown = 0;
  getEmployee($event) {
    let text = $('#empNo').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#empNo').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#empNo").val(ui.item.value);
                  $("#empNo").val(ui.item.value);
                }
                else {
                  $("#empNo").val('');
                  $("#empNo").val('');
                }
              },
              select: function (event:any, ui:any) {
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
        this.empListCon = data.map((i:any) => { i.name = i.fullName + '-' + i.employeeId, i.id = i.employeeId, i.empName = i.fullName; return i; });
        this.EmployeeList.sort((a:any, b:any) => {
          if (a.fullName > b.fullName) return 1;
          if (a.fullName < b.fullName) return -1;
          return 0;

        })
      }
      else {
        this.EmployeeList = [];
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.EmployeeList = [];
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


  statuslist: any[] = [
    { id: '0', name: 'Pending' },
    { id: '1', name: 'Approved' },
    { id: '2', name: 'Rejected' },
    { id: '3', name: 'Cancelled' },
    { id: '4', name: 'Self Cancelled' }
  ];

getHeader(): { headers: HttpHeaders } {
  //let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

  image!: string
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
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
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



  PrintPermission(values) {
    swal({
      title: "Message",
      text: "Are you sure to export?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {
       // this.onUserActions1();
      }
    });
  }

  exportList!: any[];
  //v10
  // onUserActions1() {
  //   const title = ' Employee Permission Report';
  //   const header = ["SNo", "Request No", "Employee Name", "Employee Number", "Designation", "Role", "Department", "Request Type", "Date", "Start Time", "End Time", "Type", "Status"]
  //   var exportList = [];
  //   var ts: any = {};
  //   let index = 0;
  //   this.PermissionRequestList.forEach((item :any) => {
  //     index = index + 1;
  //     ts = {};
  //     ts.slno = index;
  //     ts.requestNo = item.requestNo;
  //     ts.empName = item.empName;
  //     ts.userId = item.userId;
  //     ts.designation = item.designation;
  //     ts.role = item.role;
  //     ts.department = item.department;
  //     ts.submitDate = this.setFormatedDate(item.submitDate);
  //     ts.date = this.setFormatedDate(item.date);
  //     ts.startTime = item.startTime;
  //     ts.endTime = item.endTime;
  //     ts.type = item.type;
  //     ts.approverStatus = item.approverStatus;
  //     exportList.push(ts);
  //   });
  //   var OrganisationName = "MICRO LABS LIMITED";
  //   const data = exportList;
  //   //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //   let worksheet = workbook.addWorksheet('Employee Permission Report');
  //   //Add Row and formatting
  //   var head = worksheet.addRow([OrganisationName]);
  //   head.font = { size: 16, bold: true }
  //   head.alignment = { horizontal: 'center' }
  //   let titleRow = worksheet.addRow([title]);
  //   titleRow.font = { size: 16, bold: true }
  //   titleRow.alignment = { horizontal: 'center' }
  //   worksheet.mergeCells('A1:M1');
  //   worksheet.mergeCells('A2:M2');
  //   //Add Header Row
  //   let headerRow = worksheet.addRow(header);

  //   headerRow.eachCell((cell, number) => {
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFFFFF00' },
  //       bgColor: { argb: 'FF0000FF' }
  //     }
  //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //   })

  //   for (let x1 of data) {
  //     let x2 = Object.keys(x1);
  //     let temp = []
  //     for (let y of x2) {
  //       temp.push(x1[y])
  //     }
  //     worksheet.addRow(temp)
  //   }
  //   worksheet.eachRow((cell, number) => {
  //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //   })
  //   worksheet.addRow([]);
  //   workbook.xlsx.writeBuffer().then((data:any) => {
  //     let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     fs.saveAs(blob, 'Emp_Permission_Report.xlsx');
  //   });
  // }


}
