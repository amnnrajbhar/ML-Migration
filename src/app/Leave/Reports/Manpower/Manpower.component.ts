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
    selector: 'app-Manpower',
    templateUrl: './Manpower.component.html',
    styleUrls: ['./Manpower.component.css']
})
export class ManpowerComponent implements OnInit {
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
        this.ViewType = null;
        this.Type = null;
        this.fromDate = null;
        this.toDate = null;
        this.filterSubDepartment = null;
        this.CalenderYear = new Date().getFullYear().toString();
        this.lossofPay = [];
        this.Lop = 0;
        this.ApprovedLeaves = [];
        this.Leave = 0;
        this.LeavesPendingForApproval = [];
        this.PendingLeave = 0;
        this.ApprovedOnduty = [];
        this.Onduty = 0;
        this.OndutyPendingforApproval = [];
        this.PendingOnduty = 0;
        this.absentEmployees = [];
        this.Absent = 0;
        this.LatePunch = [];
        this.LatepunchCount = 0;
        this.Present = 0;
        this.leaveIntimationemployees = [];
        this.ODIntimationemployees = [];
        this.LeaveIntimation = 0;
        this.ODIntimation = 0;
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
        // var headers = new Headers();
        // headers.append("Accept", 'application/json');
        // headers.append('Content-Type', 'application/json');
        // let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
        // headers.append("Authorization", "Bearer " + authData.token);
        // let options = new RequestOptions({ headers: headers });
        // return options;
         let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
    }

    ApprovedLeaves: any[] = [];
    LeavesPendingForApproval: any[] = [];
    ApprovedOnduty: any[] = [];
    OndutyPendingforApproval: any[] = [];
    LatePunch: any[] = [];
    absentEmployees: any[] = [];
    leaveIntimationemployees: any[] = [];
    ODIntimationemployees: any[] = [];
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
    ODIntimation: number = 0;
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
            swal({
                text: "Please wait..Report is displaying..!",
                timer: 9000,
                icon: "info",
                dangerMode: false,
                buttons: [false,false],
            });
            let filterModel: any = {};
            filterModel.plant = this.filterPlant;
            filterModel.payGroup = this.filterPayGroup;
            filterModel.staffCat = this.filterStaffcat;
            filterModel.reporting = this.filterReportingGroup;
            filterModel.dept = this.filterDepartment;
            filterModel.date = this.getDateFormate(this.fromDate);
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
                    this.leaveIntimationemployees = data.leaveIntimation;
                    this.ODIntimationemployees = data.ODIntimation;
                    this.LeaveIntimation = data.leaveIntimation ? data.leaveIntimation.length : 0;
                    this.ODIntimation = data.ODIntimation ? data.ODIntimation.length : 0;
                }
                this.isLoading = false;
            }).catch((error) => {
                this.isLoading = false;

            });
        }
    }


    DailyReportexportToExcel() {

        this.excelService.exporttableAsExcelFile(document.getElementById('DailyReport'), 'DailyReport');
    }


    sendMail() {
        if (this.email == null || this.email == '') {
            toastr.error("Please enter email id to send mail..");
            return;
        }
        else if (!this.email.includes("microlabs.in")) {
            toastr.error("Please enter valid email id to send mail..");
            return;
        }
        else {
            let dt = new Date();
            let date = dt.getFullYear() + '_' + dt.getMonth() + '_' + dt.getDay();
            var items = document.getElementById('DailyReport');
            const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(items);

            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
            const blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
            this.upload(blob, "DailyAttendanceReport.xlsx");
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


    cmpimg: any;
    printreport() {
        //this.lineclearancelist1=data;
        var printContents = document.getElementById('pdf').innerHTML;
        var OrganisationName = "MICRO LABS LIMITED, " + this.filterPlant;
        var pipe = new DatePipe('en-US');
        var ReportHeader = "Daily Attendance Detail Report for the Date: " + this.setFormatedDateTime(this.fromDate);

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
        this.https.get('../../assets/dist/img/micrologo.png', {
            responseType: 'blob'
        })
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
