import { AuthData } from '../../../auth/auth.model'
import { APIURLS } from '../../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../../app.component';
import { HttpService } from '../../../shared/http-service';
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



@Component({
    selector: 'app-LOPMonthlyReport',
    templateUrl: './LOPMonthlyReport.component.html',
    styleUrls: ['./LOPMonthlyReport.component.css']
})
export class LOPMonthlyReportComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm, { static: false }) userForm: NgForm;


@ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  @ViewChild('table', { static: false }) table: ElementRef;

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
    fromDate: any = null;
    toDate: any = null;
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
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

    LOPMonthlyReportAuditReport: any[] = [];
  GetLOPMonthlyReportAuditReport() {
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
          this.LOPMonthlyReportAuditReport = data;
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
    cmpimg: any;

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
