import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PasswordPolicy } from './passwordpolicy.model';
import swal from 'sweetalert';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
declare var jQuery: any;

@Component({
  selector: 'app-passwordpolicy',
  templateUrl: './passwordpolicy.component.html',
  styleUrls: ['./passwordpolicy.component.css']
})
export class PasswordpolicyComponent implements OnInit {
  @ViewChild(NgForm) passwordPolicyForm: NgForm;
  policyItem: any = {};
  passwordPolicy: PasswordPolicy = new PasswordPolicy();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  neverExpire: boolean = false;
  path: string = '';
  currentUser: AuthData;
  expiryDays: any;
  oldpasswordPolicy: PasswordPolicy = new PasswordPolicy();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) {

  }

  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getPasswordPolicy();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  getPasswordPolicy() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_PASSWORDPOLICY_API, 1).then((data: any) => {
      if (data) {
        Object.assign(this.policyItem, data);
        this.expiryDays = data.expiryDays;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  onPolicyEdit(Policy: PasswordPolicy) {
    this.passwordPolicyForm.form.markAsPristine();
    this.passwordPolicyForm.form.markAsUntouched();
    this.passwordPolicyForm.form.updateValueAndValidity();
    this.errMsgPop = "";
    this.neverExpire = false;
    this.isLoadingPop = true;
    this.aduitpurpose = '';
    Object.assign(this.oldpasswordPolicy, Policy);
    Object.assign(this.passwordPolicy, Policy);
    if (this.passwordPolicy.expiryDays) {
      this.neverExpire = true;
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSavePolicy() {
    swal({
      title: "Are you sure to change the password policy?",
      icon: "warning",
      buttons: [true, true],
      dangerMode: false,
    })
      .then((willsave) => {
        if (willsave) {
          this.onSavePasswordPolicy();
        }
      });
  }

  onSavePasswordPolicy() {
    this.errMsg = '';
    this.errMsgPop = '';
    this.isLoadingPop = true;
    let connection: any;
    this.auditType = "Update";
    if (!this.neverExpire) {
      this.passwordPolicy.expiryDays = null;
    }
    this.passwordPolicy.modifiedBy = this.currentUser.uid;
    this.passwordPolicy.modifiedDate = new Date().toLocaleString();
    connection = this.httpService.put(APIURLS.BR_MASTER_PASSWORDPOLICY_API, this.passwordPolicy.id, this.passwordPolicy);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery('#myModal').modal('hide');
        this.insertAuditLog(this.oldpasswordPolicy, this.passwordPolicy, this.passwordPolicy.id);
        swal("Saved Successfully!", {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.getPasswordPolicy();
          }
        });
      }
    }).catch(() => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving password policy..';
    });

  }
  //AuditLogging
  masterName: string = 'Password Policy'; // Change MasterName
  fieldNames = ["expiryDays"];// Set Field Names
  insertAuditLog(oldObj, newObj, id) {
    let beforeobj = Object.keys(oldObj);
    let aftreobj = Object.keys(newObj);
    var biggestKey = 0;
    if (beforeobj.length > 0)
      var biggestKey = beforeobj.length;
    else
      var biggestKey = aftreobj.length;
    let auditlogchangeList: AuditLogChange[] = [];
    for (var i = 0; i < biggestKey; i++) {
      if (this.auditType == "Update") {
        if (_.isEqual(beforeobj[i], aftreobj[i]) && !_.isEqual(oldObj[beforeobj[i]], newObj[aftreobj[i]])) {
          if (this.fieldNames.includes(beforeobj[i])) {
            let auditlog: AuditLogChange = new AuditLogChange();
            auditlog.fieldname = beforeobj[i];
            auditlog.oldvalue = oldObj[beforeobj[i]];
            auditlog.newvalue = newObj[aftreobj[i]];
            auditlogchangeList.push(auditlog);
          }
        }
      }
    }
    let connection: any;
    let auditlog: AuditLog = new AuditLog();
    auditlog.auditDateTime = new Date().toLocaleString();
    auditlog.aduitUser = this.currentUser.fullName;
    auditlog.auditType = this.auditType;
    auditlog.masterName = this.masterName;
    auditlog.tableId = id;
    auditlog.keyValue="Password expiry";
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
