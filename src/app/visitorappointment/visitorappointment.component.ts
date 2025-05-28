import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
declare var jQuery: any;
// import * as _ from "lodash";
import swal from 'sweetalert';
declare var $: any;

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
// import {
//   SchedulerViewDay,
//   SchedulerViewHour,
//   SchedulerViewHourSegment,
//   CalendarSchedulerEvent,
//   CalendarSchedulerEventAction,
//   startOfPeriod,
//   endOfPeriod,
//   addPeriod,
//   subPeriod,
//   SchedulerDateFormatter,
//   SchedulerEventTimesChangedEvent,
//   CalendarSchedulerEventStatus
// } from 'angular-calendar-scheduler';
import {
  CalendarView,
  CalendarDateFormatter,
  DateAdapter,
  CalendarEvent,
  CalendarMonthViewDay,
  CalendarUtils
} from 'angular-calendar';
import { AppService } from '../shared/app.service';
import { HttpService } from '../shared/http-service';
import { APIURLS } from '../shared/api-url';

import {  MonthView, GetMonthViewArgs } from 'calendar-utils';
import { Visitor } from './visitor.model';
import { AuthData } from '../auth/auth.model';
import { NgForm } from '@angular/forms';
import { colors } from '../shared/colors';
import { error } from 'console';

export class MyCalendarUtils extends CalendarUtils {
  getMonthView(args: GetMonthViewArgs): MonthView {
    args.viewStart = subWeeks(startOfMonth(args.viewDate), 1);
    args.viewEnd = addWeeks(endOfMonth(args.viewDate), 1);
    return super.getMonthView(args);
  }
}

@Component({
  selector: 'app-visitorappointment',
  templateUrl: './visitorappointment.component.html',
  styleUrls: ['./visitorappointment.component.css'],
  providers: [{
    provide: CalendarDateFormatter,
    //useClass: SchedulerDateFormatter
  }]
})
export class VisitorappointmentComponent implements OnInit {
 @ViewChild(NgForm, { static: false }) calendarForm!: NgForm;

  title = 'Schedule a meeting';
  selectedVisitorType: any;
  selectedPurpose: any;
  visitorTypeList!: any[];
  purposeList!: any[];
  CalendarView = CalendarView;
  errMsgPop1: string = 'saved';
  errMsgPop: string = '';
  visitorName = '';
  visiting = '';
  purpose = '';
  durationDay = '0';
  durationHours = '1';
  durationMinutes = '0';
  mobile = '';
  email = '';
  appDate: Date;
  id = '';
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  locale: string = 'en';
  weekStartsOn: number = 1;
  startsWithToday: boolean = true;
  activeDayIsOpen: boolean = true;
  excludeDays: number[] = []; // [0];
  dayStartHour: number = 6;
  dayEndHour: number = 22;
  visitorsList: any[] = [[]];
  weekendDays: number[] = [];
  viewStart = startOfMonth(this.viewDate);
  viewEnd = endOfMonth(this.viewDate);
  inMonth: boolean = true;
  minDate: Date = new Date();
  maxDate: Date = endOfDay(addMonths(new Date(), 12));
  dayModifier!: Function;
  hourModifier!: Function;
  segmentModifier!: Function;
  eventModifier!: Function;
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;
  start_date = new Date();
  end_date = new Date();
  code: any;

  time = { hour: 13, minute: 30 };
  meridian = true;
  selectedEvent: any;
  otherinformation!: string ;
  companyName!: string ;
  usrid: number = 0;
  employeeItem: any;
  employeeName: any;
  employeeEmail: any;
  pastEvent: boolean = false;
  employeeId: any;
  public employeeLocation: any = '';
  LocationMasterList: any[] = [[]];
  locationId: any;
  selLocationId = [];
  selLoc: any = 0;

  toggleMeridian() {
    this.meridian = !this.meridian;
  }

  //events: CalendarSchedulerEvent[];
  isLoading!: boolean;
  calendarList: any;
  companyItem: any;
  // calendarItem: Visitor = new Visitor(0, '', '', '', '', '', '', '', '', true, '', '', '', '', true, true, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0,'', '', '');
  calendarItem: Visitor = {
    id: 0,
    isCancelled: true,
    isApproved: true,
    isPreShedualled: true,
    numberOfPerson: 0,
    modifiedBy: 0,
    isActive: true,
    fkVisitorType: 0,
    fkVisitorPurpose: 0
  } as Visitor;
  isLoadingPop!: boolean;
  isEdit: any = false;
  selectedId: any;
  // dayView: SchedulerViewDay[];
  selectedDayViewDate: Date;

  NoOfPersons:any=1;
  Allowby:any;
  currentUser!: AuthData;

  fromTime: any;
  toTime: any;
  //actions: CalendarSchedulerEventAction[];

  constructor(@Inject(LOCALE_ID) locale: string,private appService: AppService, private dateAdapter: DateAdapter, private httpService: HttpService) {
    this.locale = locale;

    // this.dayModifier = ((day: SchedulerViewDay): void => {
    //   day.cssClass = this.isDateValid(day.date) ? '' : 'cal-disabled';
    // }).bind(this);
    // this.hourModifier = ((hour: SchedulerViewHour): void => {
    //   hour.cssClass = this.isDateValid(hour.date) ? '' : 'cal-disabled';
    // }).bind(this);

    // this.segmentModifier = ((segment: SchedulerViewHourSegment): void => {
    //   segment.isDisabled = !this.isDateValid(segment.date);
    // }).bind(this);

    // this.eventModifier = ((event: CalendarSchedulerEvent): void => {
    //   event.isDisabled = !this.isDateValid(event.start);
    // }).bind(this);

    this.dateOrViewChanged();
  }

  ngOnInit(): void {

    //let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.usrid = authData.uid;
    this.currentUser=authData;
    this.employeeId = authData.userName;
    this.calendarItem.createdBy = this.currentUser.fkEmpId;

    this.getLocationList();
    this.getEmployee();
    // this.getEvents();
    this.getVisitorTypeList();
    this.getPurposeList();
    this.getVisitorList();
    // this.getEmpList();
  }
  
  // empMList: any = [[]];
  // public employeeList: any[] = [[]];
  // empMListCon: any = [];
  // getEmpList() {
  //   // debugger;
  //   this.isLoading = true;
  //   this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API, this.currentUser.baselocation).then((data: any) => {
  //     // this.isLoading = false;
  //     if (data.length > 0) {
  //       this.empMList = data.filter((x:any)  => x.isActive);
  //       // console.log(this.empMList);
  //       this.employeeList = data;
  //       // console.log(this.employeeList);
  //       this.locationId = this.empMList.find((s:any) => s.employeeId == this.currentUser.employeeId).baseLocation;
  //       // console.log(this.locationId);
  //       // var empMList = [[]];
  //       //this.empMList = this.empMList.filter((s:any) => s.isActive && s.baseLocation == this.locationId);
  //       this.empMList.forEach((element:any)=> {

  //         var t = { 'id': 0, 'name': '' };
  //         t.id = element.id;
  //         // let middleName = this.isEmpty(element.middleName.trim()) ? ' ' : ' ' + element.middleName + ' ';
  //         t.name = element.firstName + ' ' + element.middleName + ' ' + element.lastName + '-' + element.employeeId + ' (' + element.designation + ')';
  //         this.empMListCon = [...this.empMListCon, t];
  //       })
  //       // this.empListCon1 = this.empListCon;
  //       // console.log(this.empListCon);
  //       // this.dropdownSettings1 = {
  //       //   singleSelection: true,
  //       //   idField: 'id',
  //       //   textField: 'name',
  //       //   allowSearchFilter: true
  //       // };
  //     }
  //     // this.getVisitorsList();

  //   }).catch((error)=> {
  //     //console.log(error);
  //     this.isLoading = false;
  //     this.empMList = [];
  //   });
  // }

  getLocationName(id:any) {
    let temp = this.LocationMasterList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  onItemSelect(item: any) {
    this.selLoc = item.id;
  }
  onSelectAll() {
  }
  dropdownSettings = {};
  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.LocationMasterList = data.filter((x:any)  => x.isActive).sort((a:any,b:any)=>{
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
          return 0;
        });
        this.dropdownSettings = {
          singleSelection: true,
          idField: 'id',
          textField: 'name',
          allowSearchFilter: true
        };
      }
    }).catch((error) => {
      this.isLoading = false;
      this.LocationMasterList = [];
    });
  }
  getVisitorList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.visitorsList = data;
      }
    }).catch((error) => {
      this.visitorsList = [];
    });
  }

  keyPressNumber(evt:any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode >= 32 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getVisitorTypeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_TYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.visitorTypeList = data.filter((x:any)  => x.isActive).sort((a:any,b:any)=>{
          if(a.visitor_Type > b.visitor_Type) return 1;
          if(a.visitor_Type < b.visitor_Type) return -1;
          return 0;
        });
      }
    }).catch((error) => {
      this.visitorTypeList = [];
    });
  }

  getPurposeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_PURPOSE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.purposeList = data.filter((x:any)  => x.isActive).sort((a:any,b:any)=>{
          if(a.purpose > b.purpose) return 1;
          if(a.purpose < b.purpose) return -1;
          return 0;
        });
      }
    }).catch((error) => {
      this.purposeList = [];
    });
  }

  getEmployee() {
    let connection: any;
    connection = this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, this.usrid);

    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        this.employeeItem = data;
        this.employeeName = this.employeeItem.firstName + ' ' + this.employeeItem.lastName;
        this.employeeEmail = this.employeeItem.email;
        this.locationId = this.employeeItem.baseLocation;
        this.selLoc = this.locationId;
      }
    }).catch((error) => {
      this.errMsgPop = 'Error getting employee data..';
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {

    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.view = CalendarView.Day;
      this.viewDate = date;
    }

  }

//   getEvents() {
    
//     // this.appService.getEvents(this.employeeId, this.actions)
//     // .then((events: CalendarSchedulerEvent[]) => this.events = events);
//    let events = [];
//     this.httpService.getById(APIURLS.BR_MASTER_VISITOR_API, this.employeeId).then((data: any) => {
//       // console.log(usrid);
//       this.isLoading = false;
//       if (data.length > 0) {
//         // console.log(data);
//         this.calendarList = data;
//         for (let cal of this.calendarList) {
//           // console.log(cal);
//           // if(cal.temp8!=null){
//           // if(events.length == 0){
//           // let datestring = cal.date+ ' '+cal.fromTime;
//           let d = new Date(cal.date);
//           let ed = new Date(cal.endDateTime);
//           // console.log(d);
//           // let fromTime = cal.fromTime;
//           // let toTime = (cal.toTime);
//           // let temp = (ed)?  Math.abs(+ed.getTime() - +d.getTime()) / 3600000 : 1;
//           // console.log(d);
//           // console.log(ed);
//           // console.log(temp);
//           let diff = Math.abs(+ed - +d);
//           var seconds = Math.floor(diff / 1000); //ignore any left over units smaller than a second
//           var minutes = Math.floor(seconds / 60);
//           seconds = seconds % 60;
//           var hours = Math.floor(minutes / 60);
//           minutes = minutes % 60;
//           // this.isDisabled = ed < new Date();
//           // console.log("Diff = "+ cal.id+" :-"+ hours + ":" + minutes + ":" + seconds)
//           events.push(
//             <CalendarSchedulerEvent>{
//               id: cal.id,
//               start: d,//startOfHour(d),
//               end: ed,//addHours(d, hours),
//               title: cal.name,//+'<br><br>'+cal.purpose!=null?cal.purpose:'',
//               content: cal.purpose ? cal.purpose : '',
//               // color: { primary: '#E0E0E0', secondary: '#EEEEEE' },
//               color: cal.isPreShedualled ? colors.blue:colors.yellow,
//               actions: this.actions,
//               status: 'ok' as CalendarSchedulerEventStatus,
//               isClickable: true,
//               isDisabled: false,
//               draggable: true,

//               resizable: {
//                 beforeStart: true,
//                 afterEnd: true
//               }
//             });

//         }
//         this.events=events;
//       }
//       else
//       {
//         this.events=events;
//       }
//       this.isLoading = false;
//     }).catch((error)=> {
//       this.isLoading = false;
//       this.calendarList = [];
//     });
//  }
  reInitDatatable() {
    throw new Error("Method not implemented.");
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarView): void {
    this.view = view;
    this.dateOrViewChanged();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  dateOrViewChanged(): void {
    //v10
    // if (this.startsWithToday) {
    //   this.prevBtnDisabled = !this.isDateValid(subPeriod(this.dateAdapter, this.view, this.viewDate, 1));
    //   this.nextBtnDisabled = !this.isDateValid(addPeriod(this.dateAdapter, this.view, this.viewDate, 2));
    // } else {
    //   this.prevBtnDisabled = !this.isDateValid(endOfPeriod(this.dateAdapter, this.view, subPeriod(this.dateAdapter, this.view, this.viewDate, 1)));
    //   this.nextBtnDisabled = !this.isDateValid(startOfPeriod(this.dateAdapter, this.view, addPeriod(this.dateAdapter, this.view, this.viewDate, 2)));
    // }

    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  private isDateValid(date: Date): boolean {
    return /*isToday(date) ||*/ date >= this.minDate && date <= this.maxDate;
  }

  dayHeaderClicked(): void {
  }

  hourClicked(): void {
  }

  // segmentClicked(segment: SchedulerViewHourSegment): void {
  //   this.VisitorDetails=[];
  //   this.calendarForm.form.markAsPristine();
  //   this.calendarForm.form.markAsUntouched();
  //   this.calendarForm.form.updateValueAndValidity();
  //   // this.calendarItem = new Visitor(0, '', '', '', '', '', '', '', '', true, '', '', '', '', true, true, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0,'', '', '');
  //   this.calendarItem = {
  //     id: 0,
  //     isCancelled: true,
  //     isApproved: true,
  //     isPreShedualled: true,
  //     numberOfPerson: 0,
  //     createdBy: this.currentUser.fkEmpId,
  //     modifiedBy: 0,
  //     isActive: true,
  //     fkVisitorType: 0,
  //     fkVisitorPurpose: 0
  //   } as Visitor;
  //   this.isEdit = false;
  //   this.errMsgPop = '';
  //   this.errMsgPop1 = '';
  //   this.appDate = segment.date;
  //   this.pastEvent = false;
  //   this.selectedPurpose = null;
  //   this.selectedVisitorType = null;
  //   this.selectedPurpose = null;
  //   this.visitorName = '';
  //   this.code = '91';
  //   this.selLoc = this.locationId;
  //   this.selLocationId = this.LocationMasterList.filter((e:any) => e.id == this.locationId);

  //   this.getApproversDetails();

  //   jQuery("#myModal").modal('show');
  // }

  // eventClicked(action: string,event: CalendarSchedulerEvent): void {
  //   this.VisitorDetails=[];
  //   this.selectedEvent = event;
  //   if (this.selectedEvent.start < new Date()) {
  //     this.pastEvent = true;
  //   }
  //   else
  //     this.pastEvent = false;

  //   this.errMsgPop = '';
  //   this.errMsgPop1 = '';
  //   this.isEdit = true;
  //   let connection: any;
  //   connection = this.httpService.getById(APIURLS.BR_MASTER_VISITOR_POST_API, +event.id);

  //   connection.then((data: any) => {
  //     if (data == 200 || data.id > 0) {
  //       this.calendarItem = data;
  //       this.selectedId = event;
  //       this.appDate = event.start;
  //       this.purpose = this.calendarItem.purpose ? this.calendarItem.purpose : '';
  //       this.visiting = this.employeeName;
  //       this.appDate = new Date(this.calendarItem.date);
  //       this.visitorName = this.calendarItem.name;
  //       this.mobile = (this.calendarItem.mobile) + '';
  //       this.code = this.calendarItem.temp1;
  //       this.email = this.calendarItem.email;
  //       this.selectedVisitorType = this.visitorTypeList.find((s:any) => s.id == this.calendarItem.fkVisitorType);
  //       this.selectedPurpose = this.purposeList.find((s:any) => s.id == this.calendarItem.fkVisitorPurpose);
  //       this.selLocationId = this.LocationMasterList.filter((s:any) => s.id == this.calendarItem.temp7);
  //       this.selLoc = this.calendarItem.temp7;
  //       this.fromTime = this.calendarItem.date;
  //       this.toTime = this.calendarItem.endDateTime;

  //       let visitr:any={};
  //       visitr.name = this.calendarItem.name;
  //       visitr.mobile=this.calendarItem.mobile;
  //       visitr.email=this.calendarItem.email;
  //       visitr.companyName =this.calendarItem.companyName;
  //       this.VisitorDetails.push(visitr);


  //       if( data.additionalVisitors.length>0)
  //       {
  //         for(let i=0;i<data.additionalVisitors.length;i++)
  //         {
  //           let visitr1:any={};
  //           visitr1.id = data.additionalVisitors[i].id;
  //           visitr1.name = data.additionalVisitors[i].name;
  //           visitr1.mobile=data.additionalVisitors[i].mobile;
  //           visitr1.email=data.additionalVisitors[i].email;
  //           visitr1.companyName =data.additionalVisitors[i].companyName;
  //           this.VisitorDetails.push(visitr1);
  //         }
         
  //       }

  //       this.getApproversDetails();

  //       jQuery("#myModal").modal('show');
  //     }
  //   }).catch((error)=> {
  //     this.isLoadingPop = false;
  //     this.errMsgPop = 'Error saving Appointment data: ' + error;
  //   });
  // }

  GetVisitorDetails(visit:any,i:any) {
    var self = this;
    $('#visitor_' + i).autocomplete({
      source: function (request:any, response:any) {
        var searchTerm1 = request.term + ',' + self.currentUser.baselocation;
        let connection = self.httpService.getByParam(APIURLS.BR_GET_VISITOR_BASED_ON_NAME, searchTerm1);
        connection.then((data: any) => {
          if (data) {
            let result = data;
            response(result.map((i:any) => {
              i.label = i.name + '-' + i.mobile + '-' + i.companyName, i.name = i.name, i.mobile = i.mobile
                , i.companyName = i.companyName, i.email = i.email; return i;
            }));
          }
        }).catch((error)=> {
        });
      },
      select: function (event:any, ui:any) {
        visit.name = ui.item.name;
        visit.mobile = ui.item.mobile;
        visit.companyName = ui.item.companyName;
        visit.email = ui.item.email;
        return false;
      }
    });

  }

  // eventTimesChanged({ event, newStart, newEnd }: SchedulerEventTimesChangedEvent): void {
  //   if (event.start < new Date()) {
  //     swal({
  //       title: "Message",
  //       text: "Cannot change time for past appointments",
  //       icon: "warning",
  //       dangerMode: false,
  //       buttons: [false, true]
  //     }).then((willDelete) => {
  //       if (willDelete) {
  //         this.isLoading = false;
  //       }
  //     });
  //   }
  //   else if (new Date() > newStart) {
  //     swal({
  //       title: "Message",
  //       text: "Cannot move appointment to past time",
  //       icon: "warning",
  //       dangerMode: false,
  //       buttons: [false, true]
  //     }).then((willDelete) => {
  //       if (willDelete) {
  //         this.isLoading = false;
  //       }
  //     });
  //   }
  //   else {
  //    // const ev: CalendarSchedulerEvent = this.events.find(e => e.id === event.id);
  //     // ev.start = newStart;
  //     // ev.end = newEnd;
  //     this.refresh.next();
  //     this.calendarItem.fkEmployeeId = this.employeeId;
  //     this.selectedEvent = event;
  //     let connection: any;
  //     connection = this.httpService.getById(APIURLS.BR_MASTER_VISITOR_POST_API, +event.id);
  //     connection.then((data: any) => {
  //       if (data == 200 || data.id > 0) {
  //         this.calendarItem = data;
  //         this.selectedId = event;
  //         this.appDate = event.start;
  //         this.purpose = this.calendarItem.purpose ? this.calendarItem.purpose : '';
  //         this.visiting = this.employeeName;
  //         this.appDate = new Date(this.calendarItem.date);
  //         this.visitorName = this.calendarItem.name;
  //         this.mobile = (this.calendarItem.mobile) + '';
  //         this.code = this.calendarItem.temp1;
  //         this.email = this.calendarItem.email;
  //         this.selectedVisitorType = this.visitorTypeList.find((s:any) => s.id == this.calendarItem.fkVisitorType);
  //         this.selectedPurpose = this.purposeList.find((s:any) => s.id == this.calendarItem.fkVisitorPurpose);
  //         var d = new Date(newStart);
  //         let formateddate: string = d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
  //           ("00" + d.getDate()).slice(-2) + " " +
  //           ("00" + d.getHours()).slice(-2) + ":" +
  //           ("00" + d.getMinutes()).slice(-2) + ":" +
  //           ("00" + d.getSeconds()).slice(-2);

  //         var d2 = new Date(newEnd);
  //         let formatedenddate: string = d2.getFullYear() + "-" + ("00" + (d2.getMonth() + 1)).slice(-2) + "-" +
  //           ("00" + (d2.getDate())).slice(-2) + " " +
  //           ("00" + (d2.getHours())).slice(-2) + ":" +
  //           ("00" + (d2.getMinutes())).slice(-2) + ":" +
  //           ("00" + d2.getSeconds()).slice(-2);

  //         var fromTime = ("00" + d.getHours()).slice(-2) + ":" +
  //           ("00" + d.getMinutes()).slice(-2) + ":" +
  //           ("00" + d.getSeconds()).slice(-2);

  //         this.calendarItem.fromTime = fromTime;
  //         //  this.calendarItem.toTime = toTime;
  //         this.calendarItem.fkEmployeeName = this.employeeName;
  //         this.calendarItem.employeeEmail = this.employeeEmail;
  //         this.calendarItem.purpose = this.purpose;
  //         this.calendarItem.name = this.visitorName;
  //         this.calendarItem.mobile = this.mobile;
  //         this.calendarItem.temp1 = this.code;
  //         this.calendarItem.otherInformation = this.otherinformation;
  //         this.calendarItem.email = this.email;
  //         this.calendarItem.date = formateddate;
  //         this.calendarItem.endDateTime = formatedenddate;
  //         this.calendarItem.fkVisitorPurpose = this.selectedPurpose.id;
  //         this.calendarItem.fkVisitorType = this.selectedVisitorType.id;
  //         this.calendarItem.id = +this.selectedEvent.id;
  //         this.calendarItem.isActive = true;
  //         connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
  //         this.errMsgPop1 = 'Appointment updated!';

  //         connection.then((data: any) => {
  //           if (data == 200 || data.id > 0) {
  //             this.getApproversDetails();

  //             jQuery("#myModal").modal('hide');
  //             jQuery("#saveModal").modal('show');
  //             this.getEvents();
  //           }
  //         }).catch((error) => {
  //           this.isLoadingPop = false;
  //           this.errMsgPop = 'Error saving Appointment data..';
  //         });
  //       }
  //     }).catch((error) => {
  //       this.isLoadingPop = false;
  //       this.errMsgPop = 'Error saving Appointment data..';
  //     });
  //   }
  // }

  handleEvent(): void {
  }
  from_Date:any;
  cal_id:any;
  onSaveCalendar() {
    var d = new Date(this.appDate);
    var dtSTime = new Date(this.fromTime);
    var dtETime = new Date(this.toTime);
    if (dtSTime < new Date()) {
      swal({
        title: "Message",
        text: "Cannot fix appointment for past time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
    else if (dtETime <= dtSTime) {
      swal({
        title: "Message",
        text: "End time should be grater than start time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
    else if(this.NoOfPersons != this.VisitorDetails.length)
    {
      swal({
        title: "Message",
        text: "Please enter all the visitor details.",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
    else {
      let connection: any;
      this.calendarItem.fkEmployeeId = this.employeeId;
      let formateddate: string = d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
        ("00" + d.getDate()).slice(-2) + " " +
        ("00" + dtSTime.getHours()).slice(-2) + ":" +
        ("00" + dtSTime.getMinutes()).slice(-2) + ":" +
        ("00" + dtSTime.getSeconds()).slice(-2);

      let formatedenddate: string = d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
        ("00" + d.getDate()).slice(-2) + " " +
        ("00" + dtETime.getHours()).slice(-2) + ":" +
        ("00" + dtETime.getMinutes()).slice(-2) + ":" +
        ("00" + dtETime.getSeconds()).slice(-2);

      // this.calendarItem.fromTime = fromTime;
      // this.calendarItem.toTime = toTime;
      this.calendarItem.fkEmployeeName = this.employeeName;
      this.calendarItem.employeeEmail = this.employeeEmail;
      this.calendarItem.companyName = this.companyName;
      this.calendarItem.purpose = this.purpose;
      this.calendarItem.temp1 = this.code;
      // this.calendarItem.name = this.visitorName;
      // this.calendarItem.mobile = this.mobile;
      // this.calendarItem.temp1 = this.code;
      // this.calendarItem.otherInformation = this.otherinformation;
      // this.calendarItem.email = this.email;

      this.calendarItem.name = this.VisitorDetails[0].name;
      this.calendarItem.companyName = this.VisitorDetails[0].companyName;
      this.calendarItem.mobile = this.VisitorDetails[0].mobile;
      this.calendarItem.email = this.VisitorDetails[0].email;
      this.calendarItem.temp = this.VisitorDetails[0].image;

      this.calendarItem.otherInformation = this.otherinformation;
      this.calendarItem.isPreShedualled = true;
      this.calendarItem.isCancelled = false;
      this.calendarItem.numberOfPerson = this.NoOfPersons;
      this.calendarItem.date = formateddate;
      this.calendarItem.endDateTime = formatedenddate;
      this.calendarItem.fkVisitorType = this.selectedVisitorType.id;
      this.calendarItem.fkVisitorPurpose = this.selectedPurpose.id;
      this.calendarItem.temp8 = this.locationId;
      this.calendarItem.temp7 = this.selLocationId.length > 0 ? this.selLocationId[0].id : this.locationId;
      this.calendarItem.isActive = true;

      //Code added for VMS Approval
      if (this.getType(this.calendarItem.fkVisitorType) != "Employee") {
        this.calendarItem.temp13 = 'Pending For Approval.';
        this.calendarItem.temp14 = this.Approverslist[0].approverId;
      }
      else {
        this.calendarItem.temp13 = 'Approved';
      }

      if (this.isEdit) {
        this.calendarItem.id = +this.selectedEvent.id;
        connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
        this.errMsgPop1 = 'Appointment updated!';
      }
      else {
        connection = this.httpService.post(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem);
        this.errMsgPop1 = 'Appointment confirmed!';
      }
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
          this.getApproversDetails();

          jQuery("#myModal").modal('hide');
          jQuery("#saveModal").modal('show');
          if (this.VisitorDetails.length > 1) {
            for (let i = 1; i < this.VisitorDetails.length; i++) {
              if (this.VisitorDetails[i].name != '' || this.VisitorDetails[i].name != null) {
                var nextY = { 'id': 0, 'name': '', 'temp1': '', 'mobile': '', 'email': '','companyName':'', 'temp2': '', 'temp3': '', 'temp4': '', 'fkId': 0 };
                // console.log('->'+this.nextYr[i].closure_date);
                this.cal_id = data.id > 0 ? data.id : this.calendarItem.id;
                nextY.fkId = this.cal_id;
                nextY.name = this.VisitorDetails[i].name;
                nextY.temp1 = '91';
                nextY.companyName = this.VisitorDetails[i].companyName;
                nextY.mobile = this.VisitorDetails[i].mobile;
                nextY.email = this.VisitorDetails[i].email;               
               
                connection = this.httpService.post(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_POST_API, nextY);

              }

              // if (this.deletedPersonIds.length > 0) {
              //   this.deletedPersonIds.forEach((element:any)=> {

              //     let findOldIdNext = this.deletedPersonIds.some((s:any) => s == element);
              //     if (findOldIdNext)
              //       connection = this.httpService.delete(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_POST_API, element);
              //   });
              // }
            }
          }
          //this.getEvents();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Appointment data: ' + error;
      });
    }
  }

  getType(id:any) {
    if (id) {
      let temp = this.visitorTypeList.find((s:any) => s.id == id);
      return temp ? temp.visitor_Type : '';
    }
  }

  getCalendarMasterList() {
    throw new Error("Method not implemented.");
  }

  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }
  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  // beforeDayViewRender(dayView: SchedulerViewDay[]) {
  //   this.dayView = dayView;
  //   this.addSelectedDayViewClass();
  // }

  // private addSelectedDayViewClass() {
  //   this.dayView.forEach(hourSegment => {
  //     hourSegment.segments.forEach(segment => {
  //       delete segment.cssClass;
  //       if (
  //         this.selectedDayViewDate &&
  //         segment.date.getTime() === this.selectedDayViewDate.getTime()
  //       ) {
  //         segment.cssClass = 'cal-day-selected';
  //       }
  //     });
  //   });
  // }
private addSelectedDayViewClass() {
  // this.dayView.forEach((hourSegment: any) => {
  //   hourSegment.segments.forEach((segment: any) => {
  //     delete segment.cssClass;
  //     if (
  //       this.selectedDayViewDate &&
  //       segment.date.getTime() === this.selectedDayViewDate.getTime()
  //     ) {
  //       segment.cssClass = 'cal-day-selected';
  //     }
  //   });
  // });
}


  hourSegmentClicked(date: Date) {
    this.VisitorDetails=[];
    if (date < new Date()) {
      swal({
        title: "Message",
        text: "Cannot fix appointment for past time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
    else {
      this.calendarForm.form.markAsPristine();
      this.calendarForm.form.markAsUntouched();
      this.calendarForm.form.updateValueAndValidity();
      // this.calendarItem = new Visitor(0, '', '', '', '', '', '', '', '', true, '', '', '', '', true, true, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0,'', '', '');
      this.calendarItem = {
        id: 0,
        isCancelled: true,
        isApproved: true,
        isPreShedualled: true,
        numberOfPerson: 0,
        createdBy: this.currentUser.fkEmpId,
        modifiedBy: 0,
        isActive: true,
        fkVisitorType: 0,
        fkVisitorPurpose: 0
      } as Visitor;
      this.selectedEvent = null;
      this.selectedDayViewDate = date;
      this.appDate = date;
      this.isEdit = false;
      this.pastEvent = false;
      this.visitorName = '';
      this.mobile = '';
      this.code = '91';
      this.email = '';
      this.companyName = '';
      this.otherinformation = '';
      this.purpose = '';
      this.selectedVisitorType = null;
      this.selectedPurpose = null;
      this.selLoc = this.locationId;
      this.selLocationId = this.LocationMasterList.filter((s:any) => s.id == this.locationId);
      this.fromTime = date;
      let endTime = new Date(date);
      endTime.setHours(endTime.getHours() + +this.durationHours);
      this.toTime = endTime;

      this.getApproversDetails();

      jQuery("#myModal").modal('show');
    }
  }

  deleteCalendarEntry() {
    let cantDelete = this.visitorsList.find((s:any) => s.id == this.selectedEvent && (s.numberOfPerson > 0 || s.isActive == false));
    if (cantDelete) {
      swal({
        title: "Message",
        text: "Cannot delete entry as visitor has already checked in",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    } else {
      let connection: any;
      connection = this.httpService.delete(APIURLS.BR_MASTER_VISITOR_POST_API, this.selectedEvent.id);
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
          this.getApproversDetails();

          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Appointment removed!';
          jQuery("#saveModal").modal('show');
         // this.getEvents();
        }
      }).catch((error) => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Appointment data..';
      });
    }
  }

  VisitorDetails: any[] = [];
  count = 0;
  onAddLineClick() {
    this.isLoading = true;
    this.VisitorDetails.push({});
    //console.log(this.departmentList);
    this.count++;
    this.isLoading = false;
  }

  RemoveLine(no:any, id:any) {
    this.isLoading = true;
    this.VisitorDetails.splice(no, 1);
    // console.log(this.departmentList);
    this.count--;

    this.isLoading = false;
  }
  checklength() {
    while (this.VisitorDetails.length > this.NoOfPersons) {
      this.VisitorDetails.splice(this.VisitorDetails.length - 1, 1)
    }

  }
  AddBelongings() {
    jQuery("#BelongingsModal").modal('show');
  }
  closeBelongingModal()
  {
    jQuery("#BelongingsModal").modal('hide');
  }
  Type: any;
  Belonging: any;
  modelNo: any;
  Details: any;
  SerialNo:any;
  BelongingsList: any[] = [];
  addData() {
    let model: any = {};
    model.Type = this.Type;
    model.Belonging = this.Belonging;
    model.modelNo = this.modelNo;
    model.Details = this.Details;
    model.serialNo = this.SerialNo;
    this.BelongingsList.push(model);
    this.clearInput();
  }

  clearInput()
  {
    this.Type=null;
    this.Belonging=null;
    this.modelNo=null;
    this.Details=null;
    this.SerialNo=null;
  }

  Approverslist: any[] = [];
  selParentRole: any = [];
  getApproversDetails() {
    if (this.Approverslist.length == 0) {
      console.log(this.employeeItem);
      this.httpService.getByParam(APIURLS.BR_GET_VMS_APPROVERS, this.employeeItem.id + ',Visitor' + "," + this.currentUser.employeeId).then((data: any) => {
        // this.isLoading = false;
        if (data.length > 0) {
          this.Approverslist = data;
        }
        else {
          this.Approverslist = [];
        }
      }).catch((error)=> {
        //console.log(error);
        this.isLoading = false;
        this.Approverslist = [];
      });
    }
  }
}
