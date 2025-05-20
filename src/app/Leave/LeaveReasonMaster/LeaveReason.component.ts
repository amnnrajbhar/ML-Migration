import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { LeaveReason } from './LeaveReason.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from "lodash";
//import { C } from '@angular/core/src/render3';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import { ExcelService } from '../../shared/excel-service';
import * as fs from 'file-saver';

declare var jQuery: any;
export class actionItemModel {
  description: string;
  id: number;
  uname: string;
}
@Component({
  selector: 'app-LeaveReason',
  templateUrl: './LeaveReason.component.html',
  styleUrls: ['./LeaveReason.component.css']
})
export class LeaveReasoncomponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) leaveForm: NgForm;
  public filteredItems = [];

  public tableWidget: any;
  leavereasonItem: LeaveReason = new LeaveReason();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  notFirst = true;
  currentUser = {} as AuthData;
  oldleavereasonItem: LeaveReason = new LeaveReason();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  plantList: any[] = [[]];
  id: any;
  locationAllList: any;
  locationList: any;
  leaveList: any;
  checkdup: any[] = [];

  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent,
    private http: Http, private excelService: ExcelService) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#LeaveReasonTable');
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


  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getLeaveReasonList();
      this.getLeaveTypeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  leaveReasonList: any[] = [];
  getLeaveReasonList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.BR_LEAVEREASON_GETALL).then((data: any) => {
      if (data.length > 0) {
        if (data.leavType == 7) {
          this.leavereasonItem.leavType = 'On Duty'
        }
        this.leaveReasonList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.leaveReasonList = [];
    });
  }

  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  onAddLeave(isEdit: boolean, data: LeaveReason) {
    this.leaveForm.form.markAsPristine();
    this.leaveForm.form.markAsUntouched();
    this.leaveForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.leavereasonItem = new LeaveReason();
    this.aduitpurpose = '';
    this.oldleavereasonItem = new LeaveReason();
    if (this.isEdit) {
      this.leavereasonItem = Object.assign({}, data);
    }
    else {
      this.leavereasonItem = new LeaveReason();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  Edit(data: any) {
    this.leavereasonItem = Object.assign({}, data)

  }

  leaveTypeList: any[] = [];
  getLeaveTypeList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.GET_LEAVE_TYPES_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.leaveTypeList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.leaveTypeList = [];
    });
  }

  onDutyList: any[] = [
    { lvTypeid: 100, lvType: 'ON DUTY' }
  ]

  getTypeslist(id) {
    if (id == 100) {
      let temp = this.onDutyList.find(x => x.lvTypeid == id);
      return temp ? temp.lvType : '';
    }
    else {
      let temp = this.leaveTypeList.find(x => x.lvTypeid == id);
      return temp ? temp.lvType : '';
    }
  }

  CheckSpecialCharactersInFileName(string): boolean {
    let pattern = new RegExp("[@!#\$%\^*+=\{\}\?\|1234567890]");
    if (pattern.test(string)) {
      return false;
    }
    return true;
  }

  onSaveLeave() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.CheckSpecialCharactersInFileName(this.leavereasonItem.reason);
    if (!this.CheckSpecialCharactersInFileName(this.leavereasonItem.reason)) {
      swal({
        title: "Message",
        text: "Leave Reason cannot have the following special characters:" +
          "@, !, #, \$, %, \^, *, +, =, \{, \}, \?, \|,1,2,3,4,5,6,7,8,9,0. Please remove them..",
        icon: "error",
        dangerMode: false,
        buttons: [false, true]
      });
      jQuery("#myModal").modal('hide');
      return;
    }
    let connection: any;
    if (!this.isEdit) {
      this.auditType = "Create";
      this.checkdup = this.leaveReasonList.find(x => x.leavType == this.leavereasonItem.leavType && x.reason == this.leavereasonItem.reason
        && x.isActive == true)
      if (this.checkdup != null) {
        this.isLoadingPop = false;
        swal({
          title: "Entered Leave Reason already exists..!",
          icon: "warning",
          dangerMode: true
        });
        return;
      }
      this.leavereasonItem.isActive = true;
      this.leavereasonItem.createdBy = this.currentUser.employeeId;
      // this.leavereasonItem.modifiedOn = new Date().toLocaleDateString();
      connection = this.httpService.LApost(APIURLS.BR_LEAVEREASON_INSERT_API, this.leavereasonItem);
    }
    else {
      this.auditType = "Update";
      this.leavereasonItem.isActive = this.leavereasonItem.isActive;
      this.leavereasonItem.modifiedBy = this.currentUser.employeeId;
      connection = this.httpService.LAput(APIURLS.BR_LEAVEREASON_INSERT_API, this.leavereasonItem.id, this.leavereasonItem);
    }
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.length == null) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = ' Leave Reason data saved successfully!';
        jQuery("#saveModal").modal('show');
        let Id = !this.isEdit ? data.id : this.leavereasonItem.id;
        this.getLeaveReasonList();
      }
      else
        this.errMsgPop = data;

    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Leave Reason data..';
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

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

  exportLeaveReaosn() {
    const title = 'Leave Reason Masters';
    const header = ["SNo", "Type", "Reason", "Detailed Reason", "Active", "Created By", "Created Date"]
    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.leaveReasonList.forEach(item => {
      index = index + 1;
      ts = {};
      ts.slno = index;
      ts.leavType = this.getTypeslist(item.leavType);
      ts.reason = item.reason;
      ts.detailedReason = item.detailedReason;
      if (item.isActive == true) {
        ts.isActive = "YES";
      }
      else {
        ts.isActive = "NO";
      }
      if (item.createdBy == null) {
        ts.createdBy = '130299';
      }
      else {
        ts.createdBy = +item.createdBy;
      }
      if (item.createdOn == null) {
        ts.createdOn = '';
      }
      else {
        ts.createdOn = this.setFormatedDate(item.createdOn);
      }
      exportList.push(ts);
    });
    var OrganisationName = "MICRO LABS LIMITED";
    const data = exportList;
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Leave Reason Masters');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:G1');
    worksheet.mergeCells('A2:G2');
    //Add Header Row
    let headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    for (let x1 of data) {
      let x2 = Object.keys(x1);
      let temp = []
      for (let y of x2) {
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet.addRow([]);
    worksheet.addRow([]);
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'LeaveReason_Master.xlsx');
    });
  }

}
