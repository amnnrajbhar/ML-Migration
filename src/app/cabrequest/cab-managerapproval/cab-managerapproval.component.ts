import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CabBooking } from '../cabbooking.model';
import { GenericCabBookingFilters } from '../genericcabbookingfilters.model';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var $: any;

@Component({
  selector: 'app-cab-managerapproval',
  templateUrl: './cab-managerapproval.component.html',
  styleUrls: ['./cab-managerapproval.component.css']
})
export class CabManagerapprovalComponent implements OnInit {
 @ViewChild(NgForm, { static: false }) calendarForm!: NgForm;

  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  isLoadingPop: boolean = false;
  tableWidget: any;
  cabRequest = {} as CabBooking;
  mycabRequests: CabBooking[] = [];
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.loadTilesCount();
      this.getMyRequests();
    }
  }
  //Page Load functions here...
  getMyRequests(filter: string = 'all') {
    this.isLoading = true;
    let todaydate = new Date();
    var genericBookingFilters = {} as GenericCabBookingFilters;
    genericBookingFilters.managerId = this.currentUser.employeeId;
    genericBookingFilters.fromdate = this.getDateFormate(todaydate);
    if (filter == 'today') {
      // genericBookingFilters.todate = this.getDateFormate(todaydate);
      genericBookingFilters.status = 'Pending with Manager';
    }
    if (filter == 'approve')
      genericBookingFilters.status = 'Pending with Admin,Approved,Rejected by Admin,Rejected by Manager';
    this.httpService.post(APIURLS.BR_CAB_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        this.mycabRequests = data.filter((x:any)  => { return x.isCancelled == false });
        this.mycabRequests.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.mycabRequests = [];
    });
  }
  //Load Tiles Count
  allBookings: number = 0;
  todayBookings: number = 0;
  approvedBookings: number = 0;
  loadTilesCount() {
    this.isLoading = true;
    let todaydate = new Date();
    var genericBookingFilters = {} as GenericCabBookingFilters;
    genericBookingFilters.managerId = this.currentUser.employeeId;
    genericBookingFilters.fromdate = this.getDateFormate(todaydate);

    this.httpService.post(APIURLS.BR_CAB_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        this.allBookings = data.filter((x:any)  => { return x.isCancelled == false }).length;
        // this.todayBookings = data.filter((x:any)  => { return x.isCancelled == false && new Date(x.toDateTime).getDate() == todaydate.getDate() && x.status == 'Pending with Manager' }).length;
        this.todayBookings = data.filter((x:any)  => { return x.isCancelled == false  && x.status == 'Pending with Manager' }).length;
        this.approvedBookings = data.filter((x:any)  => { return x.isCancelled == false && (x.status == 'Approved' || x.status == 'Pending with Admin' || x.status == 'Rejected by Admin' || x.status == 'Rejected by Manager') }).length;
      }
      this.isLoading = false;
    }).catch((error)=> {
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
  onBookings(bookmeeting: CabBooking): void {
    this.resetForm();
    this.calendarForm.form.markAsPristine();
    this.calendarForm.form.markAsUntouched();
    this.calendarForm.form.updateValueAndValidity();
    this.cabRequest = Object.assign({}, bookmeeting);
    $("#myModal").modal('show');
  }
  //reset form here..
  resetForm(): void {
    this.cabRequest = {} as CabBooking;
    this.errMsgPop = '';
  }
  //approve/ reject Cab Requests...
  onSubmit(status: string) {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: [true, true],
    })
      .then((willsave) => {
        if (willsave) {
          this.actionOnBookings(status);
        }
      });
  }
  actionOnBookings(status: string) {
    this.cabRequest.managerApprovalDate = this.getFormatedDateTime(new Date());
    if (this.cabRequest.adminId && status != "Rejected")
      this.cabRequest.status = "Pending with Admin";
    else
      this.cabRequest.status = status == "Rejected" ? status + " by Manager" : status;
    this.cabRequest.modifiedBy = this.currentUser.uid;
    this.cabRequest.modifiedDate = this.getFormatedDateTime(new Date());
    let connection = this.httpService.put(APIURLS.BR_CAB_BOOKING_API, this.cabRequest.id, this.cabRequest);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        this.sendMail(this.cabRequest);
        $('#myModal').modal('hide');
        this.errMsgModalPop = "Request " + status + " successfully!";
        $("#saveModal").modal('show');
        this.loadTilesCount();
        this.getMyRequests();
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error in Booking Room';
    });
  }
  sendMail(bookingData: CabBooking) {
    let connection: any;
    let type: string
    if (bookingData.status == "Pending with Admin") {
      type = "Cab-2ndLevelApproval";
    }
    else if (bookingData.status == "Rejected by Manager") {
      type = "CabRequestRejected";
    }
    else {
      type = "CabRequestApproved";
    }
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_CABREQUEST_EMAIL_API, type, bookingData);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch((error)=> {
      this.errMsgPop = 'Error in sending mail..';
    });
  }
  //Tile Filters :
  bookedCabs(filter: string) {
    this.getMyRequests(filter);
  }

}
