import { Component, OnInit, Inject, LOCALE_ID, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
declare var jQuery: any;
import * as _ from "lodash";
import swal from 'sweetalert';
import { Http, RequestOptions, Headers } from '@angular/http';

import {
  addDays,
  startOfHour,
  addHours,
  setHours,
  subMinutes,
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
  SchedulerEventTimesChangedEvent
} from 'angular-calendar-scheduler';
import {
  CalendarView,
  CalendarDateFormatter,
  DateAdapter,
  MOMENT,
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarEventAction,
  CalendarMonthViewDay,
  CalendarUtils
} from 'angular-calendar';
import { AppService } from '../../shared/app.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpService } from '../../shared/http-service';
import { DayViewHour, MonthView, GetMonthViewArgs } from 'calendar-utils';
import { NgForm } from '@angular/forms';
import { PARAMETERS } from '@angular/core/src/util/decorators';
import { APIURLS } from '../../shared/api-url';
import { BookMeeting } from './bookmeeting.model';
import { AuthData } from '../../auth/auth.model';
import { BookingParticipants } from './bookingparticipants.model';
import { RoomInformation } from '../room-maintenance/room.model';


@Component({
  selector: 'app-room-booking',
  templateUrl: './room-booking.component.html',
  styleUrls: ['./room-booking.component.css'],
  providers: [{
    provide: CalendarDateFormatter,
    useClass: SchedulerDateFormatter
  }]
})
export class RoomBookingComponent implements OnInit {
  @ViewChild(NgForm) calendarForm: NgForm;
  CalendarView = CalendarView;

  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  locale: string = 'en';
  hourSegments: number = 4;
  weekStartsOn: number = 1;
  startsWithToday: boolean = true;
  activeDayIsOpen: boolean = true;
  excludeDays: number[] = []; // [0];
  weekendDays: number[] = [0, 6];
  dayStartHour: number = 6;
  dayEndHour: number = 22;

  minDate: Date = new Date();
  maxDate: Date = endOfDay(addMonths(new Date(), 11));
  dayModifier: Function;
  hourModifier: Function;
  segmentModifier: Function;
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;
  actions: CalendarSchedulerEventAction[] = [];

  events: CalendarSchedulerEvent[];
  //Above are calendar properties
  roomId: number;
  baseLocation: number;
  roomLocationCode: string;
  roomName: string;
  roomLocation: string;
  isEdit: boolean = false;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoadingPop: boolean = false;
  calendarMeeting = {} as BookMeeting;
  roomInformation = {} as RoomInformation;
  pastEvent: boolean = false;
  currentUser: AuthData;
  min = new Date();
  constructor(@Inject(LOCALE_ID) locale: string, private appService: AppService, private dateAdapter: DateAdapter, private router: Router, private route: ActivatedRoute, private httpService: HttpService) {
    this.locale = locale;

    this.dayModifier = ((day: SchedulerViewDay): void => {
      if (!this.isDateValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    }).bind(this);
    this.hourModifier = ((hour: SchedulerViewHour): void => {
      if (!this.isDateValid(hour.date)) {
        hour.cssClass = 'cal-disabled';
      }
    }).bind(this);
    this.segmentModifier = ((segment: SchedulerViewHourSegment): void => {
      if (!this.isDateValid(segment.date)) {
        segment.isDisabled = true;
      }
    }).bind(this);


    this.dateOrViewChanged();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.roomId = parseInt(params.get('id'));
      this.getRoomInfoById(this.roomId);
    });
    this.getCurrentEmployeeDetails();

    this.getAllRoombookings();
  }

  changeDate(date: Date): void {
    console.log('changeDate', date);
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarView): void {
    console.log('changeView', view);
    this.view = view;
    this.dateOrViewChanged();
  }
  startDayOfWeek(date) {
    var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }
  dateOrViewChanged(): void {
    // if (this.view == 'week')
    //   this.startDayOfWeek(this.viewDate);
    //console.log(this.viewDate);
    if (this.startsWithToday) {
      this.prevBtnDisabled = !this.isDateValid(subPeriod(this.dateAdapter, this.view, this.viewDate, 1));
      this.nextBtnDisabled = !this.isDateValid(addPeriod(this.dateAdapter, this.view, this.viewDate, 1));
    } else {
      this.prevBtnDisabled = !this.isDateValid(endOfPeriod(this.dateAdapter, this.view, subPeriod(this.dateAdapter, this.view, this.viewDate, 1)));
      this.nextBtnDisabled = !this.isDateValid(startOfPeriod(this.dateAdapter, this.view, addPeriod(this.dateAdapter, this.view, this.viewDate, 1)));
    }

    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  private isDateValid(date: Date): boolean {
    return /*isToday(date) ||*/ date >= this.minDate && date <= this.maxDate;
  }
  hourSegmentClicked(date: Date) {
    console.log('hourSegmentClicked Date', date);
    if (date < new Date()) {
      swal({
        title: "Message",
        text: "Cannot book room for past time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      this.resetForm();
      this.getPurposeList();
      this.calendarMeeting.fromDate = date;
      this.calendarMeeting.toDate = date;
      this.calendarMeeting.fromTime = date;
      let endTime = new Date(date);
      endTime.setMinutes(endTime.getMinutes() + 30);
      this.calendarMeeting.toTime = endTime;
      jQuery("#myModal").modal('show');
    }
  }
  eventClicked(action: string, event: CalendarSchedulerEvent): void { //Edit
    console.log('eventClicked Action', action);
    console.log('eventClicked Event', event);
  }

  eventTimesChanged({ event, newStart, newEnd }: SchedulerEventTimesChangedEvent): void { //Edit
    console.log('eventTimesChanged Event', event);
    console.log('eventTimesChanged New Times', newStart, newEnd);
    let ev = this.events.find(e => e.id === event.id);
    ev.start = newStart;
    ev.end = newEnd;
    this.refresh.next();
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
  gotoBookRooms() {
    let selectedRoomId = this.roomId ? this.roomId : null;
    let locationId = this.baseLocation ? this.baseLocation : null;
    this.router.navigate(['/book-room', { id: selectedRoomId, lid: locationId }]);
    //this.router.navigate(['../',{id:selectedRoomId}],{relativeTo:this.route})
  }
  getRoomInfoById(rmId: number) {
    this.httpService.getById(APIURLS.BR_ROOM_MASTER_API, rmId).then((data: any) => {
      if (data) {
        this.roomInformation = data;
        this.baseLocation = data.fk_Location;
        this.roomName = data.name;
        this.getLocationById(this.baseLocation);
        this.getBaseLocationAdmin();
      }
    }).catch(error => {
      this.baseLocation = 0;
    });
  }
  getLocationById(lId: number) {
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.roomLocationCode=data.code;
        this.roomLocation = data ? data.code + '-' + data.name : '';
      }
    }).catch(error => {
      this.roomLocation = '';
    });
  }
  purposeList: any[] = [];
  selectedPurpose: any;
  getPurposeList() {
    this.httpService.get(APIURLS.BR_BOOK_PURPOSE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.purposeList = data.filter(x=>x.type=="Room Booking" && x.isActive).sort((a,b)=>
                                                                                {
                                                                                  if(a.purpose > b.purpose) return 1;
                                                                                  if(a.purpose < b.purpose) return -1;
                                                                                  return 0;
                                                                                });
      }
    }).catch(error => {
      this.purposeList = [];
    });
  }
  //reset form here..
  resetForm(): void {
    this.calendarMeeting = {} as BookMeeting;
    this.calendarMeeting.numberOfPerson = 0;
    this.selectedPurpose = null;
    this.errMsgPop = '';
    this.purposeList = [];
    this.person = [];
    this.showTable = false;
    this.calendarForm.form.markAsPristine();
    this.calendarForm.form.markAsUntouched();
    this.calendarForm.form.updateValueAndValidity();
  }
  showTable: boolean = false;
  person: BookingParticipants[] = [];
  recCount: any;
  addPersonDetails() {
    this.showTable = true;
    var line_no = this.person.length;
    let genId: any = (line_no) ? this.person[this.person.length - 1].id : 0;
    let nextKraId = genId + 1;
    var person_temp = {} as BookingParticipants;
    person_temp.id = nextKraId;
    this.person.push(person_temp);
    this.recCount = this.person.length;
    return true;
  }
  personIds: any = [];
  deletedPersonIds = [];
  removePersonDetails(id: number, position: number) {
    if (this.person.length == 0)
      this.showTable = false;
    if (id != 0 && this.personIds.find(s => s == id)) this.deletedPersonIds.push(id);
    this.person.splice(position, 1);
    this.recCount--;
  }
  //page Load methods here..
  getAllRoombookings() {
    this.appService.getRoomMeetings(this.currentUser.employeeId, this.roomId, this.actions)
      .then((events: CalendarSchedulerEvent[]) => this.events = events);
  }
  getCurrentEmployeeDetails() {
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, this.currentUser.uid).then((data: any) => {
      if (data) {
        let managerId = data.fkReportingManager;
        this.getCurrentUserManager(managerId);

      }
    }).catch(error => {
      console.log(error);
    });
  }
  managerInfo: any = {};
  getCurrentUserManager(mgrId: number) {
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, mgrId).then((data: any) => {
      if (data) {
        this.managerInfo = data;
      }
    }).catch(error => {
      this.managerInfo = {};
    });
  }
  adminInfo: any = [];
  getBaseLocationAdmin() {
    let searchStr = this.baseLocation.toString() + ',' + '1004';//Room Location Admin
    this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_BYPARAM_API, searchStr).then((data: any) => {
      if (data.length > 0) {
        this.adminInfo = data;
      }
    }).catch(error => {
      this.adminInfo = [];
    });
  }
  onSaveMeeting() {
    let crrstcount = 0;
    let crrendcount = 0;
    let pstcount = 0;
    let pendcount = 0;
    let dtStartDate;
    let dtEndDate;

    let d1 = new Date(this.calendarMeeting.fromDate);
    let d2 = new Date(this.calendarMeeting.toDate);
    var dtStartTime = new Date(this.calendarMeeting.fromTime);
    var dtEndTime = new Date(this.calendarMeeting.toTime);
    if (this.calendarMeeting.allDay) {
      dtStartDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0);
      dtEndDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 23, 59);
    }
    else {
      dtStartDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), dtStartTime.getHours(), dtStartTime.getMinutes());
      dtEndDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), dtEndTime.getHours(), dtEndTime.getMinutes());
    }
    let diffc = dtStartDate.getTime() - dtEndDate.getTime();
    let days = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));
    if (!this.calendarMeeting.allDay && days > 0) { // recurring...
      let stDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
      let edDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
      var getDateArray = [];
      while (stDate <= edDate) {
        getDateArray.push(new Date(stDate));
        stDate.setDate(stDate.getDate() + 1);
      }
      for (let i = 0; i < getDateArray.length; i++) {
        var date = new Date(getDateArray[i]);
        let stDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), dtStartTime.getHours(), dtStartTime.getMinutes());
        let edDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), dtEndTime.getHours(), dtEndTime.getMinutes());

        crrstcount = this.events.filter(x => stDate <= x.start && x.start < edDate).length;
        crrendcount = this.events.filter(x => stDate < x.end && x.end <= edDate).length;
        pstcount = this.events.filter(x => x.start < stDate && stDate < x.end).length;
        pendcount = this.events.filter(x => x.start < edDate && edDate < x.end).length;

        if (crrstcount > 0 || crrendcount > 0 || pstcount > 0 || pendcount > 0) { break; }
      }
    }
    else { // All Day, Same Day
      crrstcount = this.events.filter(x => x.start >= dtStartDate && x.start < dtEndDate).length;
      crrendcount = this.events.filter(x => x.end > dtStartDate  && x.end <= dtEndDate).length;

      pstcount = this.events.filter(x => dtStartDate > x.start && dtStartDate < x.end).length;
      pendcount = this.events.filter(x => dtEndDate > x.start && dtEndDate < x.end).length;
    }
    if (dtStartDate < new Date() && !this.calendarMeeting.allDay) {
     // let msg = "Cannot book room for past time";
      // if (this.calendarMeeting.allDay)
      //   msg = "It is too late to book for full day. Please uncheck (all day event) and select start and end date/time";
      swal({
        title: "Message",
        text: "Cannot book room for past time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else if (dtEndDate <= dtStartDate) {
      swal({
        title: "Message",
        text: "End date/time should be grater than start date/time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else if (crrstcount > 0 || crrendcount > 0 || pstcount > 0 || pendcount > 0) {
      swal({
        title: "Message",
        text: "Room is not available for this time.Please try it for diffrent time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else if (this.calendarMeeting.numberOfPerson <= 0) {
      swal({
        title: "Message",
        text: "Number of person should be greater than zero",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else if (this.roomInformation.capacity < this.calendarMeeting.numberOfPerson) {
      swal({
        title: "Message",
        text: "Entered number of person should not be more than room capacity ('" + this.roomInformation.capacity + "')",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      let bookingId: number;
      let connection: any;
      if (!this.isEdit) {
        let formdate: string = d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
          ("00" + d1.getDate()).slice(-2);
        let todate: string = d2.getFullYear() + "-" + ("00" + (d2.getMonth() + 1)).slice(-2) + "-" +
          ("00" + d2.getDate()).slice(-2);
        this.calendarMeeting.fromDate = formdate;
        this.calendarMeeting.toDate = todate;
        var startTime = ("00" + dtStartTime.getHours()).slice(-2) + ":" +
          ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
          ("00" + dtStartTime.getSeconds()).slice(-2);
        var endTime = ("00" + dtEndTime.getHours()).slice(-2) + ":" +
          ("00" + dtEndTime.getMinutes()).slice(-2) + ":" +
          ("00" + dtEndTime.getSeconds()).slice(-2);
        this.calendarMeeting.fromTime = this.calendarMeeting.allDay ? "00:00:00" : startTime;
        this.calendarMeeting.toTime = this.calendarMeeting.allDay ? "23:59:59" : endTime;
        this.calendarMeeting.fkEmployeeId = parseInt(this.currentUser.employeeId);
        this.calendarMeeting.employeeNumber = this.currentUser.employeeId;
        this.calendarMeeting.fkRoomId = this.roomId;
        this.calendarMeeting.fkPurpose = this.selectedPurpose.id;
        this.calendarMeeting.empoloyeeLocation = this.currentUser.baselocation;
        this.calendarMeeting.roomLocation = this.baseLocation;// Room Location Id
        this.calendarMeeting.isApprovalReq = false;
        this.calendarMeeting.isCancelled = false;
        this.calendarMeeting.empName = this.currentUser.fullName;
        this.calendarMeeting.empEmail = this.currentUser.email;
        this.calendarMeeting.empDesignation = this.currentUser.designation;
        this.calendarMeeting.createdBy = this.currentUser.uid;
        this.calendarMeeting.createdDate = new Date().toLocaleString();
        this.calendarMeeting.status = "Approved";
        this.calendarMeeting.roomName = this.roomName;
        this.calendarMeeting.roomLocationCode=this.roomLocationCode;
        this.calendarMeeting.roomLocationName = this.roomLocation;
        this.calendarMeeting.purpose = this.selectedPurpose.purpose;
        if (this.roomInformation.manager_Approval) {
          this.calendarMeeting.managerId = this.managerInfo.employeeId;
          this.calendarMeeting.managerName = this.managerInfo.firstName + ' ' + this.managerInfo.middleName + ' ' + this.managerInfo.lastName;
          this.calendarMeeting.managerEmail = this.managerInfo.email;
        }
        if (this.roomInformation.admin_Approval) {
          if (this.adminInfo.length > 0) {
            this.calendarMeeting.adminId = this.adminInfo[0].employeeId;
            this.calendarMeeting.adminName = this.adminInfo[0].firstName + ' ' + this.adminInfo[0].middleName + ' ' + this.adminInfo[0].lastName;
            this.calendarMeeting.adminEmail = this.adminInfo[0].email;
          }
        }
        if (this.roomInformation.manager_Approval) {
          this.calendarMeeting.status = "Pending with Manager";
        }
        else if (this.roomInformation.admin_Approval) {
          if (this.adminInfo.length > 0) {
            this.calendarMeeting.status = "Pending with Admin";
          }
        }
        connection = this.httpService.post(APIURLS.BR_ROOM_BOOKING_API, this.calendarMeeting);
      }
      else {
        this.calendarMeeting.modifiedBy = this.currentUser.uid;
        this.calendarMeeting.modifiedDate = new Date().toLocaleString();
        bookingId = this.calendarMeeting.id;
        connection = this.httpService.put(APIURLS.BR_ROOM_BOOKING_API, this.calendarMeeting.id, this.calendarMeeting);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          if (!this.isEdit) {
            bookingId = data.id;
            this.calendarMeeting.requestNo=data.requestNo;
          }
          this.saveAdditionalPersons(this.isEdit, bookingId);
          this.sendMail(this.calendarMeeting);
          jQuery('#myModal').modal('hide');
          if (this.isEdit)
            this.errMsgModalPop = 'Room booking updated!';
          else
            this.errMsgModalPop = 'Room booked successfully!';
          jQuery("#saveModal").modal('show');
          this.getAllRoombookings();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error in Booking Room';
      });
    }

  }
  saveAdditionalPersons(isedit: boolean, brmid: number): void {
    let connection: any;
    for (let per of this.person) {
      let bookingParticipant = {} as BookingParticipants;
      bookingParticipant.fK_BookingId = brmid;
      bookingParticipant.name = per.name;
      bookingParticipant.mobileCode = per.mobileCode;
      bookingParticipant.mobile = per.mobile;
      bookingParticipant.email = per.email;
      bookingParticipant.createdBy = this.currentUser.uid;
      bookingParticipant.createdDate = new Date().toLocaleString();
      connection = this.httpService.post(APIURLS.BR_ROOM_BOOKINGPARTICIPANTS_API, bookingParticipant);
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
        }
      }).catch(error => {
        this.errMsgPop = 'Error saving ROOM BOOKING PARTICIPANTS ...';
      });
    }
  }

  sendMail(bookingData: BookMeeting) {
    let connection: any;
    if (bookingData.status == "Pending with Manager" || bookingData.status == "Pending with Admin") {
      connection = this.httpService.sendPutMail(APIURLS.BR_SENDMEETINGEMAIL_API, "1stLevelApproval", bookingData);
      connection.then((data: any) => {
        if (data == 200) {
        }
      }).catch(error => {
        this.errMsgPop = 'Error in sending mail..';
      });
    }
  }
  keyPressNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
}
