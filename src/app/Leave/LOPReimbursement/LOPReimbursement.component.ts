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
import moment from 'moment'
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// import htmlToPdfmake from 'html-to-pdfmake';



@Component({
  selector: 'app-LOPReimbursement',
  templateUrl: './LOPReimbursement.component.html',
  styleUrls: ['./LOPReimbursement.component.css']
})

export class LOPReimbursementComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm!: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;

  public tableWidget: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  path!: string
  employeeId: any = null;
  year: any;

  CalenderYear: string = '';
  CalYear: any;
  StartDate: string = ' ';
  EndDate: string = ' ';
  DetailedReason: string = '';
  RequestList: any[] = [];
  ApplyFor: any = null;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private https: HttpClient, private route: ActivatedRoute) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
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

  locationAllList: any[] = [[]];
  getLocation(id:any) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  loccode: any = [];
  getLocationMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter((x:any)  => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
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
    //this.baseLocation = this.currentUser.baselocation;
    //this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getLocationMaster();
      this.getReimbursementData();
      //this.getApproversList(this.currentUser.employeeId);
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  ApplyPermission() {

    this.Lopdateslist = [];
    if(this.router.url == '/LOPReimbursementEss') {
      this.GetReimbursementList();
    }
    else {
    jQuery("#myModal").modal('show');
    }
  }

  ApproversList: any[] = [];
  getApproversList(id:any) {
    if (this.ApplyFor == 'Others') {
      this.GetReimbursementList();
    }
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_PERMISSION_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          swal({
            title: "Message",
            text: "Approvers Not Assigned",
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
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
  lastReportingkeydown = 0;

  lastReportingkeydown1 = 0;
  getEmployee($event) {
    let text = $('#userId').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#userId').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#userId").val(ui.item.value);
                  $("#userId").val(ui.item.value);
                }
                else {
                  $("#userId").val('');
                  $("#userId").val('');
                }
              },
              select: function (event:any, ui:any) {
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

  getReimbursementData() {
    this.isLoading = true;
    let srcstr = this.CalYear + "," + this.currentUser.employeeId;
    this.httpService.LAgetByParam(APIURLS.GET_REIMBURSEMENT_REQUESTS, srcstr).then((data:any) => {
      if (data) {
        this.RequestList = data;
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch((error) => {
      this.isLoading = false;
      this.RequestList = [];
    })
  }

  Lopdateslist: any[] = [];
  InsertLOPReimbursement() {
    this.isLoading = true;
    let filterModel: any = {};
    let connection: any;
    if (this.ApplyFor == 'Others') {
      filterModel.employeeId = this.employeeId;
    }
    else {
      filterModel.employeeId = this.currentUser.employeeId;
    }
    this.checkedRequestList.forEach((element:any)=> {

      filterModel.fromDate = this.setFormatedDateTime(element.fromDate);
      // filterModel.toDate = this.setFormatedDateTime(this.EndDate);
      filterModel.reason = element.remarks;
      filterModel.pendingApprover = this.ApproversList[0].employeeId;
      filterModel.submittedBy = this.currentUser.employeeId;
      connection = this.httpService.LApost(APIURLS.INSERT_LOP_REIMBURSEMENT_REQUEST, filterModel);
    });

    connection.then((data:any) => {
      if (data) {
        swal({
          title: "Message",
          text: data.message,
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.ClearData();
        if (data.type == 'S') {
          jQuery("#myModal").modal('hide');
          this.ClearData();
        }
      }
      this.isLoading = false;
      this.getReimbursementData();
    }).catch((error) => {
      this.isLoading = false;
      this.errMsgPop = "Error Submitting Request."
    });

  }

  ClearData() {
    this.ApplyFor = null;
    this.employeeId = null;
    this.Lopdateslist = [];
    this.ApproversList = [];
    this.ApproversList = null;
  }

  GetReimbursementList() {
    this.isLoading = true;
    let filterModel: any = {};
    if (this.router.url != '/LOPReimbursementEss') {
      if (this.ApplyFor == "Others") {
        if (this.employeeId == null || this.employeeId == '') {
          toastr.error("Please Enter Employee Number..!");
          return;
        }
        filterModel.applyFor = 'Others';
        filterModel.EmployeeId = this.employeeId;
      }
      else {
        filterModel.applyFor = 'Self';
        filterModel.EmployeeId = this.currentUser.employeeId;
        this.getApproversList(filterModel.EmployeeId);
      }
    }
    else {
      filterModel.applyFor = 'Self';
      filterModel.EmployeeId = this.currentUser.employeeId;
      this.getApproversList(filterModel.EmployeeId);
    }

    let connection = this.httpService.LApost(APIURLS.GET_REIMBURSEMENT_LIST, filterModel);
    connection.then((data:any) => {
      if (data[0].type == 'S') {
        this.Lopdateslist = data;
        jQuery("#myModal").modal('show');
      }
      else if (data[0].type == 'E') {
        swal({
          title: "Message",
          text: data[0].message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.ClearData();
        jQuery("#myModal").modal('hide');
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
      this.Lopdateslist = [];
    })
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

  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2) + ' ' +
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

  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.Lopdateslist.length; i++) {
      this.Lopdateslist[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.Lopdateslist.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.Lopdateslist.length; i++) {
      if (this.Lopdateslist[i].isSelected)
        this.checkedlist.push(this.Lopdateslist[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

}