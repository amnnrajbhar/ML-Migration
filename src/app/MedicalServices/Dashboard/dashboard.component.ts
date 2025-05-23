import { Component, OnInit } from '@angular/core';
import { Lightbox } from 'ngx-lightbox';
declare var jQuery: any;
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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ExcelService } from '../../shared/excel-service';
declare var $: any;
import swal from 'sweetalert';
import * as moment from 'moment';
//import { debug } from 'util';
import { MediServiceRequest } from '../MediServiceRequest/MediServiceRequest.model';
import { DatePipe } from '@angular/common';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    currentUser: AuthData;
    current: string;
    newVisitorsMonth: any;
    todayDate = new Date();
    today: Date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
    chart1: any;
    errMsg: string;
    EmployeeList1: any;
    location: any;
    usrid: number;
    path: string;
    employeeId: any;
    additionalVisitorItem: any[] = [[]];
    additionalVisitors: any[] = [[]]
    visitorTypeList: any[] = [[]];
    purposeList: any[] = [[]];
    locationList: any[] = [[]];
    errMsgPop = '';
    //[x: string]: any;
    // [x: string]: any;
    public tableWidget;
    public tableWidget1;
    chart: any;
    visitorsList: any[] = [[]];
    totalnewvisits: number = 0;
    totalrevisits: number = 0;
    totalvisits: number = 0;
    singlevisits: number = 0;
    visitorsInside: any;
    myDate = new Date();
    todaysvisitorsList: any = [];
    roleId: number;
    //today report filter
    fromDate = '';
    toDate = '';
    visitorsList1: any = [];
    visitorsListAllCount = 0;
    private _albums = [];
    j = 1;
    empData: AuthData;
    pendingCheckouts = 0;
    visitorsFilteredList1: any[] = [];
    visitorsFilteredList: any[] = [];
    todayVisitorsFilteredList1: any[] = [];
    todayVisitorsFilteredList: any[] = [];
    datas: any = [];
    misseddatas: any[] = [];
    label: any[] = [];
    
    from_date: any;
    to_date: any;
    filterstatus: any = null;

    dayOfWeek: any[] = [
        { id: 0, name: 'Sun' },
        { id: 1, name: 'Mon' },
        { id: 2, name: 'Tue' },
        { id: 3, name: 'Wed' },
        { id: 4, name: 'Thu' },
        { id: 5, name: 'Fri' },
        { id: 6, name: 'Sat' },
    ]

    statuslist: any[] = [
        { id: 0, name: 'Submitted' },
        { id: 1, name: 'In Process' },
        { id: 2, name: 'Rejected' },
        { id: 3, name: 'Completed' },
    ];

    otherVisitorsTotal = 0;
    isLoading: boolean = false;
    isGoLoading: boolean = false;
    checkedInCount: any = 0;
    todaysVisitorCount: any = 0;
    exportList: any[];
    newVisitors: any[] = [];
    submitted = 0;
    inprocess = 0;
    rejected: any = 0;
    completed = 0;
    directcheckedInCount = 0;
    public chartPlugins = [ChartDataLabels];
    
    MediServiceRequestMasterList: MediServiceRequest[] = [];
    MediServiceRequestDisplayList: MediServiceRequest[] = [];

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private datePipe: DatePipe, private excelService: ExcelService) { }

    private initDatatable(): void {
        let exampleId: any = jQuery('#userTable');
        this.tableWidget = exampleId.DataTable({
            "order": []
        });
    }

    private reInitDatatable(): void {
        // debugger;
        if (this.tableWidget) {
            this.tableWidget.destroy();
            this.tableWidget = null;
        }
        setTimeout(() => this.initDatatable(), 0)
    }

    ngOnInit() {
        this.path = this.router.url;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.current = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        // console.log('Access:'+chkaccess);
        if (chkaccess == true) {
            let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
            // console.log(authData);

            this.roleId = authData.roleId;
            this.usrid = authData.uid;
            this.employeeId = authData.userName;
            this.empData = authData;
            // console.log(this.today);
            let d = new Date();
            this.label.push(this.dayOfWeek[d.getDay()].name);

            for (let i = 1; i < 7; i++) {
                d.setDate(d.getDate() - 1);
                this.label.push(this.dayOfWeek[d.getDay()].name);
            }

            this.label.reverse();
            this.getLocationList();
            this.filterReport();
            // this.getVisitorTypeList();
            // this.getPurposeList();
            //this.getEmployee();

            // this.getAdditionalVisitors();
            // this.filterReport();

        } else {
            this.router.navigate(["/unauthorized"]);
        }
    }

    ngAfterViewInit() {
        this.initDatatable();
    }

    toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }

    getFormatedDate(d) {
        let fd = new Date(d);
        let formateddate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
            ("00" + fd.getDate()).slice(-2);
        // return new Date(fd.getFullYear(),fd.getMonth(),fd.getDate());
        return formateddate;
    }

    filterReport() {
        // this.submitted = 0;
        // this.inprocess = 0;
        // this.completed = 0;
        // this.rejected = 0;
        this.isLoading = true;
        this.isGoLoading = true;
        let td = new Date();
        let formatedFROMdate: string;
        let formatedTOdate: string;
        var filterModel: any = {};

        if (this.from_date == '' || this.from_date == null) {
            formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
            this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
        }
        else {
            let fd = new Date(this.from_date);
            formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
                ("00" + fd.getDate()).slice(-2);
            this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());
        }

        if (this.to_date == '' || this.to_date == null) {
            formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
                ("00" + td.getDate()).slice(-2);
            this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
        } else {
            let ed = new Date(this.to_date);
            formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
                ("00" + ed.getDate()).slice(-2);
            this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);
        }

        filterModel.status = this.filterstatus;
        filterModel.FromDate = this.getFormatedDateTime(this.from_date);
        filterModel.ToDate = this.getFormatedDateTime(this.to_date);

        let params: string = this.getFormatedDateTime(this.from_date) + "," + this.getFormatedDateTime(this.to_date) + "," + this.filterstatus;

        this.httpService.getByParam(APIURLS.BR_MEDISERVICEREQUEST_GETMSREQUESTSFORDASHBOARD, params).then((data: MediServiceRequest[]) => {
            if (data) {
                this.MediServiceRequestMasterList = data.sort((a, b) => {
                    if (a.id < b.id) { return 1; }
                    else if (a.id > b.id) { return -1; }
                    return 0;
                });
                this.MediServiceRequestDisplayList = this.MediServiceRequestMasterList;

                this.submitted = this.MediServiceRequestMasterList.filter(x => x.approveType == 'Submitted').length;
                this.inprocess = this.MediServiceRequestMasterList.filter(x => x.approveType == 'In Process').length;
                this.completed = this.MediServiceRequestMasterList.filter(x => x.approveType == 'Completed').length;
                this.rejected = this.MediServiceRequestMasterList.filter(x => x.approveType == 'Rejected').length;
            }

            this.reInitDatatable();
            this.isLoading = false;
            this.isGoLoading = false;
        }).catch(error => {
            swal("Error", "Error fetching Medical Service requests. Please check the console for error details.", "error");
            console.log(error);

            this.MediServiceRequestMasterList = [];
            this.MediServiceRequestDisplayList = [];

            this.isLoading = false;
            this.isGoLoading = false;
        });
    }

    isRequestPendingWithUser(item: MediServiceRequest): boolean {
        if (item.pendingApprover == this.currentUser.employeeId || item.pendingApproverName == this.currentUser.fullName) {
            return true;
        }

        return false;
    }

    onClickCard(status: string) {
        // console.log(status);
        
        this.MediServiceRequestDisplayList = this.MediServiceRequestMasterList.filter(x => x.approveType == status);
        console.log(this.MediServiceRequestDisplayList);
        
        this.reInitDatatable();
    }

    onDateChange() {
        // console.log(this.filterstatus);
        // this.filterstatus = null;
    }

    getFormatedDateTime(date: any) {
        let dt = new Date(date);
        let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
            ("00" + dt.getDate()).slice(-2) + ' ' +
            ("00" + dt.getHours()).slice(-2) + ":" +
            ("00" + dt.getMinutes()).slice(-2) + ":" +
            ("00" + dt.getSeconds()).slice(-2);

        return formateddate;
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
        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
            // this.isLoading = false;
            if (data.length > 0) {
                this.locationList = data;
            }
            //this.getVisitorTypeList();

        }).catch(error => {
            // this.isLoading = false;
            this.locationList = [];
        });
    }

    ClearFilter() {
        this.filterstatus = null;
        // this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
        this.from_date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), 1);
        this.to_date = this.today;
    }

    exportAsXLSX(): void {
        this.exportList = [];
        //var templist=this.assessList.length;
        // debugger;
        for (var i = 0; i <= this.MediServiceRequestDisplayList.length - 1; i++) {
            var expListItem = {
                SlNo: (i + 1),
                Location: this.MediServiceRequestDisplayList[i].location,
                'Requested No': (this.MediServiceRequestDisplayList[i].requestNo),
                'Requested By': (this.MediServiceRequestDisplayList[i].createdBy),
                'Requested Date': this.datePipe.transform(this.MediServiceRequestDisplayList[i].requestDate, 'dd/MM/yyyy'),
                'Division': this.MediServiceRequestDisplayList[i].division,
                'Category': this.MediServiceRequestDisplayList[i].category,
                'Brand': this.MediServiceRequestDisplayList[i].brand,
                Product: this.MediServiceRequestDisplayList[i].product,
                'Details': this.MediServiceRequestDisplayList[i].details,
                'Final Medical Code': this.MediServiceRequestDisplayList[i].finalDocNo,
                'Medical Code Created Date': this.datePipe.transform(this.MediServiceRequestDisplayList[i].finalDocDate, 'dd/MM/yyyy'),
                'Pending Approver': this.MediServiceRequestDisplayList[i].pendingApprover,
                'Last Approver': this.MediServiceRequestDisplayList[i].lastApprover,
                Status: this.MediServiceRequestDisplayList[i].approveType,
            };

            this.exportList.push(expListItem);
            // console.log('export list'+this.exportList);
        }

        //this.exportList = {  }
        this.excelService.exportAsExcelFile(this.exportList, 'MediService_Report');
    }

    getHeader(): any {
        let headers = new HttpHeaders()
            .set("Accept", "application/json")
            .set("Content-Type", "application/json");

        let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        headers = headers.set("Authorization", "Bearer " + authData.token);

        let options = { headers: headers };

        return options;
    }

    getTimeFormat(time) {
        return moment('1970-01-01 ' + time);
    }
}
