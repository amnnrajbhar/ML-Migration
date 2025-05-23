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
import { WorkingCalendar } from './WorkingCalendar.model';
declare var jQuery: any;
declare var toastr: any;
import { Subject } from 'rxjs';
declare var jQuery: any;
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
import { MonthView, GetMonthViewArgs } from 'calendar-utils';
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
    selector: 'app-WorkingCalendar',
    templateUrl: './WorkingCalendar.component.html',
    styleUrls: ['./WorkingCalendar.component.css'],
    providers: [{
        provide: CalendarDateFormatter,
        useClass: SchedulerDateFormatter
    }]
})
export class WorkingCalendarComponent implements OnInit {
    searchTerm: FormControl = new FormControl();
    @ViewChild(NgForm) desigForm: NgForm;
    @ViewChild('native') native: ElementRef;
    public filteredItems = [];


    CalendarView = CalendarView;
    events: CalendarSchedulerEvent[];
    public tableWidget: any;
    selParentId: any;
    WorkingCalendarList: any[] = [];
    holidayTypesList: any[] = [];
    AddTypeCodeNameList: any[] = [];
    WorkingCalendarList1: any = [] = [];
    desgList: any;
    parentList: any[];
    selParentRole: any = [];
    selParentRoleList: any;
    requiredField: boolean = true;
    WorkingCalendar: WorkingCalendar = new WorkingCalendar();
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
    oldWorkingCalendar: WorkingCalendar = new WorkingCalendar();// For aduit log
    auditType: string;// set ActionTypes: Create,Update,Delete
    aduitpurpose: string;
    calYear: string;
    filterLocation: string = null;
    filterPayGroup: string = null;
    filterCategory: string = null;
    filterAction: string = null;
    filterTypeCode: string = null;
    filterTypeName: string = null;
    filterMonth: string = null;
    filterEmployee: string = null;
    filterType: string = null;
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
    days: string = null;
    months: string = null;
    holidayType: string = null;
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
        private appService: AppComponent, private http: HttpClient,
 private excelService: ExcelService) {
        this.locale = locale;

        this.dayModifier = ((day: SchedulerViewDay): void => {
            day.cssClass = this.isDateValid(day.date) ? '' : 'cal-disabled';
        }).bind(this);
        this.hourModifier = ((hour: SchedulerViewHour): void => {
            hour.cssClass = this.isDateValid(hour.date) ? '' : 'cal-disabled';
        }).bind(this);

        this.segmentModifier = ((segment: SchedulerViewHourSegment): void => {
            segment.isDisabled = !this.isDateValid(segment.date);
        }).bind(this);

        this.eventModifier = ((event: CalendarSchedulerEvent): void => {
            event.isDisabled = !this.isDateValid(event.start);
        }).bind(this);

        // this.dateOrViewChanged();
    }

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
            this.filterLocation = this.currentUser.baselocation.toString();
            this.calYear = new Date().getFullYear().toString();
            this.getPlantsassigned(this.currentUser.fkEmpId);
            this.getHolidaysList();
            
            this.getEmployeeCategoryList();
            this.getLocationMaster();
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

    getAdditionalHoliday() {
        this.errMsg = "";
        this.isLoading = true;
        let filterModel: any = {};
        filterModel.location = this.filterLocation;
        filterModel.payGroup = this.filterPayGroup;
        this.httpService.LApost(APIURLS.BR_GET_ADDITIONAL_HOLIDAYTYPES, filterModel).then((data: any) => {
            if (data.length > 0) {
                this.holidayTypesList = data;
            }
            else {
                //alert("No Calendar data present for the selected plant..!!");
                swal({
                    title: "Message",
                    text: "No Additonal holidays created for mentioned Plant and Paygroup. Please create one.!!",
                    icon: "error",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.events = [];
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.holidayTypesList = [];
        });
    }

    typeCodeEditCreateFlag: string = null;
    CheckAdditionalCalendar() {
        let flag: string = null;
        if (this.filterType == 'Additional' && this.filterHolidayTypeCode == 'REGULAR') {
            swal({
                title: "Message",
                text: "Do you want to create a new Calendar or edit an existing one??",
                icon: "warning",
                dangerMode: false,
                buttons: {
                    create: {
                        text: 'Create',
                        value: 'Create',
                        className: "sweet-alert",
                    }, edit: {
                        text: "Edit",
                        value: "Edit"
                    }, cancel: true
                }
            }).then(value => {
                if (value == "Edit" || value == "Create") {
                    this.typeCodeEditCreateFlag = value;
                    flag = value;
                } else {
                    this.typeCodeEditCreateFlag = null;
                    this.filterHolidayTypeCode = null;
                }
            });

            if (flag == "Create") {
                return;
            }
        }

        this.errMsg = "";
        this.isLoading = true;
        let filterModel: any = {};
        filterModel.location = this.filterLocation;
        filterModel.payGroup = this.filterPayGroup;
        filterModel.empCat = this.filterCategory;
        filterModel.type = this.filterType;
        filterModel.holidayTypeCode = this.filterHolidayTypeCode;

        this.httpService.LApost(APIURLS.BR_GET_ADDITIONAL_CALENDAR_TYPE, filterModel).then((data: any) => {
            if (data.length > 0) {
                this.AddTypeCodeNameList = data;
                this.typeCodeEditCreateFlag = "Edit";
            } else {
                this.typeCodeEditCreateFlag = "Create";
            }
            // else {
            //     swal({
            //         title: "Message",
            //         text: "No Additonal Calendar created for selected Holiday Type. Please create one.!!",
            //         icon: "error",
            //         dangerMode: false,
            //         buttons: [false, true]
            //     });
            //     this.events = [];
            // }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.AddTypeCodeNameList = [];
        });
    }


    dynamicArray: any = [];
    newDynamic: any = {};
    rowcount: number = 0;
    addRows(index) {
        this.rowcount = this.rowcount + 1;
        this.newDynamic = { id: this.rowcount, location: null, day: "", date: null, occasion: "", stored: "0" };
        this.dynamicArray.push(this.newDynamic);
    }
    removeRows(item) {
        if (this.dynamicArray.length > 1) {
            const index = this.dynamicArray.indexOf(item);
            this.dynamicArray.splice(index, 1);
        }
    }

    OnClickGo() {
        if (this.calYear == null) {
            toastr.error("Please enter calendar year..!");
            return;
        }
        else if (this.filterLocation == null) {
            toastr.error("Please select Plant..!");
            return;
        }
        else if (this.filterPayGroup == '') {
            toastr.error("Please select PayGroup..!");
            return;
        }
        else if (this.filterCategory == null) {
            toastr.error("Please select Emp Category..!");
            return;
        }
        else if (this.filterType == '') {
            toastr.error("Please Select Calendar Type..!");
            return;
        }
        else if (this.filterHolidayTypeCode != '' && this.filterTypeCode == null && this.filterType == 'Additional') {
            toastr.error("Please Select/Enter Additional Type Code..!");
            return;
        }
        else if (this.filterType == 'Additional' && this.filterHolidayTypeCode == '') {
            toastr.error("Please Select/Enter Holiday Type..!");
            return;
        }
        else if (this.filterHolidayTypeCode == '' && this.filterTypeName == null && this.filterType == 'Additional') {
            toastr.error("Please Select/Enter Additional Type Name..!");
            return;
        }
        else {
            let date = new Date();
            this.filterMonth = this.MonthList.find(x => x.id == date.getMonth() + 1).name;
            this.getWorkingCalendarList(this.filterMonth);
        }

    }

    getWorkingCalendarList(month) {
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
                this.WorkingCalendarList = data;
                let mon = this.MonthList.find(x => x.name == this.filterMonth).id;
                let date = "'" + mon + "/" + new Date().getDay() + "/" + this.calYear + "'";
                let d = new Date(date);
                this.viewDate = d;
                this.viewStart = startOfMonth(this.viewDate);
                this.viewEnd = endOfMonth(this.viewDate);
                this.getEvents(this.WorkingCalendarList);
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
            this.WorkingCalendarList = [];
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
        this.filterTypeCode = null;
        this.filterTypeName = null;
        this.filterHolidayTypeCode = null;

        this.typeCodeEditCreateFlag = null;
    }

    EmpCalendarList: any[] = [];
    getEmpCalendarList() {
        this.errMsg = "";
        this.isLoading = true;
        // this.WorkingCalendarList = [];
        let searchTerm = this.calYear + ',' + this.filterEmployee + ',' + this.filterMonth;
        this.httpService.LAgetByParam(APIURLS.BR_GET_EMP_WORKING_CALENDAR, searchTerm).then((data: any) => {
            if (data.length > 0) {
                this.EmpCalendarList = data;
                let mon = this.MonthList.find(x => x.name == this.filterMonth).id;
                let date = "'" + mon + "/" + new Date().getDay() + "/" + this.calYear + "'";
                let d = new Date(date);
                this.viewDate = d;
                this.viewStart = startOfMonth(this.viewDate);
                this.viewEnd = endOfMonth(this.viewDate);
                this.getEvents(this.EmpCalendarList);
            }
            else {
                //alert("No Calendar data present for the selected employee..!!");
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
            this.EmpCalendarList = [];
        });
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

    onAddWorkingCalendar(isEdit: boolean, data: WorkingCalendar) {
        this.desigForm.form.markAsPristine();
        this.desigForm.form.markAsUntouched();
        this.desigForm.form.updateValueAndValidity();

        this.notFirst = true;
        this.isEdit = isEdit;
        this.errMsgPop = "";
        this.isLoadingPop = true;
        this.WorkingCalendar = new WorkingCalendar();
        this.aduitpurpose = '';
        this.dynamicArray = [];
        this.oldWorkingCalendar = new WorkingCalendar();
        if (this.isEdit) {
            Object.assign(this.oldWorkingCalendar, data);
            this.WorkingCalendar = Object.assign({}, data);
            let holiday = this.WorkingCalendarList.filter(x => x.location == this.WorkingCalendar.location && x.year == this.WorkingCalendar.cyear);
            let index = 0;
            holiday.forEach(element => {
                let newDynamic = { id: this.rowcount, location: null, day: "", date: null, occasion: "" };
                newDynamic.id = element.id;
                newDynamic.location = element.location;
                newDynamic.date = element.date;
                newDynamic.day = element.dayName;
                newDynamic.occasion = element.holidayName
                this.dynamicArray.push(newDynamic);
            });
        }
        else {
            this.WorkingCalendar = new WorkingCalendar();
            this.newDynamic = { id: this.rowcount, location: null, day: "", date: null, occasion: "", stored: "0" };
            this.dynamicArray.push(this.newDynamic);
        }
        this.isLoadingPop = false;
        jQuery("#myModal").modal('show');
    }

    onSaveWorkingCalendar() {
        this.errMsg = "";
        this.errMsgPop = "";
        this.isLoadingPop = true;
        let connection: any;
        let filterModel: any = {};
        filterModel.monName = this.filterMonth;
        filterModel.monValue = this.filterWOType;
        filterModel.location = this.filterLocation;
        filterModel.empCat = this.filterCategory;
        filterModel.payGroup = this.filterPayGroup;
        filterModel.cyear = this.calYear;
        filterModel.date = this.getDateFormate(this.wodate);
        filterModel.type = this.filterType;
        filterModel.typeCode = this.filterTypeCode;
        filterModel.typeName = this.filterTypeName;
        filterModel.holidayTypeCode = this.filterHolidayTypeCode;
        connection = this.httpService.LApost(APIURLS.BR_UPDATE_PLANT_WORKING_CALENDAR, filterModel);

        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data.length > 0) {
                jQuery("#myModal").modal('hide');
                //this.errMsgPop1 = 'Working Calendar Updated Successfully!';
                swal({
                    title: "Message",
                    text: "Working Calendar Updated Successfully!",
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.OnClickGo();
            }
            else
                this.errMsgPop = data;

        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving calendar..';
        });
    }

    CreateCalendar() {
        let filterModel: any = {};
        filterModel.empCat = this.filterCategory;
        filterModel.payGroup = this.filterPayGroup;
        filterModel.location = this.filterLocation;
        filterModel.cyear = this.calYear;
        filterModel.frequency = this.frequency;
        filterModel.days = this.days;
        filterModel.month = this.months;
        filterModel.holiday = this.holidayType;
        filterModel.holidayTypeCode = this.filterHolidayTypeCode;
        filterModel.type = this.filterType;
        filterModel.typeCode = this.filterTypeCode;
        filterModel.typeName = this.filterTypeName;
        filterModel.modifiedBy = this.currentUser.employeeId;
        let connection = this.httpService.LApost(APIURLS.BR_CREATE_EMP_WORKING_CALENDAR, filterModel);

        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data.result) {
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = 'Working Calendar Updated Successfully!';
                //jQuery("#saveModal").modal('show');
                let art = data.result;
                swal({
                    title: "Message",
                    text: art.message,
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true],
                });
                this.clearFilter();
            }
            else
                this.errMsgPop = data;

        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving calendar..';
        });
    }


    getDateFormate(date: any): string {
        let d1 = new Date(date);
        return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
            ("00" + d1.getDate()).slice(-2);
    }

    getYear(date: any): number {
        let d1 = new Date(date);
        return d1.getFullYear();
    }

    getDay(date: any): number {
        let d1 = new Date(date);
        return d1.getDay();
    }
    getmonth(date: any): number {
        let d1 = new Date(date);
        return d1.getMonth();
    }

    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
        let temp = this.HolidaysList.find(x => this.getDateFormate(x.date) == this.getDateFormate(date))
        if (date < new Date()) {
            swal({
                title: "Message",
                text: "Cannot modify for the past dates",
                icon: "error",
                dangerMode: false,
                buttons: [false, true],
            })
            return;
        }
        else {
            this.isLoadingPop = false;
            this.filterWOType = null;
            this.wodate = null;
            this.wodate = date;
            jQuery("#myModal").modal('show');
        }
    }
    changeView(view: CalendarView): void {
        this.view = view;
        // this.dateOrViewChanged();
    }

    setView(view: CalendarView) {
        this.view = view;
    }

    dateOrViewChanged(date): void {
        let date1 = new Date();
        this.filterMonth = this.MonthList.find(x => x.id == date.getMonth() + 1).name;
        this.getWorkingCalendarList(this.filterMonth);
    }

    minDate: Date = new Date();
    maxDate: Date = endOfDay(addMonths(new Date(), 12));
    private isDateValid(date: Date): boolean {
        return /*isToday(date) ||*/ date >= this.minDate && date <= this.maxDate;
    }

    PrevdateOrViewChanged(date) {
        let date1 = new Date();
        this.filterMonth = this.MonthList.find(x => x.id == date.getMonth() + 1).name;
        this.getWorkingCalendarList(this.filterMonth);
    }


    dayHeaderClicked(): void {
    }

    hourClicked(): void {
    }


    eventClicked(action: string, event: CalendarSchedulerEvent): void {

        this.selectedEvent = event;
        if (this.selectedEvent.start < new Date()) {
            this.pastEvent = true;
        }
        else
            this.pastEvent = false;

        this.errMsgPop = '';
        this.errMsgPop1 = '';
        this.isEdit = true;
        let connection: any;
        connection = this.httpService.getById(APIURLS.BR_MASTER_VISITOR_POST_API, +event.id);

        connection.then((data: any) => {
            if (data == 200 || data.id > 0) {
                jQuery("#myModal").modal('show');
            }
        }).catch(() => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving Calendar data..';
        });
    }

    getEvents(list) {

        // this.appService.getEvents(this.employeeId, this.actions)
        // .then((events: CalendarSchedulerEvent[]) => this.events = events);
        let events = [];
        let list1 = list.filter(x => x.month != 'W')
        for (let cal of list1) {
            let mon = this.MonthList.find(x => x.name == this.filterMonth).id;
            let date = "'" + mon + "/" + cal.day + "/" + cal.year + "'";
            let d = new Date(date);
            let ed = new Date(date);
            let temp = this.HolidaysList.find(x => this.getDateFormate(x.date) == this.getDateFormate(d));
            let name = temp ? temp.holidayName : '';


            events.push(
                <CalendarSchedulerEvent>{
                    // id: cal.id,
                    start: d,//startOfHour(d),
                    //end: ed,//addHours(d, hours),
                    title: cal.month == 'SS' ? 'Second Saturday' : cal.month == 'TS' ? 'Third Saturday' : cal.month == 'SH' ? 'Special Holiday' : cal.month == 'WO' ? 'Week Off' : cal.month == 'PH' ? name : '',//+'<br><br>'+cal.purpose!=null?cal.purpose:'',
                    content: name,
                    // color: { primary: '#E0E0E0', secondary: '#EEEEEE' },
                    color: cal.month == 'PH' ? colors.green : cal.month == 'WO' ? colors.red : cal.month == 'SS' ? colors.cyan : cal.month == 'SH' ? colors.orange :
                        cal.month == 'TS' ? colors.blue : '',
                    actions: this.actions,
                    // status: 'ok' as CalendarSchedulerEventStatus,
                    isClickable: true,
                    isDisabled: false,
                    draggable: true,

                    resizable: {
                        beforeStart: true,
                        afterEnd: true
                    }
                });


        }
        this.events = events;
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
        else if (this.filterLocation == null) {
            toastr.error("Please select Location..!");
            return;
        }
        else if (this.filterPayGroup == '') {
            alert("Please select PayGroup..!")
            toastr.error("Please select PayGroup..!");
            return;
        }
        else if (this.filterCategory == null) {
            toastr.error("Please enter Emp Category..!");
            return;
        }
        else if (this.filterType == '') {
            toastr.error("Please select type..!");
            return;
        }
        else if (this.filterType == 'Additional' && this.filterTypeCode == null) {
            toastr.error("Please Enter Additional Type Code..!");
            return;
        }
        else if (this.filterType == 'Additional' && this.filterTypeName == null) {
            toastr.error("Please Enter Additional Type Name..!");
            return;
        }
        else {
            var filterModel: any = {};
            filterModel.cyear = this.calYear;
            filterModel.location = this.filterLocation;
            filterModel.payGroup = this.filterPayGroup;
            filterModel.empCat = this.filterCategory;
            filterModel.type = this.filterType;
            filterModel.typeCode = this.filterTypeCode;
            filterModel.typeName = this.filterTypeName;
            this.httpService.LApost(APIURLS.BR_GET_WORKING_CALENDAR, filterModel).then((data: any) => {
                if (data) {
                    this.WorkingCalendarList1 = data;
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
                this.WorkingCalendarList1 = [];
            });
        }
    }

    ExportExcel() {
        this.exportList = [];
        let index = 0;
        this.WorkingCalendarList1.forEach(item => {
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

        this.excelService.exportAsExcelFileForLA(this.exportList, 'Working_Calendar');
    }
}
