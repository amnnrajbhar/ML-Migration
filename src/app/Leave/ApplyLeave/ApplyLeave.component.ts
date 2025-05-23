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
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { LeaveDetails } from './ApplyLeave.model';

declare var ActiveXObject: (type: string) => void;

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, DecimalPipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
//import { filter } from 'rxjs-compat/operator/filter';
//import { calcBindingFlags } from '@angular/core/src/view/util';
//import { C } from '@angular/core/src/render3';


@Component({
  selector: 'app-ApplyLeave',
  templateUrl: './ApplyLeave.component.html',
  styleUrls: ['./ApplyLeave.component.css']
})
export class ApplyLeaveComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

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
  reqId: number = null;
  reqNo: number = null;
  StartDate: string = null;
  EndDate: string = null;
  Duration1: any;
  Duration2: any;
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
  approvalStatus: any;
  approvedDate: any;
  documents: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private https: HttpClient, private route: ActivatedRoute) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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
    let temp = this.locationList.find(x => x.fkPlantId == id);
    return temp ? temp.code + ' - ' + temp.name : '';
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
    this.CalYear = new Date().getFullYear().toString();
    this.CalenderYear = new Date().getFullYear().toString();
    //this.getLocationMaster();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getPayGroupList();
    this.getLvTypesList();
    this.getEmpleaveRequests();
    this.getholidaysList();
    this.getbase64image();
    this.GetEmpDetails(this.currentUser.employeeId);
    this.getRoleList();
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  totOpbal: number = 0;
  totUsbal: number = 0;
  totClbal: number = 0;
  totAvbal: number = 0;
  lvbalaneList: any[] = [];
  lvbalaneList1: any[] = [];
  getUsersList(id) {
    this.errMsg = "";
    this.lvbalaneList = [];
    this.lvbalaneList1 = [];
    let srcstr = id + "," + this.CalYear;
    this.httpService.LAgetByParam(APIURLS.GET_LEAVE_DATA_BY_EMPLOYEE, srcstr).then((data: any) => {
      if (data.length > 0) {
        this.lvbalaneList1 = [];
        this.lvbalaneList = data.sort((a, b) => {
          if (a.lvTypeid > b.lvTypeid) return 1;
          if (a.lvTypeid < b.lvTypeid) return -1;
          return 0;
        });
        //    this.lvbalaneList =this.lvbalaneList.filter(x=>x.lvClbal >0);
        this.totOpbal = 0;
        this.totUsbal = 0;
        this.totClbal = 0;
        this.totAvbal = 0;
        this.lvbalaneList.forEach(element => {
          this.totOpbal = this.totOpbal + element.lvOpbal;
          this.totUsbal = this.totUsbal + element.lvAvailed;
          this.totClbal = this.totClbal + element.lvClbal;
          this.totAvbal = this.totAvbal + element.lvAwtBal;
          let lvType: any = {};
          lvType.lvTypeid = element.lvTypeid;
          lvType.lvType = element.lvType;
          this.lvbalaneList1.push(lvType);
        });
      }
      // let lvtype: any = {};
      // lvtype.lvtypeid = 4;
      // lvtype.lvtype = "loss of pay";
      // this.lvbalanelist1.push(lvtype);
      // if (this.currentuser.gender == "female") {
      //   let lvtype: any = {};
      //   lvtype.lvtypeid = 5;
      //   lvtype.lvtype = "maternity";
      //   this.lvbalanelist1.push(lvtype);
      // }
      // if (this.currentuser.mediclaimesi == "e") {
      //   let lvtype: any = {};
      //   lvtype.lvtypeid = 8;
      //   lvtype.lvtype = "esic";
      //   this.lvbalanelist1.push(lvtype);
      // }
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.lvbalaneList = [];
      this.lvbalaneList1 = [];
    });
  }

  Holiday: any;
  HolidayDate: any;
  holidayname: any = null;
  holidaysList: HolidayMaster[] = [];
  getholidaysList() {
    this.errMsg = "";
    let filterModel: any = {};
    filterModel.employeeId = this.currentUser.employeeId;
    filterModel.year = this.year;
    this.httpService.LApost(APIURLS.GET_HOLIDAYS_LIST_BASED_ON_EMPLOYEES, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.holidaysList = data;
        this.holidaysList = this.holidaysList.sort((a, b) => {
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
    if (this.ApplyFor == "Others" && (this.userId == null || this.userId == '')) {
      toastr.error("Please enter Employee no...!");
      return;
    }
    this.getUsersList(id);
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
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

  totNoDays: number = 0;
  totCobal: number = 0;
  CompOffAvailList: any[] = [];
  getAvailCompOffList(id) {
    this.errMsg = "";
    let srchstr: any = {};
    if (this.ApplyFor == "Others") {
      srchstr.employeeNumber = this.userId;
    }
    else {
      srchstr.employeeNumber = this.currentUser.employeeId;
    }
    this.httpService.LApost(APIURLS.GET_AVAIL_COMPOFF_FOR_EMPLOYEE, srchstr).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          swal({
            title: "Message",
            text: "No Compoff Days Available",
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
          this.ClearData();

        }
        else {
          this.CompOffAvailList = data;
          this.totNoDays = 0;
          this.totCobal = 0;
          this.CompOffAvailList.forEach(element => {
            this.totNoDays = this.totNoDays + element.numberOfDays;
            this.totCobal = this.totCobal + element.compOffBalance;
          });
        }
      }
    }).catch(error => {
      this.isLoading = false;
      this.CompOffAvailList = [];
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
    this.personName = null;
    this.LeaveAddress = null;
    this.LeaveContactNo = null;
    this.ApplyFor = null;
    this.userId = null;
    this.fileslist1 = [];
    this.files = [];
  }


  lvTypeList: any[] = [];
  getLvTypesList() {
    this.errMsg = "";
    let empId: any;
    if (this.router.url == '/ApplyLeaveEss') {
      empId = this.currentUser.employeeId;
    }
    else {
      empId = this.userId;
    }
    this.httpService.LAgetByParam(APIURLS.GET_LEAVE_TYPES_DATA_GETALL, empId).then((data: any) => {
      if (data.length > 0) {
        this.lvTypeList = data;
        //this.getUsersList(this.employeeId);
      }
    }).catch(error => {
      this.isLoading = false;
      this.lvTypeList = [];
    });
  }

  getType(id) {
    let temp = this.lvTypeList.find(x => x.lvTypeid == id);
    return temp ? temp.lvType : '';
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


  fileToUpload: File | null = null;
  File: File | null = null;
  name: string;
  files: File[] = []
  handleFileInput(files: FileList) {

    this.File = files[0];
    for (var i = 0; i < files.length; i++) {
      let pattern = /[(@!#\$%\^\&*\)\(+=,]/;
      let text = files[i].name;
      if ((pattern.test(text))) {
        swal({
          title: "Message",
          text: "Please remove all the special characters in the file name..!",
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.reset();
      }
      else if (this.File.size > 1e+7) {
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
          this.fileslist1.push(files[i].name);
        }
      }
    }
    // this.fileslist1 = this.files;
    //this.fileslist1 = this.fileslist1[0].name;
    this.reset();
  }

  removefile(name, id) {
    const index = this.fileslist1.indexOf(name);
    this.fileslist1.splice(index, 1);

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
  fileslist1: any[] = [];
  errMsg1: string = '';

  uploadfile(list: any) {
    // debugger;
    // this.id='VM001';

    this.id = list.reqId;

    this.formData = new FormData();
    for (var i = 0; i < this.files.length; i++) {
      this.formData.append('files', this.files[i]);
    }
    let connection: any;
    connection = this.httpService.LAfileUpload(APIURLS.BR_MASTER_LEAVE_FILEUPLOAD_API, this.id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error uploading file ..';
    });
  }

  ReasonList: any[] = [];
  getLvReasonList(type) {
    this.errMsg = "";
    this.checklvbalance(type);
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

  checklvbalance(type) {
    let leaveType: any = {};
    let temp = this.lvbalaneList.find(x => x.lvTypeid == type);
    let temp1 = this.lvTypeList.find(x => x.lvTypeid == type);
    if (temp1.lvTypeid == 1) {
      leaveType = 'Casual';
    }
    else if (temp1.lvTypeid == 2) {
      leaveType = 'Sick';
    }
    else {
      leaveType = 'Privilege/Earned';
    }
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
  upcomingLeaves: any[] = [];
  getEmpleaveRequests() {
    this.getUsersList(this.currentUser.employeeId);
    this.errMsg = "";
    this.CancelLeaveflag = false;
    this.isLoading = true;
    let srchstr: any = {};
    srchstr.userId = this.currentUser.employeeId;
    srchstr.year = this.CalYear;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LEAVE_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.LeaveRequestList = data;
        this.upcomingLeaves = this.LeaveRequestList.filter(x => new Date(x.startDate) > new Date() && (x.approvelStatus == 'Pending' || x.approvelStatus == 'Approved'));
        this.upcomingLeaves = this.LeaveRequestList.filter(x => new Date(x.startDate) > new Date() && (x.approvelStatus == 'Pending' || x.approvelStatus == 'Approved'));
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

    this.view = false;
    this.isEdit = isedit;
    this.errMsgPop = "";
    this.fileslist1 = [];
    this.files = [];
    this.ClearData();
    this.lvType = null;
    if (this.isEdit) {
      //   let data=Object.assign({},value)
      this.getApproversList(data.userId);
      this.getAvailCompOffList(data.userId);
      this.lvType = this.lvTypeList.find(x => x.lvType == data.leaveType).lvTypeid;
      this.reqId = data.reqId;
      this.getLvReasonList(this.lvType);
      this.CalenderYear = this.CalYear;
      this.StartDate = data.startDate;
      this.EndDate = data.endDate;
      this.Duration1 = data.startDuration;
      this.Duration2 = data.endDuration;
      this.NoOfDays = data.noOfDays;
      this.LvReason = data.reasonType;
      this.DetailedReason = data.reason;
      this.personName = data.personResponsible;
      this.LeaveAddress = data.addressDuringLeave;
      this.LeaveContactNo = data.contactNo;
      this.approvalStatus = data.approvelStatus;
      this.approvedDate = data.approvedDate;
      if (data.documents != null && data.documents != '') {
        this.fileslist1 = data.documents.split(',');
      }
    }
    else {
      this.getApproversList(this.currentUser.employeeId);
      this.getAvailCompOffList(this.currentUser.employeeId);
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }


  OnSaveLeaveRequest(status) {
    this.isLoading = true;
    swal({
      text: "Please wait.. Leave is getting applied ..!",
      timer: 9000,
      icon: "info",
      dangerMode: false,
      buttons: [false, false]
    });
    if (this.lvType == 2 && this.NoOfDays > 2 && (this.File == undefined || this.File == null)) {
      swal({
        title: "Message",
        text: 'Please attach a medical certificate to avail Sick leave',
        icon: "info",
        dangerMode: false,
        buttons: [false, true]
      });
      this.EndDate = '';
      this.Duration2 = '';
      this.NoOfDays = '';
    }
    else if (this.lvType == 5 && (this.File == undefined || this.File == null)) {
      swal({
        title: "Message",
        text: 'Please attach a medical certificate to avail Maternity leave',
        icon: "info",
        dangerMode: false,
        buttons: [false, true]
      });
      this.EndDate = '';
      this.Duration2 = '';
      this.NoOfDays = '';
    }

    else if (this.lvType == 8 && (this.File == undefined || this.File == null)) {
      swal({
        title: "Message",
        text: 'Please attach a medical certificate to avail ESIC leave',
        icon: "info",
        dangerMode: false,
        buttons: [false, true]
      });
      this.EndDate = '';
      this.Duration2 = '';
      this.NoOfDays = '';
    }
    else if (this.lvType == 7 && (this.File == undefined || this.File == null)) {
      swal({
        title: "Message",
        text: 'Please attach a medical certificate to avail ESIC - Maternity leave',
        icon: "info",
        dangerMode: false,
        buttons: [false, true]
      });
      this.EndDate = '';
      this.Duration2 = '';
      this.NoOfDays = '';
    }
    let filterModel = {} as LeaveDetails;
    if (this.ApplyFor == "Others") {
      filterModel.applyFor = 'Others';
      filterModel.userId = this.userId;
    }
    else {
      filterModel.applyFor = 'Self';
      filterModel.userId = this.currentUser.employeeId;
    }
    filterModel.leaveType = this.lvType.toString();
    filterModel.startDate = this.setFormatedDate(this.StartDate);
    filterModel.endDate = this.setFormatedDate(this.EndDate);
    filterModel.startDuration = this.Duration1;
    filterModel.endDuration = this.Duration2;
    filterModel.noOfDays = this.NoOfDays.toString();
    filterModel.leaveStatus = '0';
    filterModel.recordStatus = status;
    if (this.fileslist1.length > 0) {
      filterModel.documents = this.fileslist1[0];
      for (let j = 1; j < this.fileslist1.length; j++) {
        filterModel.documents = this.fileslist1[j] + ',' + filterModel.documents;
      }
    }
    else {
      filterModel.documents = '';
    }
    filterModel.departmentId = this.currentUser.fK_Department;
    filterModel.plantId = this.currentUser.baselocation;
    filterModel.designationId = this.currentUser.fK_Designation;
    filterModel.submitDate = new Date().toDateString();
    filterModel.reasonType = this.LvReason;
    filterModel.reason = this.DetailedReason;
    filterModel.firstname = this.currentUser.employeeId;
    filterModel.approvelStatus = 'Pending';
    filterModel.approverId = this.ApproversList[0].employeeId;
    filterModel.lastApprover = 'No';
    filterModel.pendingApprover = this.ApproversList[0].employeeId;
    filterModel.forwardedEmpId = this.personName;
    filterModel.personResponsible = this.personName;
    filterModel.addressDuringLeave = this.LeaveAddress;
    filterModel.contactNo = this.LeaveContactNo;
    // filterModel.reqId = this.LeaveContactNo;
    let connection = this.httpService.LApost(APIURLS.BR_APPLY_EMP_LEAVE, filterModel);
    connection.then((data: any) => {
      this.isLoading = true;
      if (data.typ == 'S') {
        swal({
          title: "Message",
          text: "Leave Details Submitted Sucessfully With Req Id: " + data.reqId,
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.sendMail(data);
        this.uploadfile(data);
        jQuery("#myModal").modal('hide');
      }
      if (data.typ == 'D') {
        swal({
          title: "Message",
          text: "Leave Details Saved Sucessfully As Draft with Req Id: " + data.reqId,
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.uploadfile(data);
        jQuery("#myModal").modal('hide');
      }
      if (data.typ == 'E') {
        swal({
          title: "Message",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.StartDate = '';
        this.Duration1 = '';
        this.EndDate = '';
        this.Duration2 = '';
        this.NoOfDays = '';
      }
      this.getEmpleaveRequests();
    }).catch(error => {
      this.errMsgPop = 'Error Submitting Leave ..';
    });

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
    }).catch(error => {
      this.errMsgPop = 'Error Cancelling Leave ..';
    });
  }

  CancelLeave(data) {
    this.isLoading = true;
    swal({
      title: "Message",
      text: "Are you sure to cancel ?.",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
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
            //toastr.success("Leave Cancelled Sucessfully..!");
            swal({
              title: "Message",
              text: "Leave Self Cancelled Sucessfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            });
            this.getEmpleaveRequests();
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

  Plant: any;
  PayGroup: any;
  Department: any;
  Designation: any;
  RoleId: any;
  FullName: any;
  JoiningDate: any;
  EmployeeId: any;
  GetEmpDetails(val) {
    let connection = this.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, val);
    connection.then((data: any) => {
      if (data) {
        let result = data.filter(x => { return x.employeeId != null });
        this.Plant = result[0].baselocation;
        this.PayGroup = result[0].division;
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

  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.getPayGroupList();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  PayGroupList: any[] = [];
  getPayGroupList() {
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.PayGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.PayGroupList = [];
    });
  }

  getPay(id) {
    let tempPg = this.PayGroupList.find(x => x.id == id);
    return tempPg ? tempPg.short_desc : '';
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


  GetLastDay(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate() + 182).slice(-2);
    return formateddate;
  }

  CalculateDays() {
    // let stDate=new Date(this.StartDate);
    this.NoOfDays = 0;
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
    var cb = this.lvbalaneList.find(x => x.lvTypeid == 1);
    var casualBal: any;
    if (cb) {
      casualBal = cb.lvClbal;
    }
    var sb = this.lvbalaneList.find(x => x.lvTypeid == 2);
    var sickBal: any;
    if (sb) {
      sickBal = sb.lvClbal;
    }
    var pb = this.lvbalaneList.find(x => x.lvTypeid == 3);
    var privbal: any;
    if (pb) {
      privbal = pb.lvClbal;
    }
    var co = this.lvbalaneList.find(x => x.lvTypeid == 6);
    var coBal: any;
    if (co) {
      coBal = co.lvClbal;
    }

    if (this.lvType == null) {
      //toastr.error("Leave Type should not be left blank");

      swal({
        title: "Message",
        text: "Leave Type should not be left blank..!",
        timer: 1500,
        icon: "warning",
        dangerMode: false,
        buttons: [false, false]
      });
      this.ClearData();
      return;
    }

    if (this.lvType == 5 && this.StartDate != null) {
      var dt = new Date(this.StartDate);
      var edt = new Date(dt.setDate(dt.getDate() + 182));

      var currYear = new Date().getFullYear();

      if (edt.getFullYear() == currYear) {
        this.EndDate = this.setFormatedDate(edt);
        this.Duration1 = 'FD';
        this.Duration2 = 'FD';
        this.NoOfDays = '182';
        return;
      }
      else {
        this.EndDate = this.setFormatedDate(new Date(currYear + "-" + 12 + '-' + 31));
        this.Duration1 = 'FD';
        this.Duration2 = 'FD';
      }

    }
    if (this.StartDate != null && this.EndDate != null && this.Duration1 != null && this.Duration2 != null) {

      if (this.StartDate != null && this.EndDate != null) {
        if ((new Date(this.StartDate) > new Date(this.EndDate)) && this.EndDate != null && this.lvType != 5) {
          //toastr.error("Please Select Valid Date Range.");
          swal({
            title: "Message",
            text: "Please Select Valid Date Range.",
            timer: 1500,
            icon: "warning",
            dangerMode: false,
            buttons: [false, false]
          });
          return;
        }
        if (this.lvType != 5) {
          if (stYear != this.year || endYear != this.year) {
            //toastr.error("From date Year and To date year should equal to calendar Year");
            swal({
              title: "Message",
              text: "From date Year and To date year should equal to calendar Year",
              timer: 1500,
              icon: "warning",
              dangerMode: false,
              buttons: [false, false]
            });
            this.Duration1 = null;
            this.Duration2 = null;
            this.ClearData();
            return;
          }
        }
        if (stDate == edDate && this.Duration1 != this.Duration2) {
          this.NoOfDays = 0;
          //toastr.error("Please Select Valid Duration");
          swal({
            title: "Message",
            text: "Please Select Valid Date Duration.",
            timer: 1500,
            icon: "warning",
            dangerMode: false,
            buttons: [false, false]
          });
          this.StartDate = null;
          this.EndDate = null;
          this.Duration1 = null;
          this.Duration2 = null;
          return;
        }
      }

      if (this.Duration1 == 'FD' && this.Duration2 == 'SH') {
        this.NoOfDays = 0;
        //toastr.error("Please Select Valid Duration");
        swal({
          title: "Message",
          text: "Please Select Valid Duration.",
          timer: 1500,
          icon: "warning",
          dangerMode: false,
          buttons: [false, false]
        });
        this.StartDate = null;
        this.EndDate = null;
        this.Duration1 = null;
        this.Duration2 = null;
        return;
      }
      if (this.Duration1 == 'FH' && this.Duration2 == 'FD') {
        this.NoOfDays = 0;
        //toastr.error("Please Select Valid Duration");
        swal({
          title: "Message",
          text: "Please Select Valid Duration.",
          timer: 1500,
          icon: "warning",
          dangerMode: false,
          buttons: [false, false]
        });
        this.StartDate = null;
        this.EndDate = null;
        this.Duration1 = null;
        this.Duration2 = null;
        return;
      }
      if (this.Duration1 == 'FH' && this.Duration2 == 'SH') {
        this.NoOfDays = 0;
        //toastr.error("Please Select Valid Duration");
        swal({
          title: "Message",
          text: "Please Select Valid Duration.",
          timer: 1500,
          icon: "warning",
          dangerMode: false,
          buttons: [false, false]
        });
        this.StartDate = null;
        this.EndDate = null;
        this.Duration1 = null;
        this.Duration2 = null;
        return;
      }
      if ((casualBal == undefined || casualBal == null || casualBal.lvClbal == 0) && this.lvType == 1) {
        //toastr.error("Invalid leave balance. Please select another type.");
        swal({
          title: "Message",
          text: "Invalid leave balance. Please select another Leave type.",
          timer: 1500,
          icon: "warning",
          dangerMode: false,
          buttons: [false, false]
        });
        return;
      }
      if ((sickBal == undefined || sickBal == null || sickBal.lvClbal == 0) && this.lvType == 2) {
        //toastr.error("Invalid leave balance. Please select another type.");
        swal({
          title: "Message",
          text: "Invalid leave balance. Please select another Leave type.",
          timer: 1500,
          icon: "warning",
          dangerMode: false,
          buttons: [false, false]
        });
        return;
      }
      if ((privbal == undefined || privbal == null || privbal.lvClbal == 0) && this.lvType == 3) {
        //toastr.error("Invalid leave balance. Please select another Leave type.");
        swal({
          title: "Message",
          text: "Invalid leave balance. Please select another Leave type.",
          timer: 1500,
          icon: "warning",
          dangerMode: false,
          buttons: [false, false]
        });
        return;
      }
      if (this.lvType == 3) {
        var totDays = this.daydiff(this.parseDate(stDate), this.parseDate(edDate));
        if ((stDur == 'SH' && endDur == 'FD')
          || (stDur == 'FD' && endDur == 'SH') || (stDur == 'FD' && endDur == 'FH')) {
          totDays = (+totDays - 1).toString();
        }
        if (privbal < totDays) {
          //toastr.error("Invalid leave balance. Please select another type.");
          swal({
            title: "Message",
            text: "Invalid leave balance. Please select another Leave type.",
            timer: 1500,
            icon: "warning",
            dangerMode: false,
            buttons: [false, false]
          });
          this.Duration1 = null;
          this.Duration2 = null;
          return;
        }
      }
      if (this.lvType == 6) {
        var totDays = this.daydiff(this.parseDate(stDate), this.parseDate(edDate));
        if ((stDur == 'SH' && endDur == 'FD')
          || (stDur == 'FD' && endDur == 'SH') || (stDur == 'FD' && endDur == 'FH')) {
          totDays = (+totDays - 1).toString();
        }
        if (coBal < totDays) {
          //toastr.error("Invalid leave balance. Please select another type.");
          swal({
            title: "Message",
            text: "Invalid leave balance. Please select another Leave type.",
            timer: 1500,
            icon: "warning",
            dangerMode: false,
            buttons: [false, false]
          });
          this.Duration1 = null;
          this.Duration2 = null;
          return;
        }
      }
      if ((stDur == 'FH' && endDur == 'FH') || (stDur == 'SH' && endDur == 'SH')) {
        if (stDate != edDate) {
          //toastr.error("Please Select Valid Duration");
          swal({
            title: "Message",
            text: "Please Select Valid Duration.",
            timer: 1500,
            icon: "warning",
            dangerMode: false,
            buttons: [false, false]
          });
          this.StartDate = null;
          this.EndDate = null;
          this.Duration1 = null;
          this.Duration2 = null;
          return;
        }
      }
      if (this.lvType == 1) {
        var totDays = this.daydiff(this.parseDate(stDate), this.parseDate(edDate));
        if (this.maxCasual < totDays) {
          toastr.error("Maximum " + this.maxCasual + " days allow to apply casual leave.");
          return;
        }
        if (casualBal < totDays) {
          //toastr.error("Invalid leave balance. Please select another type.");
          swal({
            title: "Message",
            text: "Insufficient leave balance. Please select another Leave type.",
            timer: 1500,
            icon: "warning",
            dangerMode: false,
            buttons: [false, false]
          });
          this.Duration1 = null;
          this.Duration2 = null;
          return;
        }
      }
      if (this.lvType == 5) {
        var totDays = this.daydiff(this.parseDate(stDate), this.parseDate(edDate));
        if (+totDays > 182) {
          //toastr.error("Maximum " + 182 + " days allow to apply for maternity leave.");
          swal({
            title: "Message",
            text: "Maximum " + 182 + " days allow to apply for maternity leave.",
            icon: "error",
            dangerMode: false,
            buttons: [false, false]
          });
          this.ClearData();
          return;
        }

      }
      if (this.lvType == 2) {
        var totDays = this.daydiff(this.parseDate(stDate), this.parseDate(edDate));
        if (this.maxSick < totDays) {
          //toastr.error("Maximum " + this.maxSick + " days allow to apply sick leave.");
          swal({
            title: "Message",
            text: "Maximum " + this.maxSick + " days allow to apply sick leave.",
            icon: "error",
            dangerMode: false,
            buttons: [false, false]
          });
          this.Duration1 = null;
          this.Duration2 = null;
          jQuery("#myModal").modal('hide');
          return;
        }
        else {
          let filterModel: any = {};
          filterModel.startDate = this.setFormatedDate(this.StartDate);
          filterModel.endDate = this.setFormatedDate(this.EndDate);
          filterModel.startDuration = this.Duration1;
          filterModel.endDuration = this.Duration2;
          filterModel.location = this.currentUser.baselocation;
          filterModel.userId = this.currentUser.employeeId;
          filterModel.leaveType = this.lvType;

          let connection = this.httpService.LApost(APIURLS.CALCULATE_NO_OF_LEAVE_DAYS, filterModel);
          connection.then((data: any) => {
            if (data.noOfDays > 0) {
              this.NoOfDays = data.noOfDays;
            }
            else if (data.noOfDays == 'E') {
              swal({
                title: "Message",
                text: data.message,
                icon: "error",
                dangerMode: false,
                buttons: [false, true]
              });
              this.ClearData();
              jQuery("#myModal").modal('hide');
            }
          }).catch(error => {
          });
        }
      }

      else {
        let filterModel: any = {};
        filterModel.startDate = this.setFormatedDate(this.StartDate);
        filterModel.endDate = this.setFormatedDate(this.EndDate);
        filterModel.startDuration = this.Duration1;
        filterModel.endDuration = this.Duration2;
        filterModel.location = this.currentUser.baselocation;
        filterModel.userId = this.currentUser.employeeId;
        filterModel.leaveType = this.lvType;

        let connection = this.httpService.LApost(APIURLS.CALCULATE_NO_OF_LEAVE_DAYS, filterModel);
        connection.then((data: any) => {
          if (data.noOfDays > 0) {
            this.NoOfDays = +data.noOfDays;
            if (data.message == 'MATERNITY') {
              var dt1 = new Date(this.StartDate);
              var edt1 = new Date(dt1.setDate(dt1.getDate() + this.NoOfDays));

              this.EndDate = this.setFormatedDate(edt1);
            }
          }
          else if (data.noOfDays == 'E') {
            swal({
              title: "Message",
              text: data.message,
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            });
            this.ClearData();
            jQuery("#myModal").modal('hide');
          }
        }).catch(error => {
        });
      }
    }
    return;
  }

  daydiff(first, second) {

    var totaldays = (second - first) / (3000 * 60 * 60 * 24);
    if (totaldays <= 0) {
      return "";
    }

    //daydiff

    if (totaldays == 1 && ((this.Duration1 == 'FH' && this.Duration2 == 'FH') || (this.Duration1 == 'SH' && this.Duration2 == 'SH'))) {
      totaldays = 0.5;
    }
    else if ((this.Duration1 == 'FD' && this.Duration2 == 'FH') || (this.Duration1 == 'SH' && this.Duration2 == 'FD')) {
      totaldays = totaldays + 0.5;
    }
    else if (this.Duration1 == 'SH' && this.Duration2 == 'FH') {
      totaldays = totaldays - 1;
    }
    this.NoOfDays = totaldays;
    return totaldays;
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

  downloadFile(reqNo, value) {
    // console.log(filename);
    if (value.length > 0) {
      this.httpService.LAgetFile(APIURLS.BR_LEAVE_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
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


  addLeave: any;
  conLeave: any;
  perLeave: any;
  appid: any;
  appName: any;
  appDesg: any;
  appRole: any;
  appDept: any;
  appStatus: any;
  appDate: any;
  rejDate: any;
  printLeave(values) {
    // this.appDetails(values.reqId);
    this.reqNo = values.reqId;
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
    if (values.approvelStatus == 'Approved' || values.approvelStatus == 'Rejected') {
      this.appid = values.approverNoL;
      this.appName = values.lastApprover;
      this.appDesg = values.appDesignationL;
      this.appRole = values.appRoleL;
      this.appDept = values.appDepartmentL;
      this.appStatus = values.approvelStatus;
      this.appDate = values.approvedDate;
      this.rejDate = values.rejectedDate;
    }
    else {
      this.appid = values.approverNo;
      this.appName = values.pendingApprover;
      this.appDesg = values.appDesignation;
      this.appRole = values.appRole;
      this.appDept = values.appDepartment;
      this.appStatus = values.approvelStatus;
      this.appDate = '';
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


  ApprovedLeaveList: any[] = [];
  cancelapprovedleavelist() {
    this.CancelLeaveflag = true;
    let dt = new Date();
    let stdate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1 - 2)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2)
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    srchstr.userId = this.currentUser.employeeId;
    srchstr.year = this.CalYear;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LEAVE_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.LeaveRequestList = data;
        this.LeaveRequestList = this.LeaveRequestList.filter(x => new Date(x.startDate) > new Date(stdate) &&
          (x.approvelStatus == 'Approved'));
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.LeaveRequestList = [];
    });
  }

  getCAncelApproversList(id) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_CANCEL_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
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

  CancelLeaveflag: boolean = false;
  CancelApprovedLeaveView(isedit: boolean, data: any, value: string) {
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.reqId = data.reqId;
    filterModel.typ = 'Leave'
    let connection = this.httpService.LApost(APIURLS.CHECK_CANCEL_LEAVE_ONDUTY_FLAG, filterModel);
    connection.then((dataCCL: any) => {
      this.isLoading = true;
      if (dataCCL.table[0].type == 'S') {
        jQuery("#CancelLeaveModal").modal('hide');
        this.CancelLeave(data);
        return;
      }
      else if (dataCCL.table[0].type == 'E') {
        this.view = false;
        this.isEdit = isedit;
        this.errMsgPop = "";
        this.ClearData();
        this.getCAncelApproversList(data.userId);
        this.lvType = this.lvTypeList.find(x => x.lvType == data.leaveType).lvTypeid;
        this.getLvReasonList(this.lvType);
        this.CalenderYear = this.CalYear;
        this.reqNo = data.reqId;
        this.StartDate = data.startDate;
        this.EndDate = data.endDate;
        this.Duration1 = data.startDuration;
        this.Duration2 = data.endDuration;
        this.NoOfDays = data.noOfDays;
        this.LvReason = data.reasonType;
        this.DetailedReason = data.reason;
        this.personName = data.personResponsible;
        this.LeaveAddress = data.addressDuringLeave;
        this.LeaveContactNo = data.contactNo;
        this.approvalStatus = data.approvelStatus;
        this.approvedDate = data.approvedDate;
        jQuery("#CancelLeaveModal").modal('show');
        return;
      }
    })


  }

  CancelApprovedLeave() {
    swal({
      title: "Message",
      text: "Are you sure to cancel ?.",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {

        let leaveDetailsModel: any = {};
        leaveDetailsModel.reqId = this.reqNo;
        leaveDetailsModel.cancelflag = 1;
        leaveDetailsModel.approvelStatus = 'Cancel Leave';
        let connection = this.httpService.LApost(APIURLS.BR_CANCEL_EMP_LEAVE, leaveDetailsModel);
        connection.then((data: any) => {
          this.isLoading = false;
          if (data) {
            swal({
              title: "Message",
              text: "Leave Cancellation Applied Successfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            });
            jQuery("#CancelLeaveModal").modal('hide');
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


}
