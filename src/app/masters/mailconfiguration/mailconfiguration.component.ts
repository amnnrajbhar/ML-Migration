import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Location } from '../locationmaster/location.model';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
declare var jQuery: any;
export class actionItemModel {
  inwardMail: string;
  outwardMail: string;
  visitorMail: string;
}

@Component({
  selector: 'app-mailconfiguration',
  templateUrl: './mailconfiguration.component.html',
  styleUrls: ['./mailconfiguration.component.css']
})
export class MailconfigurationComponent implements OnInit {
  public tableWidget: any;
  @ViewChild(NgForm) locationMasterForm: NgForm;
  LocationMasterList: any[] = [[]];
  locationMasterItem: Location = new Location();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  currentUser: AuthData;
  oldlocationMasterItem: Location = new Location();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) {

  }

  private initDatatable(): void {
    let exampleId: any = jQuery('#location');
    this.tableWidget = exampleId.DataTable({
      "order": []
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
      this.getLocationMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }


  onAddLocationMaster(isEdit: boolean, data: Location) {
    this.locationMasterForm.form.markAsPristine();
    this.locationMasterForm.form.markAsUntouched();
    this.locationMasterForm.form.updateValueAndValidity();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.aduitpurpose = '';
    this.oldlocationMasterItem = new Location();
    this.isLoadingPop = true;
    if (this.isEdit) {
      Object.assign(this.oldlocationMasterItem, data);
      Object.assign(this.locationMasterItem, data);
    }
    else {
      this.locationMasterItem = new Location();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  getLocationMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.LocationMasterList = data;
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(() => {
      this.isLoading = false;
      this.LocationMasterList = [];
    });
  }
  validatedForm: boolean = true;
  closeSaveModal() {
    this.getLocationMasterList();
    jQuery("#saveModal").modal('hide');
  }
  onSaveLocationMaster() {
    this.errMsg = '';
    this.errMsgPop = '';
    this.isLoadingPop = true;
    let connection: any;
    this.validatedForm = true;
    this.auditType = "Update";
    this.locationMasterItem.modifiedBy = this.currentUser.uid;
  //  this.locationMasterItem.modifiedDate = new Date().toLocaleString();
    connection = this.httpService.put(APIURLS.BR_MASTER_LOCATION_MASTER_API, this.locationMasterItem.id, this.locationMasterItem);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery('#myModal').modal('hide');
        this.errMsgPop1 = 'Location data saved successfully!';
        jQuery("#saveModal").modal('show');
        this.insertAuditLog(this.oldlocationMasterItem, this.locationMasterItem, this.locationMasterItem.id);
        this.getLocationMasterList();
      }
    }).catch(() => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Location..';
    });

  }
  //AuditLogging
  masterName: string = 'Daily Report Mail Configuration'; // Change MasterName
  insertAuditLog(oldObj: Location, newObj: Location, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.inwardMail = oldObj.toMail;
    oldObject.outwardMail = oldObj.outwardMail;
    oldObject.visitorMail = oldObj.visitorMail;
    newObject.inwardMail = newObj.toMail;
    newObject.outwardMail = newObj.outwardMail;
    newObject.visitorMail = newObj.visitorMail;

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
    auditlog.keyValue=newObj.name?newObj.code+'-'+newObj.name:oldObj.code+'-'+oldObj.name;
    auditlog.changes = JSON.stringify(auditlogchangeList);
    auditlog.oldValues = JSON.stringify(oldObj);
    auditlog.newValues = JSON.stringify(newObj);
    auditlog.purpose = this.aduitpurpose;
    connection = this.httpService.post(APIURLS.BR_AUDITLOG_API, auditlog);
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
    this.httpService.getByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
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
}
