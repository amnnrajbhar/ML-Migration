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
import { LeaveDetails } from './EsicSickLeave.model';

declare var ActiveXObject: (type: string) => void;

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, DecimalPipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { filter } from 'rxjs-compat/operator/filter';
import { max, now } from 'moment';
import { L } from '@angular/core/src/render3';


@Component({
  selector: 'app-EsicSickLeave',
  templateUrl: './EsicSickLeave.component.html',
  styleUrls: ['./EsicSickLeave.component.css']
})
export class EsicSickLeaveComponent implements OnInit {
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
  appDet: any[] = [];
  CalenderYear: string = '';
  CalYear: any;
  lvType: number = null;
  reqNo: number = null;
  StartDate: string = null;
  EndDate: string = null;
  Duration1: string = null;
  Duration2: string = null;
  NoOfDays: any;
  LvReason: string = null;
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  LeaveRequestList: any[] = [];
  ApplyFor: any = null;
  userId: string = null;
  appliedDate: any;
  fromDate: any;
  startDur: any;
  toDate: any;
  endDur: any;
  numDays: any;
  reason: any;
  detReason: any;
  LeaveAddress: any;
  LeaveContactNo: any;

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

  private initlvDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidgetlv = exampleId.DataTable({
      "order": []
    });
  }

  private reInitlvDatatable(): void {
    if (this.tableWidgetlv) {
      this.tableWidgetlv.destroy()
      this.tableWidgetlv = null
    }
    setTimeout(() => this.initlvDatatable(), 0)
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
  getLocationMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
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
    //this.baseLocation = this.currentUser.baselocation;
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    // var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {
    this.getLocationMaster();
    //this.getLvReasonList();
    //this.getApproversList(this.employeeId);
    this.getEmpleaveRequests();
    this.getholidaysList(this.year);
    this.getbase64image();
    this.GetEmpDetails(this.currentUser.employeeId);

    //this.getUsersList(this.employeeId);
    // }
    // else   EditContractEmployee
    //   this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }


  totOpbal: number = 0;
  totUsbal: number = 0;
  totClbal: number = 0;
  totAvbal: number = 0;
  lvbalaneList: any[] = [];
  getUsersList(id) {
    this.errMsg = "";
    this.lvbalaneList = [];
    this.totOpbal = 0;
    this.totUsbal = 0;
    this.totClbal = 0;
    this.totAvbal = 0;
    let srcstr = id + "," + this.CalYear;
    this.httpService.LAgetByParam(APIURLS.GET_LEAVE_DATA_BY_EMPLOYEE, srcstr).then((data: any) => {
      if (data.length > 0) {
        this.lvbalaneList = data.sort((a, b) => {
          if (a.lvTypeid > b.lvTypeid) return 1;
          if (a.lvTypeid < b.lvTypeid) return -1;
          return 0;
        });
        this.lvbalaneList.forEach(element => {
          this.totOpbal = this.totOpbal + element.lvOpbal;
          this.totUsbal = this.totUsbal + element.lvAvailed;
          this.totClbal = this.totClbal + element.lvClbal;
          this.totAvbal = this.totAvbal + element.lvAwtBal;
        });
        this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.lvbalaneList = [];
    });
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
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          toastr.error("Approvers Not Assigned");
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

  ClearData() {
    this.lvType = null;
    this.StartDate = null;
    this.Duration1 = null;
    this.EndDate = null;
    this.Duration2 = null;
    this.NoOfDays = null;
    this.LvReason = null;
    this.DetailedReason = null;
    this.personResponsible = null;
    this.LeaveAddress = null;
    this.LeaveContactNo = null;
  }


  lvTypeList: any[] = [
    { id: 8, name: "ESIC Leave" }
  ];


  getType(id) {
    let temp = this.lvTypeList.find(x => x.lvTypeid == id);
    return temp ? temp.lvType : '';
  }

  fileToUpload: File | null = null;
  File: File | null = null;
  name: string;
  files: File[] = []
  fileslist: any[] = [];
  handleFileInput(files: FileList) {

    this.File = files[0];
    if (this.File.size > 1e+7) {
      swal({
        title: "Message",
        text: "File cannot exceed 5 Mb",
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
    this.fileslist.push(this.File.name);
    // this.reset();
  }

  reset() {
    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }

  ReadAsBase64(file): Promise<any> {
    const reader = new FileReader();
    const fileValue = new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        const result = reader.result as string;
        if (!result) reject('Cannot read variable');
        if (result.length * 2 > 2 ** 23) reject('File exceeds the maximum size'); // Note: 2*2**20 = 2**21
        resolve(reader.result);
      });

      reader.addEventListener('error', event => {
        reject(event);
      });

      reader.readAsDataURL(file);
    });

    return fileValue;
  }
  id: string;
  formData = new FormData();
  errMsg1: string = '';
  uploadfile() {
    // debugger;
    // this.id='VM001';
    this.formData = new FormData();
    for (var i = 0; i < this.files.length; i++) {
      this.formData.append('files', this.files[i]);
    }
    let connection: any;
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_LEAVE_FILEUPLOAD_API, this.id, this.formData);
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
  getLvReasonList(type) {
    this.errMsg = "";
    this.LvReason = null;
    this.ReasonList = [];
    this.httpService.LAgetByParam(APIURLS.BR_GET_LEAVE_REASONS, type).then((data: any) => {
      if (data.length > 0) {
        this.ReasonList = data.filter(x => x.isActive);
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


  isValid: boolean = false;
  validatedForm: boolean = true;
  LeaveRequestList1: any[] = [];
  upcomingLeaves: any[] = [];
  getEmpleaveRequests() {
    this.getUsersList(this.currentUser.employeeId);
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    srchstr.userId = this.currentUser.employeeId;
    srchstr.year = this.CalYear;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_ESIC_LEAVE_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.LeaveRequestList = data;
        this.LeaveRequestList1 = data.filter(x => x.approvelStatus == 'Completed');
        this.upcomingLeaves = this.LeaveRequestList.filter(x => new Date(x.startDate) > new Date());
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.LeaveRequestList = [];
    });
  }

  view: boolean = false;
  reqId: any;
  ApplyLeave(isedit: boolean, data: any, value: string) {
    this.view = false;
    this.fileslist = [];
    this.isEdit = isedit;
    this.ClearData();
    if (this.isEdit) {
      //   let data=Object.assign({},value)
      this.getApproversList(data.userId);
      this.lvType = 8;
      this.getLvReasonList(this.lvType);
      this.CalenderYear = this.CalYear;
      this.reqId = data.reqId;
      this.StartDate = data.startDate;
      this.EndDate = data.endDate;
      this.Duration1 = data.startDuration;
      this.Duration2 = data.endDuration;
      this.NoOfDays = data.noOfDays;
      this.LvReason = data.reasonType;
      this.DetailedReason = data.reason;
      this.personResponsible = data.personResponsible;
      this.LeaveAddress = data.addressDuringLeave;
      this.LeaveContactNo = data.contactNo;
      let docs = data.documents ? data.documents.split(",") : [];
      docs.forEach(element => {
        this.fileslist.push(element);
      });
    }
    else {
      this.getApproversList(this.currentUser.employeeId);
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }


  today = new Date();
  OnSaveLeaveRequest(status) {
    let filterModel = {} as LeaveDetails;
    let d1 = new Date(this.StartDate);
    let stDate = d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
    let d2 = new Date(this.EndDate);
    let edDate = d2.getFullYear() + "-" + ("00" + (d2.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d2.getDate()).slice(-2);
    var totDays: any = this.daydiff(this.parseDate(stDate), this.parseDate(edDate));
    if (this.ApplyFor == "Others") {
      filterModel.userId = this.userId;
    }
    else {
      filterModel.userId = this.currentUser.employeeId;
    }
    if (this.File == undefined || this.File == null) {
      toastr.error("Please attach a document for applying Leave..!");
      return;
    }
    else if (this.maxSick < totDays) {
      toastr.error("Maximum " + this.maxSick + " days allow to apply sick leave.");
      this.Duration1 = '';
      this.Duration2 = '';
      return;
    }
    else {
      filterModel.leaveType = this.lvType.toString();
      filterModel.startDate = this.setFormatedDate(this.StartDate);
      filterModel.endDate = this.setFormatedDate(this.EndDate);
      filterModel.startDuration = this.Duration1;
      filterModel.endDuration = this.Duration2;
      filterModel.noOfDays = this.NoOfDays.toString();
      filterModel.leaveStatus = '0';
      filterModel.recordStatus = status;
      filterModel.documents = this.File.name;
      filterModel.departmentId = this.currentUser.fK_Department;
      filterModel.plantId = this.currentUser.baselocation;
      filterModel.designationId = this.currentUser.fK_Designation;
      filterModel.submitDate = new Date().toDateString();
      filterModel.reason = this.DetailedReason;
      filterModel.firstname = this.currentUser.employeeId;
      filterModel.approvelStatus = 'Pending';
      filterModel.approverId = this.ApproversList[0].employeeId;
      filterModel.lastApprover = 'No';
      filterModel.pendingApprover = this.ApproversList[0].employeeId;
      filterModel.forwardedEmpId = this.personResponsible;
      filterModel.personResponsible = this.personResponsible;
      filterModel.addressDuringLeave = this.LeaveAddress;
      filterModel.contactNo = this.LeaveContactNo;
      let connection = this.httpService.LApost(APIURLS.BR_APPLY_EMP_LEAVE, filterModel);
      connection.then((data: any) => {
        this.isLoading = false;
        if (data.typ == 'S') {
          this.id = data.reqId;
          this.uploadfile();
          this.sendMail(data);
          alert("Leave Details Submitted Sucessfully With Req Id : " + data.reqId);
          jQuery("#myModal").modal('hide');
        }
        else {
          alert(data.message);
        }
        this.getEmpleaveRequests();
      }).catch(error => {
        this.errMsgPop = 'Error Cancelling Leave ..';
      });
    }
  }
  
  sendMail(data) {
    data.typ = 'Apply Leave';
    if (this.ApplyFor == "Others") {
      data.userId = this.userId;
    }
    else {
      data.userId = this.currentUser.employeeId;
    }
    let connection = this.httpService.LApost(APIURLS.BR_SEND_MAIL_FOR_LEAVE, data);
    connection.then((data: any) => {
      this.isLoading = false;

      //this.getEmpleaveRequests();
      this.reset();
    }).catch(error => {
      this.errMsgPop = 'Error Cancelling Leave ..';
    });
  }

  CancelLeave(data) {
    swal({
      title: "Message",
      text: "Are you sure to cancel ?.",
      icon: "warning",
      dangerMode: false,
      buttons: [false, true]
    }).then((willsave) => {
      if (willsave) {

        let leaveDetailsModel: any = {};
        leaveDetailsModel.id = data.id;
        leaveDetailsModel.reqId = data.reqId;

        leaveDetailsModel.cancelflag = 1;
        leaveDetailsModel.approvelStatus = 'Self Cancelled';
        let connection = this.httpService.LApost(APIURLS.BR_CANCEL_EMP_LEAVE, leaveDetailsModel);
        connection.then((data: any) => {
          this.isLoading = false;
          if (data) {
            toastr.success("Leave Cancelled Sucessfully..!");
          }
          else {
            toastr.error("Error Cancelling Leave ..");
          }
          this.reset();
          this.getEmpleaveRequests();
        }).catch(error => {
          this.errMsgPop = 'Error Cancelling Leave ..';
        });


      }
    });
  }

  Department: any;
  Designation: any;
  FullName: any;
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
      }
    }).catch(error => {
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

  minSick: any;
  minCasual: any;
  minPrivilage: any;
  maxSick: any;
  maxCasual: any;
  maxPrivilage: any;
  casAdvDays: any;
  sickAdvDays: any;
  privilageAdvDays: any;
  clmindur: any;
  slmindur: any;
  plmindur: any;
  lossmindur: any;

  CalculateDays() {
    // let stDate=new Date(this.StartDate);
    let d1 = new Date(this.StartDate);
    let stDate = d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
    let stYear = d1.getFullYear();
    let stDays = d1.getDay();
    let stDur = this.Duration1;
    let d2 = new Date(this.EndDate);
    let edDate = d2.getFullYear() + "-" + ("00" + (d2.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d2.getDate()).slice(-2);
    let endYear = d2.getFullYear();
    let endDays = d2.getDay();
    // let edDate=new Date(this.EndDate);
    // let endYear=new Date(this.EndDate).getFullYear();
    let endDur = this.Duration2;

    if (this.lvType == null) {
      toastr.error("Leave Type should not be left blank");
      return;
    }

    if (this.StartDate != null && this.EndDate != null) {
      if ((new Date(this.StartDate) > new Date(this.EndDate)) && this.EndDate != null) {
        toastr.error("Please Select Valid Date Range.");
        return;
      }
    }

    if (this.Duration1 == 'FD' && this.Duration2 == 'SH') {
      this.NoOfDays = 0;
      toastr.error("Please Select Valid Duration");
      this.Duration1 = '';
      this.Duration2 = '';
      return;
    }
    if (this.Duration1 == 'FH' && this.Duration2 == 'FD') {
      this.NoOfDays = 0;
      toastr.error("Please Select Valid Duration");
      this.Duration1 = '';
      this.Duration2 = '';
      return;
    }
    if (this.Duration1 == 'FH' && this.Duration2 == 'SH') {
      this.NoOfDays = 0;
      toastr.error("Please Select Valid Duration");
      this.Duration1 = '';
      this.Duration2 = '';
      return;
    }
    if (this.lvType == 8) {
      var totDays: any = this.daydiff(this.parseDate(stDate), this.parseDate(edDate));
      if ((stDur == 'SH' && endDur == 'FD')
        || (stDur == 'FD' && endDur == 'SH') || (stDur == 'FD' && endDur == 'FH')) {
        totDays = totDays - 1;
      }
    }
    if ((stDur == 'FH' && endDur == 'FH') || (stDur == 'SH' && endDur == 'SH')) {
      if (stDate != edDate) {
        toastr.error("Please Select Valid Duration");
        this.NoOfDays = 0;
        this.Duration2 = '';
        totDays = null;
        return;
      }
    }

    else {
    }
    return
  }
  daydiff(first, second) {

    var totaldays = (second - first) / (1000 * 60 * 60 * 24);
    if (totaldays <= 0) {
      return "";
    }

    //daydiff
    if (totaldays == 1 && this.Duration1 != this.Duration2) {
      toastr.error("Please select valid Duration")
    }

    if (totaldays == 1 && ((this.Duration1 == 'FH' && this.Duration2 == 'FH') || (this.Duration1 == 'SH' && this.Duration2 == 'SH'))) {
      totaldays = 0.5;
    }
    else if ((this.Duration1 == 'FD' && this.Duration2 == 'FH') || (this.Duration1 == 'SH' && this.Duration2 == 'FD')) {
      totaldays = totaldays - 0.5;
    }
    else if (this.Duration1 == 'SH' && this.Duration2 == 'FH') {
      totaldays = totaldays - 1;
    }
    this.NoOfDays = totaldays;
  }


  parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[0], mdy[1] - 1, mdy[2]);
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
  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
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


  addLeave: any;
  conLeave: any;
  perLeave: any;
  appid: any;
  appName: any;
  appDesg: any;
  appDept: any;
  appStatus: any;
  appDate: any;
  printLeave(values) {
    // this.appDetails(values.reqId);
    this.reqNo = values.id;
    this.lvType = values.leaveType;
    this.appliedDate = values.submitDate;
    this.fromDate = values.startDate;
    this.startDur = values.startDuration;
    this.toDate = values.endDate;
    this.endDur = values.endDuration;
    this.numDays = values.noOfDays;
    this.reason = values.reasonType;
    this.detReason = values.reason;
    this.addLeave = values.addressDuringLeave;
    this.conLeave = values.contactNo;
    this.perLeave = values.personResponsible;
    if (values.approvelStatus == 'Approved') {
      this.appid = values.approverNoL;
      this.appName = values.lastApprover;
      this.appDesg = values.appDesignationL;
      this.appDept = values.appDepartmentL;
      this.appStatus = values.approvelStatus;
      this.appDate = values.approvedDate;
    }
    else {
      this.appid = values.approverNo;
      this.appName = values.pendingApprover;
      this.appDesg = values.appDesignation;
      this.appDept = values.appDepartment;
      this.appStatus = values.approvelStatus;
      this.appDate = values.approvedDate;
    }
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

  downloadFile(reqNo, value) {

    // console.log(filename);
    if (value.length > 0) {
      this.httpService.getFile(APIURLS.BR_LEAVE_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find(s => s.id == id).name;
        if (data != undefined) {
          var FileSaver = require('file-saver');
          const imageFile = new File([data], value, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);
        }
      }).catch(error => {
        this.isLoading = false;
      });

    } else {
      swal({
        title: "Message",
        text: "No File on server",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
  }



  onUserActions1() {
    var printContents = document.getElementById('pdf1').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "EMPLOYEE LEAVE REQUEST";
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
        title: 'Leave Detail',
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


  Print() {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "EMPLOYEE LEAVE CARD";
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
        title: 'Leave card',
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
