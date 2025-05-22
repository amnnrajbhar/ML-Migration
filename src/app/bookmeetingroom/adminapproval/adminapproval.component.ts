import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BookMeeting } from '../room-booking/bookmeeting.model';
import { GenericBookingFilters } from '../genericbookingfilters.model';
import { NgForm } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-adminapproval',
  templateUrl: './adminapproval.component.html',
  styleUrls: ['./adminapproval.component.css']
})
export class AdminapprovalComponent implements OnInit {
 @ViewChild(NgForm, { static: false }) calendarForm: NgForm;

  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  isLoadingPop: boolean = false;
  tableWidget: any;
  calendarMeeting = {} as BookMeeting;
  myMeetings: BookMeeting[] = [];
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.loadTilesCount();
      this.getApprovalMeetings();
    }
  }
  //Page Load functions here...
  getApprovalMeetings(filter: string = 'all') {
    this.isLoading = true;
    let todaydate = new Date();
    var genericBookingFilters = {} as GenericBookingFilters;
    genericBookingFilters.adminId = this.currentUser.employeeId;
    genericBookingFilters.fromdate = this.getDateFormate(todaydate);
    if (filter == 'today') {
     // genericBookingFilters.todate = this.getDateFormate(todaydate);
      genericBookingFilters.status = 'Pending with Admin';
    }
    else if (filter == 'approve')
      genericBookingFilters.status = 'Approved,Rejected by Admin';

    this.httpService.post(APIURLS.BR_ROOM_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        this.myMeetings = data.filter(x => { return x.isCancelled == false && (x.status != 'Pending with Manager' && x.status != 'Rejected by Manager')});
        this.myMeetings.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.myMeetings = [];
    });
  }
  //Load Tiles Count
  allMeetings:number=0;
  todayMeetings:number=0;
  approvedMeetings:number=0;
  loadTilesCount() {
    this.isLoading = true;
    let todaydate = new Date();
    var genericBookingFilters = {} as GenericBookingFilters;
    genericBookingFilters.adminId = this.currentUser.employeeId;
    genericBookingFilters.fromdate = this.getDateFormate(todaydate);
    
    this.httpService.post(APIURLS.BR_ROOM_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        this.allMeetings = data.filter(x => { return x.isCancelled == false && (x.status != 'Pending with Manager' && x.status != 'Rejected by Manager')}).length;
        // this.todayMeetings = data.filter(x => { return x.isCancelled == false && new Date(x.toDate).getDate()== todaydate.getDate() && x.status =='Pending with Admin'}).length;
        this.todayMeetings = data.filter(x => { return x.isCancelled == false && x.status =='Pending with Admin'}).length;
        this.approvedMeetings = data.filter(x => { return x.isCancelled == false && (x.status == 'Approved' || x.status == 'Rejected by Admin') }).length;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  //get My Meetings and Apply filters and paging to table..
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    var table = $('#roomsTable').DataTable(
      {
        "destroy": true,
        "columnDefs": [
          { "orderable": false, "targets": 7 }
        ]
      }
    );
    this.tableWidget = table;
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }
  //bind formatted location and date/time
  bindLocation(meeting: any) {
    return meeting.roomLocationCode + ' - ' + meeting.roomLocationName;
  }
  binddatetime(time) {
    let datetime = new Date();
    let times = time.split(':');
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1]));
    datetime.setSeconds(parseInt(times[2]));
    return datetime;
  }
  //Date Time Convertors...
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
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
  //Modal popup event
  fromTime: any;
  toTime: any;
  onMeeting(bookmeeting: BookMeeting): void {
    this.resetForm();
    this.calendarForm.form.markAsPristine();
    this.calendarForm.form.markAsUntouched();
    this.calendarForm.form.updateValueAndValidity();
    this.calendarMeeting = Object.assign({}, bookmeeting);
    this.fromTime = this.binddatetime(this.calendarMeeting.fromTime);
    this.toTime = this.binddatetime(this.calendarMeeting.toTime);
    $("#myModal").modal('show');
  }
  //reset form here..
  resetForm(): void {
    this.calendarMeeting = {} as BookMeeting;
    this.errMsgPop = '';
  }
  //approve/ reject the meeting...
  actionMeeting(status: string) {
    this.calendarMeeting.adminApprovalDate = this.getFormatedDateTime(new Date());
    this.calendarMeeting.status = status == "Rejected" ? status + " by Admin" : status;
    this.calendarMeeting.modifiedBy = this.currentUser.uid;
    this.calendarMeeting.modifiedDate = this.getFormatedDateTime(new Date());
    let connection = this.httpService.put(APIURLS.BR_ROOM_BOOKING_API, this.calendarMeeting.id, this.calendarMeeting);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        this.sendMail(this.calendarMeeting);
        $('#myModal').modal('hide');
        this.errMsgModalPop = status + " successfully!";
        $("#saveModal").modal('show');
        this.loadTilesCount();
        this.getApprovalMeetings();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error in Booking Room';
    });
  }
  sendMail(bookingData: BookMeeting) {
    let connection: any;
    let type: string;
    if (bookingData.status == "Rejected by Admin") {
      type = "MeetingRejected";
    }
    else {
      type = "MeetingApproved";
    }
    connection = this.httpService.sendPutMail(APIURLS.BR_SENDMEETINGEMAIL_API, type, bookingData);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });
  }
  //Tile Filters :
  bookAppointment(filter: string) {
    this.getApprovalMeetings(filter);
  }
}
