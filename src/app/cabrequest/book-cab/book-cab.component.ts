import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CabBooking } from '../cabbooking.model';
import { GenericCabBookingFilters } from '../genericcabbookingfilters.model';
import swal from 'sweetalert';
declare var $: any;

@Component({
  selector: 'app-book-cab',
  templateUrl: './book-cab.component.html',
  styleUrls: ['./book-cab.component.css']
})
export class BookCabComponent implements OnInit {
  @ViewChild(NgForm) calendarForm: NgForm;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  isLoadingPop: boolean = false;
  tableWidget: any;
  cabRequest = {} as CabBooking;
  mycabRequests: CabBooking[] = [];
  isEdit: boolean = false;
  min: Date = new Date();
  empLocatonCode:string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getLocationById(this.currentUser.baselocation);
      this.getCurrentEmployeeDetails();
      this.getBaseLocationAdmin();
      this.getPurposeList();
      this.loadTilesCount();
      this.getMyRequests();
    }
  }
  //Page Load functions here...
  selectedTrip: any;
  selectedTripList = [
    { type: "Local" },
    { type: "Outstation" },
  ]
  selectedService: any;
  serviceTypeList = [
    { type: "One way" },
    { type: "Round" },
  ]
  purposeList: any[] = [];
  selectedPurpose: any;
  getPurposeList() {
    this.httpService.get(APIURLS.BR_BOOK_PURPOSE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.purposeList = data.filter(x=>x.type=="Cab Request" && x.isActive).sort((a,b)=>{if(a.purpose > b.purpose) return 1; if(a.purpose < b.purpose) return -1; return 0;});
      }
    }).catch(error => {
      this.purposeList = [];
    });
  }
  getMyRequests(filter: string = 'all') {
    this.isLoading = true;
    let todaydate = new Date();
    var genericBookingFilters = {} as GenericCabBookingFilters;
    genericBookingFilters.employeeId = this.currentUser.employeeId;
    //genericBookingFilters.fromdate = this.getDateFormate(todaydate);
    if (filter == 'today')
    {
      genericBookingFilters.fromdate = this.getDateFormate(todaydate);
      genericBookingFilters.todate = this.getDateFormate(todaydate);
    }
    else if (filter == 'approve')
      genericBookingFilters.status = 'Approved';
    else if (filter == 'reject')
      genericBookingFilters.status = 'Rejected by Admin,Rejected by Manager';
    this.httpService.post(APIURLS.BR_CAB_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        if (filter == 'cancel')
          this.mycabRequests = data.filter(x => { return x.isCancelled == true });
        else
          this.mycabRequests = data;
        this.mycabRequests.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.mycabRequests = [];
    });
  }
  //Load Tiles Count
  allBookings: number = 0;
  todayBookings: number = 0;
  approvedBookings: number = 0;
  rejectedBookings: number = 0;
  cancelledBookings: number = 0;
  loadTilesCount() {
    this.isLoading = true;
    let todaydate = new Date();
    var genericBookingFilters = {} as GenericCabBookingFilters;
    genericBookingFilters.employeeId = this.currentUser.employeeId;
   // genericBookingFilters.fromdate = this.getDateFormate(todaydate);

    this.httpService.post(APIURLS.BR_CAB_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        this.allBookings = data.length;
        this.todayBookings = data.filter(x => { return this.getDateFormate(x.fromDateTime) == this.getDateFormate(todaydate) }).length;
        this.cancelledBookings = data.filter(x => { return x.isCancelled == true }).length;
        this.approvedBookings = data.filter(x => { return x.status == 'Approved' }).length;
        this.rejectedBookings = data.filter(x => { return ( x.status == 'Rejected by Admin' || x.status == 'Rejected by Manager') }).length;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  getLocationById(lId: number) {
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.empLocatonCode=data.code;
        // this.roomLocation = data ? data.code + '-' + data.name : '';
      }
    }).catch(error => {
      this.empLocatonCode = '';
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
          { "orderable": false, "targets": 8 }
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
  meeting:any;
  onNewRequest(isEdit: boolean, cabbooking: CabBooking): void {
    this.isEdit = isEdit;
    this.resetForm();
    this.calendarForm.form.markAsPristine();
    this.calendarForm.form.markAsUntouched();
    this.calendarForm.form.updateValueAndValidity();
    if (isEdit) {
      this.cabRequest = Object.assign({}, cabbooking);
      this.selectedTrip = this.selectedTripList.find(x => x.type == cabbooking.typeofTrip);
      this.selectedService = this.serviceTypeList.find(x => x.type == cabbooking.serviceType);
      this.selectedPurpose = this.purposeList.find(x => x.id == cabbooking.fkPurpose);
    }
    $("#myModal").modal('show');
  }
  //reset form here..
  resetForm(): void {
    this.selectedTrip = null;
    this.selectedService = null;
    this.selectedPurpose = null;
    this.cabRequest = {} as CabBooking;
    this.errMsgPop = '';
    //this.tominTime=new Date();
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
    let searchStr = this.currentUser.baselocation.toString() + ',' + '1004';//Room Location Admin
    this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_BYPARAM_API, searchStr).then((data: any) => {
      if (data.length > 0) {
        this.adminInfo = data;
      }
    }).catch(error => {
      this.adminInfo = [];
    });
  }
  //Book Cab...
  onSubmit() {
    let fromDateTime = new Date(this.cabRequest.fromDateTime);
    let toDateTime = new Date(this.cabRequest.toDateTime);
    let fromDate = new Date(fromDateTime.getFullYear(),fromDateTime.getMonth(),fromDateTime.getDate(),fromDateTime.getHours(),fromDateTime.getMinutes());
    let toDate = new Date(toDateTime.getFullYear(),toDateTime.getMonth(),toDateTime.getDate(),toDateTime.getHours(),toDateTime.getMinutes());
    if (toDate <= fromDate) {
      swal({
        text: "To date/time should be grater than from date/time",
        icon: "warning",
        buttons: [false, true]
      });
    }
    else if (this.cabRequest.numberOfPerson <= 0) {
      swal({
        title: "Message",
        text: "Number of persons should be greater than zero",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      if (this.adminInfo.length > 0) {
        swal({
          title: "Are you sure to Submit?",
          icon: "warning",
          buttons: [true, true],
        })
          .then((willsave) => {
            if (willsave) {
              this.saveCabBooking();
            }
          });
      }
      else{
        swal("There are no approvers configured on this current location.Please contact the administrator");
      }
    }
  }
  saveCabBooking() {
    let bookingId: number;
    let connection: any;
    if (!this.isEdit) {
      this.cabRequest.fkEmployeeId = parseInt(this.currentUser.employeeId);
      this.cabRequest.employeeNumber = this.currentUser.employeeId;
      this.cabRequest.fkPurpose = this.selectedPurpose.id;
      this.cabRequest.empoloyeeLocation = this.currentUser.baselocation;
      this.cabRequest.typeofTrip = this.selectedTrip.type;
      this.cabRequest.serviceType = this.selectedService.type;
      this.cabRequest.fromDateTime = this.getFormatedDateTime(this.cabRequest.fromDateTime);
      this.cabRequest.toDateTime = this.getFormatedDateTime(this.cabRequest.toDateTime);
      this.cabRequest.isApprovalReq = false;
      this.cabRequest.isCancelled = false;
      this.cabRequest.empName = this.currentUser.fullName;
      this.cabRequest.empEmail = this.currentUser.email;
      this.cabRequest.empDesignation = this.currentUser.designation;
      this.cabRequest.createdBy = this.currentUser.uid;
      this.cabRequest.createdDate = this.getFormatedDateTime(new Date());
      this.cabRequest.purpose = this.selectedPurpose.purpose;
      this.cabRequest.managerId = this.managerInfo.employeeId;
      this.cabRequest.managerName = this.managerInfo.firstName + ' ' + this.managerInfo.middleName + ' ' + this.managerInfo.lastName;
      this.cabRequest.managerEmail = this.managerInfo.email;
      this.cabRequest.adminId = this.adminInfo[0].employeeId;
      this.cabRequest.adminName = this.adminInfo[0].firstName + ' ' + this.adminInfo[0].middleName + ' ' + this.adminInfo[0].lastName;
      this.cabRequest.adminEmail = this.adminInfo[0].email;
      this.cabRequest.status = "Pending with Manager";
      this.cabRequest.empLocatonCode=this.empLocatonCode;
      connection = this.httpService.post(APIURLS.BR_CAB_BOOKING_API, this.cabRequest);
    }
    else {
      this.cabRequest.modifiedBy = this.currentUser.uid;
      this.cabRequest.modifiedDate = this.getFormatedDateTime(new Date());
      bookingId = this.cabRequest.id;
      connection = this.httpService.put(APIURLS.BR_CAB_BOOKING_API, this.cabRequest.id, this.cabRequest);
    }
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        if (!this.isEdit) {
          bookingId = data.id;
          this.cabRequest.requestNo=data.requestNo;
        }
        this.sendMail(this.cabRequest);
        $('#myModal').modal('hide');
        if (this.isEdit)
          this.errMsgModalPop = 'Cab Request updated!';
        else
          this.errMsgModalPop = 'Cab Request is created successfully!';
        $("#saveModal").modal('show');
        this.loadTilesCount();
        this.getMyRequests();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error in Cab Request';
    });
  }

  //Cancel Cab Request...
  onCancelRequest() {
    swal({
      title: "Are you sure to Cancel?",
      icon: "warning",
      buttons: [true, true],
    })
      .then((willsave) => {
        if (willsave) {
          this.cancelBooking();
        }
      });
  }
  cancelBooking() {
    this.cabRequest.isCancelled = true;
    this.cabRequest.status = "Cancelled";
    this.cabRequest.modifiedBy = this.currentUser.uid;
    this.cabRequest.modifiedDate = this.getFormatedDateTime(new Date());
    let connection = this.httpService.put(APIURLS.BR_CAB_BOOKING_API, this.cabRequest.id, this.cabRequest);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        $('#myModal').modal('hide');
        this.errMsgModalPop = 'Cab request cancelled successfully!';
        $("#saveModal").modal('show');
        this.loadTilesCount();
        this.getMyRequests();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error in Cab request';
    });
  }
  //Tile Filters :
  bookedCabs(filter: string) {
    this.getMyRequests(filter);
  }
  keyPressNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
  sendMail(bookingData:CabBooking) {
    let connection: any;
    if(bookingData.status=="Pending with Manager") {
      connection = this.httpService.sendPutMail(APIURLS.BR_SEND_CABREQUEST_EMAIL_API, "Cab-1stLevelApproval",bookingData);
      connection.then((data: any) => {
        if (data == 200) {
        }
      }).catch(error => {
        this.errMsgPop = 'Error in sending mail..';
      });
    }
  }
}
