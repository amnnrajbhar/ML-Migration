import { Injectable } from '@angular/core';
import {
  CalendarSchedulerEvent,
  CalendarSchedulerEventStatus,
  CalendarSchedulerEventAction
} from 'angular-calendar-scheduler';
import {
  addDays,
  startOfHour,
  addHours,
  setHours,
  subMinutes
} from 'date-fns';
import { Router } from '@angular/router';
import { HttpService } from './http-service';
import { APIURLS } from './api-url';
import { colors } from './colors';
import { Subject } from 'rxjs';
declare var jQuery: any;
import * as _ from "lodash";


@Injectable()
export class AppService {
  errMsgPop: string;

  isLoading: boolean;
  calendarList: any;
  actions: CalendarSchedulerEventAction[];
  refresh: Subject<any> = new Subject();
  errMsgPop1: string;
  isLoadingPop: boolean;
  isDisabled: boolean;
  constructor(private httpService: HttpService, private router: Router) { }
  getEvents(usrid, actions: CalendarSchedulerEventAction[]): Promise<CalendarSchedulerEvent[]> {
    let events = [];

    this.httpService.getById(APIURLS.BR_MASTER_VISITOR_API, usrid).then((data: any) => {
      // console.log(usrid);
      this.isLoading = false;
      if (data.length > 0) {
        // console.log(data);
        this.calendarList = data;
        for (let cal of this.calendarList) {
          // console.log(cal);
          // if(cal.temp8!=null){
          // if(events.length == 0){
          // let datestring = cal.date+ ' '+cal.fromTime;
          let d = new Date(cal.date);
          let ed = new Date(cal.endDateTime);
          // console.log(d);
          // let fromTime = cal.fromTime;
          // let toTime = (cal.toTime);
          // let temp = (ed)?  Math.abs(+ed.getTime() - +d.getTime()) / 3600000 : 1;
          // console.log(d);
          // console.log(ed);
          // console.log(temp);
          let diff = Math.abs(+ed - +d);
          var seconds = Math.floor(diff / 1000); //ignore any left over units smaller than a second
          var minutes = Math.floor(seconds / 60);
          seconds = seconds % 60;
          var hours = Math.floor(minutes / 60);
          minutes = minutes % 60;
          // this.isDisabled = ed < new Date();
          // console.log("Diff = "+ cal.id+" :-"+ hours + ":" + minutes + ":" + seconds)
          events.push(
            <CalendarSchedulerEvent>{
              id: cal.id,
              start: d,//startOfHour(d),
              end: ed,//addHours(d, hours),
              title: cal.name,//+'<br><br>'+cal.purpose!=null?cal.purpose:'',
              content: cal.purpose ? cal.purpose : '',
              // color: { primary: '#E0E0E0', secondary: '#EEEEEE' },
              color: cal.isPreShedualled ? colors.blue:colors.yellow,
              actions: actions,
              status: 'ok' as CalendarSchedulerEventStatus,
              isClickable: true,
              isDisabled: false,
              draggable: true,

              resizable: {
                beforeStart: true,
                afterEnd: true
              }
            });

        }
      }
      // console.log('from appService:'+events);
      // console.log('from appService:'+actions );

      // }
    }).catch(error => {
      this.isLoading = false;
      this.calendarList = [];
    });
    return new Promise(resolve => setTimeout(() => resolve(events), 3000));
  }
  getRoomMeetings(empId,roomid, actions: CalendarSchedulerEventAction[]): Promise<CalendarSchedulerEvent[]> {
    let events = [];

    this.httpService.getById(APIURLS.BR_ROOM_BOOKING_GetBYANY_API, roomid).then((data: any) => {
      // console.log(usrid);
      this.isLoading = false;
      // console.log(data);
      if (data.length > 0) {
        this.calendarList = data.filter(x => { return x.isCancelled == false && (x.status=='Rejected by Manager'?false: x.status=='Rejected by Admin'?false:true)});
        for (let cal of this.calendarList) {
          let stDate = new Date(cal.fromDate);
          //console.log(stDate.toDateString());
          let edDate = new Date(cal.toDate);
          //console.log(edDate.toDateString());
          if(cal.allDay)
          {
            let d = new Date(stDate.toDateString() + ' ' + cal.fromTime);
            //console.log(d); //Start Date & Time
            let ed = new Date(edDate.toDateString() + ' ' + cal.toTime);
            //console.log(ed); //End Date & Time
            events.push(
              <CalendarSchedulerEvent>{
                id: cal.id,
                start: d,
                end: ed,//addHours(d, hours),
                title: cal.empEmail+'<br>EmpNo: '+cal.fkEmployeeId+'<br>Designation: '+cal.empDesignation+'<br>Status: '+cal.status,
                content: 'test Content',
                color: cal.fkEmployeeId==empId?colors.blue:colors.yellow,
                actions: actions,
                status: 'ok' as CalendarSchedulerEventStatus,
                isClickable: true,
                isDisabled: false,
                draggable: false,//cal.status=='Approved'?false:cal.fkEmployeeId==empId,
                resizable: {
                  beforeStart: false,//cal.status=='Approved'?false:cal.fkEmployeeId===empId,
                  afterEnd: false //cal.status=='Approved'?false:cal.fkEmployeeId===empId
                }
              });
          }
          else{
            var getDateArray = [];
            while (stDate <= edDate) {
              getDateArray.push(new Date(stDate));
              stDate.setDate(stDate.getDate() + 1);
            }
           //console.log(getDateArray);
            for (let i = 0; i < getDateArray.length; i++) {
              var date = new Date(getDateArray[i]);
              let d = new Date(date.toDateString() + ' ' + cal.fromTime);
              //console.log(d); //Start Date & Time
              let ed = new Date(date.toDateString() + ' ' + cal.toTime);
              //console.log(ed); //End Date & Time
              events.push(
                <CalendarSchedulerEvent>{
                  id: cal.id,
                  start: d,
                  end: ed,//addHours(d, hours),
                  title: cal.empEmail+'<br>EmpNo: '+cal.fkEmployeeId+'<br>Designation: '+cal.empDesignation+'<br>Status: '+cal.status,
                  content: 'test Content',
                  color: cal.fkEmployeeId==empId?colors.blue:colors.yellow,
                  actions: actions,
                  status: 'ok' as CalendarSchedulerEventStatus,
                  isClickable: true,
                  isDisabled: false,
                  draggable: false,//cal.status=='Approved'?false:cal.fkEmployeeId==empId,
                  resizable: {
                    beforeStart: false,//cal.status=='Approved'?false:cal.fkEmployeeId===empId,
                    afterEnd: false //cal.status=='Approved'?false:cal.fkEmployeeId===empId
                  }
                });

            }
          }



        }
      }
     //console.log(events);
      // console.log('from appService:'+actions );

      // }
    }).catch(error => {
      this.isLoading = false;
      this.calendarList = [];
    });
    return new Promise(resolve => setTimeout(() => resolve(events), 3000));
  }
}
