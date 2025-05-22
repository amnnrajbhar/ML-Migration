import { MaterialType } from './materialtype.model';
import { APIURLS } from './../../shared/api-url';
import { AppComponent } from './../../app.component';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit, ViewChild } from '@angular/core';
declare var jQuery: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { AuthData } from '../../auth/auth.model';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
export class actionItemModel {
  type: string;
  description: string;
}
@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit {
@ViewChild(NgForm, { static: false }) materialForm: NgForm;

  public tableWidget: any;
  companyId: number;
  materialList: MaterialType[] = [];
  companyItem: any;
  materialItem: MaterialType = new MaterialType();
  isLoading: boolean = false;
  entityTabHeader: string;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  currentUser = {} as AuthData;
  oldmaterialItem: MaterialType = new MaterialType();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#materialTable');
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
      this.getMaterialMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);

  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onAddMaterial(isEdit: boolean, data: MaterialType) {
    this.materialForm.form.markAsPristine();
    this.materialForm.form.markAsUntouched();
    this.materialForm.form.updateValueAndValidity();

    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.aduitpurpose = '';
    if (this.isEdit) {
      Object.assign(this.oldmaterialItem, data);
      Object.assign(this.materialItem, data);
    }
    else {
      this.materialItem = new MaterialType();
      this.oldmaterialItem = new MaterialType();
    }

    jQuery("#myModal").modal('show');
  }

  getMaterialMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_MATERIALTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.materialList = data.filter(x => x.isActive);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialList = [];
    });
  }

  onSaveMaterial(status: boolean) {
    this.errMsg = "";
    this.errMsgPop = "";

    let connection: any;
    if (!this.materialList.some(s => s.type.trim().toLowerCase() === this.materialItem.type.trim().toLowerCase() && s.id != this.materialItem.id)) {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.materialItem.isActive = true;
        this.materialItem.createdBy = this.currentUser.uid;
      //  this.materialItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_MATERIALTYPE_PUT_API, this.materialItem);
      }
      else {
        this.auditType = "Update";
        this.materialItem.modifiedBy = this.currentUser.uid;
      //  this.materialItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_MATERIALTYPE_PUT_API, this.materialItem.id, this.materialItem);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Material type saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.materialItem.id;
          this.insertAuditLog(this.oldmaterialItem, this.materialItem, Id);
          this.getMaterialMasterList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving material type data..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Entered material type already exists';
    }
  }
  deleteMaterialType(data: MaterialType): void {
    this.aduitpurpose='';
    this.materialItem = new MaterialType();
    this.oldmaterialItem = new MaterialType();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.materialItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.materialItem.isActive = false;
        this.materialItem.modifiedBy = this.currentUser.uid;
        this.materialItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_MATERIALTYPE_PUT_API, this.materialItem.id, this.materialItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.materialItem, this.oldmaterialItem, this.materialItem.id);
            this.getMaterialMasterList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting material type..';
        });
      }
    });
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }
  //AuditLogging
  masterName: string = 'Material Type'; // Change MasterName
  insertAuditLog(oldObj: MaterialType, newObj: MaterialType, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.type = oldObj.type;
    oldObject.description = oldObj.description;
    newObject.type = newObj.type;
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
    auditlog.keyValue=newObject.type?newObject.type:oldObject.type;
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
