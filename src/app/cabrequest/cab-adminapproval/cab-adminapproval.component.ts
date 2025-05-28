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
  selector: 'app-cab-adminapproval',
  templateUrl: './cab-adminapproval.component.html',
  styleUrls: ['./cab-adminapproval.component.css']
})
export class CabAdminapprovalComponent implements OnInit {
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
  checkCabDetails:boolean=false;
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
    genericBookingFilters.adminId = this.currentUser.employeeId;
    genericBookingFilters.fromdate = this.getDateFormate(todaydate);
    if (filter == 'today') {
      // genericBookingFilters.todate = this.getDateFormate(todaydate);
      genericBookingFilters.status = 'Pending with Admin';
    }
    if (filter == 'approve')
      genericBookingFilters.status = 'Approved,Cab Assigned,Rejected by Admin';
    if (filter == 'assign')
      genericBookingFilters.status = 'Approved';
    this.httpService.post(APIURLS.BR_CAB_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        this.mycabRequests = data.filter((x:any)  => { return x.isCancelled == false && (x.status != 'Pending with Manager' && x.status != 'Rejected by Manager')});
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
  assignBookings: number = 0;
  loadTilesCount() {
    this.isLoading = true;
    let todaydate = new Date();
    var genericBookingFilters = {} as GenericCabBookingFilters;
    genericBookingFilters.adminId = this.currentUser.employeeId;
    genericBookingFilters.fromdate = this.getDateFormate(todaydate);

    this.httpService.post(APIURLS.BR_CAB_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        this.allBookings = data.filter((x:any)  => { return x.isCancelled == false && (x.status != 'Pending with Manager' && x.status != 'Rejected by Manager')}).length;
        // this.todayBookings = data.filter((x:any)  => { return x.isCancelled == false && new Date(x.toDateTime).getDate() == todaydate.getDate() && x.status == 'Pending with Admin' }).length;
        this.todayBookings = data.filter((x:any)  => { return x.isCancelled == false && x.status == 'Pending with Admin' }).length;
        this.approvedBookings = data.filter((x:any)  => { return x.isCancelled == false && (x.status == 'Approved' || x.status=="Cab Assigned" || x.status == 'Rejected by Admin') }).length;
        this.assignBookings = data.filter((x:any)  => { return x.isCancelled == false && (x.status == 'Approved') }).length;
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
    this.checkCabDetails=false;
  }
  //approve/ reject Cab Requests...
  onSubmit(status: string) {
    if (status == "Rejected" && this.cabRequest.adminComments==null) {
      swal({
        text: "Please enter comments.",
        icon: "warning",
        buttons: [false, true]
      });
    }
    else {
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
  }
  toggleVisibility(e){
    if (!e.target.checked) {
      this.cabRequest.cabDetails = null;
      this.cabRequest.driverName = null;
      this.cabRequest.driverContact = null;
    }
  }
  actionOnBookings(status: string) {
    if (status != 'Updated') {
      if (status == "Rejected") {
        this.cabRequest.cabDetails = null;
        this.cabRequest.driverName = null;
        this.cabRequest.driverContact = null;
      }
      this.cabRequest.adminApprovalDate = this.getFormatedDateTime(new Date());
      if (this.checkCabDetails)
        this.cabRequest.status = "Cab Assigned";
      else
        this.cabRequest.status = status == "Rejected" ? status + " by Admin" : status;
    }
    else {
      this.cabRequest.status = "Cab Assigned";
    }
    this.cabRequest.modifiedBy = this.currentUser.uid;
    this.cabRequest.modifiedDate = this.getFormatedDateTime(new Date());
    let connection = this.httpService.put(APIURLS.BR_CAB_BOOKING_API, this.cabRequest.id, this.cabRequest);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        this.sendMail(this.cabRequest);
        $('#myModal').modal('hide');
        this.errMsgModalPop = " Request " + status + " successfully!";
        $("#saveModal").modal('show');
        this.loadTilesCount();
        this.getMyRequests();
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error in booking cab';
    });
  }
  sendMail(bookingData: CabBooking) {
    let connection: any;
    let type: string
    if (bookingData.status == "Rejected by Admin") {
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
  keyPressNumber(evt:any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
}
