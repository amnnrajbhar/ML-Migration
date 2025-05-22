import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { EmpShiftMaster } from './EmpShiftMaster.model';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { DatePipe } from '@angular/common';
declare var jQuery: any;
declare var $: any;
import * as moment from 'moment';
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from '../../masters/auditlog.model';
//import { L } from '@angular/core/src/render3';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import { ExcelService } from '../../shared/excel-service';
import * as fs from 'file-saver';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

export class actionItemModel {
  shiftCode: string;
  shiftName: string;
  nightShift: boolean;
  shiftStartTime: string;
  firstHalfEndTime: string;
  shStartTime: string;
  shiftEndTime: string;
  punchStartTime: string;
  punchEndTime: string;
  comeLate: string;
  goEarly: string;
  shiftGraceTime: string;
}
@Component({
  selector: 'app-EmpShiftMaster',
  templateUrl: './EmpShiftMaster.component.html',
  styleUrls: ['./EmpShiftMaster.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class EmpShiftMasterComponent implements OnInit {
  public tableWidget: any;
  @ViewChild(NgForm  , { static: false }) EmpShiftMasterForm: NgForm;
  EmpShiftMasterList: any[] = [[]];
  EmpShiftMasterItem: EmpShiftMaster = new EmpShiftMaster();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  currentUser: AuthData;
  oldEmpShiftMasterItem: EmpShiftMaster = new EmpShiftMaster();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private datePipe: DatePipe, private excelService: ExcelService) { }


  clearForm() {
    this.EmpShiftMasterForm.resetForm();
    this.getEmpShiftMasterList();
  }

  private initDatatable(): void {
    let exampleId: any = jQuery('#location');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
    $('#location').on('click', '.toggleTest', function () {
      console.log('click');
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }


  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getEmpShiftMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  binddatetime(time) {
    let today = new Date();
    let times = time.split(':');
    // datetime.setHours(parseInt(times[0]));
    // datetime.setMinutes(parseInt(times[1]));
    // datetime.setSeconds(parseInt(times[2]));
    let dateTime = new Date(today.getFullYear(), today.getMonth(), today.getDay(), times[0], times[1], times[2], 0);
    return dateTime;
  }

  onAddEmpShiftMaster(isEdit: boolean, data: EmpShiftMaster) {
    // this.clearForm();
    this.EmpShiftMasterForm.form.markAsPristine();
    this.EmpShiftMasterForm.form.markAsUntouched();
    this.EmpShiftMasterForm.form.updateValueAndValidity();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.aduitpurpose = '';
    this.oldEmpShiftMasterItem = new EmpShiftMaster();
    this.isLoadingPop = true;
    if (this.isEdit) {
      Object.assign(this.oldEmpShiftMasterItem, data);
      Object.assign(this.EmpShiftMasterItem, data);
      this.EmpShiftMasterItem.comeLate = this.EmpShiftMasterItem.comeLate ? this.EmpShiftMasterItem.comeLate : null;
      this.EmpShiftMasterItem.firstHalfEndTime = this.EmpShiftMasterItem.firstHalfEndTime ? this.EmpShiftMasterItem.firstHalfEndTime : null;
      this.EmpShiftMasterItem.goEarly = this.EmpShiftMasterItem.goEarly ? this.EmpShiftMasterItem.goEarly : null;
      this.EmpShiftMasterItem.punchEndTime = this.EmpShiftMasterItem.punchEndTime ? this.EmpShiftMasterItem.punchEndTime : null;
      this.EmpShiftMasterItem.punchStartTime = this.EmpShiftMasterItem.punchStartTime ? this.EmpShiftMasterItem.punchStartTime : null;
      //this.EmpShiftMasterItem.punchValidTill = this.EmpShiftMasterItem.punchValidTill ? this.EmpShiftMasterItem.punchValidTill : null;
      this.EmpShiftMasterItem.shStartTime = this.EmpShiftMasterItem.shStartTime ? this.EmpShiftMasterItem.shStartTime : null;
      this.EmpShiftMasterItem.shiftEndTime = this.EmpShiftMasterItem.shiftEndTime ? this.EmpShiftMasterItem.shiftEndTime : null;
      this.EmpShiftMasterItem.shiftStartTime = this.EmpShiftMasterItem.shiftStartTime ? this.EmpShiftMasterItem.shiftStartTime : null;
      //this.EmpShiftMasterItem.shiftGraceTime = this.EmpShiftMasterItem.shiftGraceTime ? this.EmpShiftMasterItem.shiftGraceTime : null;

    }
    else {
      this.EmpShiftMasterItem = new EmpShiftMaster();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  deleteShift(data: EmpShiftMaster) {
    Object.assign(this.oldEmpShiftMasterItem, data);
    Object.assign(this.EmpShiftMasterItem, data);
    jQuery("#deleteModal").modal('show');
  }

  getEmpShiftMasterList() {
    this.isLoading = true;
    this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
      if (data.length > 0) {
        this.EmpShiftMasterList = data.filter(x => x.isActive == 1).sort((a, b) => {
          if (a.shiftCode > b.shiftCode) return 1;
          if (a.shiftCode < b.shiftCode) return -1;
          return 0;
        });
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(() => {
      this.isLoading = false;
      this.EmpShiftMasterList = [];
    });
  }

  transform(value: any, args?: any): any {
    return moment(value, 'HH:mm').format("HH:mm A");
  }

  validatedForm: boolean = true;


  closeSaveModal() {
    this.getEmpShiftMasterList();
    jQuery("#saveModal").modal('hide');
  }

  onSaveEmpShiftMaster() {
    this.errMsg = '';
    this.errMsgPop = '';
    this.isLoadingPop = true;
    let connection: any;

    if (!this.isEdit) {
      this.auditType = "Create";
      this.validatedForm = true;
      let validName = this.EmpShiftMasterList.some(s => s.shiftName == this.EmpShiftMasterItem.shiftName && s.isActive == true);
      if (validName == true) {
        this.isLoadingPop = false;
        this.validatedForm = false;
        //this.errMsgPop = 'Shift Name already exists...';
        swal({
          title: "Message",
          text: "SHIFT NAME ALREADY EXISTS...!",
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.getEmpShiftMasterList();
      }

      this.EmpShiftMasterItem.comeLate = this.getFormattedTime(this.EmpShiftMasterItem.comeLate);
      this.EmpShiftMasterItem.firstHalfEndTime = this.getFormattedTime(this.EmpShiftMasterItem.firstHalfEndTime);
      this.EmpShiftMasterItem.goEarly = this.getFormattedTime(this.EmpShiftMasterItem.goEarly);
      this.EmpShiftMasterItem.punchEndTime = this.getFormattedTime(this.EmpShiftMasterItem.punchEndTime);
      this.EmpShiftMasterItem.punchStartTime = this.getFormattedTime(this.EmpShiftMasterItem.punchStartTime);
      //this.EmpShiftMasterItem.punchValidTill = this.getFormattedTime(this.EmpShiftMasterItem.punchValidTill);
      this.EmpShiftMasterItem.shStartTime = this.getFormattedTime(this.EmpShiftMasterItem.shStartTime);
      this.EmpShiftMasterItem.shiftEndTime = this.getFormattedTime(this.EmpShiftMasterItem.shiftEndTime);
      this.EmpShiftMasterItem.shiftStartTime = this.getFormattedTime(this.EmpShiftMasterItem.shiftStartTime);
      //this.EmpShiftMasterItem.shiftGraceTime = this.getFormattedTime(this.EmpShiftMasterItem.shiftGraceTime);
      this.EmpShiftMasterItem.isActive = true;
      this.EmpShiftMasterItem.ruleCode = this.EmpShiftMasterItem.shiftCode;
      this.EmpShiftMasterItem.createdBy = this.currentUser.employeeId;
      connection = this.httpService.LApost(APIURLS.BR_SHIFT_INSERT_UPDATE, this.EmpShiftMasterItem);
    }
    else {
      this.auditType = "Update";
      this.EmpShiftMasterItem.comeLate = this.getFormattedTime(this.EmpShiftMasterItem.comeLate);
      this.EmpShiftMasterItem.firstHalfEndTime = this.getFormattedTime(this.EmpShiftMasterItem.firstHalfEndTime);
      this.EmpShiftMasterItem.goEarly = this.getFormattedTime(this.EmpShiftMasterItem.goEarly);
      this.EmpShiftMasterItem.punchEndTime = this.getFormattedTime(this.EmpShiftMasterItem.punchEndTime);
      this.EmpShiftMasterItem.punchStartTime = this.getFormattedTime(this.EmpShiftMasterItem.punchStartTime);
      //this.EmpShiftMasterItem.punchValidTill = this.getFormattedTime(this.EmpShiftMasterItem.punchValidTill);
      this.EmpShiftMasterItem.shStartTime = this.getFormattedTime(this.EmpShiftMasterItem.shStartTime);
      this.EmpShiftMasterItem.shiftEndTime = this.getFormattedTime(this.EmpShiftMasterItem.shiftEndTime);
      this.EmpShiftMasterItem.shiftStartTime = this.getFormattedTime(this.EmpShiftMasterItem.shiftStartTime);
      //this.EmpShiftMasterItem.shiftGraceTime = this.getFormattedTime(this.EmpShiftMasterItem.shiftGraceTime);
      this.EmpShiftMasterItem.modifiedBy = this.currentUser.employeeId;
      this.EmpShiftMasterItem.ruleCode = this.EmpShiftMasterItem.shiftCode;
      connection = this.httpService.LAput(APIURLS.BR_SHIFT_INSERT_UPDATE, this.EmpShiftMasterItem.id, this.EmpShiftMasterItem);
    }
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery('#myModal').modal('hide');
        swal({
          title: "Message",
          text: "Shift Data saved successfully...!!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        let Id = !this.isEdit ? data.id : this.EmpShiftMasterItem.id;
        this.getEmpShiftMasterList();
        this.insertAuditLog(this.EmpShiftMasterItem, this.oldEmpShiftMasterItem, Id);
      }
      if (data.type == 'E') {
        swal({
          title: "Message",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
      }
    }).catch(() => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Shift..';
    });
  }

  CheckShiftAlloted(shiftCode) {
    let filterModel: any = {};
    filterModel.shiftCode = shiftCode;
    filterModel.plant = this.currentUser.baselocation;
    let connection = this.httpService.LApost(APIURLS.BR_CHECK_SHIFT_ALLOTTED, filterModel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data[0].type == 'E') {
        swal({
          title: "Error",
          text: data[0].message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        })
        jQuery("#deleteModal").modal('hide');
      }
    }).catch(() => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error deleting Shift..';
    });
  }

  deleteEmpShiftMaster(shiftCode): void {
    this.CheckShiftAlloted(shiftCode);
    this.aduitpurpose = '';
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        // Object.assign(this.EmpShiftMasterItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.EmpShiftMasterItem.isActive = false;
        this.EmpShiftMasterItem.deletedBy = this.currentUser.employeeId;
        //this.EmpShiftMasterItem.deletedOn = new Date().toLocaleString();
        connection = this.httpService.LAput(APIURLS.BR_SHIFT_INSERT_UPDATE, this.EmpShiftMasterItem.id, this.EmpShiftMasterItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = 'Deleted successfully..!';
            swal({
              title: "Message",
              text: this.errMsgPop1,
              dangerMode: true,
              icon: "success",
              buttons:[false,true],
            });
            jQuery("#deleteModal").modal('hide');
            this.getEmpShiftMasterList();
            this.insertAuditLog(this.EmpShiftMasterItem, this.oldEmpShiftMasterItem, this.EmpShiftMasterItem.id);
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Location..';
        });
      }
    });
  }


  getFormattedTime(date: any) {
    let today = new Date();
    let dtStartTime = new Date(today.getFullYear(), today.getMonth(), today.getDay(), date.split(":")[0], date.split(":")[1], 0);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
  }


  //AuditLogging
  masterName: string = 'Shift Master'; // Change MasterName
  insertAuditLog(oldObj: EmpShiftMaster, newObj: EmpShiftMaster, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.shiftCode = oldObj.shiftCode;
    oldObject.shiftName = oldObj.shiftName;
    oldObject.nightShift = oldObj.nightShift;
    oldObject.shiftCode = oldObj.shiftCode;
    oldObject.shiftName = oldObj.shiftName;
    oldObject.nightShift = oldObj.nightShift;
    oldObject.punchEndTime = oldObj.punchEndTime;
    oldObject.punchStartTime = oldObj.punchStartTime;
    oldObject.shiftStartTime = oldObj.shiftStartTime;
    oldObject.punchEndTime = oldObj.punchEndTime;
    oldObject.firstHalfEndTime = oldObj.firstHalfEndTime;
    oldObject.shStartTime = oldObj.shStartTime;
    //oldObject.shiftGraceTime = oldObj.shiftGraceTime;

    newObject.shiftCode = newObj.shiftCode;
    newObject.shiftName = newObj.shiftName;
    newObject.nightShift = newObj.nightShift;
    newObject.shiftCode = newObj.shiftCode;
    newObject.shiftName = newObj.shiftName;
    newObject.nightShift = newObj.nightShift;
    newObject.punchEndTime = newObj.punchEndTime;
    newObject.punchStartTime = newObj.punchStartTime;
    newObject.shiftStartTime = newObj.shiftStartTime;
    newObject.punchEndTime = newObj.punchEndTime;
    newObject.firstHalfEndTime = newObj.firstHalfEndTime;
    newObject.shStartTime = newObj.shStartTime;
    //newObject.shiftGraceTime = newObj.shiftGraceTime;

    let beforekey = Object.keys(oldObject);
    let aftrekey = Object.keys(newObject);
    var biggestKey = 0;
    if (beforekey.length > 0)
      var biggestKey = beforekey.length;
    else
      var biggestKey = aftrekey.length;
    let auditlogchangeList: AuditLogChange[] = [];
    for (var i = 0; i < biggestKey; i++) {
      if (this.auditType == "Update") {
        if (_.isEqual(beforekey[i], aftrekey[i]) && !_.isEqual(oldObject[beforekey[i]], newObject[aftrekey[i]])) {
          let auditlog: AuditLogChange = new AuditLogChange();
          auditlog.fieldname = beforekey[i];
          auditlog.oldvalue = oldObject[beforekey[i]];
          auditlog.newvalue = newObject[aftrekey[i]];
          auditlogchangeList.push(auditlog);
        }
      }
      else if (this.auditType == "Create") {
        let auditlog: AuditLogChange = new AuditLogChange();
        auditlog.fieldname = aftrekey[i];
        auditlog.oldvalue = oldObject[beforekey[i]];
        auditlog.newvalue = newObject[aftrekey[i]];
        auditlogchangeList.push(auditlog);
      }
      else if (this.auditType == "Delete") {
        let auditlog: AuditLogChange = new AuditLogChange();
        auditlog.fieldname = beforekey[i];
        auditlog.oldvalue = oldObject[beforekey[i]];
        auditlog.newvalue = newObject[aftrekey[i]];
        auditlogchangeList.push(auditlog);
      }
    }
    let connection: any;
    let auditlog: AuditLog = new AuditLog();
    auditlog.auditDateTime = new Date().toLocaleString();
    auditlog.aduitUser = this.currentUser.fullName;
    auditlog.auditType = this.auditType;
    auditlog.masterName = this.masterName;
    auditlog.tableId = id;
    auditlog.keyValue = newObj.shiftName ? newObj.shiftCode + '-' + newObj.shiftName : oldObj.shiftCode + '-' + oldObj.shiftName;
    auditlog.changes = JSON.stringify(auditlogchangeList);
    auditlog.oldValues = JSON.stringify(oldObj);
    auditlog.newValues = JSON.stringify(newObj);
    auditlog.purpose = this.aduitpurpose;
    connection = this.httpService.LApost(APIURLS.BR_AUDITLOG_API, auditlog);
    connection.then((data: any) => {
      this.isLoadingPop = false;
    }).catch(() => {
      this.isLoadingPop = false;
    });
  }
  auditLogList: AuditLog[] = [];
  openAuditLogs(id) {
    jQuery("#auditModal").modal('show');
    let stringparms = this.masterName + ',' + id;
    this.httpService.LAgetByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
      if (data) {
        this.auditLogList = data;
        this.auditLogList.reverse();
      }
      this.reinitPOUPDatatable();
    }).catch(() => {
    });

  }
  objParser(val) {
    return JSON.parse(val);
  }
  public audittableWidget: any;
  private initPOUPDatatable(): void {
    let exampleId: any = jQuery('#auditTable');
    this.audittableWidget = exampleId.DataTable({
      "order": [[0, "desc"]],
      "lengthChange": false,
      "pageLength": 5,
      "searching": false,
      "columnDefs": [
        {
          render: function (data, type, full, meta) {
            return "<div style='word-break: break-all;height:7em;overflow-x:hidden;'>" + data + "</div>";
          },
          targets: 5
        }
      ]
    });
    this.isLoading = false;

  }
  private reinitPOUPDatatable(): void {
    if (this.audittableWidget) {
      this.audittableWidget.destroy();
      this.audittableWidget = null;
    }
    setTimeout(() => this.initPOUPDatatable(), 0);
  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

  exportExcelShifts() {
    const title = 'Shift Masters';
    const header = ["SNo", "Shift Code", "Shift Name", "Night Shift", "Shift Start Time", "First Half End Time", "Second Half Start Time", "Shift End Time",
      "Come Late By", "Go Early By", "Punch Start Time", "Punch End Time", "Created By", "Created Date/Time", "Active"]
    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.EmpShiftMasterList.forEach(item => {
      index = index + 1;
      ts = {};
      ts.slno = index;
      ts.shiftCode = item.shiftCode;
      ts.shiftName = item.shiftName;
      if (item.nightShift == true) {
        ts.nightShift = "Yes";
      }
      else {
        ts.nightShift = "No";
      }
      ts.shiftStartTime = item.shiftStartTime;
      ts.firstHalfEndTime = item.firstHalfEndTime;
      ts.shStartTime = item.shStartTime;
      ts.shiftEndTime = item.shiftEndTime;
      ts.comeLate = item.comeLate;
      ts.goEarly = item.goEarly;
      ts.punchStartTime = item.punchStartTime;
      ts.punchEndTime = item.punchEndTime;
      ts.createdBy = +item.createdBy;
      ts.createdOn = this.setFormatedDate(item.createdOn);
      if (item.isActive == true) {
        ts.isActive = "YES";
      }
      else {
        ts.isActive = "NO";
      }
      exportList.push(ts);
    });
    var OrganisationName = "MICRO LABS LIMITED";
    const data = exportList;
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Shift Masters');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:O1');
    worksheet.mergeCells('A2:O2');
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
      fs.saveAs(blob, 'Shift_Master.xlsx');
    });
  }
}
