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

import { NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { OverTimeRequest } from './OverTimeRequest.model';
import moment from 'moment'

declare var ActiveXObject: (type: string) => void;

@Component({
  selector: 'app-OverTimeRequest',
  templateUrl: './OverTimeRequest.component.html',
  styleUrls: ['./OverTimeRequest.component.css']
})
export class OverTimeRequestComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm!: NgForm;

  @ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;
  public tableWidget: any;
  public tableWidgetlv: any;
  empListCon = [];
  empListCon1 = [];
  locListCon = [];
  locListCon1 = [];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string
  path!: string
  employeeId: any = null;
  year: any;
  CalenderYear: string = '';
  CalYear: any;
  StartDate: string = ' ';
  EndDate: string = ' ';
  LvReason: string = ' ';
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  OverTimeRequestList: any[] = [];
  Starttime: any;
  EndTime: any;
  fromDate: any;
  toDate: any;
  fromTime: any;
  toTime: any;
  Plant: any = null;
  SwipeType: any = null;
  isSubmitting!: boolean;
  uploadedfileUrl: any;
  snackBar: any;
  isShowFileUpload!: boolean;

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

  locationAllList: any[] = [[]];
  getLocation(id:any) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  getLocationMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter((x:any)  => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x:any) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  getLocationName(id:any) {
    let t = this.locationList.find((s:any) => s.id == id);
    return t.code + ' - ' + t.name;
  }

  currentUser!: AuthData;
  ngOnInit() {
    this.path = this.router.url;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getLocationMaster();
      this.getApproversList(this.employeeId);
      this.getholidaysList(this.year);
      this.getLvReasonList();
      this.getEmpOverTimeRequests();
      this.getRoleList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  Holiday: any;
  HolidayDate: any;
  holidayname: any = null;
  holidaysList: HolidayMaster[] = [];
  getholidaysList(id:any) {
    this.errMsg = "";
    let srchstr = this.currentUser.baselocation + ',,' + this.year + ',' + ',,'
    this.httpService.LAgetByParam(APIURLS.GET_HOLIDAYS_LIST, srchstr).then((data: any) => {
      if (data.length > 0) {
        this.holidaysList = data;
        this.holidaysList = this.holidaysList.filter((x:any)  => x.isActive == true).sort((a:any, b:any) => {
          if (a.date > b.date) return 1;
          if (a.date < b.date) return -1;
          return 0;
        });
        let temp = this.holidaysList.find((x:any)  => new Date(x.date) > new Date());
        this.Holiday = temp ? temp.holidayName : 'No Holidays.'
        this.HolidayDate = temp ? temp.date : null;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.holidaysList = [];
    });
  }

  ApproversList: any[] = [];
  getApproversList(id:any) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_PLANT_HEADS_FOR_EMPLOYEE, this.currentUser.employeeId).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          swal({
            title: "Message",
            text: "Approvers Details not Found",
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
    }).catch((error)=> {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }

  getApproversListSep(empNo) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_PLANT_HEADS_FOR_EMPLOYEE, empNo.empNo).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          swal({
            title: "Message",
            text: "Approvers Details not Found",
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          })
        }
        else {
          this.ApproversList = data;
        }
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }

  ClearData() {
    this.fromDate = null;
    this.SwipeType = null;
    this.Starttime = null;
    this.EndTime = null;
    this.attendanceDetails = [];
    this.DetailedReason = null;
    this.dynamicArray = [];
  }

  fileToUpload: File | null = null;
  File: File | null = null;
  name: string
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
    }
  }
  reset() {
    console.log(this.myInputVariable.nativeElement.files);

    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }

    console.log(this.myInputVariable.nativeElement.files);
  }

  id: string
  formData = new FormData();
  fileslist1: any[] = [];
  errMsg1: string = '';
  uploadfile() {
    this.formData = new FormData();
    for (var i = 0; i < this.fileslist1.length; i++) {
      this.formData.append('files', this.fileslist1[i]);
    }
    let connection: any;
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_MED_FILEUPLOAD_API, this.id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
      }
    }).catch((error)=> {
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
        this.ReasonList = data.filter((x:any)  => x.isActive);
      }
    }).catch((error)=> {
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
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#personName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#person").val(ui.item.value);
                  $("#personName").val(ui.item.label);
                }
                else {
                  $("#person").val('');
                  $("#personName").val('');
                }
              },
              select: function (event:any, ui:any) {
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

  getEmpOverTimeRequests() {
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    srchstr.requestedBy = this.currentUser.employeeId;
    srchstr.year = this.CalYear;
    this.httpService.LApost(APIURLS.BR_GET_EMP_OVER_TIME_REQUEST, srchstr).then((data: any) => {
      if (data) {
        this.OverTimeRequestList = data;
        this.OverTimeRequestList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.OverTimeRequestList = [];
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
  rowcount: number = 0;
  dynamicArray: any = [];
  newDynamic: any = {};
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, stored: "0" };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item:any) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }

  Rolelist: any[] = [];
  getRoleList() {
    this.errMsg = "";
    this.get("RoleMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.Rolelist = data.filter((x:any)  => x.isActive);
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.Rolelist = [];
    });
  }

  getRole(id:any) {
    let temp = this.Rolelist.find((x:any)  => x.id == id);
    return temp ? temp.role_Stxt : '';
  }

  GetEmpDetails(mtrl) {
    var self = this;
    $('#empNo' + mtrl.id).autocomplete({
      source: function (request:any, response:any) {
        var searchTerm1 = mtrl.empNo;
        let connection = self.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, searchTerm1);
        connection.then((data: any) => {
          if (data) {
            let result = data.filter((x:any)  => { return x.employeeId != null });
            response(result.map((i:any) => {
              i.label = i.fullName + '-' + i.department + '-' + i.designation,
                i.fullName = i.fullName, i.department = i.department, i.designation = i.designation,
                i.joiningdate = i.joiningDate, i.val = i.materialCode; return i;
            }));
          }
        }).catch((error)=> {
        });
      },
      select: function (event:any, ui:any) {
        mtrl.Name = ui.item.fullName;
        mtrl.Dept = ui.item.department;
        mtrl.Desig = ui.item.designation;
        mtrl.DOJ = ui.item.joiningdate;
        // mtrl.Role = ui.item.roleId;
        mtrl.stored = "1";
        return false;
      }
    });
  }

  checkOTEligibility(id:any) {
    let filterModel: any = {};
    filterModel.pernr = id;
    filterModel.TYP = 'Overtime';
    let connection = this.httpService.LApost(APIURLS.CHECK_COMPOFF_OT_ELIGIBILITY,filterModel) 
      connection.then((data: any) => {
        this.isLoading = false;
        if(data[0].type == 'E') {
          swal ({
            title: "Message",
            text: 'You are not entitled to place a OverTime Request..!',
            icon: "error",
            dangerMode: false,
            buttons: [true,true]
          });
          this.getEmpOverTimeRequests();
          jQuery("#myModal").modal('hide');
        }
        else if(data[0].type == 'S') {
          jQuery("#myModal").modal('show');
        }
      })
  }

  ApplyPermission(isedit: boolean, data: any, value: string) {
    if (this.router.url == '/OverTime' && value != 'View') {
      this.checkOTEligibility(this.currentUser.employeeId);
      this.isEdit = false;
      this.fromDate = null;
      this.dynamicArray = [];
      this.DetailedReason = null;
      let newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, stored: "0" };
      this.dynamicArray.push(newDynamic);
      return;
    }
    this.view = false;
    this.isEdit = isedit;
    this.dynamicArray = [];
    this.ClearData();
    if (this.isEdit) {
      let connection = this.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, data.pernr);
      connection.then((data1: any) => {
        if (data1) {
          this.getApproversList(data.pernr);
          this.Plant = data.location;
          this.CalenderYear = this.CalYear;
          this.fromDate = data.fromDate;
          this.SwipeType = data.swipeType;
          this.DetailedReason = data.reason;
          let result = data1.find((x:any)  => x.employeeId == data.pernr);
          let newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, stored: "0" };
          newDynamic.empNo = data.pernr;
          newDynamic.NoHrs = data.noHRS;
          newDynamic.Name = result.fullName;
          newDynamic.Dept = result.department;
          newDynamic.Desig = result.designation;
          newDynamic.DOJ = result.joiningDate;
          this.dynamicArray.push(newDynamic);
        }
      }).catch((error)=> {
      });
    }
    else {
      let newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, stored: "0" };
      this.dynamicArray.push(newDynamic);
    }
    if (value == 'View') {
      this.view = true;
    }
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

  CancelPermission(data: OverTimeRequest) {
    swal({
      title: "Message",
      text: "Are you sure to cancel ?.",
      icon: "warning",
      dangerMode: false,
      buttons: [false, true]
    }).then((willsave) => {
      if (willsave) {
        let leaveDetailsModel = {} as OverTimeRequest;
        leaveDetailsModel = Object.assign({}, data);
        leaveDetailsModel.id = data.id;
        leaveDetailsModel.apprvrStatus = 'Self Cancelled';
        let connection = this.httpService.LAput(APIURLS.BR_ONDUTY_CANCEL_REQUEST, leaveDetailsModel.id, leaveDetailsModel);
        connection.then((data: any) => {
          this.isLoading = false;
          if (data) {
            swal({
              title: "Message",
              text: "Overtime Cancelled Sucessfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true],
            });
            this.getEmpOverTimeRequests();
          }
          else {
            swal({
              title: "Message",
              text: "Error Cancelling Overtime ..!",
              icon: "error",
              dangerMode: false,
              buttons: [false, true],
            });
            this.getEmpOverTimeRequests();
          }
        }).catch((error)=> {
          this.errMsgPop = 'Error Cancelling Overtime ..';
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
      toastr.error("Please select date");
    }
    else {
      this.showAttendance = true;
      this.errMsg = "";
      this.isLoading = true;
      let srchstr: any = {};
      srchstr.userId = this.currentUser.employeeId;
      let d1 = new Date(this.fromDate);
      srchstr.date = this.getDateFormate(this.fromDate);
      srchstr.location = this.currentUser.baselocation;
      this.httpService.LApost(APIURLS.BR_GET_ATTENDANCE_FOR_PER, srchstr).then((data: any) => {
        if (data) {
          this.attendanceDetails.push(data);
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.attendanceDetails = [];
      });
    }
  }

  InsertPermission() {
    let filterModel = {} as OverTimeRequest;
    filterModel.userId = this.currentUser.employeeId;
    let d1 = new Date(this.fromDate);
    let dtStartDate;
    let dtEndDate;
    var dtStartTime = new Date(this.fromTime);
    var dtEndTime = new Date(this.toTime);
    dtStartDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), dtStartTime.getHours(), dtStartTime.getMinutes());
    dtEndDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), dtEndTime.getHours(), dtEndTime.getMinutes());
    let formdate: string = d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

    var startTime = ("00" + (dtStartDate.getHours() - 12)).slice(-2) + ":" +
      ("00" + dtStartDate.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartDate.getSeconds()).slice(-2);
    var endTime = ("00" + (dtEndDate.getHours() - 12)).slice(-2) + ":" +
      ("00" + dtEndDate.getMinutes()).slice(-2) + ":" +
      ("00" + dtEndDate.getSeconds()).slice(-2);

    filterModel.fromDate = formdate;
    filterModel.toDate = this.toDate;
    filterModel.pernr = this.dynamicArray.map((x:any)  => x.empNo).join();
    filterModel.noHRS = this.dynamicArray.map((x:any)  => x.NoHrs).join();
    filterModel.reason = this.DetailedReason;
    filterModel.apprvrStatus = 'Pending';
    filterModel.pendingApprover = this.ApproversList[0].employeeId;
    filterModel.location = this.currentUser.baselocation.toString();
    filterModel.requestedBy = this.currentUser.employeeId;

    let connection = this.httpService.LApost(APIURLS.BR_INSERT_OVER_TIME_REQUEST, filterModel);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data.typ == 'S') {
        jQuery("#myModal").modal('hide');
        swal({
          title: "Message",
          text: "Over Time Request Submitted Successfully..!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true],
        });
        this.getEmpOverTimeRequests();
      }
      else {
        swal({
          title: "ERROR",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true],
        });
      }
      this.reset();
      this.getEmpOverTimeRequests();
    }).catch((error)=> {
      this.errMsgPop = 'Error Applying Over Time ..';
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
  //let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

  file!: File;
  uploadfiles(files: File) {
    this.file = files[0];
  }

  compOffOtUpload: any[] = [];
  upload(): any {
    if (this.file == undefined || this.file == null) {
      toastr.error("Please attach a excel file of overtime requests..!");
      return;
    }
    let connection: any;
    this.isSubmitting = true;
    this.formData = new FormData();
    this.formData.append('file', this.file);
    connection = this.httpService.LAExcelUpload(APIURLS.BR_UPLOAD_EXCELFILE_Ot, this.currentUser.employeeId, this.formData);
    connection.then((data: any) => {
      if (data.typ == 'S') {
        swal({
          title: "Message",
          text: data.message,
          icon: "success",
          dangerMode: false,
          buttons: [false, true],
        });
        this.reset();
        this.getEmpOverTimeRequests();
      }

      else if (data.typ == 'E') {
        swal({
          title: "Message",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true],
        });
        this.reset;
        this.getEmpOverTimeRequests();
      }
    }).catch((error)=> {
      this.errMsgPop = 'Error uploading file ..';
    });
  }
}
