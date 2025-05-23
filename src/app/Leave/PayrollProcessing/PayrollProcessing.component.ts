import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
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
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatAccordion } from '@angular/material/expansion';
import * as moment from 'moment';
import { ProcessingLog } from './ProcessingLog.model';
import { ExcelService } from '../../shared/excel-service';
import { filter } from 'rxjs-compat/operator/filter';

declare var ActiveXObject: (type: string) => void;



@Component({
  selector: 'app-PayrollProcessing',
  templateUrl: './PayrollProcessing.component.html',
  styleUrls: ['./PayrollProcessing.component.css']
})
export class PayrollProcessingComponent implements OnInit {
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

  CalenderYear: string = '';
  CalYear: any;
  OnDutyType: string = null;
  StartDate: string = null;
  EndDate: string = null;
  AttendanceProcessingList: any[] = [];
  Starttime: any;
  EndTime: any;
  fromDate: any;
  toDate: any;
  fromTime: any;
  toTime: any;
  Plant: any = null;
  SwipeType: any = null;
  EmployeeNo: any = null;
  filterPayGroup: string = null;
  filterDepartment: string = null;
  filterSubDepartment: string = null;
  filterReportingGroup: string = null;
  filterCategory: string = null;
  filterType: string = null;
  salarayProcess: boolean = false;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
 private route: ActivatedRoute, private excelService: ExcelService) { }

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


  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }
  currentUser: AuthData;
  date: any;

  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.baseLocation = this.currentUser.baselocation;
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.date = today;
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      //  this.getLocationMaster();
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getpayGroupList();
      this.getempCatList();
      this.getDepartList();
      this.getsubDeptList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
    this.initDatatable();
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
  payGroupList1: any[] = [];
  getpaygroupbasedonplant() {
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
  ClearData() {
    this.fromDate = null;
    this.toDate = null;
    this.Plant = null;
    this.EndTime = null;
    this.filterPayGroup = null;
    this.filterCategory = null;
    this.filterDepartment = null;
    this.filterSubDepartment = null;
  }


  ProcessAttendance() {
    if (this.filterPayGroup == null) {
      toastr.error("Please select Paygroup..!");
      return;
    }
    else if (this.fromDate == null) {
      toastr.error("Please select start date.");
      return;
    }
    else if (this.toDate == null) {
      toastr.error("Please select end date.");
      return;
    }
    else {
      this.isLoading = true;
      swal({
        title: "Message",
        text: "Attendance Processing was Started. Screen will close automatically ..!",
        timer: 2000,
        icon: "info",
        dangerMode: false,
        buttons: [false, false]
      });
      let filterModel: any = {};
      filterModel.plant = this.Plant;
      filterModel.fromDate = this.getDateFormate(this.fromDate);
      filterModel.toDate = this.getDateFormate(this.toDate);
      filterModel.attendanceType = '1';
      let connection = this.httpService.LApost(APIURLS.PROCESS_EMP_PLANT_ATTENDANCE, filterModel)
      connection.then((data) => {
       
        if (data) {
          if (data.type == 'E') {
            swal({
              title: "Message",
              text: data.message,
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            });
            this.isLoading = false;
          }
          else {
            swal({
              title: "Message",
              text: "Attendance Processing has been completed. Please check..!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true],
            });
            this.isLoading = false;
            this.filterPayGroup = '';
            this.filterCategory = '';
            this.filterType = null;
          }
        }

      }).catch((error) => {
        this.isLoadingPop = false;
      });
    }

  }
  isValid: boolean = false;
  validatedForm: boolean = true;
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

  ProcessingHistoryData: any[] = [];
  ShowProcessingHistory() {
    if (this.Plant == null) {
      toastr.error("Please select plant");
      return;
    }
    if (this.filterPayGroup == null) {
      toastr.error("Please select Paygroup");
      return;
    }
    if (this.filterCategory == null) {
      toastr.error("Please select Employee Category");
      return;
    }
    else if (this.fromDate == null) {
      toastr.error("Please select from date");
      return;
    }
    else if (this.toDate == null) {
      toastr.error("Please select to date");
      return;
    }
    else {
      let filterModel: any = {};
      filterModel.location = this.Plant;
      filterModel.department = this.filterDepartment;
      filterModel.payGroup = this.filterPayGroup;
      filterModel.category = this.filterCategory;
      filterModel.reporting = '10';
      filterModel.fromDate = this.getDateFormate(this.fromDate);
      filterModel.toDate = this.getDateFormate(this.toDate);
      filterModel.category = this.filterCategory;
      this.httpService.LApost(APIURLS.GET_ATTENDANCE_FOR_PAYROLL, filterModel).then((data) => {
        if (data.length > 0) {
          this.ProcessingHistoryData = data;
        }
        jQuery("#myModal").modal('show');
        this.reInitDatatable();
      }).catch((error) => {
        this.ProcessingHistoryData = [];
      });
    }
  }
  exportList: any[] = [];
  export() {
    if (this.ProcessingHistoryData.length <= 0) {
      toastr.error("No data to export");
      return;
    }
    else {
      this.exportList = [];
      let index = 0;
      this.ProcessingHistoryData.forEach(item => {
        index = index + 1;
        let exportItem = {
          "SNo": index,
          "Employee Id": item.employeeId,
          "Employee Name": item.empName,
          "Designation": item.designation,
          "Department": item.department,
          "Division": item.division,
          "Number of Working Days ":item.workingDays,
          "Number of Days Worked":item.workedDays,
          "No of Days LOP": item.lopdays,
          "Sick Leaves Taken":item.sickLeavesTaken,
          "Casual Leaves Taken":item.casualLeavesTaken,
          "Privilege Leaves Taken":item.privilageLeavesTaken,
          "Sick Leave Balance":item.slBalance,
          "Casual Leave Balance":item.clBalance,
          "Privilege Leave Balance":item.plBalance


        }
        this.exportList.push(exportItem);
      });
      let dt = new Date();
      let date = dt.getFullYear() + '_' + dt.getMonth() + '_' + dt.getDay();
      this.excelService.exportAsExcelFile(this.exportList, date + '_' + 'AttendanceReport');
    }
  }
  InsertProcessingLog() {
    let processlog = {} as ProcessingLog;
    processlog.empId = this.currentUser.employeeId;
    processlog.empName = this.currentUser.fullName;
    processlog.empLoc = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
    processlog.processParameter = this.filterPayGroup;
    processlog.processLocation = this.Plant;
    processlog.startDate = this.fromDate;
    processlog.endDate = this.toDate;
    processlog.processStatus = 'In Progress';
    let connection = this.httpService.LApost(APIURLS.INSERT_PROCESSING_LOG, processlog);

  }

  EmployeeList: any[] = [];
  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.EmployeeList.length; i++) {
      this.EmployeeList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.EmployeeList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.EmployeeList.length; i++) {
      if (this.EmployeeList[i].isSelected)
        this.checkedlist.push(this.EmployeeList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  GetEmployees() {
    let filterModel: any = {};
    filterModel.baseLocation = this.Plant;
    filterModel.fkDepartment = this.filterDepartment;
    filterModel.fkPayroll = this.filterPayGroup;
    filterModel.fkCompetancy = this.filterCategory;
    // filterModel.fromDate = this.getDateFormate(this.fromDate);
    //  filterModel.toDate = this.getDateFormate(this.toDate);
    //filterModel.empCode = this.employeeId;
    let connection = this.httpService.LApost(APIURLS.GET_EMPLOYEES_FOR_ATTENDANCE, filterModel)
    connection.then((data) => {
      if (data.length > 0) {
        this.EmployeeList = data;
      }
      this.reInitDatatable();
      this.isLoadingPop = false;
    }).catch((error) => {
      this.isLoadingPop = false;
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


}
