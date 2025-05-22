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
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatAccordion } from '@angular/material';
import { ReachHRDetails } from './ReachHR.model';
import * as moment from 'moment';
import htmlToPdfmake from 'html-to-pdfmake';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { UserIdRequest } from '../../UID/UserIdRequest/UserIdRequest.model';
declare var ActiveXObject: (type: string) => void;



@Component({
  selector: 'app-ReachHR',
  templateUrl: './ReachHR.component.html',
  styleUrls: ['./ReachHR.component.css']
})
export class ReachHRComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;

  protected aFormGroup: FormGroup;
  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  public tableWidget: any;
  public tableWidgetlv: any;
  isLoading: boolean = false;
  siteKey: any = "6LdvuLIlAAAAACWo5eg4062FwVmvzMIsP7MEDoqU";
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  path: string;
  selectedBaseLocation: any[] = [];
  employeeId: any = null;
  year: any;
  CalenderYear: string = '';
  CalYear: any;
  filtermonth: any;
  StartDate: string = null;
  EndDate: string = null;
  ReachHRList: any[] = [];
  fromDate: any;
  toDate: any;
  userId: string = null;
  requestPSList: any[] = [];
  requestHRQList: any[] = [];
  filterRequest: any = null;
  MonthorYear: any = null;
  Year: any = [];
  upcomingPSList: any[];
  upcomingHRQList: any[];
  filterYear: any;
  locationId: any;
  catList: any[] = [];
  filterHR: any;
  filtercategory: any;
  filtersubject: any;
  filterdescription: any;
  filtercomments: any;
  FromDate: any;
  ToDate: any;
  locationList: any;
  location: any;
  locationAllList: any;
  locListCon: any;
  ApproversList: any[] = [];
  captchaValue: string;
  UserInput: string;
  captchaStatus: any = '';
  captchaConfig: any = {
    type: 1,
    length: 6,
    cssClass: 'custom',
    back: {
      stroke: "#2F9688",
      solid: "#f2efd2"
    },
    font: {
      color: "#000000",
      size: "35px"
    }
  };
  captch_input: any = null;
  code: any = null;
  resultCode: any = null;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private https: HttpClient, private route: ActivatedRoute, private formBuilder: FormBuilder) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

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

  ngOnChanges() {

    this.createCaptcha();
  }

  createCaptcha() {

    switch (1) {
      case 1: // only alpha numaric degits to type

        let char =
          Math.random()
            .toString(24)
            .substring(2, 6) +
          Math.random()
            .toString(24)
            .substring(2, 4);
        this.code = this.resultCode = char.toUpperCase();
        break;
      // case 2: // solve the calculation 
      // let num1 = Math.floor(Math.random() * 99);
      // let num2 = Math.floor(Math.random() * 9);
      // let operators = ['+','-'];
      // let operator = operators[(Math.floor(Math.random() * operators.length))];
      // this.code =  num1+operator+num2+'=?';
      // this.resultCode = (operator == '+')? (num1+num2):(num1-num2);
      // break;
    }


    setTimeout(() => {
      let captcahCanvas: any = document.getElementById("captcahCanvas");
      var ctx = captcahCanvas.getContext("2d");
      ctx.fillStyle = this.captchaConfig.back.solid;
      ctx.fillRect(0, 0, captcahCanvas.width, captcahCanvas.height);

      ctx.beginPath();

      captcahCanvas.style.letterSpacing = 15 + "px";
      ctx.font = this.captchaConfig.font.size + " " + this.captchaConfig.font.family;
      ctx.fillStyle = this.captchaConfig.font.color;
      ctx.textBaseline = "middle";
      ctx.fillText(this.code, 40, 50);
      if (this.captchaConfig.back.stroke) {
        ctx.strokeStyle = this.captchaConfig.back.stroke;
        for (var i = 0; i < 150; i++) {
          ctx.moveTo(Math.random() * 300, Math.random() * 300);
          ctx.lineTo(Math.random() * 300, Math.random() * 300);
        }
        ctx.stroke();
      }

      // this.captchaCode.emit(char);
    }, 100);
  }
  createCaptchaForForm16() {

    switch (1) {
      case 1: // only alpha numaric degits to type

        let char =
          Math.random()
            .toString(24)
            .substring(2, 6) +
          Math.random()
            .toString(24)
            .substring(2, 4);
        this.code = this.resultCode = char.toUpperCase();
        break;
      // case 2: // solve the calculation 
      // let num1 = Math.floor(Math.random() * 99);
      // let num2 = Math.floor(Math.random() * 9);
      // let operators = ['+','-'];
      // let operator = operators[(Math.floor(Math.random() * operators.length))];
      // this.code =  num1+operator+num2+'=?';
      // this.resultCode = (operator == '+')? (num1+num2):(num1-num2);
      // break;
    }


    setTimeout(() => {
      let captcahCanvas: any = document.getElementById("captcahCanvas1");
      var ctx = captcahCanvas.getContext("2d");
      ctx.fillStyle = this.captchaConfig.back.solid;
      ctx.fillRect(0, 0, captcahCanvas.width, captcahCanvas.height);

      ctx.beginPath();

      captcahCanvas.style.letterSpacing = 15 + "px";
      ctx.font = this.captchaConfig.font.size + " " + this.captchaConfig.font.family;
      ctx.fillStyle = this.captchaConfig.font.color;
      ctx.textBaseline = "middle";
      ctx.fillText(this.code, 40, 50);
      if (this.captchaConfig.back.stroke) {
        ctx.strokeStyle = this.captchaConfig.back.stroke;
        for (var i = 0; i < 150; i++) {
          ctx.moveTo(Math.random() * 300, Math.random() * 300);
          ctx.lineTo(Math.random() * 300, Math.random() * 300);
        }
        ctx.stroke();
      }

      // this.captchaCode.emit(char);
    }, 100);
  }
  playCaptcha() {
    var msg = new SpeechSynthesisUtterance(this.code.split('').join(' '));
    msg.pitch = 0.1;
    window.speechSynthesis.speak(msg);
  }

  validatecaptcha: boolean = false;
  checkCaptcha() {
    if (this.captch_input != this.resultCode) {
      toastr.error("Invalid Captcha")
      this.validatecaptcha = false;
      this.captch_input = null;

    } else {
      toastr.success("Success")
      this.validatecaptcha = true;
    }
  }



  private reInitlvDatatable(): void {
    if (this.tableWidgetlv) {
      this.tableWidgetlv.destroy()
      this.tableWidgetlv = null
    }
    setTimeout(() => this.initlvDatatable(), 0)
  }


  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.baseLocation = this.currentUser.baselocation;
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.filterYear = new Date(today).toDateString();
    this.monthslist();
    this.yearslist();
    // this.getPayslipRequests();
    // this.getForm16Requests();
    // this.getHRQueriesRequests();
    this.getLocationMaster();
    this.createCaptcha();
    this.getRoleList();
    this.getEmpDetails(this.currentUser.employeeId);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.aFormGroup = this.formBuilder.group({
      recaptcha: ['', Validators.required]
    });
    if (chkaccess == true) {
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onChange() {
    this.requestPSList = [];
    this.reInitDatatable();
  }

  CategoryList: any[];
  getCatList() {
    this.httpService.LAget(APIURLS.BR_GET_QUERY_CATEGORY).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.catList = data;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.catList.sort((a, b) => { return collator.compare(a.name, b.name) });
      }
    }).catch(error => {
      this.catList = [];
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

  MonthorYearList: any[] = [];
  monthslist() {
    let today = new Date();
    for (let i = 0; i < 10; i++) {
      let model: any = {};

      model.mon = new Date(today.getFullYear(), today.getMonth() - i, today.getDate())
      this.MonthorYearList.push(model)
    }
    this.MonthorYear = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  YearList: any[] = [];
  yearslist() {
    let today = new Date();
    for (let i = 0; i < 3; i++) {
      let model: any = {};

      model.year = new Date(today.getFullYear() - i, today.getMonth(), today.getDate())
      this.YearList.push(model)
    }
    // this.Year = new Date(today.getFullYear());
  }

  getPayslipRequests() {
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    if (this.filterYear == null || this.filterYear == undefined) {
      this.isLoading = false;
      toastr.error("Please select year.")
    }
    else {
      srchstr.year = new Date(this.filterYear).getFullYear().toString();
      srchstr.reqType = 'Payslip';
      srchstr.reqBy = this.currentUser.employeeId;

      this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_PAYSLIP_REQUESTS, srchstr).then((data: any) => {
        if (data) {
          this.requestPSList = data;
          this.upcomingPSList = this.requestPSList.filter(x => new Date(x.startDate) > new Date());
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.requestPSList = [];
      });
    }

  }

  getForm16Requests() {
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    srchstr.year = new Date(this.filterYear).getFullYear().toString();
    srchstr.reqType = 'Form16';
    srchstr.reqBy = this.currentUser.employeeId;

    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_PAYSLIP_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.requestPSList = data;
        this.upcomingPSList = this.requestPSList.filter(x => new Date(x.startDate) > new Date());
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.requestPSList = [];
    });
  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

  getHRQueriesRequests() {
    this.errMsg = "";
    this.isLoading = true;
    let srchstr: any = {};
    srchstr.fromDate = this.setFormatedDate(this.FromDate);
    srchstr.toDate = this.setFormatedDate(this.ToDate);
    srchstr.reqBy = this.currentUser.employeeId;

    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_QUERY_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.requestHRQList = data;
        this.upcomingHRQList = this.requestHRQList.filter(x => new Date(x.startDate) > new Date());
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.requestHRQList = [];
    });
  }

  clearFilter() {
    this.filterYear = null;
    this.filterRequest = null;
    this.FromDate = null;
    this.ToDate = null;
  }

  ClearData() {
    this.filtermonth = null;
    this.filterYear = null;
    this.filterHR = null;
    this.filtercategory = null;
    this.filtersubject = null;
    this.filterdescription = null;
    this.ApproversList = [];

  }

  // GET PAYSLIP REQUESTS
  view: boolean = false;
  NewPayslipRequest(isedit: boolean, data: any, value: string) {
    this.view = false;
    this.isEdit = isedit;
    this.ClearData();
    this.createCaptcha();
    if (this.isEdit) {
    }
    if (value == 'View') {
      this.view = true
    }
    jQuery("#myModal").modal('show');
  }

  // APPLY FOR PAYSLIP REQUESTS
  OnSavePayslipRequest() {
    if (this.filtermonth == null) {
      toastr.error("Please select Month !")
      return;
    }
    else if (this.filterYear == null) {
      toastr.error("Please select Year !")
      return;
    }
    else if (this.captch_input != this.resultCode) {
      toastr.error("Invalid Captcha")
      this.captch_input = null;
      return;
    }
    else if (this.captch_input == null || this.captch_input == ''  || this.captch_input == undefined ) {
      toastr.error("Please enter Captcha")
      this.captch_input = null;
      return;
    }
    else {
      let filterModel = {} as ReachHRDetails;
      filterModel.reqBy = this.currentUser.employeeId;
      filterModel.reqType = 'Payslip'
      filterModel.Month = this.filtermonth;
      filterModel.Year = new Date(this.filterYear).getFullYear().toString();
      filterModel.status = 'Pending';
      let connection = this.httpService.LApost(APIURLS.BR_APPLY_PAYSLIP_REQUEST, filterModel);
      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200 || output.reqId >= 0) {
          
          swal({
            title: "Message",
            text: "Payslip Request No: " + output.reqId + " submitted and Payslip generated successfully..!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          jQuery("#myModal").modal('hide');
          this.ClearData();
          this.generaterPaySlip(output)
        }
      }).catch(error => {
        this.errMsgPop = 'Error Uploading Request...';
      });
    }
  }

  generaterPaySlip(Id) {
    let requestList: any[] = [];
    let filterModel: any = {};
    filterModel.pernr = this.currentUser.employeeId;
    filterModel.werks = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
    filterModel.reqno = Id.reqId;
    let year = new Date(this.filterYear).getFullYear();
    let month = this.filtermonth.length > 1 ? this.filtermonth : '0' + this.filtermonth
    let day = new Date().getDay().toString();
    day = day.length > 1 ? day : '0' + day;
    filterModel.prmnth = year + "-" + month + "-" + day;
    requestList.push(filterModel);
    let connection = this.httpService.post(APIURLS.RFCBAPI_GET_PAYSLIP_API, requestList);
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output.length > 0) {
        if (output[0].message.toLocaleLowerCase() != 'success') {
          swal({
            title: "Message",
            text: output[0].message,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          });
          Id.status = 'Mail Not Sent.';
          Id.sapMessage = output[0].message
          Id.sapStatus = 'Failed';
        }
        else {
          swal({
            title: "Message",
            text: "Payslip Request No: " + Id.reqId + " submitted and Payslip generated successfully..!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          Id.status = 'Mail Sent.';
          Id.sapMessage = output[0].message
          Id.sapStatus = 'Success';
        }
        this.UpdatePaySlipRequest(Id);
        this.ClearData();
      }
    }).catch(error => {
      this.errMsgPop = 'Error generating Request...';
    });
  }

  UpdatePaySlipRequest(data) {
    let filterModel = {} as ReachHRDetails;
    filterModel = Object.assign({}, data)
    filterModel.reqBy = data.reqBy;
    filterModel.reqType = data.reqType
    filterModel.Month = data.Month;
    filterModel.Year = data.Year;
    filterModel.status = data.status;
    filterModel.reqId = data.reqId
    filterModel.sapMessage = data.sapMessage;
    filterModel.sapStatus = data.sapStatus;
    let connection = this.httpService.LAput(APIURLS.BR_APPLY_PAYSLIP_REQUEST, filterModel.reqId, filterModel);
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.reqId >= 0) {

        // this.generaterPaySlip(output.reqId)
      }
    }).catch(error => {
      this.errMsgPop = 'Error Uploading Request...';
    });
  }

  // GET FORM16 REQUESTS
  view1: boolean = false;
  NewForm16Request(isedit: boolean, data: any, value: string) {
    this.view1 = false;
    this.isEdit = isedit;
    this.ClearData();
    this.createCaptchaForForm16();
    if (this.isEdit) {
    }
    if (value == 'View') {
      this.view1 = true
    }
    jQuery("#myModal1").modal('show');
  }

  // APPLY FOR FORM16 REQUESTS
  OnSaveForm16Request() {
    if (this.filterYear == null) {
      toastr.error("Please select Year !")
    }
    else if (this.captch_input != this.resultCode) {
      toastr.error("Invalid Captcha")
      this.captch_input = null;
      return;
    }
    else if (this.captch_input == null || this.captch_input == ''  || this.captch_input == undefined ) {
      toastr.error("Please enter Captcha")
      this.captch_input = null;
      return;
    }
    else {
      let filterModel = {} as ReachHRDetails;
      filterModel.reqBy = this.currentUser.employeeId;
      filterModel.reqType = 'Form16';
      filterModel.Month = '0';
      filterModel.Year = new Date(this.filterYear).getFullYear().toString();
      filterModel.status = 'Pending';
      let connection = this.httpService.LApost(APIURLS.BR_APPLY_PAYSLIP_REQUEST, filterModel);
      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200 || output.reqId >= 0) {

          swal({
            title: "Message",
            text: "Form16 Request No: " + output.reqId + " submitted !!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          jQuery("#myModal1").modal('hide');
          this.ClearData();
          this.generateForm16(output)
        }
      }).catch(error => {
        this.errMsgPop = 'Error Uploading Request...';
      });
    }
  }

  generateForm16(Id) {
    let requestList: any[] = [];
    let filterModel: any = {};
    filterModel.pernr = this.currentUser.employeeId;
    filterModel.werks = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
    filterModel.reqno = Id.reqId;
    let year = new Date(this.filterYear).getFullYear();
    // let month = this.filtermonth.length > 1 ? this.filtermonth : '0' + this.filtermonth
    // let day = new Date().getDay().toString();
    // day = day.length > 1 ? day : '0' + day;
    filterModel.pryear = year;
    requestList.push(filterModel);
    let connection = this.httpService.LApost(APIURLS.RFCBAPI_GET_FORM16_API, requestList);
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output.length > 0) {
        if (output[0].message.toLocaleLowerCase() != 'success') {
          swal({
            title: "Message",
            text: output[0].message,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          });
          Id.status = 'Mail Not Sent.';
          Id.sapMessage = output[0].message
          Id.sapStatus = 'Failed';
        }
        else {
          swal({
            title: "Message",
            text: "Payslip Request No: " + Id.reqId + " submitted and Payslip generated successfully..!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          Id.status = 'Mail Sent.';
          Id.sapMessage = output[0].message
          Id.sapStatus = 'Success';
        }
        this.UpdateForm16Request(Id);
        this.ClearData();
      }
    }).catch(error => {
      this.errMsgPop = 'Error generating Request...';
    });
  }

  UpdateForm16Request(data) {
    let filterModel = {} as ReachHRDetails;
    filterModel = Object.assign({}, data)
    filterModel.reqBy = data.reqBy;
    filterModel.reqType = data.reqType
    filterModel.Month = data.Month;
    filterModel.Year = data.Year;
    filterModel.status = data.status;
    filterModel.reqId = data.reqId
    filterModel.sapMessage = data.sapMessage;
    filterModel.sapStatus = data.sapStatus;
    let connection = this.httpService.LAput(APIURLS.BR_APPLY_PAYSLIP_REQUEST, filterModel.reqId, filterModel);
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.reqId >= 0) {

        // this.generaterPaySlip(output.reqId)
      }
    }).catch(error => {
      this.errMsgPop = 'Error Uploading Request...';
    });
  }


  getEmpDetails(empId) {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserGroupsList=[];
    this.httpService.LAgetByParam(APIURLS.BR_GET_EMP_DETAILS_API, empId).then((data: any) => {
      if (data.employeeId > 0) {
        // this.currentUser = data;
        // this.userIdRequest.requestDate=this.requestdate;
        this.userIdRequest.plant = this.locationId;
        this.userIdRequest.employeeId = data.employeeId;
        this.userIdRequest.firstName = data.firstName;
        this.userIdRequest.lastName = data.lastName;
        this.userIdRequest.fullName = data.fullName;
        this.userIdRequest.designation = data.designation;
        this.userIdRequest.department = data.department;
        this.userIdRequest.reportingManager = data.reportingManager;
        this.userIdRequest.joiningDate = data.joiningDate;
        this.userIdRequest.role = data.roleId;
        // this.userIdRequest.sid=this.selectedSoftwares[0].id;
      }
      else {
        // this.Error="Error";
        swal({
          title: "Message",
          text: "Entered employee code (" + empId + ") does not exist.Please check again or contact administator",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        })
      }
      // this.reInitDatatable();()
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.currentUser = {} as AuthData;
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

  // GET HR QUERY REQUESTS
  userIdRequest = {} as UserIdRequest;
  view2: boolean = false;
  NewHRQRequests(isedit: boolean, userIdRequest: UserIdRequest, value: string) {
    this.view2 = false;
    this.isEdit = isedit;
    this.getCatList();
    this.ClearData();
    if (this.isEdit) {
      // this.filterHR = userIdRequest.role,
      // this.filtercategory = userIdRequest.category;
      // this.filtersubject = userIdRequest.subject;
      // this.filterdescription = userIdRequest.description;
      // this.filtercomments = userIdRequest.comments;
    }
    else {
      let loc = this.locationList.find(x => x.id == this.currentUser.baselocation);
      this.userIdRequest.plant = loc.code + " - " + loc.name;
      this.userIdRequest.employeeId = this.currentUser.employeeId;
      this.userIdRequest.fullName = this.currentUser.fullName;
      this.userIdRequest.firstName = this.currentUser.firstName;
      this.userIdRequest.lastName = this.currentUser.lastName;
      this.userIdRequest.designation = this.currentUser.designation;
      this.userIdRequest.department = this.currentUser.department;
    }
    if (value == 'View') {
      this.view2 = true
    }
    jQuery("#myModal2").modal('show');
  }


  // APPLY HR QUERY REQUESTS
  OnSaveHRQRequest() {
    if (this.filterHR == null) {
      toastr.error("Please select HR !")
    }
    else if (this.filtercategory == null) {
      toastr.error("Please select Category !")
    }
    else {
      let filterModel = {} as ReachHRDetails;
      filterModel.reqBy = this.currentUser.employeeId;
      filterModel.status = 'Open'
      filterModel.subject = this.filtersubject;
      filterModel.description = this.filterdescription;
      filterModel.role = this.filterHR;
      filterModel.category = this.filtercategory;
      filterModel.pendingApprover = this.ApproversList[0].hrId;
      let connection = this.httpService.LApost(APIURLS.BR_APPLY_QUERY_REQUEST, filterModel);
      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200 || output.id >= 0) {

          swal({
            title: "Message",
            text: "Query Request No : " + output.id + " submitted !!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          jQuery("#myModal2").modal('hide');
          this.ClearData();
        }
      }).catch(error => {
        this.errMsgPop = 'Error Uploading Request...';
      });
    }
  }

  Monthlist: any[] = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'Decemeber' }
  ];

  HrList: any[] = [
    { id: 1, name: 'Corporate HR' },
    { id: 2, name: 'Site HR' },
    { id: 3, name: 'VP HR' },
    { id: 4, name: 'Field HR' }
  ];

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

  getApproverDetails() {
    let filterModel = {} as ReachHRDetails;
    filterModel.role = this.filterHR;
    filterModel.category = this.filtercategory;
    filterModel.location = this.currentUser.baselocation;
    let connection = this.httpService.LApost(APIURLS.BR_GET_HR_QUERY_APPROVER, filterModel);
    connection.then((data: any) => {
      if (data.length == 0) {
        swal({
          title: "Error",
          text: "Approvers Not Assigned",
          icon: "error",
          dangerMode: false,
          buttons: [false, true],
        });
        this.filterHR = '';
        this.filtercategory = '';
        this.ApproversList = [];
      }
      else {
        this.ApproversList = data;
      }

    }).catch(error => {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }


  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}
