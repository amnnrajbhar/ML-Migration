import { Component, OnInit, ViewChild } from '@angular/core';
import { APIURLS } from './../../shared/api-url';
import { AppComponent } from './../../app.component';
import { HttpService } from './../../shared/http-service';
declare var jQuery: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UOM } from './uom.model';
import swal from 'sweetalert';
import { AuthData } from '../../auth/auth.model';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
export class actionItemModel {
  uom: string
  description: string
}
@Component({
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: ['./uom.component.css']
})
export class UomComponent implements OnInit {
@ViewChild(NgForm, { static: false }) uomForm!: NgForm;

  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  public tableWidget: any;
  uomItem: UOM = new UOM();
  uomMasterList: UOM[] = [];
  isLoading: boolean = false;
  currentUser = {} as AuthData;
  olduomItem: UOM = new UOM();// For aduit log
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#uomTable');
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
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getUOMMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }
  getUOMMasterList() {
    this.httpService.get(APIURLS.BR_MASTER_UOM_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.uomMasterList = data.filter((x:any)=>x.isActive);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.uomMasterList = [];
    });
  }
  onAddUOM(isEdit: boolean, data: UOM) {
    this.uomForm.form.markAsPristine();
    this.uomForm.form.markAsUntouched();
    this.uomForm.form.updateValueAndValidity();
    this.uomItem = new UOM();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.aduitpurpose='';
    this.olduomItem=new UOM();
    if (this.isEdit) {
      Object.assign(this.olduomItem, data);
      Object.assign(this.uomItem, data);
    }
    jQuery("#myModal").modal('show');
  }
  onSaveUOM(status: boolean) {
    this.errMsg = "";
    let connection: any;
    if (!this.uomMasterList.some((s:any) => s.uom.trim().toLowerCase() === this.uomItem.uom.trim().toLowerCase() && s.id != this.uomItem.id)) {
      if (!this.isEdit)
      {
        this.auditType="Create";
        this.uomItem.isActive=true;
        this.uomItem.createdBy = this.currentUser.uid;
       // this.uomItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_UOM_PUT_API, this.uomItem);
      }
      else
      {
        this.auditType="Update";
        this.uomItem.modifiedBy = this.currentUser.uid;
       // this.uomItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_UOM_PUT_API, this.uomItem.id, this.uomItem);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'UOM data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.uomItem.id;
          this.insertAuditLog(this.olduomItem, this.uomItem, Id);
          this.getUOMMasterList();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving UOM data..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'UOM Entry already exists..';
    }
  }
  deleteUOM(data: UOM): void {
    this.aduitpurpose='';
    this.olduomItem=new UOM();
    this.uomItem = new UOM();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode:true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.uomItem, data);
        let connection: any;
        this.auditType="Delete";
        this.uomItem.isActive = false;
        this.uomItem.modifiedBy = this.currentUser.uid;
        this.uomItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_UOM_PUT_API, this.uomItem.id, this.uomItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.uomItem,this.olduomItem,this.uomItem.id);
            this.getUOMMasterList();
          }
        }).catch((error) => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting UOM..';
        });
      }
    });
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }
  //AuditLogging
  masterName:string='UOM Master'; // Change MasterName
  insertAuditLog(oldObj: UOM, newObj: UOM, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.uom = oldObj.uom;
    oldObject.description = oldObj.description;
    newObject.uom = newObj.uom;
    newObject.description = newObj.description;

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
    auditlog.keyValue=newObject.uom?newObject.uom:oldObject.uom;
    auditlog.changes = JSON.stringify(auditlogchangeList);
    auditlog.oldValues = JSON.stringify(oldObj);
    auditlog.newValues = JSON.stringify(newObj);
    auditlog.purpose = this.aduitpurpose;
    connection = this.httpService.post(APIURLS.BR_AUDITLOG_API, auditlog);
    connection.then((data: any) => {
      this.isLoadingPop = false;
    }).catch((error) => {
      this.isLoadingPop = false;
    });
  }
  auditLogList: AuditLog[] = [];
  openAuditLogs(id:any) {
    jQuery("#auditModal").modal('show');
    let stringparms = this.masterName + ',' + id;
    this.httpService.getByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
      if (data) {
        this.auditLogList = data;
        this.auditLogList.reverse();
      }
      this.reinitPOUPDatatable();
    }).catch((error) => {
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
