import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { MatAccordion } from '@angular/material';
import { PayRollRegularizationRequest } from './PayRollRegularizationRequest.model';
import { LeaveDetails } from '../ApplyLeave/ApplyLeave.model';

declare var ActiveXObject: (type: string) => void;


@Component({
  selector: 'app-PayRollRegularizationRequest',
  templateUrl: './PayRollRegularizationRequest.component.html',
  styleUrls: ['./PayRollRegularizationRequest.component.css']
})
export class PayRollRegularizationRequestComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  public tableWidget: any;
  public tableWidgetlv: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  path: string;
  employeeId: any = null;
  year: any;

  CalenderYear: string = '';
  CalYear: any;
  lvType: number = null;
  Date: any = null;
  Date1: string = null;

  Duration1: string = null;
  Duration2: string = null;
  NoOfDays: number = 0;
  LvReason: string = null;
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  LeaveRequestList: any[] = [];
  ApplyFor: any = null;
  userId: string = null;
  ReasonType: string = null;
  SwipeType: string = null;
  filterStatus: any = null;
  today = new Date();
  approvalStatus: any;
  approvedDate: any;
  Time: any = null;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private route: ActivatedRoute) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
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

  dropdownSettings1 = {
    singleSelection: true,
    idField: 'id',
    textField: 'name1',
    allowSearchFilter: true
  };
  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  g
  onSelectAll() {

  }
  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true
  };

  BloodGroupList: any[] = [];

  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    this.getApproversList(this.employeeId);
    this.getEmpPermissionRequests();
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  ApproversList: any[] = [];
  getApproversList(id) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_PERMISSION_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          toastr.error("Approvers Not Assigned");
        }
        else {
          this.ApproversList = data;
        }
      }
    }).catch(error => {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }

  ClearData() {
    this.SwipeType = null;
    this.ReasonType = null;
    this.Date = null;
    this.Time = null;
    this.DetailedReason = null;
    this.attendanceDetails = [];
  }


  lastReportingkeydown = 0;
  getpersonResponsible($event) {
    let text = $('#personName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#personName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#person").val(ui.item.value);
                  $("#personName").val(ui.item.label);
                }
                else {
                  $("#person").val('');
                  $("#personName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#person").val(ui.item.value);
                  $("#personName").val(ui.item.label);
                }
                else {
                  $("#person").val('');
                  $("#personName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }


  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  attendanceDetails: any[] = [];
  getAttendanceDetails() {
    if (this.Date == null) {
      toastr.error("Please select date");
    }
    else {

      this.attendanceDetails = [];
      this.errMsg = "";
      this.isLoading = true;
      let srchstr: any = {};
      srchstr.userId = this.currentUser.employeeId;
      let d1 = new Date(this.Date);
      srchstr.date = this.getDateFormate(this.Date);
      srchstr.location = this.currentUser.baselocation;
      this.httpService.LApost(APIURLS.BR_GET_ATTENDANCE_FOR_PER, srchstr).then((data: any) => {
        if (data) {
          this.attendanceDetails.push(data);
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.attendanceDetails = [];
      });

    }
  }

  checkTimings() {
    if (this.attendanceDetails[0].inTime == '00:00' || this.attendanceDetails[0].outStatus == '00:00') {
      swal({
        title: "Error",
        text: "Please place a regularization request to regularize your Punch timings...",
        icon: "error",
        dangerMode: false,
        buttons: [false, true]
      });
      jQuery("#myModal").modal('hide');
      this.ClearData();
      return;
    }
    else {

    }

  }

  isValid: boolean = false;
  validatedForm: boolean = true;
  name: string;
  getEmpPermissionRequests() {
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    srchstr.userId = this.currentUser.employeeId;
    srchstr.year = this.CalYear;
    this.httpService.LApost(APIURLS.GET_EMPLOYEE_PAYREG_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.LeaveRequestList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.LeaveRequestList = [];
    });
  }
  view: boolean = false;
  ApplyLeave(isedit: boolean, data: any, value: string) {
    this.attendanceDetails = [];
    this.view = false;
    this.isEdit = isedit;
    this.ClearData();
    if (this.isEdit) {
      this.CalenderYear = this.CalYear;
      this.Date = data.date;
      this.Time = data.time;
      this.SwipeType = data.swipeType;
      this.ReasonType = data.reasonType;
      this.DetailedReason = data.reason;
      this.approvedDate = data.approvedDate;
      this.approvalStatus = data.status;
      this.getAttendanceDetails();
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }

  getFormattedTime(date: any) {
    let dtStartTime = new Date(date);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
  }


  OnSaveRequest(status) {
    let filterModel = {} as PayRollRegularizationRequest;
    if (this.attendanceDetails[0].inStatus == 'PP' && this.SwipeType == 'In') {
      swal({
        title: "Message",
        text: "Attendance details already available...",
        icon: "error",
        dangerMode: false,
        buttons: [false, true]
      });
      return;
    }
    else if (this.attendanceDetails[0].outStatus == 'PP' && this.SwipeType == 'Out') {
      swal({
        title: "Message",
        text: "Attendance details already available...",
        icon: "error",
        dangerMode: false,
        buttons: [false, true]
      });
      return;
    }
    else {
      this.isLoading = true;
      filterModel.userId = this.currentUser.employeeId;
      filterModel.requestedBy = this.currentUser.employeeId;
      filterModel.date = this.getDateFormate(this.Date);
      filterModel.reason = this.DetailedReason;
      filterModel.pendingApprover = this.ApproversList[0].employeeId;
      filterModel.status = 'Pending';
      filterModel.swipeType = this.SwipeType;
      if(this.SwipeType == 'In'){
        filterModel.time = this.attendanceDetails[0].inTime;
      }
      else {
        filterModel.time = this.attendanceDetails[0].outTime;
      }
      let connection = this.httpService.LApost(APIURLS.INSERT_PAYROLL_REGULARIZATION_REQUEST, filterModel);
      connection.then((data: any) => {
        this.isLoading = false;
        if (data.type == 'S') {
          swal({
            title: "Message",
            text: "Payroll Regularization Request Details Submitted Sucessfully With Req Id : " + data.requestNo,
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          jQuery("#myModal").modal('hide');
          this.ClearData();
        }
        else if (data.type == 'E') {
          swal({
            title: "Error",
            text: data.message,
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
          this.ClearData();
        }
        this.getEmpPermissionRequests();
      }).catch(error => {
        this.errMsgPop = 'Error submitting request ..';
      });
    }
  }

  Cancel(data) {
    swal({
      title: "Message",
      text: "Are you sure to cancel ?.",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {

        let leaveDetailsModel = {} as PayRollRegularizationRequest;

        leaveDetailsModel = Object.assign({}, data)

        leaveDetailsModel.cancelflag = true;
        leaveDetailsModel.status = 'Self Cancelled';
        leaveDetailsModel.pendingApprover = '';

        let connection = this.httpService.LAput(APIURLS.UPDATE_PAYROLL_REGULARIZATION_REQUEST, leaveDetailsModel.id, leaveDetailsModel);
        connection.then((data: any) => {
          this.isLoading = false;
          if (data) {
            swal({
              title: "Message",
              text: "Payroll Regularization Request Cancelled Sucessfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            });
          }
          else {
            swal({
              title: "Message",
              text: "Error Cancelling Payroll Regularization Request ..",
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            });
          }
          this.getEmpPermissionRequests();
        }).catch(error => {
          this.errMsgPop = 'Error Cancelling Payroll Regularization Request ..';
        });
      }
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
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

}
