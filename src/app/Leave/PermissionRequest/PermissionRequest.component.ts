import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatAccordion } from '@angular/material';
import { PermissionDetails } from './PermissionRequest.model';
import * as moment from 'moment';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from 'html-to-pdfmake';

declare var ActiveXObject: (type: string) => void;



@Component({
  selector: 'app-PermissionRequest',
  templateUrl: './PermissionRequest.component.html',
  styleUrls: ['./PermissionRequest.component.css']
})
export class PermissionRequestComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;

  @ViewChild('myInput') myInputVariable: ElementRef;

  public tableWidget: any;
  public tableWidgetlv: any;
  //designationList: any[] = [];
  roleList: any[] = [];
  departmentList: any[] = [];
  profileList: any[] = []; managerList: any[] = []; reporting_managerList: any[] = [];
  projectList: any[] = [];
  userDivisionList: any[] = [];
  empListCon = [];
  empListCon1 = [];
  locListCon = [];
  locListCon1 = [];
  genders: any[] = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }];
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  addressList: any[];
  empOtherDetailList: any[];
  employeePayrollList: any[];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  path: string;
  selectedBaseLocation: any[] = [];
  employeeId: any = null;
  userMasterItem: any = {};
  year: any;

  CalenderYear: string = '';
  CalYear: any;
  OnDutyType: string = null;
  StartDate: string = null;
  EndDate: string = null;
  Duration1: string = null;
  Duration2: string = null;
  NoOfDays: number = 0;
  LvReason: string = null;
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  PermissionRequestList: any[] = [];
  approverStatus: string = null;
  approvedDate: string = null;
  Starttime: any;
  EndTime: any;
  fromDate: any;
  toDate: any;
  fromTime: any;
  toTime: any;
  Plant: any = null;
  SwipeType: any = null;
  PermissionType: any = null;
  permissionDate: any;
  perType: any;
  strTime: any;
  endTime: any;
  swipeType: any;
  status: any;
  reqDate: any;
  perReason: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: Http, private https: HttpClient, private route: ActivatedRoute) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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
  // private initPerDatatable(): void {
  //   let exampleId: any = jQuery('#perTable');
  //   this.tableWidget = exampleId.DataTable({
  //     "order": []
  //   });
  // }

  // private reInitPerDatatable(): void {
  //   if (this.tableWidget) {
  //     this.tableWidget.destroy()
  //     this.tableWidget = null
  //   }
  //   setTimeout(() => this.initPerDatatable(), 0)
  // }


  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  loccode: any = [];
  getLocationMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.loccode = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
        this.getLvRulesList();
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }


  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.baseLocation = this.currentUser.baselocation;
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    //this.fromDate = today;
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getLocationMaster();
      //  this.getApproversList(this.employeeId);
      this.getholidaysList(this.year);
      this.getLvReasonList();
      this.getbase64image();
      this.getEmpPermissionRequests();
      this.getRoleList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }
  
  Rolelist: any[] = [];
  getRoleList() {
    this.errMsg = "";
    this.get("RoleMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.Rolelist = data.filter(x => x.isActive);
      }
    }).catch(error => {
      this.isLoading = false;
      this.Rolelist = [];
    });
  }

  getRole(id) {
    let temp = this.Rolelist.find(x => x.id == id);
    return temp ? temp.role_Stxt : '';
  }

  Holiday: any;
  HolidayDate: any;
  holidayname: any = null;
  holidaysList: HolidayMaster[] = [];
  getholidaysList(id) {
    this.errMsg = "";
    let srchstr = this.currentUser.baselocation + ',,' + this.year + ',' + ',,'
    this.httpService.LAgetByParam(APIURLS.GET_HOLIDAYS_LIST, srchstr).then((data: any) => {
      if (data.length > 0) {
        this.holidaysList = data;
        this.holidaysList = this.holidaysList.filter(x => x.isActive == true).sort((a, b) => {
          if (a.date > b.date) return 1;
          if (a.date < b.date) return -1;
          return 0;

        });
        let temp = this.holidaysList.find(x => new Date(x.date) > new Date());
        this.Holiday = temp ? temp.holidayName : 'No Holidays.'
        this.HolidayDate = temp ? temp.date : null;
        //this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.holidaysList = [];
    });
  }

  ApproversList: any[] = [];
  getApproversList(id) {
    if(this.ApplyFor == "Others" && (this.userId == null || this.userId == '')) {
      toastr.error("Please enter Employee no...!");
      return;
    }
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_PERMISSION_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          //toastr.error("Approvers Not Assigned");
          swal({
            title: "Message",
            text: "Approvers Not Assigned",
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          })
        }
        else {
          this.ApproversList = data;
        }


        //this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }

  // ApproversList1: any[] = [];
  // getApproversListforPM(id) {
  //   this.errMsg = "";
  //   this.httpService.LAgetByParam(APIURLS.GET_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
  //     if (data) {
  //       if (data[0].typ == 'E') {
  //         toastr.error("Approvers Not Assigned");
  //       }
  //       else {
  //         this.ApproversList = data;
  //       }


  //       //this.reInitDatatable();
  //     }
  //   }).catch(error => {
  //     this.isLoading = false;
  //     this.ApproversList = [];
  //   });
  // }

  ClearData() {
    this.fromDate = null;
    this.SwipeType = null;
    this.Starttime = null;
    this.EndTime = null;
    this.attendanceDetails = null;
    this.DetailedReason = null;
  }

  fileToUpload: File | null = null;
  File: File | null = null;
  name: string;
  files: File[] = []
  handleFileInput(files: FileList) {

    this.File = files[0];
    if (this.File.size > 1e+7) {
      swal({
        title: "Message",
        text: "File cannot exceed 10 Mb",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      })
      this.File = null;
    }
    else {
      for (var i = 0; i < files.length; i++) {
        this.files.push(files[i]);
      }
      //  this.validateAttcahment();
    }
    // this.files=[];

    // this.reset();
  }
  reset() {
    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }


  id: string;
  formData = new FormData();
  fileslist1: any[] = [];
  errMsg1: string = '';
  uploadfile() {
    // debugger;
    // this.id='VM001';
    this.formData = new FormData();
    for (var i = 0; i < this.fileslist1.length; i++) {
      this.formData.append('files', this.fileslist1[i]);
    }
    let connection: any;
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_MED_FILEUPLOAD_API, this.id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log('copied file to server')
        //this.imageFlag = true;
      }
    }).catch(error => {
      this.errMsgPop = 'Error uploading file ..';
    });

  }

  ReasonList: any[] = [];
  getLvReasonList() {
    this.errMsg = "";
    this.LvReason = null;
    this.ReasonList = [];
    this.httpService.LAget(APIURLS.BR_GET_ALL_REASONS_LIST).then((data: any) => {
      if (data.length > 0) {
        this.ReasonList = data.filter(x => x.isActive);
      }
    }).catch(error => {
      this.isLoading = false;
      this.ReasonList = [];
    });
  }

  LvRulesList: any[] = [];
  pType: any;
  getLvRulesList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.GET_ALL_RULES_DATA_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.LvRulesList = data.filter(x => x.locationCode == this.loccode);

        if (this.LvRulesList[0].permissionType == 'COUNT WISE') {
          this.totalCount = this.LvRulesList[0].permissionCountYearly;
          this.pType = this.LvRulesList[0].permissionType;
        }
        else {
          this.totalCount = this.LvRulesList[0].pTotalMinutes;
          this.pType = this.LvRulesList[0].permissionType;
        }

      }
    }).catch(error => {
      this.isLoading = false;
      this.ReasonList = [];
    });
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



  isValid: boolean = false;
  validatedForm: boolean = true;
  PermissionCount: number = 0;
  totalCount: any;
  getEmpPermissionRequests() {
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    srchstr.userId = this.currentUser.employeeId;
    srchstr.year = this.CalYear;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_PERMISSION_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.PermissionRequestList = data;
        this.PermissionRequestList.reverse();
        this.PermissionCount = this.PermissionRequestList.filter(x => x.approverStatus == 'Approved' || x.approverStatus == 'Pending').length + 1;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.PermissionRequestList = [];
    });
  }
  view: boolean = false;
  binddatetime(time) {
    let datetime = new Date();
    let times = time.split(':');
    let tm = times[1].toString().substring(2, 4);
    if (tm == 'PM') {
      times[0] = +times[0] + +12;
    }
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1].toString().substring(0, 2)));
    datetime.setSeconds(parseInt('00'));
    return datetime;
  }

  ApplyPermission(isedit: boolean, data: any, value: string) {

    this.errMsgPop = '';
    this.view = false;
    this.isEdit = isedit;
    this.ClearData();
    this.fromDate = null;
    this.DetailedReason = null;
    this.SwipeType = null;
    this.fromTime = '';
    this.toTime = '';

    if (this.isEdit) {
      //   let data=Object.assign({},value)
      this.getApproversList(data.userId);
      this.Plant = data.location;
      this.CalenderYear = this.CalYear;
      this.fromDate = data.date;
      this.SwipeType = data.swipeType;
      this.fromTime = this.binddatetime1(data.startTime);
      this.toTime = this.binddatetime1(data.endTime);
      this.DetailedReason = data.reason;
      this.approverStatus = data.approverStatus;
      this.approvedDate = data.approvedDate;
    }
    else {
      this.getApproversList(this.currentUser.employeeId);

    }
    if (value == 'View') {
      this.view = true;
    }
    this.getEmpPermissionRequests();
    jQuery("#myModal").modal('show');
  }

  transform(value: any, args?: any): any {
    return moment(value, 'HH:mm').format("HH:mm A");
  }

  binddatetime1(time) {
    let datetime = new Date();
    let times = time.split(':');
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1]));
    datetime.setSeconds(parseInt(times[2]));
    return datetime;
  }

  sendMail(data) {
    data.typ = 'ApplyPermission';
    if (this.ApplyFor == "Others") {
      data.userId = this.userId;
    }
    else {
      data.userId = this.currentUser.employeeId;
    }
    let connection = this.httpService.LApost(APIURLS.BR_SEND_MAIL_FOR_PERMISSION, data);
    connection.then((data: any) => {
      this.isLoading = false;

      //this.getEmpleaveRequests();
      this.reset();
    }).catch(error => {
      this.errMsgPop = 'Failure Sending Mail ..';
    });
  }

  CancelPermission(data: PermissionDetails) {
    swal({
      title: "Message",
      text: "Are you sure to cancel ?.",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {

        let leaveDetailsModel = {} as PermissionDetails;
        leaveDetailsModel = Object.assign({}, data);
        leaveDetailsModel.id = data.id;
        // leaveDetailsModel.approverStatus = '4';
        leaveDetailsModel.approverStatus = 'Self Cancelled';
        let connection = this.httpService.LAput(APIURLS.UPDATE_PERMISSION_REQUEST, leaveDetailsModel.id, leaveDetailsModel);
        connection.then((data: any) => {
          this.isLoading = false;
          if (data) {
            //toastr.success("Permission Cancelled Sucessfully..!");
            swal({
              title: "Message",
              text: "Permission Cancelled Sucessfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            })
          }
          else {
            //toastr.error("Error Cancelling Permission ..");
            swal({
              title: "Message",
              text: "Error Cancelling Permission ..",
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            })
          }
          this.getEmpPermissionRequests();
          this.reset();
        }).catch(error => {
          this.errMsgPop = 'Error Cancelling Permission ..';
        });


      }
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  attendanceDetails: any[] = [];
  showAttendance: boolean = false;
  getAttendanceDetails() {
    if (this.fromDate == null) {
      toastr.error("Please select Date");
    }
    else {
      this.attendanceDetails = [];
      this.showAttendance = true;
      this.errMsg = "";
      this.isLoading = true;
      let srchstr: any = {};
      if (this.ApplyFor == "Others") {
        srchstr.userId = this.userId;
      }
      else {
        srchstr.userId = this.currentUser.employeeId;
      }

      //srchstr.userId = this.currentUser.employeeId;
      let d1 = new Date(this.fromDate);
      srchstr.date = this.getDateFormate(this.fromDate);
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

  ApplyFor: any = null;
  userId: string = null;
  lastReportingkeydown1 = 0;
  getEmployee($event) {
    let text = $('#userId').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#userId').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#userId").val(ui.item.value);
                  $("#userId").val(ui.item.value);
                }
                else {
                  $("#userId").val('');
                  $("#userId").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#userId").val(ui.item.value);
                  $("#userId").val(ui.item.value);
                }
                else {
                  $("#userId").val('');
                  $("#userId").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown1 = $event.timeStamp;
    }
  }

  getFormattedTime(date: any) {
    let today = new Date();
    let dtStartTime = new Date(today.getFullYear(), today.getMonth(), today.getDay(), date.split(":")[0], date.split(":")[1], 0);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
  }

  getFormattedTimeOnly(date: any) {
    let dtStartTime = new Date(date);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
  }

  InsertPermission() {
    this.isLoadingPop = true;
    swal({
      text: "Please wait.. Permission is getting applied ..!",
      timer: 2000,
      icon: "info",
      dangerMode: false,
      buttons: [false, false]
    });
    let filterModel = {} as PermissionDetails;
    if (this.ApplyFor == "Others") {
      filterModel.applyFor = 'Others';
      filterModel.userId = this.userId;
    }
    else {
      filterModel.applyFor = 'Self';
      filterModel.userId = this.currentUser.employeeId;
    }

    filterModel.date = this.getDateFormate(this.fromDate);
    filterModel.startTime = this.getFormattedTimeOnly(this.fromTime);
    filterModel.endTime = this.getFormattedTimeOnly(this.toTime);
    filterModel.reason = this.DetailedReason;
    filterModel.firstname = this.currentUser.employeeId;
    filterModel.approverStatus = 'Pending';
    filterModel.pendingApprover = this.ApproversList[0].employeeId;
    filterModel.approverId = this.ApproversList[0].employeeId;
    filterModel.swipeType = this.SwipeType;
    filterModel.location = this.currentUser.baselocation;
    filterModel.type = 'Personal';
    filterModel.permissionType = this.PermissionType;

    let connection = this.httpService.LApost(APIURLS.BR_INSERT_PERMISSION_REQUEST, filterModel);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data.typ == 'S') {
        jQuery("#myModal").modal('hide');
        //toastr.success("Permission Details Submitted Sucessfully With Req Id : " + data.requestNo);
        swal({
          title: "Message",
          text: "Permission Details Submitted Sucessfully With Req Id : " + data.requestNo,
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        })
        this.sendMail(data);
        this.getEmpPermissionRequests();
        this.reset();
      }
      else if (data.typ == 'E') {
        //toastr.error(data.message);
        jQuery("#myModal").modal('hide');
        swal({
          title: "Message",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        })
      }
      this.getEmpPermissionRequests();
    }).catch(error => {
      this.errMsgPop = 'Error Applying Permission ..';
    });
  }


  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res.json());
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
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
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

  setFormatedTime(date: any) {
    let dt = new Date(date);
    let formateddate =
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  image: string;
  getbase64image() {
    this.https.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
        };

      });
  }

  Department: any;
  Designation: any;
  FullName: any;
  RoleId: any;
  JoiningDate: any;
  EmployeeId: any;
  GetEmpDetails(val) {

    let connection = this.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, val);
    connection.then((data: any) => {
      if (data) {
        let result = data.filter(x => { return x.employeeId != null });
        this.Department = result[0].department;
        this.Designation = result[0].designation;
        this.FullName = result[0].fullName;
        this.EmployeeId = result[0].employeeId;
        this.JoiningDate = result[0].joiningDate;
        this.RoleId = result[0].roleId;
      }
    }).catch(error => {
    });
  }

  reqNo: any;
  printPermission(values) {
    this.GetEmpDetails(values.userId);
    this.reqNo = values.id;
    this.permissionDate = values.date;
    this.strTime = this.binddatetime1(values.startTime);
    this.endTime = this.binddatetime1(values.endTime);
    this.swipeType = values.swipeType;
    this.perReason = values.reason;
    swal({
      title: "Message",
      text: "Are you sure to print?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {
        this.onUserActions1();
      }
    });
  }

  onUserActions1() {
    var printContents = document.getElementById('pdf1').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "EMPLOYEE PERMISSION DETAILS";
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
    var logo = this.image;
    var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>
  ${printContents}
  <div>     
  </div>
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: 'Permission Detail',
      },

      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
        bold: false,
        table: {
          width: '*',
        },
        th: { bold: true, fillColor: '#8B0000' }
      },
      stack: [{
        unbreakable: true,
      }],
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 90, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {

          columns: [
            {
              pageMargins: [60, 80, 60, 80],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [90, 350, 90],
                headerRows: 2,
                keepWithHeaderRows: 1,
                body: [
                  [{
                    rowSpan: 2, image: logo,
                    width: 50,
                    alignment: 'center'
                  }
                    , { text: OrganisationName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' },
                  {
                    rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                      { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                  }],
                  [''
                    ,
                    { text: ReportName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' }
                    , '']
                ]
              }
            }
          ],
          margin: 20
        }
      },
      footer: function (currentPage, pageCount) {
        return {

          columns: [

            {
              alignment: 'right',
              stack: [
                { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString() }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

          ],
          margin: 20
        }
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }


}
