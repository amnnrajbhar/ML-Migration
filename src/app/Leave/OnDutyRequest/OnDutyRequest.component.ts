import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
// //import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatAccordion } from '@angular/material/expansion';
import { OnDutyDetails } from './OnDutyRequest.model';
import * as moment from 'moment';
import htmlToPdfmake from 'html-to-pdfmake';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { logWarnings } from 'protractor/built/driverProviders';
import { formatDate } from '@angular/common';

declare var ActiveXObject: (type: string) => void;



@Component({
  selector: 'app-OnDutyRequest',
  templateUrl: './OnDutyRequest.component.html',
  styleUrls: ['./OnDutyRequest.component.css']
})
export class OnDutyRequestComponent implements OnInit {
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
  OnDutyAddress: string = null;
  OnDutyContactNo: string = null;
  approverStatus: string = null;
  approvedDate: any;
  StartDate: any;
  EndDate: any;
  Duration1: string = null;
  Duration2: string = null;
  NoOfDays: number = 0;
  LvReason: string = null;
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  OnDutyRequestList: any[] = [];
  Starttime: any;
  EndTime: any;
  fromDate: any;
  toDate: any;
  fromTime: any;
  toTime: any;
  Plant: any = null;
  ApplyFor: any = null;
  userId: string = null;
  onType: any;
  location: any;
  strDate: any;
  startDur: any;
  endDate: any;
  endDur: any;
  reqDate: any;
  detReason: any;
  Areaorlocation: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
 private https: HttpClient, private route: ActivatedRoute) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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
        this.locationAllList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationAllList = this.locationAllList.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locationAllList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
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

  getLocationName(id) {
    let temp = this.locationList.find(x => x.fkPlantId == id);
    return temp ? temp.code + ' - ' + temp.name : '';
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
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getLocationMaster();
      this.getApproversList(this.employeeId);
      this.getholidaysList();
      this.getLvReasonList();
      this.getEmpOnDutyRequests();
      this.getbase64image();
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getRoleList();
      this.getPlantsassigned(this.currentUser.fkEmpId);
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


  ApproversList: any[] = [];
  getApproversList(id) {
    if (this.ApplyFor == "Others" && (this.userId == null || this.userId == '')) {
      toastr.error("Please enter Employee no...!");
      return;
    }
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
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

  ClearData() {
    this.OnDutyType = null;
    this.StartDate = null;
    this.fromDate = null;
    this.toDate = null;
    this.Duration1 = null;
    this.Duration2 = null;
    this.NoOfDays = null;
    this.LvReason = null;
    this.DetailedReason = null;
    this.Starttime = null;
    this.EndTime = null;
    this.personName = null;
    this.personResponsible = null;
    this.Plant = null;
    this.OnDutyAddress = null;
    this.OnDutyContactNo = null;
    this.Areaorlocation = null;
    this.ApplyFor = null;
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
          text: "File cannot exceed 10 Mb",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        })
        this.File = null;
        this.reset();
      }

      else {
        for (var i = 0; i < files.length; i++) {
          this.files.push(files[i]);
          this.fileslist1.push(files[i].name);
        }
      }
    }
    // this.fileslist1 = this.files;
    this.reset();
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
  uploadfile(list: any) {
    // debugger;
    // this.id='VM001';

    this.id = list.requestNo;
    this.formData = new FormData();
    for (var i = 0; i < this.files.length; i++) {
      this.formData.append('files', this.files[i]);
    }
    let connection: any;
    connection = this.httpService.LAfileUpload(APIURLS.BR_MASTER_ONDUTY_FILEUPLOAD_API, this.id, this.formData);
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

  removefile(name, id) {
    const index = this.fileslist1.indexOf(name);
    this.fileslist1.splice(index, 1);

  }

  ReasonList: any[] = [];
  getLvReasonList() {
    this.errMsg = "";
    this.LvReason = null;
    this.ReasonList = [];
    this.httpService.LAget(APIURLS.BR_GET_ALL_ONDUTY_REASONS_LIST).then((data: any) => {
      if (data.length > 0) {
        this.ReasonList = data.filter(x => x.isActive && x.leavType == 100);
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

  upcomingRequests: any[] = [];
  getEmpOnDutyRequests() {
    this.errMsg = "";
    this.isLoading = true;
    this.CancelLeaveflag = false;
    let srchstr: any = {};
    srchstr.userId = this.currentUser.employeeId;
    srchstr.year = this.CalYear;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_ONDUTY_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.OnDutyRequestList = data;
        this.OnDutyRequestList = this.OnDutyRequestList.sort((a, b) => {
          if (a.requestNo < b.requestNo) return 1;
          if (a.requestNo > b.requestNo) return -1;
        });
        this.upcomingRequests = this.OnDutyRequestList.filter(x => new Date(x.startDate) > new Date() && (x.approverStatus == 'Pending' || x.approverStatus == 'In Process' || x.approverStatus == 'Approved'));
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.OnDutyRequestList = [];
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

  ApplyOnDuty(isedit: boolean, data: any, value: string) {
    this.view = false;
    this.isEdit = isedit;
    this.fileslist1 = [];
    this.files = [];
    this.ClearData();
    if (this.isEdit) {
      //   let data=Object.assign({},value)
      this.Plant = data.location;
      this.reqNo = data.requestNo;
      this.CalenderYear = this.CalYear;
      this.fromDate = data.startDate;
      this.OnDutyType = data.onDutyType;
      this.toDate = data.endDate;
      this.fromTime = this.binddatetime1(data.startTime);
      this.toTime = this.binddatetime1(data.endTime);
      this.DetailedReason = data.reason;
      this.personName = data.personResponsible;
      this.OnDutyAddress = data.addressDuringLeave;
      this.OnDutyContactNo = data.contactNo;
      this.approverStatus = data.approverStatus;
      this.approvedDate = data.approvedDate;
      this.Areaorlocation = data.area;
      if (data.documents != null) {
        this.fileslist1 = data.documents.split(',');
      }
    }
    else {
      // this.fromDate = new Date();
      // this.toDate = new Date();
      let currentDate = new Date();
      let hours = currentDate.getHours();
      let minutes = currentDate.getMinutes();
      let seconds = currentDate.getSeconds();
      let currentTime = hours + ':' + minutes + ':' + seconds;
      this.fromTime = this.binddatetime1(currentTime);
      // this.fromTime = this.binddatetime1('09:00:00');
      this.toTime = this.binddatetime1('18:00:00');
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }

  getTimings(fromDate) {
    let currentDate = new Date();
    let formatedDate = formatDate(currentDate, 'dd/MM/yyyy', 'en-US');

    let formatedDateSelected = formatDate(fromDate, 'dd/MM/yyyy', 'en-US');

    if (formatedDateSelected != formatedDate) {
      this.fromTime = this.binddatetime1('09:00:00');
      this.toTime = this.binddatetime1('18:00:00');
    }
    else {
      let currentDate = new Date();
      let hours = currentDate.getHours();
      let minutes = currentDate.getMinutes();
      let seconds = currentDate.getSeconds();
      let currentTime = hours + ':' + minutes + ':' + seconds;
      this.fromTime = this.binddatetime1(currentTime);
      this.toTime = this.binddatetime1('18:00:00');
    }
  }

  getDate(toDate) {
    console.log(this.setFormatedDate(toDate));
  }

  Department: any;
  Designation: any;
  FullName: any;
  JoiningDate: any;
  RoleId: any;
  PayGroup: any;
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

  downloadFile(reqNo, value) {

    // console.log(filename);
    if (value.length > 0) {
      this.httpService.LAgetFile(APIURLS.BR_ONDUTY_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
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

  OnSaveOnDutyRequest(status) {
    this.isLoading = true;
    swal({
      text: "Please wait.. On-Duty is getting applied ..!",
      timer: 5000,
      icon: "info",
      dangerMode: false,
      buttons: [false, false]
    });
    if (this.OnDutyType == 'Visit Plants' && (this.Plant == null || this.Plant == '')) {
      toastr.error("Please select Plant..");
      return;
    }
    if (this.toDate < this.fromDate) {
      toastr.error("Please select valid End Date..");
      this.toDate = null;
      return;
    }
    let filterModel = {} as OnDutyDetails;
    if (this.ApplyFor == "Others") {
      filterModel.userId = this.userId;
      filterModel.applyFor = 'Others';
    }
    else {
      filterModel.userId = this.currentUser.employeeId;
      filterModel.applyFor = 'Self';
    }

    filterModel.endDuration = this.Duration2;
    let dtStartDate;
    let dtEndDate;

    let d1 = new Date(this.fromDate);
    let d2 = new Date(this.toDate);
    var dtStartTime = new Date(this.fromTime);
    var dtEndTime = new Date(this.toTime);
    dtStartDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), dtStartTime.getHours(), dtStartTime.getMinutes());
    dtEndDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), dtEndTime.getHours(), dtEndTime.getMinutes());
    let formdate: string = d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
    let todate: string = d2.getFullYear() + "-" + ("00" + (d2.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d2.getDate()).slice(-2);
    var startTime = ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
    var endTime = ("00" + dtEndTime.getHours()).slice(-2) + ":" +
      ("00" + dtEndTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtEndTime.getSeconds()).slice(-2);
    filterModel.applyFor = this.ApplyFor;
    filterModel.startDate = formdate;
    filterModel.endDate = todate;
    filterModel.startTime = startTime;
    filterModel.endTime = endTime;
    filterModel.recordStatus = status;
    filterModel.onDutyStatus = '0';
    filterModel.onDutyType = this.OnDutyType;
    if (this.fileslist1.length > 0) {
      filterModel.documents = this.fileslist1[0];
      for (let j = 1; j < this.fileslist1.length; j++) {
        filterModel.documents = this.fileslist1[j] + ',' + filterModel.documents;
      }
    }
    else {
      filterModel.documents = '';
    }
    //filterModel.submitDate = new Date().toDateString();
    filterModel.reason = this.DetailedReason;
    filterModel.firstname = this.currentUser.employeeId;
    filterModel.approverStatus = 'In Process';
    filterModel.approverId = this.ApproversList[0].employeeId;
    filterModel.lastApprover = 'No';
    filterModel.pendingApprover = this.ApproversList[0].employeeId;
    filterModel.addressDuringLeave = this.OnDutyAddress;
    filterModel.contactNo = this.OnDutyContactNo;
    filterModel.forwardedEmpId = this.personName;
    filterModel.location = this.Plant;
    filterModel.area = this.Areaorlocation;

    var sday: any = new Date(startTime);
    var eday: any = new Date(endTime);
    let diffMs: any = (eday - sday)
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    filterModel.reqMin = diffMins;
    filterModel.reqHours = diffHrs;

    let connection = this.httpService.LApost(APIURLS.BR_APPLY_EMP_ONDUTY, filterModel);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data.typ == 'S') {
        jQuery("#myModal").modal('hide');
        // alert("OnDuty Details Submitted Sucessfully With Req Id : " + data.requestNo);
        swal({
          title: "Message",
          text: "OnDuty Details Submitted Sucessfully With Req No : " + data.requestNo,
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        })
        this.sendMail(data);
        this.uploadfile(data);
        this.ClearData();
        this.getApproversList(this.currentUser.employeeId);
        this.getEmpOnDutyRequests();
        jQuery("#myModal").modal('hide');
      }
      if (data.typ == 'D') {
        swal({
          title: "Message",
          text: "OnDuty Details Saved Sucessfully As Draft with Req No: " + data.requestNo,
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.ClearData();
        this.getApproversList(this.currentUser.employeeId);
        this.getEmpOnDutyRequests();
        jQuery("#myModal").modal('hide');
      }
      else if (data.typ == 'E') {
        // toastr.error(data.message);
        swal({
          title: "Message",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        })
        this.ClearData();
        jQuery("#myModal").modal('hide');
        this.getEmpOnDutyRequests();
      }
      this.reset();
    }).catch(error => {
      this.errMsgPop = 'Error Cancelling OnDuty ..';
    });

  }

  CancelOnDuty(data: OnDutyDetails) {
    swal({
      title: "Message",
      text: "Are you sure to self cancel ?.",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {

        let leaveDetailsModel = {} as OnDutyDetails;
        leaveDetailsModel = Object.assign({}, data);
        leaveDetailsModel.id = data.id;
        leaveDetailsModel.onDutyStatus = '4';
        leaveDetailsModel.approverStatus = 'Self Cancelled';
        let connection = this.httpService.LAput(APIURLS.BR_ONDUTY_CANCEL_REQUEST, leaveDetailsModel.id, leaveDetailsModel);
        connection.then((data: any) => {
          this.isLoading = false;
          if (data) {
            //toastr.success("OnDuty Cancelled Sucessfully..!");
            swal({
              title: "Message",
              text: "OnDuty Self Cancelled Sucessfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            });
            this.getEmpOnDutyRequests();
          }
          else {
            //toastr.error("Error Cancelling OnDuty ..");
            swal({
              title: "Message",
              text: "Error Cancelling OnDuty ..",
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            })
          }
          this.getEmpOnDutyRequests();
          this.reset();
        }).catch(error => {
          this.errMsgPop = 'Error Cancelling OnDuty ..';
        });
      }
    });
  }


  sendMail(data) {
    data.typ = 'ApplyOnDuty';
    if (this.ApplyFor == "Others") {
      data.userId = this.userId;
    }
    else {
      data.userId = this.currentUser.employeeId;
    }
    let connection = this.httpService.LApost(APIURLS.BR_SEND_MAIL_FOR_ONDUTY, data);
    connection.then((data: any) => {
      this.isLoading = false;

      //this.getEmpleaveRequests();
      this.reset();
    }).catch(error => {
      this.errMsgPop = 'Failure Sending Mail ..';
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

   getHeader(): any {
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
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

  Active: boolean = false;
  toggleAccordian(event, index) {
    var element = event.target;
    element.classList.toggle("active");
    if (this.Active) {
      this.Active = false;
    } else {
      this.Active = true;
    }
    var panel = element.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
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
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear();
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


  reqNo: any;
  perLeave: any;
  addLeave: any;
  conLeave: any;
  printOnDuty(values) {
    this.GetEmpDetails(values.userId);
    this.reqNo = values.requestNo;
    this.addLeave = values.addressDuringLeave;
    this.perLeave = values.personResponsible;
    this.conLeave = values.contactNo;
    this.onType = values.onDutyType;
    this.location = values.location;
    this.strDate = values.startDate;
    this.startDur = values.startTime;
    this.endDate = values.endDate;
    this.endDur = values.endTime;
    this.reqDate = values.submitDate;
    this.detReason = values.reason;
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
    var ReportName = "EMPLOYEE ON DUTY DETAILS";
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
        title: 'On Duty Detail',
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
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_ONDUTY_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.OnDutyRequestList = data;
        this.OnDutyRequestList = this.OnDutyRequestList.filter(x => new Date(x.startDate) > new Date(stdate) &&
          (x.approverStatus != 'Rejected' && x.approverStatus != 'Self Cancelled'));
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.OnDutyRequestList = [];
    });
  }

  getCAncelApproversList(id) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_CANCEL_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
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

  CheckCancelODFlag(dataODL) {
    jQuery("#CancelModal").modal('hide');
    this.isLoading = false;
    let filterModel: any = {};
    filterModel.reqId = dataODL.requestNo;
    filterModel.typ = 'OnDuty'
    let connection = this.httpService.LApost(APIURLS.CHECK_CANCEL_LEAVE_ONDUTY_FLAG, filterModel);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data.table[0].type == 'S') {
        jQuery("#CancelModal").modal('hide');
        this.CancelOnDuty(dataODL);
        return;
      }
      else if (data.table[0].type == 'E') {
        return;
      }
    })
  }

  CancelLeaveflag: boolean = false;
  CancelApprovedLeaveView(isedit: boolean, data: any, value: string) {
    this.isLoading = false;
    let filterModel: any = {};
    filterModel.reqId = data.requestNo;
    filterModel.typ = 'OnDuty'
    let connection = this.httpService.LApost(APIURLS.CHECK_CANCEL_LEAVE_ONDUTY_FLAG, filterModel);
    connection.then((dataODL: any) => {
      this.isLoading = false;
      if (dataODL.table[0].type == 'S') {
        jQuery("#CancelModal").modal('hide');
        this.CancelOnDuty(data);
        return;
      }
      else if (dataODL.table[0].type == 'E') {
        this.getCAncelApproversList(data.userId);
        this.view = false;
        this.isEdit = isedit;
        this.errMsgPop = "";
        this.ClearData();
        this.Plant = data.location;
        this.CalenderYear = this.CalYear;
        this.fromDate = data.startDate;
        this.OnDutyType = data.onDutyType;
        this.toDate = data.endDate;
        this.fromTime = this.binddatetime1(data.startTime);
        this.toTime = this.binddatetime1(data.endTime);
        this.DetailedReason = data.reason;
        this.reqNo = data.requestNo;
        this.personName = data.personResponsible;
        this.OnDutyAddress = data.addressDuringLeave;
        this.OnDutyContactNo = data.contactNo;
        this.approverStatus = data.approverStatus;
        this.approvedDate = data.approvedDate;
        jQuery("#CancelModal").modal('show');
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
        leaveDetailsModel.onDutyStatus = '4';
        leaveDetailsModel.cancelflag = 1
        leaveDetailsModel.approvelStatus = 'Cancel OnDuty';
        let connection = this.httpService.LApost(APIURLS.BR_CANCEL_EMP_LEAVE, leaveDetailsModel);
        connection.then((data: any) => {
          this.isLoading = false;
          if (data) {
            //toastr.success("OnDuty Cancellation Applied Sucessfully..!");
            swal({
              title: "Message",
              text: "OnDuty Cancellation Applied Sucessfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            })
            jQuery("#CancelModal").modal('hide');
          }
          else {
            //toastr.error("Error Cancelling OnDuty ..");
            swal({
              title: "Message",
              text: "Error Cancelling OnDuty ..",
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            })
          }
          this.reset();
          this.getEmpOnDutyRequests();
        }).catch(error => {
          this.errMsgPop = 'Error Cancelling OnDuty...';
        });
      }
    });
  }

}
