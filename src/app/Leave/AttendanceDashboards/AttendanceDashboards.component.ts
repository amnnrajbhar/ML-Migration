import { Component, OnInit } from '@angular/core';
import { Lightbox } from 'ngx-lightbox';
declare var jQuery: any;
import { Chart } from 'chart.js';
import { ChartDataLabels } from 'chartjs-plugin-datalabels';
import * as _ from "lodash";
import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Router } from '@angular/router';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { MOMENT } from 'angular-calendar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ExcelService } from '../../shared/excel-service';
declare var $: any;
import swal from 'sweetalert';
import * as moment from 'moment';
//import { debug } from 'util';


@Component({
  selector: 'app-AttendanceDashboards',
  templateUrl: './AttendanceDashboards.component.html',
  styleUrls: ['./AttendanceDashboards.component.css']
})
export class AttendanceDashboardsComponent implements OnInit {
  todayDate = new Date();
  today: Date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
  tableWidget: any;
  errMsg: string;
  location: any;
  usrid: number;
  path: string;
  locationList: any[] = [];
  errMsgPop = '';
  myDate = new Date();
  from_date: any;
  to_date: any;
  //today report filter
  fromDate = '';
  toDate = '';
  empData: AuthData;
  isLoading: boolean;

  filterPlant: string = null;
  filterPaygroup: string = null;
  filterCategory: string = null;
  filterDepartment: string = null;
  filterSubdept: string = null;
  filterReporting: string = null;
  StaffCategoryList: any[] = [];
  PayGroupList: any[] = [];
  ReportingGroupList: any[] = [];
  subdepartmentList: any[] = [];
  departmentList: any[] = [];

  public chartPlugins = [ChartDataLabels];
  employeeList: any[] = [];
  typeofCount: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private excelService: ExcelService, private http: HttpClient,) {
  }


  ngAfterViewInit() {
    // this.initVisitorDatatable();
    this.initDatatable();


  }


  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // console.log('Access:'+chkaccess);
    if (chkaccess == true) {
      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      // console.log(authData);
      this.usrid = authData.uid;
      this.empData = authData;
      let today = new Date();
      // console.log(this.today);
      let d = new Date();

      this.getPlantsassigned(this.empData.fkEmpId);
      this.getDepartList();
      this.getReportingGroupList();
      this.getempCatList();
      this.getpayGroupList();


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

  ShiftDashboardData: any[] = [];
  TotavailableEmpCount: number = 0;
  TotpresentEmployees: number = 0;
  TotemployeesOnOD: number = 0;
  TotemployeesOnLeave: number = 0;
  TotabsentEmployees: number = 0;

  filterReport() {
    if (this.filterPlant == null) {
      toastr.error("Please enter Plant...!");
      return;
    }
    if (this.filterPaygroup == null) {
      toastr.error("Please enter PayGroup...!");
      return;
    }
    this.isLoading = true;
    let td = new Date();
    this.TotavailableEmpCount = 0;
    this.TotpresentEmployees = 0;
    this.TotemployeesOnOD = 0;
    this.TotemployeesOnLeave = 0;
    this.TotabsentEmployees = 0;
    let formatedFROMdate: string;
    let formatedTOdate: string;
    let filterModel: any = {};

    if (this.from_date == '' || this.from_date == null) {
      formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + ("00" + td.getDate()).slice(-2);
      this.from_date = new Date(td.getFullYear(), td.getMonth(), td.getDate());
    }
    else {
      let fd = new Date(this.from_date);
      formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
        ("00" + fd.getDate()).slice(-2);
      this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

    }
    filterModel.plant = this.locationList.find(x => x.code == this.filterPlant).fkPlantId;
    filterModel.payGroup = this.filterPaygroup;
    filterModel.department = this.filterDepartment;
    filterModel.reporting = this.filterReporting;
    filterModel.empCat = this.filterCategory;
    filterModel.date = formatedFROMdate;
    this.httpService.LApost(APIURLS.GET_SHIFT_DASBOARD_DATE, filterModel).then((data: any) => {
      if (data.length > 0 && +data[0].availableEmpCount > 0) {
        this.ShiftDashboardData = data;
        this.TotavailableEmpCount = +data[0].availableEmpCount;
        this.TotpresentEmployees = +data[0].presentEmployees;
        this.TotemployeesOnOD = +data[0].employeesOnOD;
        this.TotemployeesOnLeave = +data[0].employeesOnLeave;
        this.TotabsentEmployees = +data[0].absentEmployees;
        // this.ShiftDashboardData.forEach(element => {
        //   this.TotavailableEmpCount = this.TotavailableEmpCount + +element.availableEmpCount;
        //   this.TotpresentEmployees = this.TotpresentEmployees + +element.presentEmployees;
        //   this.TotemployeesOnOD = this.TotemployeesOnOD + +element.employeesOnOD;
        //   this.TotemployeesOnLeave = this.TotemployeesOnLeave + +element.employeesOnLeave;
        //   this.TotabsentEmployees = this.TotabsentEmployees + +element.absentEmployees;
        // });
      }
      else {
        swal({
          title: "Message",
          text: "No Data Found...!",
          icon: "error",
          dangerMode: true,
          buttons: [false, true]
        }).then((willDelete) => {
          if (willDelete) {
            this.isLoading = false;
            this.ShiftDashboardData = [];
          }
        });
      }
      this.isLoading = false;
      this.reInitDatatable();

    }).catch(error => {
      this.isLoading = false;
      this.ShiftDashboardData = [];
    });

  }
  ClearData() {
    this.from_date = null;
    this.filterPlant = null;
    this.filterPaygroup = null;
    this.filterCategory = null;
    this.filterReporting = null;
    this.ShiftDashboardData = [];
    this.TotavailableEmpCount = 0;
    this.TotpresentEmployees = 0;
    this.TotemployeesOnOD = 0;
    this.TotemployeesOnLeave = 0;
    this.TotabsentEmployees = 0;
  }

  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        let temp = this.locationList.find(x => x.fkPlantId == this.empData.baselocation);
        this.filterPlant = temp.code;
        // this.filterReport();

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
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
    // debugger;
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

  getLocationList() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.locationList = data;
        //this.location=this.locationList.find(x=>x.id==this.empData.baselocation).code;
        //this.filterReport();
      }

    }).catch(error => {
      // this.isLoading = false;
      this.locationList = [];
    });
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
  getTimeFormat(time) {
    return moment('1970-01-01 ' + time);
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

  ShowPresent: boolean = false;
  ShowAvailable: boolean = false;
  ShowOD: boolean = false;
  ShowLeave: boolean = false;
  ShowAbsent: boolean = false;
  getEmpData(ch) {
    this.typeofCount = ch;
    if (this.TotavailableEmpCount == 0) {
      swal({
        title: "Message",
        text: "Filter the attendance data for the location by providing the above filters..!",
        icon: "error",
        dangerMode: false,
        buttons: [false, true],
      });
    }
    else {
      if (ch == 'pres') {
        this.employeeList = [];
        this.ShowPresent = true;
        this.ShowAvailable = false;
        this.ShowOD = false;
        this.ShowLeave = false;
        this.ShowAbsent = false;
      }
      else if (ch == 'abs') {
        this.employeeList = [];
        this.ShowPresent = false;
        this.ShowAvailable = false;
        this.ShowOD = false;
        this.ShowLeave = false;
        this.ShowAbsent = true;
      }
      else if (ch == 'avail') {
        this.employeeList = [];
        this.ShowPresent = false;
        this.ShowAvailable = true;
        this.ShowOD = false;
        this.ShowLeave = false;
        this.ShowAbsent = false;
      }
      else if (ch == 'od') {
        this.employeeList = [];
        this.ShowPresent = false;
        this.ShowAvailable = false;
        this.ShowOD = true;
        this.ShowLeave = false;
        this.ShowAbsent = false;
      }
      else if (ch == 'leave') {
        this.employeeList = [];
        this.ShowPresent = false;
        this.ShowAvailable = false;
        this.ShowOD = false;
        this.ShowLeave = true;
        this.ShowAbsent = false;
      }
      let filterModel: any = {};
      filterModel.plant = this.locationList.find(x => x.code == this.filterPlant).fkPlantId;
      filterModel.payGroup = this.filterPaygroup;
      filterModel.empCat = this.filterCategory;
      filterModel.department = this.filterDepartment;
      filterModel.reportingGrp = this.filterReporting;
      filterModel.date = this.getFormatedDate(this.from_date);
      filterModel.typeCount = this.typeofCount;
      this.httpService.LApost(APIURLS.BR_GET_EMP_PUNCH_DETAILS, filterModel).then((data: any) => {
        if (data.length > 0) {
          this.employeeList = data;
        }
      }).catch(error => {
        this.employeeList = [];
      });
      jQuery("#myModal").modal('show');
    }
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
}
