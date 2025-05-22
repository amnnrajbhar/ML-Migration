import { AuthData } from './../../auth/auth.model';
import { AppComponent } from './../../app.component';
import { APIURLS } from './../../shared/api-url';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Department } from './department.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { FormControl, NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { AuditLog } from '../../masters/auditlog.model';
import { AuditLogChange } from '../../masters/auditlogchange.model';
declare var jQuery: any;
export class actionItemModel {
  name: string;
  description: string;
}
@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
@ViewChild(NgForm, { static: false }) depForm: NgForm;

  currentUser = {} as AuthData;
  public tableWidget: any;
  depList: any[];
  depList1: any[];
  public filteredItems = [];
  parentList: any[];
  selParentRole: any;
  depItem: Department = new Department(0, '', '', 0, '', true);
  isLoading: boolean = false;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isLoadingPop: boolean = false;
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  olddepItem: Department = new Department(0, '', '', 0, '', true);// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#department');
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
      this.isLoading = true;
      this.getDepartList();
      this.isLoading = false;
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
    this.initDatatable()
  }
  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  onAddDepart(isEdit: boolean, data: Department) {
    this.depForm.form.markAsPristine();
    this.depForm.form.markAsUntouched();
    this.depForm.form.updateValueAndValidity();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.aduitpurpose='';
    this.olddepItem=new Department(0, '', '', 0, '', true);
    this.isLoadingPop = false;
    if (this.isEdit) {
      Object.assign(this.olddepItem, data);
      this.depItem = Object.assign({}, data);
    }
    else {
      this.depItem = new Department(0, '', '', 0, '', true);
      this.isLoadingPop = false;
    }
    jQuery("#myModal").modal('show');
  }

  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.depList = data.filter(x => x.isActive);
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(() => {
      this.isLoading = false;
      this.depList = [];
    });
  }
  onSaveDepart() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    if (!this.depList.some(s => s.name.trim().toLowerCase() == this.depItem.name.trim().toLowerCase() && s.id != this.depItem.id)) {
      if (!this.isEdit)
      {
        this.auditType="Create";
        connection = this.httpService.post(APIURLS.BR_MASTER_DEPARTMENT_API_INSERT, this.depItem);
      }
      else
      {
        this.auditType="Update";
        connection = this.httpService.put(APIURLS.BR_MASTER_DEPARTMENT_API_INSERT, this.depItem.id, this.depItem);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' Department data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.depItem.id;
          this.insertAuditLog(this.olddepItem,this.depItem,Id);
          this.getDepartList();
        }
      }).catch(() => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving department data..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Department name already exists..';
      this.getDepartList();
    }
  }
  deleteDepart(data: Department): void {
    this.aduitpurpose='';
    this.olddepItem=new Department(0, '', '', 0, '', true);
    this.depItem=new Department(0, '', '', 0, '', true);
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.depItem, data);
        let connection: any;
        this.auditType="Delete";
        this.depItem.isActive = false;
        connection = this.httpService.put(APIURLS.BR_MASTER_DEPARTMENT_API_INSERT, this.depItem.id, this.depItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.depItem,this.olddepItem,this.depItem.id);
            this.getDepartList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Department..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='Department'; // Change MasterName
  insertAuditLog(oldObj: Department, newObj: Department, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.name = oldObj.name;
    oldObject.description = oldObj.description;

    newObject.name = newObj.name;
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
    auditlog.keyValue=newObj.name?newObj.name:oldObj.name;
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
