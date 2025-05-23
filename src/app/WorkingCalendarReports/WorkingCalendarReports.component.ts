import { Component, OnInit, ViewChild, Inject, LOCALE_ID, ElementRef } from '@angular/core';
import { HttpService } from '../shared/http-service';
import { APIURLS } from '../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../auth/auth.model';
import swal from 'sweetalert';
import { AuditLogChange } from '../masters/auditlogchange.model';
import { AuditLog } from '../masters/auditlog.model';
import * as _ from "lodash";
import { WorkingCalendarReports } from './WorkingCalendarReports.model';
declare var jQuery: any;
declare var toastr: any;
import { Subject } from 'rxjs';
declare var jQuery: any;
import { HttpClient, HttpHeaders } from '@angular/common/http';


import {
    startOfMonth,
    endOfMonth,
    isSameMonth,
    isSameDay,
    subWeeks,
    addWeeks
} from 'date-fns';
import {
    endOfDay,
    addMonths,
} from 'date-fns';
import {
    SchedulerViewDay,
    SchedulerViewHour,
    SchedulerViewHourSegment,
    CalendarSchedulerEvent,
    CalendarSchedulerEventAction,
    startOfPeriod,
    endOfPeriod,
    addPeriod,
    subPeriod,
    SchedulerDateFormatter,
    SchedulerEventTimesChangedEvent,
    CalendarSchedulerEventStatus
} from 'angular-calendar-scheduler';
import {
    CalendarView,
    CalendarDateFormatter,
    DateAdapter,
    CalendarEvent,
    CalendarMonthViewDay,
    CalendarUtils
} from 'angular-calendar';
import {  MonthView, GetMonthViewArgs } from 'calendar-utils';
import { colors } from '../shared/colors';
import { ExcelService } from '../shared/excel-service';
import { ThrowStmt } from '@angular/compiler';
import { error } from 'console';

export class MyCalendarUtils extends CalendarUtils {
    getMonthView(args: GetMonthViewArgs): MonthView {
        args.viewStart = subWeeks(startOfMonth(args.viewDate), 1);
        args.viewEnd = addWeeks(endOfMonth(args.viewDate), 1);
        return super.getMonthView(args);
    }
}


@Component({
    selector: 'app-WorkingCalendarReports',
    templateUrl: './WorkingCalendarReports.component.html',
    styleUrls: ['./WorkingCalendarReports.component.css'],
    providers: [{
        provide: CalendarDateFormatter,
        useClass: SchedulerDateFormatter
    }]
})
export class WorkingCalendarReportsComponent implements OnInit {
    searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm, { static: false }) desigForm: NgForm;

  @ViewChild('native', { static: false }) native: ElementRef;

    public filteredItems = [];


    CalendarView = CalendarView;
    events: CalendarSchedulerEvent[];
    public tableWidget: any;
    selParentId: any;
    WorkingCalendarReportsList: any[] = [];
    holidayTypesList: any[] = [];
    AddTypeCodeNameList: any[] = [];
    WorkingCalendarReportsList1: any = [] = [];
    desgList: any;
    parentList: any[];
    selParentRole: any = [];
    selParentRoleList: any;
    requiredField: boolean = true;
    WorkingCalendarReports: WorkingCalendarReports = new WorkingCalendarReports();
    EmployeeCalendar: any = {}
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    isLoadPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    path: string = '';
    notFirst = true;
    currentUser = {} as AuthData;
    oldWorkingCalendarReports: WorkingCalendarReports = new WorkingCalendarReports();// For aduit log
    auditType: string;// set ActionTypes: Create,Update,Delete
    aduitpurpose: string;
    calYear: string;

    filterLocation: string = null;
    filterPayGroup: string = '';
    filterCategory: string = null;
    filterAction: string = null;
    filterTypeCode: string = '';
    filterTypeName: string = '';


    filterMonth: string = null;
    filterEmployee: string = null;
    filterType: string = '';
    filterHolidayTypeCode: string = null;
    view: CalendarView = CalendarView.Month;
    viewDate: Date = new Date();
    refresh: Subject<any> = new Subject();
    locale: string = 'en';
    weekStartsOn: number = 1;
    startsWithToday: boolean = true;
    activeDayIsOpen: boolean = true;
    excludeDays: number[] = []; // [0];
    viewStart = startOfMonth(this.viewDate);
    viewEnd = endOfMonth(this.viewDate);
    dayModifier: Function;
    hourModifier: Function;
    segmentModifier: Function;
    eventModifier: Function;
    selectedEvent: CalendarSchedulerEvent;
    pastEvent: boolean;
    actions: CalendarSchedulerEventAction[];
    MonthList: any[] = [
        { id: 1, name: 'Jan' },
        { id: 2, name: 'Feb' },
        { id: 3, name: 'Mar' },
        { id: 4, name: 'Apr' },
        { id: 5, name: 'May' },
        { id: 6, name: 'Jun' },
        { id: 7, name: 'Jul' },
        { id: 8, name: 'Aug' },
        { id: 9, name: 'Sep' },
        { id: 10, name: 'Oct' },
        { id: 11, name: 'Nov' },
        { id: 12, name: 'Dec' }
    ];
    filterWOType: string = null;
    wodate: any;
    frequency: any;
    days: any;
    months: any;
    holidayType: any;
    showCalendar: boolean = false;

    locationList11: any[] = [[]];
    getLocationMaster() {
        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
            if (data.length > 0) {
                this.locationList11 = data;
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.locationList11.sort((a, b) => { return collator.compare(a.code, b.code) });
            }
        }).catch(error => {
            this.isLoading = false;
            this.locationList11 = [];
        });
    }

    constructor(@Inject(LOCALE_ID) locale: string, private httpService: HttpService, private router: Router,
        private appService: AppComponent, private http: HttpClient, private excelService: ExcelService) {}

        // this.dateOrViewChanged();
    

    private initDatatable(): void {
        let exampleId: any = jQuery('#categTable');
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

    ngOnInit() {
        this.path = this.router.url;
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        if (chkaccess == true) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.calYear = new Date().getFullYear().toString();
            this.filterLocation = this.currentUser.baselocation.toString();
            this.getPlantsassigned(this.currentUser.fkEmpId);
            this.getHolidaysList();
            this.getEmployeeCategoryList();
            this.getLocationMaster();
            this.getpayGroupList();

            //  this.getWorkingCalendarReportsList();
        }
        else
            this.router.navigate(["/unauthorized"]);
    }
    ngAfterViewInit() {
        this.initDatatable()
    }

    closeSaveModal() {
        jQuery("#myModal").modal('hide');
    }

    getWorkingCalendarReportsList(month) {
        this.errMsg = "";
        this.isLoading = true;
        this.showCalendar = true;
        if (this.filterType == 'Regular') {
            this.filterTypeCode = '';
            this.filterTypeName = '';
            this.filterHolidayTypeCode = '';
        }
        let searchTerm = this.calYear + ',' + this.filterLocation + ',' + this.filterPayGroup + ',' + this.filterCategory + ',' +
            this.filterTypeCode + ',' + this.filterTypeName + ',' + this.filterType + ',' + 
            this.filterHolidayTypeCode + ',' + month;
        this.httpService.LAgetByParam(APIURLS.BR_GET_PLANT_WORKING_CALENDAR, searchTerm).then((data: any) => {
            if (data.length > 0) {
                this.WorkingCalendarReportsList = data;
            }
            else {
                //alert("No Calendar data present for the selected plant..!!");
                swal({
                    title: "Message",
                    text: "No Calendar data present for the selected plant. Please create one.!!",
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.events = [];
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.WorkingCalendarReportsList = [];
        });
    }

    clearFilter() {
        this.filterEmployee = null;
        this.filterMonth = null;
        this.filterLocation = null;
        this.filterType = '';
        this.filterCategory = null;
        this.filterPayGroup = '';
        this.frequency = null;
        this.days = null;
        this.months = null;
        this.holidayType = null;
        this.showCalendar = false;
        this.events = [];
    }

    locationList: any[] = [[]];
    plantList: any[] = [];
    getPlantsassigned(id) {
        this.isLoading = true;
        this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
            if (data) {
                this.locationList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
                this.getpayGroupList();
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
                let temp = this.locationList.find(x => x.fkPlantId == this.filterLocation);
                this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
            }
            //this.reInitDatatable();
        }).catch(error => {
            this.isLoading = false;
            this.payGroupList = [];
        });
    }

    payGroupList1: any[] = [];
    getPaygroupsBasedOnPlant() {
        this.filterPayGroup = null;
        let temp = this.locationList.find(x => x.fkPlantId == this.filterLocation);
        this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
    }

    HolidaysList: any[] = [];
    getHolidaysList() {
        this.errMsg = "";
        //this.isLoading = true;
        // this.HolidaysMasterList = [];
        let searchTerm = this.filterLocation + ',' + this.filterPayGroup + ',' + this.calYear + ',,,';
        this.httpService.LAgetByParam(APIURLS.GET_HOLIDAYS_LIST, searchTerm).then((data: any) => {
            if (data.length > 0) {
                this.HolidaysList = data.filter(x => x.isActive == true).sort((a, b) => {
                    if (a.date > b.date) return 1;
                    if (a.date < b.date) return -1;
                    return 0;
                });
            }
            // this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.HolidaysList = [];
        });
    }

    getLoc(id) {
        let temp = this.locationList.find(x => x.id == id);
        return temp ? temp.code : '';
    }

    employeeCategoryList: any[] = [];
    getEmployeeCategoryList() {
        this.errMsg = "";
        this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
            if (data.length > 0) {
                this.employeeCategoryList = data.sort((a, b) => {
                    if (a.catltxt > b.catltxt) return 1;
                    if (a.catltxt < b.catltxt) return -1;
                    return 0;
                });
            }
        }).catch(error => {
            this.isLoading = false;
            this.employeeCategoryList = [];
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
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
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
    getExportData() {
        if (this.calYear == null) {
            toastr.error("Please enter calendar year..!");
            return;
        }
        else {
            var filterModel: any = {};
            filterModel.cyear = this.calYear;
            filterModel.location = this.filterLocation;
            filterModel.payGroup = this.filterPayGroup;
            filterModel.empCat = this.filterCategory;
            filterModel.type = this.filterType;
            this.httpService.LApost(APIURLS.BR_GET_WORKING_CALENDAR, filterModel).then((data: any) => {
                if (data) {
                    this.WorkingCalendarReportsList1 = data;
                    this.ExportExcel();
                }
                else {
                    swal({
                        title: "Message",
                        text: "No Data Found",
                        icon: "error",
                        dangerMode: false,
                        buttons: [false, true],
                    });
                    return;
                }
                this.isLoading = false;
            }).catch(error => {
                this.isLoading = false;
                this.WorkingCalendarReportsList1 = [];
            });
        }
    }

    ExportExcel() {
        this.exportList = [];
        let index = 0;
        this.WorkingCalendarReportsList1.forEach(item => {
            index = index + 1;
            if (item.type == 'Regular') {
                let exportItemReg = {
                    "SNo": index,
                    "Plant": item.location ? this.locationList11.find(x => x.id == item.location).code : '',
                    "Calendar Type": item.cyear,
                    "Pay Group": item.payGroup ? this.payGroupList.find(x => x.id == item.payGroup).short_desc : '',
                    "Staff category": item.empCat ? this.employeeCategoryList.find(x => x.id == item.empCat).catltxt : '',
                    "Day": item.day,
                    "January": item.jan,
                    "February": item.feb,
                    "March": item.mar,
                    "April": item.apr,
                    "May": item.may,
                    "June": item.jun,
                    "July": item.jul,
                    "August": item.aug,
                    "September": item.sep,
                    "October": item.oct,
                    "November": item.nov,
                    "December": item.dec,
                    "Type": item.type,
                    "Updated By": item.modifiedBy,
                    "Updated On": this.setDateFormate(item.modifiedOn),
                }
                this.exportList.push(exportItemReg);
            }
            else {
                let exportItemAdd = {
                    "SNo": index,
                    "Plant": item.location ? this.locationList11.find(x => x.id == item.location).code : '',
                    "Calendar Type": item.cyear,
                    "Pay Group": item.payGroup ? this.payGroupList.find(x => x.id == item.payGroup).short_desc : '',
                    "Staff category": item.empCat ? this.employeeCategoryList.find(x => x.id == item.empCat).catltxt : '',
                    "Day": item.day,
                    "January": item.jan,
                    "February": item.feb,
                    "March": item.mar,
                    "April": item.apr,
                    "May": item.may,
                    "June": item.jun,
                    "July": item.jul,
                    "August": item.aug,
                    "September": item.sep,
                    "October": item.oct,
                    "November": item.nov,
                    "December": item.dec,
                    "Type": item.type,
                    "Type Code": item.typeCode,
                    "Type Name": item.typeName,
                    "Updated By": item.modifiedBy,
                    "Updated On": this.setDateFormate(item.modifiedOn),
                }
                this.exportList.push(exportItemAdd);
            }
        });

        this.excelService.exportAsExcelFileForLA(this.exportList, 'WorkingCalendar');
    }
}
