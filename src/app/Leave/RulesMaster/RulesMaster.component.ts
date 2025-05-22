import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { RulesMaster } from './RulesMaster.model';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { DatePipe } from '@angular/common';
declare var jQuery: any;
declare var $: any;
import * as moment from 'moment';
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from '../../masters/auditlog.model';
import { EmpShiftMaster } from '../EmpShiftMaster/EmpShiftMaster.model';
import { element, text } from '@angular/core/src/render3/instructions';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import { ExcelService } from '../../shared/excel-service';
import * as fs from 'file-saver';


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
}
@Component({
  selector: 'app-RulesMaster',
  templateUrl: './RulesMaster.component.html',
  styleUrls: ['./RulesMaster.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class RulesMasterComponent implements OnInit {
  public tableWidget: any;
  @ViewChild(NgForm) RulesMasterForm: NgForm;
  RulesMasterList: any[] = [];
  RulesMasterItem: RulesMaster = new RulesMaster();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  currentUser: AuthData;
  oldRulesMasterItem: RulesMaster = new RulesMaster();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  filterPlant: any = null;
  filterPayGroup: any = null;
  filterCategory: any = null;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private datePipe: DatePipe, private http: Http, private excelService: ExcelService) { }


  clearForm() {
    this.AllShiftList = [];
    this.count = 0;
    this.RulesMasterForm.resetForm();
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
      this.getRulesMasterList();
      this.getLocationMaster();
      this.getPlantsassigned(this.currentUser.fkEmpId)
      this.getempCatList();
      this.getShiftMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }
  locationList: any[] = [];
  locListCon: any[] = [];
  getLocationMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
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

  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.plantList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.getpayGroupList();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }

  payGroupList1: any[] = [];
  getPaygroupsBasedOnPlant() {
    this.filterPayGroup = null;
    let temp = this.plantList.find(x => x.fkPlantId == this.RulesMasterItem.plant);
    this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
  }

  empCatList: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.empCatList = [];
    });
  }

  ShiftList: EmpShiftMaster[] = [];
  loccode: string;

  getShiftMasterList() {
    this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
      if (data.length > 0) {
        this.ShiftList = data.filter(x => x.isActive == true);
      }
    }).catch(error => {
      this.isLoading = false;
      this.ShiftList = [];
    });
  }

  newDynamic: {};
  AllShiftList: any[] = [];
  count: number = 0;
  onAddLineClick() {
    if (this.count > 0) {
      toastr.error("No more Shifts can be added...!");
      return;
    }
    this.count = this.count + 1;
    this.newDynamic = { id: this.count, shiftCode: null, flexi: false, flexiStartTime: null, workHours: null, shiftAllowance: false, allowanceAmount: null };
    this.AllShiftList.push(this.newDynamic);

  }

  RemoveLine(no) {
    if (this.AllShiftList.length > 1) {
      const index = this.AllShiftList.indexOf(no);
      this.AllShiftList.splice(no, 1);
    }
  }

  binddatetime(time) {
    let datetime = new Date();
    let times = time.split(':');
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1]));
    datetime.setSeconds(parseInt(times[2]));
    return datetime;
  }

  onAddRulesMaster(isEdit: boolean, data: RulesMaster) {
    this.RulesMasterForm.form.markAsPristine();
    this.RulesMasterForm.form.markAsUntouched();
    this.RulesMasterForm.form.updateValueAndValidity();
    this.count = 0;
    this.AllShiftList = [];
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.aduitpurpose = '';
    this.oldRulesMasterItem = new RulesMaster();
    this.isLoadingPop = true;
    if (this.isEdit) {
      Object.assign(this.oldRulesMasterItem, data);
      Object.assign(this.RulesMasterItem, data);
      this.RulesMasterItem.permissionCount = data.permissionCount;
      this.getPaygroupsBasedOnPlant();

      let newEntry = {
        shiftCode: data.shiftCode,
        availFlexiHours: data.availFlexiHours,
        flexiStartTime: data.flexiStartTime,
        workHours: data.workHours,
        shiftAllowance: data.shiftAllowance,
        allowanceAmount: data.allowanceAmount
      };

      this.AllShiftList.push(newEntry);
    }
    else {
      this.RulesMasterItem = new RulesMaster();

      let newEntry: any = {
        shiftCode: null
      };

      this.AllShiftList.push(newEntry);
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  deleteShift(data: RulesMaster) {
    Object.assign(this.oldRulesMasterItem, data);
    Object.assign(this.RulesMasterItem, data);
    jQuery("#deleteModal").modal('show');
  }

  getRulesMasterList() {
    this.isLoading = true;
    this.httpService.LAget(APIURLS.BR_GET_ALL_RULES).then((data: any) => {
      if (data.length > 0) {
        this.RulesMasterList = data.filter(x => x.isActive == 1);
        this.RulesMasterList = this.RulesMasterList.sort((a, b) => {
          if (a.plantName > b.plantName) return 1;
          if (a.plantName < b.plantName) return -1;

          if(a.payGroupName > b.payGroupName) return 1;
          if(a.payGroupName < b.payGroupName) return -1;

          if(a.catName > b.catName) return 1;
          if(a.catName < b.catName) return -1;
          return 0;
        });
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(() => {
      this.isLoading = false;
      this.RulesMasterList = [];
    });
  }

  transform(value: any, args?: any): any {
    return moment(value, 'HH:mm').format("HH:mm A");
  }

  validatedForm: boolean = true;


  closeSaveModal() {
    this.getRulesMasterList();
    jQuery("#saveModal").modal('hide');
  }

  onSaveRulesMaster() {
    if(this.AllShiftList[0].flexiStartTime != null && this.AllShiftList[0].availFlexiHours == undefined) {
      toastr.error("Please mark Avail Flexi Hours..!");
      return;
    }
    this.errMsg = '';
    this.errMsgPop = '';
    this.isLoadingPop = true;
    let connection: any;
    this.validatedForm = true;
    if (!this.isEdit) {
      this.RulesMasterItem.auditType = "Create";

      this.RulesMasterItem.isActive = true;
      this.RulesMasterItem.createdBy = this.currentUser.employeeId;

      this.AllShiftList.forEach(element => {
        this.RulesMasterItem.shiftCode = element.shiftCode;
        this.RulesMasterItem.availFlexiHours = element.availFlexiHours;
        this.RulesMasterItem.flexiStartTime = this.getFormattedTime(element.flexiStartTime);
        this.RulesMasterItem.workHours = element.workHours;
        this.RulesMasterItem.shiftAllowance = element.shiftAllowance;
        this.RulesMasterItem.allowanceAmount = element.allowanceAmount;
      });
      connection = this.httpService.LApost(APIURLS.BR_RULES_INSERT_UPDATE, this.RulesMasterItem);
    }
    else {
      this.RulesMasterItem.auditType = "Update";
      this.RulesMasterItem.modifiedBy = this.currentUser.employeeId;
      this.AllShiftList.forEach(element => {
        this.RulesMasterItem.shiftCode = element.shiftCode;
        this.RulesMasterItem.availFlexiHours = element.availFlexiHours;
        this.RulesMasterItem.flexiStartTime = this.getFormattedTime(element.flexiStartTime);
        this.RulesMasterItem.workHours = element.workHours;
        this.RulesMasterItem.shiftAllowance = element.shiftAllowance;
        this.RulesMasterItem.allowanceAmount = element.allowanceAmount;
      });
      // this.RulesMasterItem.modifiedDate = new Date().toLocaleString();
      connection = this.httpService.LApost(APIURLS.BR_RULES_INSERT_UPDATE, this.RulesMasterItem);
    }
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.typ == 'S') {
        swal({
          title: "Message",
          text: "New Rule created successfully..!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearForm();
        jQuery('#myModal').modal('hide');
        this.getRulesMasterList();
      }
      if (data.typ == 'E') {
        swal({
          title: "Message",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true],
        });
        jQuery('#myModal').modal('hide');
        this.getRulesMasterList();
      }
      else if (data.typ == 'SE') {
        swal({
          title: "Message",
          text: "Rule updated successfully..!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        jQuery('#myModal').modal('hide');
        this.getRulesMasterList();
      }
    }).catch(() => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Rules..';
    });
  }

  deleteRulesMaster(): void {
    this.aduitpurpose = '';

    jQuery("#deleteModal").modal('hide');
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        // Object.assign(this.RulesMasterItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.RulesMasterItem.isActive = false;
        this.RulesMasterItem.modifiedBy = this.currentUser.employeeId;
        //this.RulesMasterItem.deletedOn = new Date().toLocaleString();
        connection = this.httpService.LAput(APIURLS.BR_RULES_UPDATE, this.RulesMasterItem.id, this.RulesMasterItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = 'Deleted successfully!';
            swal({
              title: "Message",
              text: this.errMsgPop1,
              dangerMode: true,
              icon: "success",
              buttons:[false,true],
            });
            this.getRulesMasterList();
            //this.insertAuditLog(this.RulesMasterItem,this.oldRulesMasterItem,this.RulesMasterItem.id);
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Rule data..';
        });
      }
    });
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }

  getFormattedTime(date: any) {
    let today = new Date();
    let dtStartTime = new Date(today.getFullYear(), today.getMonth(), today.getDay(), date.split(":")[0], date.split(":")[1], 0);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
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

  exportExcelRules() {
    const title = 'Rules Masters';
    const header = ["SNo", "Plant", "PayGroup", "Emp Cat", "Shift Code", "Attendance Count", "Apply Leave After", "Apply On Duty After",
      "Apply Permission After", "Apply ForgetSwipe After","Apply Status Change After", "Missing Punches Request Count", "LOP Reimbursement", "Permission Count Type", "Permission Count"
      , "Attendance Status Change Count", "Avail Fexi Hours", "Flexi Start Time", "Work Hours", "Shift Allowance", "Allowance Amount", "Active", "Created By", "Created Date"]
    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.RulesMasterList.forEach(item => {
      index = index + 1;
      ts = {};
      ts.slno = index;
      ts.plantName = item.plantName;
      ts.payGroupName = item.payGroupName;
      ts.catName = item.catName;
      ts.shiftCode = item.shiftCode;
      ts.attendanceLateCount = +item.attendanceLateCount;
      ts.leaveApplyAfter = +item.leaveApplyAfter;
      ts.odApplyAfter = +item.odApplyAfter;
      ts.applyPermissionAfter = +item.applyPermissionAfter;
      ts.applyForgotSwipe = item.applyForgotSwipe;
      ts.applyStatusChange = item.applyStatusChange;
      ts.missingPunchesRequestCount = item.missingPunchesRequestCount;
      ts.lopReimbursement = item.lopReimbursement;
      ts.permissionCountType = item.permissionCountType;
      ts.permissionCount = item.permissionCount;
      ts.attendanceStatusChangeCount = item.attendanceStatusChangeCount;
      if (item.availFlexiHours == true) {
        ts.availFlexiHours = "Yes";
      }
      else {
        ts.availFlexiHours = "No";
      }
      ts.flexiStartTime = item.flexiStartTime;
      ts.workHours = +item.workHours;
      if (item.shiftAllowance == true) {
        ts.shiftAllowance = "Yes";
      }
      else {
        ts.shiftAllowance = "No";
      }
      ts.allowanceAmount = +item.allowanceAmount;
      if (item.isActive == true) {
        ts.isActive = "YES";
      }
      else {
        ts.isActive = "NO";
      }
      ts.createdBy = +item.createdBy;
      ts.createdOn = this.setFormatedDate(item.createdOn);
      exportList.push(ts);
    });
    var OrganisationName = "MICRO LABS LIMITED";
    const data = exportList;
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Rules Masters');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:W1');
    worksheet.mergeCells('A2:W2');
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
      fs.saveAs(blob, 'Rules_Master.xlsx');
    });
  }
}

