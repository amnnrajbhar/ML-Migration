import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import * as _ from "lodash";
import { FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { Purpose } from './purpose.model';
import swal from 'sweetalert';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
declare var jQuery: any;
export class actionItemModel {
  purpose: string
}
@Component({
  selector: 'app-purpose',
  templateUrl: './purpose.component.html',
  styleUrls: ['./purpose.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class PurposeComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) purposeForm!: NgForm;

  searchTerm: FormControl = new FormControl();
  public tableWidget: any;
  purposeList!: any[];
  oldpurposeItem: Purpose = new Purpose();// For aduit log
  auditType:string;// set ActionTypes: Create,Update,Delete
  aduitpurpose:string;
  purposeItem: Purpose = new Purpose();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  currentUser = {} as AuthData;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  clearForm() {
    this.purposeForm.resetForm();
    this.getPurposeList();
  }
  private initDatatable(): void {
    let exampleId: any = jQuery('#purpose');
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
      this.getPurposeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }
  onAddPurpose(isEdit: boolean, data: Purpose) {
    this.purposeForm.form.markAsPristine();
    this.purposeForm.form.markAsUntouched();
    this.purposeForm.form.updateValueAndValidity();

    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.aduitpurpose='';
    if (this.isEdit) {
      Object.assign(this.oldpurposeItem, data);//for audit
      Object.assign(this.purposeItem, data);
    }
    else {
      this.searchTerm.setValue('');
      this.purposeItem = new Purpose();
      this.oldpurposeItem=new Purpose();
    }
    jQuery("#myModal").modal('show');
  }

  getPurposeList() {
    this.httpService.get(APIURLS.BR_MASTER_PURPOSE_ALL).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.purposeList = data.filter((x:any)=>x.isActive);
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch((error) => {
      this.isLoading = false;
      this.purposeList = [];
    });
  }

  validatedForm: boolean = true;
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }
  onSavePurpose() {
    this.errMsg = '';
    this.errMsgPop = '';
    this.isLoadingPop = true;
    let connection: any;
    this.validatedForm = true;
    let validName = this.purposeList.some((s:any) => s.purpose.toLowerCase() == this.purposeItem.purpose.toLowerCase() && s.id != this.purposeItem.id);
    if (validName) {
      this.isLoadingPop = false;
      this.validatedForm = false;
      this.errMsgPop = 'Purpose already exists..';
    }
    else {
      if (!this.isEdit) {
        this.purposeItem.isActive=true;
        this.purposeItem.createdBy=this.currentUser.uid;
        this.purposeItem.createdDate=new Date().toLocaleString();
        this.auditType="Create";
        connection = this.httpService.post(APIURLS.BR_MASTER_PURPOSE, this.purposeItem);
      }
      else {
        this.purposeItem.modifiedBy=this.currentUser.uid;
        this.purposeItem.modifiedDate=new Date().toLocaleString();
        this.auditType="Update";
        connection = this.httpService.put(APIURLS.BR_MASTER_PURPOSE, this.purposeItem.id, this.purposeItem);
      }
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
          jQuery('#myModal').modal('hide');
          this.errMsgPop1 = 'Purpose data saved successfully!';
          jQuery("#saveModal").modal('show');
          this.isLoadingPop = false;
          let Id=!this.isEdit?data.id:this.purposeItem.id;
          this.insertAuditLog(this.oldpurposeItem,this.purposeItem,Id);
          this.getPurposeList();
        }
      }).catch((error) => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Purpose data..';
      });
    }
  }
  deletePurpose(data: Purpose): void {
    this.aduitpurpose='';
    this.purposeItem = new Purpose();
    this.oldpurposeItem=new Purpose();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode:true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        this.oldpurposeItem=new Purpose();
        Object.assign(this.purposeItem, data);
        let connection: any;
        this.auditType="Delete";
        this.purposeItem.isActive = false;
        this.purposeItem.modifiedBy = this.currentUser.uid;
        this.purposeItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_PURPOSE, this.purposeItem.id, this.purposeItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.purposeItem,this.oldpurposeItem,this.purposeItem.id);
            this.getPurposeList();
          }
        }).catch((error) => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Purpose..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='Visitor Purpose'; // Change MasterName
  insertAuditLog(oldObj: Purpose, newObj: Purpose, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.purpose = oldObj.purpose;
    newObject.purpose = newObj.purpose;

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
    auditlog.keyValue=newObject.purpose?newObject.purpose:oldObject.purpose;
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
