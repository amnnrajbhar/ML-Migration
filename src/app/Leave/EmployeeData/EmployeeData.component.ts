import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Lightbox } from 'ngx-lightbox';
declare var jQuery: any;
declare var toastr: any;
import { Chart } from 'chart.js';
// import { ChartDataLabels } from 'chartjs-plugin-datalabels';
import ChartDataLabels  from 'chartjs-plugin-datalabels';
import * as _ from "lodash";
import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Router } from '@angular/router';
import { APIURLS } from '../../shared/api-url';
import { MOMENT } from 'angular-calendar';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';import { ExcelService } from '../../shared/excel-service';
declare var $: any;
import swal from 'sweetalert';
import * as moment from 'moment';
//import { debug } from 'util';
import { EmpShiftMaster } from '../EmpShiftMaster/EmpShiftMaster.model';
import { EmployeeData } from './EmployeeData.model';
import { Profile } from '../../profile-page/profile.model';
import { EmployeeDetails } from './Employeedetails.model';
import { DependantDetails } from './DependantDetails.model';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
import { info } from 'console';
declare var toastr: any;
//import { Employee } from 'src/app/masters/employee/employee.model';


@Component({
  selector: 'app-EmployeeData',
  templateUrl: './EmployeeData.component.html',
  styleUrls: ['./EmployeeData.component.css']
})
export class EmployeeDataComponent implements OnInit {
  todayDate = new Date();
  @ViewChild('myInput') myInputVariable: ElementRef;
  today: Date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
  tableWidget: any;
  errMsg: string;
  location: any;
  usrid: number;
  path: string;
  locationList: any[] = [[]];
  errMsgPop = '';
  empData: AuthData;
  isLoading: boolean;
  list: any = {};
  StaffCategoryList: any[] = [];
  PayGroupList: any[] = [];
  payGroupList1: any[] = [];
  ReportingGroupList: any[] = [];
  subdepartmentList: any[] = [];
  workTypeList: any[] = [];
  departmentList: any[] = [];
  holidayList: any[] = [];
  calendarList: any[] = [];
  EmployeeData = {} as EmployeeData;
  filterModel: any = {};
  id: any;
  EmployeeId: any;
  FirstName: any;
  LastName: any;
  MiddleName: any;
  Email: any;
  Location: any;
  PayGroup: any;
  EmpCategory: any;
  Designation: any;
  Department: any;
  Role: any;
  SubDepartment: any;
  ReportingGrp: any;
  ReportingManager: any;
  ReportingManagerName: any;
  ApprovingManager: any;
  ApprovingManagerName: any;
  JoiningDate: any;
  CreatedDate: any;
  ShiftCode: any;
  SwipeCount: any;
  HolidayType: any;
  TypeCodeH: any;
  TypeNameH: any;
  WorkingCalendar: any;
  TypeCodeC: any;
  TypeNameC: any;
  Mediclaim: any;
  Mediclaimexpirydate: any;
  EligibilityType: any;
  WorkType: any;
  imgUrl: any;
  PunchingDevices: any;
  PunchingDevicesSelected: any;

  public chartPlugins = [ChartDataLabels];
  filterempName: string = null;
  profileItem = {} as EmployeeDetails;
  DependentList: any[] = [];
  UpdatedDependentList: DependantDetails[] = [];

  Relationshiplist = [{ relation: "Mother" }, { relation: "Father" }, { relation: "Husband" }, { relation: "Wife" }, { relation: "Son" }, { relation: "Daughter" }];


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private excelService: ExcelService, private http: HttpClient,
) {
  }

  ngAfterViewInit() {
    // this.initVisitorDatatable();
    this.initDatatable();
  }

  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // console.log('Access:'+chkaccess);
    this.profileItem.imgUrl = '../assets/dist/img/pp.jpg'
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      // console.log(authData);
      this.usrid = this.currentUser.uid;
      this.empData = this.currentUser;

      // console.log(this.today);
      let d = new Date();
      this.pageNo = 1;
      this.pageSize = 10;
      this.getPlantsassigned(this.empData.fkEmpId);
      this.getDepartList();
      if (this.router.url == '/EmployeeDataEss') {
        this.getEmployeeDataBasedonId(this.currentUser.employeeId);
      }
      this.getReportingGroupList();
      this.getempCatList();
      this.getpayGroupList();
      this.getSubDeptList();
      this.getShiftMasterList();
      this.getcontactdetails();
      this.getWorkTypeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  getFormatedDate(d) {
    let fd = new Date(d);
    let formateddate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
      ("00" + fd.getDate()).slice(-2);
    // return new Date(fd.getFullYear(),fd.getMonth(),fd.getDate());
    return formateddate;
  }
  binddatetime1(time) {
    let datetime = new Date();
    let times = time.split(':');
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1]));
    datetime.setSeconds(parseInt(times[2]));
    return datetime;
  }

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
      this.locationList = [];
    });
  }

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'deviceId',
    textField: 'deviceName',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectM(item: any) {
  }

  notFirst = true;
  rmnotFirst = true;
  checkStatus() {
    if (this.DevBioReport.length <= 0) this.notFirst = false;
  }
  checkStatusRep() {
    if (this.DevBioReport.length <= 0) this.rmnotFirst = false;
  }

  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAll() {
  }

  DevBioReport: any[] = [];
  GetDevBio(plant) {
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.Plant = this.locationList.find(x => x.fkPlantId == plant).code;
    let connection = this.httpService.LApost(APIURLS.GET_DEV_BIO_REPORT, filterModel);
    connection.then((data) => {
      if (data) {
        this.DevBioReport = data;
        this.DevBioReport.forEach(element => {
          element.deviceName = element.deviceFname;
        });
      }
    }).catch((error) => {
      this.isLoading = false;

    });
  }


  ShiftList: EmpShiftMaster[] = [];
  ShiftList1: EmpShiftMaster[] = [];
  loccode: string;

  GetShift() {
    let temp = this.locationList.find(x => x.id == this.empData.baselocation)
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

  private initDatatable(): void {
    // let exampleId: any = jQuery('#userTable');
    // this.tableWidget = exampleId.DataTable();
    $('#userTable tfoot th').each(function () {
      var title = $('#userTable thead th').eq($(this).index()).text();
      if (title != "Sl. No")
        $(this).html('<input type="text" class="form-control" placeholder="Search" style="width:100%"/>');
    });
    var table = $('#userTable').DataTable();
    this.tableWidget = table;
    $("#userTable tfoot input").on('keyup change', function () {
      table
        .column($(this).parent().index() + ':visible')
        .search(this.value)
        .draw();
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.clear();
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0)
  }

  addDays(date, daysToAdd) {
    var _24HoursInMilliseconds = 86400000;
    return new Date(date.getTime() + daysToAdd * _24HoursInMilliseconds);
  };

  getLocationName(id) {
    let temp = this.locationList.find(s => s.id == id);
    return temp ? temp.name : '';
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
  getPaygroupsBasedOnPlant() {
    this.GetDevBio(this.EmployeeData.baseLocation);
    //this.filterPaygroup = null;
    let temp = this.locationList.find(x => x.fkPlantId == this.EmployeeData.baseLocation);
    this.payGroupList1 = temp ? this.PayGroupList.filter(x => x.plant == temp.code) : [];
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

  getHolidayType(data) {
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.baseLocation = data.baseLocation;
    filterModel.payGroup = data.payGroup;
    filterModel.category = data.category;
    filterModel.type = 'Holiday'
    this.httpService.LApost(APIURLS.BR_GET_EMP_HOLCAL, filterModel).then((data1: any) => {
      if (data1.length > 0) {
        this.holidayList = data1;
      }
    }).catch(error => {
      this.isLoading = false;
      this.holidayList = [];
    });
  }

  getCalendarType(data) {
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.baseLocation = data.baseLocation;
    filterModel.payGroup = data.payGroup;
    filterModel.category = data.category;
    filterModel.type = 'Calendar'
    this.httpService.LApost(APIURLS.BR_GET_EMP_HOLCAL, filterModel).then((data1: any) => {
      if (data1.length > 0) {
        this.calendarList = data1;
      }
    }).catch(error => {
      this.isLoading = false;
      this.calendarList = [];
    });
  }

  getAdditonalHolidayTypes() {
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.type = 'Additional';
    filterModel.baseLocation = this.EmployeeData.baseLocation;
    filterModel.payGroup = this.EmployeeData.paygroup;
    filterModel.category = this.EmployeeData.Category;
    this.httpService.LApost(APIURLS.BR_GET_EMP_HOLI_TYPES, filterModel).then((data1: any) => {
      if (data1) {
        this.holidayList = data1.table;
      }
    }).catch(error => {
      this.isLoading = false;
      this.holidayList = [];
    });

  }

  getAdditonalCalendarTypes() {
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.type = 'Additional';
    filterModel.baseLocation = this.EmployeeData.baseLocation;
    filterModel.payGroup = this.EmployeeData.paygroup;
    filterModel.category = this.EmployeeData.Category;
    this.httpService.LApost(APIURLS.BR_GET_EMP_CAL_TYPES, filterModel).then((data1: any) => {
      if (data1) {
        this.calendarList = data1.table;
      }
    }).catch(error => {
      this.isLoading = false;
      this.calendarList = [];
    });

  }

  getSubDeptList() {
    this.httpService.LAget(APIURLS.BR_MASTER_SUBDEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.subdepartmentList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.subdepartmentList = [];
    });
  }

  getWorkTypeList() {
    this.httpService.LAget(APIURLS.BR_MASTER_WORKTYPE_API).then((data: any) => {
      if (data.length > 0) {
        this.workTypeList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.workTypeList = [];
    });
  }

  getTimeFormat(time) {
    return moment('1970-01-01 ' + time);
  }

  ClearFilter() {
    this.EmployeeData.baseLocation = '';
    this.EmployeeData.paygroup = '';
    this.EmployeeData.Category = '';
    this.EmployeeData.department = '';
    this.EmployeeData.subDepartment = '';
    this.EmployeeData.reportingGroup = '';
    this.EmployeeData.employeeSearchType = '';
    this.EmployeeData.empNoName = '';
    this.list = [];
    this.reInitDatatable();
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


  formData: FormData = new FormData();
  file: File;
  uploadedFile(files: File) {
    this.file = files[0];
  }

  // uploadfiles(files: File) {
  //   this.file = files[0];
  // }

  lastReportingkeydown = 0;
  lastReportingkeydown1 = 0;
  getEmployeeR($event) {
    let text = $('#rptMgr').val();

    if (text.length > 3) {
      let self = this;
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#rptMgr').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#rptMgr").val(ui.item.value);
                  $("#rptMgr").val(ui.item.value);
                  self.ReportingManager = ui.item.value;
                  self.ReportingManagerName = ui.item.label;
                }
                else {
                  $("#rptMgr").val('');
                  $("#rptMgr").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#rptMgr").val(ui.item.value);
                  $("#rptMgr").val(ui.item.value);
                  self.ReportingManager = ui.item.value;
                  self.ReportingManagerName = ui.item.label;
                }
                else {
                  $("#rptMgr").val('');
                  $("#rptMgr").val('');
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

  getEmployeeApp($event) {
    let text = $('#appMgr').val();

    if (text.length > 3) {
      let self = this;
      if ($event.timeStamp - this.lastReportingkeydown1 > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#appMgr').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#appMgr").val(ui.item.value);
                  $("#appMgr").val(ui.item.value);
                  self.ApprovingManager = ui.item.value;
                  self.ApprovingManagerName = ui.item.label;
                }
                else {
                  $("#appMgr").val('');
                  $("#appMgr").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#appMgr").val(ui.item.value);
                  $("#appMgr").val(ui.item.value);
                  self.ApprovingManager = ui.item.value;
                  self.ApprovingManagerName = ui.item.label;
                }
                else {
                  $("#appMgr").val('');
                  $("#appMgr").val('');
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

  pageSize: any = 10;
  pageNo: any = 1;
  gotoPage(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.pageNo = 1;
    this.getData();
  }

  getEmployeeList() {
    if (this.EmployeeData.baseLocation == null || this.EmployeeData.baseLocation == '') {
      toastr.error("Please select Plant..!");
      return;
    }
    else if (this.EmployeeData.paygroup == null || this.EmployeeData.paygroup == '') {
      toastr.error("Please select Paygroup..!");
      return;
    }
    else {
      this.getData();
    }
  }

  getData() {
    this.isLoading = true;
    swal({
      text: "Getting data...Please wait..!",
      timer: 1000,
      icon: "info",
      buttons: [false,false]
    });
    var filterModel: any = {};
    filterModel.baseLocation = this.EmployeeData.baseLocation;
    filterModel.payGroup = this.EmployeeData.paygroup;
    filterModel.category = this.EmployeeData.Category;
    filterModel.department = this.EmployeeData.department;
    filterModel.subDepartment = this.EmployeeData.subDepartment;
    filterModel.reportingGroup = this.EmployeeData.reportingGroup;
    filterModel.firstName = this.EmployeeData.employeeSearchType;
    filterModel.employeeId = this.EmployeeData.empNoName;
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    filterModel.export = false;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LIST, filterModel).then((data: any) => {
      this.list = data.table1;
      this.EmployeeData.totalCount = data.table[0].totalCount;
      this.EmployeeData.totalPages = data.table[0].totalPages;
      if (data.table1.length == '0') {
        swal({
          title: "Error",
          text: "No Data Found..!",
          icon: "error",
          dangerMode: false,
          buttons: [true, true]
        });
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  view: boolean = false;
  isEdit: boolean = false;
  getEmpDetails(isedit: boolean, data: any, value: string) {
    this.view = false;
    this.isEdit = isedit;
    this.getHolidayType(data);
    this.getCalendarType(data);
    if (this.isEdit) {
      this.id = data.id;
      this.EmployeeId = data.employee_Id;
      this.FirstName = data.firstName;
      this.MiddleName = data.middleName;
      this.LastName = data.lastName;
      this.Email = data.email;
      this.Location = data.plant;
      this.PayGroup = data.payGroup;
      this.EmpCategory = data.employeeCategory;
      this.Designation = data.designation;
      this.Department = data.fk_Department;
      this.CreatedDate = data.createdDate
      this.Role = data.roleId;
      this.SubDepartment = data.subDepartmentId;
      this.ShiftCode = data.shiftCode;
      this.HolidayType = data.holiday;
      this.TypeCodeH = data.typeCodeH;
      this.TypeNameH = data.typeNameH;
      this.WorkingCalendar = data.calendarType;
      this.TypeCodeC = data.typeCodeC;
      this.TypeNameC = data.typeNameC;
      this.SwipeCount = data.swipeCount;
      this.ReportingGrp = data.reportingGroupId;
      this.ReportingManager = data.employeeIdR;
      this.ApprovingManager = data.employeeIdApp;
      this.ReportingManagerName = data.employeeIdR + ' - ' + data.firstNameR + ' ' + data.middleNameR + ' ' + data.lastNameR;
      this.ApprovingManagerName = data.employeeIdApp + ' - ' + data.firstNameApp + ' ' + data.middleNameApp + ' ' + data.lastNameApp;
      this.JoiningDate = data.dateOfJoining;
      this.Mediclaim = data.mediclaimNo;
      this.Mediclaimexpirydate = data.mediclaimExpiry;
      this.EligibilityType = data.mediclaimorESI;
      this.imgUrl = data.imgUrl;
      this.WorkType = data.workType;
      this.PunchingDevices = [];
      let punchingDeviceIDs: string[] = data.punchingDevices.split(',');
      this.DevBioReport.forEach(element => {
        if (punchingDeviceIDs.find(x => x == element.deviceId)) {
          this.PunchingDevices.push(element);
          console.log(this.PunchingDevices);
        }
      });

    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }

  currentUser: AuthData;
  isLoadingPop: boolean = false;
  UpdateData() {
    this.errMsg = "";
    if (this.HolidayType == 'Additional' && (this.TypeCodeH == '' || this.TypeCodeH == null ||
      this.TypeNameH == '' || this.TypeNameH == null)) {
      toastr.error("Please select TypeCode/TypeName..!");
      return;
    }
    else if (this.WorkingCalendar == 'Additional' && (this.TypeCodeC == '' || this.TypeCodeC == null ||
      this.TypeNameH == '' || this.TypeNameH == null)) {
      toastr.error("Please select TypeCode/TypeName..!");
      return;
    }
    if (this.ReportingManager == null || this.ReportingManager == '') {
      toastr.error("Please enter Reporting Manager..!");
      return;
    }
    if (this.ApprovingManager == null || this.ApprovingManager == '') {
      toastr.error("Please enter HOD number..!");
      return;
    }
    if (this.EligibilityType == 'M' && (this.Mediclaimexpirydate == null || this.Mediclaimexpirydate == ''
         || this.Mediclaim == null || this.Mediclaim == '')) {
      toastr.error("Please enter Mediclaim Details..!");
      return;
    }
    let EmployeeData = {} as EmployeeData;
    EmployeeData.firstName = this.FirstName;
    EmployeeData.middleName = this.MiddleName;
    EmployeeData.lastName = this.LastName;
    EmployeeData.fkDepartment = this.Department;
    EmployeeData.subDepartment = this.SubDepartment;
    EmployeeData.reportingGroup = this.ReportingGrp;
    EmployeeData.shiftCode = this.ShiftCode;
    EmployeeData.fkReportingManager = this.ReportingManager;
    EmployeeData.fkManager = this.ApprovingManager;
    EmployeeData.dateofJoining = this.JoiningDate;

    if (this.HolidayType == 'Regular') {
      EmployeeData.holiday = this.HolidayType;
      EmployeeData.typeCodeH = '';
      EmployeeData.typeNameH = '';
    }
    else {
      EmployeeData.holiday = this.HolidayType;
      EmployeeData.typeCodeH = this.TypeCodeH;
      EmployeeData.typeNameH = this.TypeNameH;
    }

    if (this.WorkingCalendar == 'Regular') {
      EmployeeData.calendar = this.WorkingCalendar;
      EmployeeData.typeCodeC = '';
      EmployeeData.typeNameC = '';
    }
    else {
      EmployeeData.calendar = this.WorkingCalendar;
      EmployeeData.typeCodeC = this.TypeCodeC;
      EmployeeData.typeNameC = this.TypeNameC;
    }

    EmployeeData.swipeCount = this.SwipeCount;
    EmployeeData.modifiedBy = this.currentUser.employeeId;
    EmployeeData.employeeId = this.EmployeeId;

    EmployeeData.modifiedBy = this.currentUser.employeeId;
    EmployeeData.baseLocation = this.Location;
    EmployeeData.email - this.Email;
    EmployeeData.mediclaimNo = this.Mediclaim;
    EmployeeData.mediclaimExpiry = this.Mediclaimexpirydate;
    EmployeeData.mediclaimorESI = this.EligibilityType;
    EmployeeData.workType = this.WorkType;
    EmployeeData.punchingDevice = this.PunchingDevices.map(x => x.deviceId).join(',');

    let connection = this.httpService.LApost(APIURLS.BR_UPDATE_EMP_DATA, EmployeeData);
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output.typ == 'S') {
        swal({
          title: "Message",
          text: "Employlee details updated Successfully ..!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.ClearFilter();

      }
      else {
        swal({
          title: "Message",
          text: output.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      jQuery("#myModal").modal('hide');

    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request...';
    });
  }

  getEmployeeDataBasedonId(empId) {
    this.isLoading = true;
    this.httpService.LAgetByParam(APIURLS.GET_EMPLOYEES_DATA_BASEDON_ID, empId).then((emp) => {
      if (emp) {
        this.profileItem = emp[0];
        this.getDependantDetails(empId);
      }
    }).catch((error) => {
      this.isLoading = false;
    })
  }

  getDependantDetails(empId) {
    this.isLoading = true;
    this.httpService.LAgetByParam(APIURLS.GET_DEPENDANT_DETAILS, empId).then((emp) => {
      if (emp) {
        this.DependentList = emp;
        this.UpdatedDependentList = emp;
      }
    }).catch((error) => {
      this.isLoading = false;
    })
  }
  count = 0;
  onAddLineClick() {
    this.isLoading = true;
    this.DependentList.push({});
    //console.log(this.departmentList);
    this.count++;
    this.isLoading = false;
  }

  RemoveLine(no) {
    this.isLoading = true;
    this.DependentList.splice(no, 1);
    // console.log(this.departmentList);
    this.count--;
    this.isLoading = false;
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  validateAge(details) {
    this.isLoading = true;
    if (details.relationship == null || details.relationship == undefined) {
      toastr.error("Please select relationship..");
      return;
    }
    if (details.dependantAge < 0) {
      details.dependantAge = null;
      toastr.error("Age should be greater than 0.");
      return;
    }
    if (details.dependantAge > 100) {
      details.dependantAge = null;
      toastr.error("Age should not be greater than 100.");
      return;
    }
    if (details.relationship == 'Mother' && details.dependantAge < 18) {
      details.dependantAge = null;
      toastr.error("Age should be greater than 18.");
      return;
    }
    if (details.relationship == 'Father' && details.dependantAge < 18) {
      details.dependantAge = null;
      toastr.error("Age should be greater than 18.");
      return;
    }
    if (details.relationship == 'Husband' && details.dependantAge < 18) {
      details.dependantAge = null;
      toastr.error("Age should be greater than 18.");
      return;
    }
    if (details.relationship == 'Wife' && details.dependantAge < 18) {
      details.dependantAge = null;
      toastr.error("Age should be greater than 18.");
      return;
    }
    this.isLoading = false;
  }

  validateRelation(val) {

    if ((val.relationship == 'Mother' || val.relationship == 'Father' || val.relationship == 'Husband'
      || val.relationship == 'Wife') && val.id != undefined) {
      let temp = this.DependentList.find(x => x.relationship == val.relationship);
      if (temp) {
        if (val.id) {
          let rel = this.UpdatedDependentList.find(x => x.id == val.id);
          val.relationship = val.relationship;
          swal({
            title: "Message",
            text: "Already an entry exists with the given relation ..!",
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
          return;
        }
        else {
          swal({
            title: "Message",
            text: "Already an entry exists with the given relation ..!",
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
          return;
        }

      }

    }
  }

  updateData() {
    this.isLoading = true;
    let connection: any;
    if ((this.DependentList.filter(x => x.relationship == 'Mother').length) > 1) {
      this.isLoading = false;
      toastr.error("Only one entry allowed for the relation 'Mother'.");
      return;
    }
    else if ((this.DependentList.filter(x => x.relationship == 'Father').length) > 1) {
      this.isLoading = false;
      toastr.error("Only one entry allowed for the relation 'Father'.");
      return;
    }
    else if ((this.DependentList.filter(x => x.relationship == 'Husband').length) > 1) {
      this.isLoading = false;
      toastr.error("Only one entry allowed for the relation 'Husband'.");
      return;
    }
    else if ((this.DependentList.filter(x => x.relationship == 'Wife').length) > 1) {
      this.isLoading = false;
      toastr.error("Only one entry allowed for the relation 'Wife'.");
      return;
    }
    else {
      this.DependentList.forEach(element => {
        let dependant = {} as DependantDetails;
        dependant.id = element.id ? element.id : 0;
        dependant.dependantAge = element.dependantAge;
        dependant.dependantName = element.dependantName;
        dependant.relationship = element.relationship;
        dependant.expiryDate = this.getDateFormate(this.profileItem.mediclaimExpiry);
        dependant.mediclaimNo = this.profileItem.mediclaimNo;
        dependant.employeeId = this.currentUser.employeeId;
        dependant.updatedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.UPDATE_DEPENDANT_DETAILS, dependant.id, dependant);

      });
      connection.then((data) => {
        if (data == 200 || data.id > 0) {
          swal({
            title: "Message",
            text: "Details updated Successfully ..!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
        }
        this.isLoading = false;
        this.getDependantDetails(this.currentUser.employeeId);
      }).catch((error) => {
        this.isLoading = false;
        toastr.error("Error updating details..");
      })
    }
  }

  deleteDependentDetails(id) {
    let connection: any;
    connection = this.httpService.LAdelete(APIURLS.UPDATE_DEPENDANT_DETAILS, id);
    connection.then((data) => {
      if (data == 200 || data.id > 0) {
        swal({
          title: "Message",
          text: "Details Deleted Successfully..!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      this.getDependantDetails(this.currentUser.employeeId);
    }).catch((error) => {
      toastr.error("Error deleting details..");
    })
  }


  ContactDetails: any[] = [];
  getcontactdetails() {
    this.isLoading = true;
    this.httpService.LAget(APIURLS.GET_CONTACT_DETAILS).then((emp) => {
      if (emp) {
        this.ContactDetails = emp;
      }
    }).catch((error) => {
      this.isLoading = false;
      this.ContactDetails = [];
    })
  }

  reset() {
    console.log(this.myInputVariable.nativeElement.files);

    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }

    console.log(this.myInputVariable.nativeElement.files);
  }


  isSubmitting: boolean;
  errorlist: string;
  uploadExcel() {
    if (this.file == undefined || this.file == null) {
      swal({
        title: "Message",
        text: "Please attach a excel file for updating details of the employees..!",
        icon: "error",
        dangerMode: false,
        buttons: [false, true]
      });
      return;
    }
    let connection: any;
    this.isSubmitting = true;
    this.isLoading = true;
    this.formData = new FormData();
    this.formData.append('file', this.file);
    connection = this.httpService.LAExcelUpload(APIURLS.BR_UPLOAD_EXCELFILE, this.currentUser.employeeId, this.formData);
    connection.then((data: any) => {
      if (data) {
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
          return;
        }
        if (data[0].typ == 'E') {
          this.isLoading = false;
          this.errorlist = "Employee Data not Updated, please find the below error list: " + '\n';
          data.forEach(element => {
            this.errorlist = this.errorlist + '\n' + '\n' + element.message;
          });
          swal({
            title: "ERROR",
            text: this.errorlist,
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
          this.reset();
          return;
        }
        else {
          this.isLoading = false;
          swal({
            title: "Message",
            text: "Excel data uploaded and updated successfully...!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
        }
        this.reset();
      }

    }).catch(error => {
      this.isLoading = false;
      this.errMsgPop = 'Error uploading file ..';
    });
  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

  exportEmployeeList() {
    if (this.EmployeeData.baseLocation == null || this.EmployeeData.baseLocation == '') {
      toastr.error("Please select Plant..!");
      return;
    }
    else if (this.EmployeeData.paygroup == null || this.EmployeeData.paygroup == '') {
      toastr.error("Please select Paygroup..!");
      return;
    }
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};
    filterModel.baseLocation = this.EmployeeData.baseLocation;
    filterModel.payGroup = this.EmployeeData.paygroup;
    filterModel.category = this.EmployeeData.Category;
    filterModel.department = this.EmployeeData.department;
    filterModel.subDepartment = this.EmployeeData.subDepartment;
    filterModel.reportingGroup = this.EmployeeData.reportingGroup;
    filterModel.export = true;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LIST, filterModel).then((data: any) => {
      if (data) {
        var list = data.table;
        swal({
          title: "Message",
          text: "Are you sure to export?",
          icon: "warning",
          dangerMode: false,
          buttons: [true, true]
        }).then((willsave) => {
          if (willsave) {
            const title = 'Employee Data Report';
            const header = ["Sl No", "Employee No", "First Name", "Middle Name", "Last Name", "Plant", "PayGroup", "Staff Category", "Reporting Group",
              "Department", "Designation", "Role", "Sub Department", "Date of Joining", "Email Id",
              "Reporting Manager No", "Reporting Manager Name", "Approving Manager No", "Approving Manager Name",
              "Active", "Created Date", "Shift Code", "Swipe Count", "Work Type", "Biometric Punching Device",
              "Mediclaim/ESIC", "Mediclaim No", "Mediclaim Expiry Date", "Holiday Type", "Holiday Type Code", "Holiday Type Name",
              "Calendar Type", "Calendar Type Code", "Calendar Type Name",]

            var exportList = [];
            var ts: any = {};
            let index = 0;
            list.forEach(element => {
              index = index + 1;
              ts = {};
              ts.slNo = index;
              ts.employeeId = +element.employee_Id;
              ts.firstName = element.firstName
              ts.middleName = element.middleName
              ts.lastName = element.lastName;
              ts.plant = element.plant + ' - ' + element.plantName;
              ts.payGroup = element.payGroup;
              ts.employeeCategory = element.employeeCategory;
              ts.reportingGroupLT = element.reportingGroupLT;
              ts.department = element.department;
              ts.designation = element.designation;
              ts.role = element.roleId;
              ts.subDepartmentName = element.subDeparmtentName;
              ts.joiningDate = this.setFormatedDate(element.dateOfJoining);
              ts.email = element.email;
              ts.employeeIdR = +element.employeeIdR;
              ts.reportingmanagerName = element.firstNameR + ' ' + element.middleNameR + ' ' + element.lastNameR;
              ts.employeeIdApp = +element.employeeIdApp;
              ts.apprivingmanagerName = element.firstNameApp + ' ' + element.middleNameApp + ' ' + element.lastNameApp;
              if (element.IsActive == '0') {
                ts.IsActive = 'No';
              }
              else {
                ts.IsActive = 'Yes';
              }
              ts.createdDate = this.setFormatedDate(element.createdDate);
              ts.shiftCode = element.shiftCode;
              ts.swipeCount = element.swipeCount;
              ts.workTypeName = element.workTypeName;
              ts.punchingDevices = element.punchingDevices;
              if (element.mediclaimorESI == 'E') {
                ts.mediclaimorESI = 'ESIC';
              }
              else {
                ts.mediclaimorESI = 'Mediclaim';
              }
              ts.mediclaimNo = element.mediclaimNo;
              ts.mediclaimExpiry = this.getFormatedDate(element.mediclaimExpiry);
              ts.holiday = element.holiday;
              ts.typeCodeH = element.typeCodeH;
              ts.typeNameH = element.typeNameH;
              ts.calendar = element.calendarType;
              ts.typeCodeC = element.typeCodeC;
              ts.typeNameC = element.typeNameC;
              exportList.push(ts);
            });
            const data1 = exportList;
            //Create workbook and worksheet
            var OrganisationName = "MICRO LABS LIMITED";
            const data = exportList;
            let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
            let worksheet = workbook.addWorksheet('Employee Data Rules Report');
            //Add Row and formatting
            var head = worksheet.addRow([OrganisationName]);
            head.font = { size: 16, bold: true }
            head.alignment = { horizontal: 'center' }
            let titleRow = worksheet.addRow([title]);
            titleRow.font = { size: 16, bold: true }
            titleRow.alignment = { horizontal: 'center' }
            worksheet.mergeCells('A1:AH1');
            worksheet.mergeCells('A2:AH2');
            worksheet.addRow("");
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

            for (let x1 of data1) {
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
            workbook.xlsx.writeBuffer().then((data1) => {
              let blob = new Blob([data1], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              fs.saveAs(blob, 'EmployeeDataReport.xlsx');
            })
          }
        })
      }
    }).catch(error => {
      this.isLoading = false;
    });
  }

}
