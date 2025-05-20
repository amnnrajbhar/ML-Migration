import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { docCategory } from './DocCategory.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import * as _ from "lodash";
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from '../../masters/auditlog.model';
declare var jQuery: any;
export class actionItemModel {
  name: string;
  description: string;
}
@Component({
  selector: 'app-docCategory',
  templateUrl: './docCategory.component.html',
  styleUrls: ['./docCategory.component.css']
})
export class DocCategoryComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) desigForm: NgForm;
  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  docCategoryList: any[];
  docCategoryList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  docCategoryItem: docCategory = new docCategory();
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
  olddocCategoryItem: docCategory = new docCategory();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#categTable');
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
      this.getdocCategoryMasterList();
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

  getdocCategoryMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.DLSget(APIURLS.BR_GET_DOC_CAT_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.docCategoryList = data.filter(x => x.isActive).sort((a,b)=>{
                                    if(a.name > b.name) return 1;
                                    if(a.name < b.name) return -1;
                                    return 0;
                                });
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.docCategoryList = [];
    });
  }

  onAdddocCategory(isEdit: boolean, data: docCategory) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.docCategoryItem = new docCategory();
    this.aduitpurpose='';
    this.olddocCategoryItem=new docCategory();
    if (this.isEdit) {
      Object.assign(this.olddocCategoryItem, data);
      this.docCategoryItem = Object.assign({}, data);
    }
    else {
      this.docCategoryItem = new docCategory();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSavedocCategory() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    if (!this.docCategoryList.some(s => s.name.toLowerCase() == this.docCategoryItem.name.toLowerCase() && s.id != this.docCategoryItem.id)) {
      if (!this.isEdit) {
        this.auditType="Create";
        this.docCategoryItem.isActive = true;
        this.docCategoryItem.createdBy = this.currentUser.uid;
        this.docCategoryItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.DLSpost(APIURLS.BR_MASTER_DOC_CAT_MASTER_INSERT, this.docCategoryItem);
      }
      else {
        this.auditType="Update";
        this.docCategoryItem.modifiedBy = this.currentUser.uid;
        this.docCategoryItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.DLSput(APIURLS.BR_MASTER_DOC_CAT_MASTER_INSERT, this.docCategoryItem.id, this.docCategoryItem);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' docCategory data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.docCategoryItem.id;
          this.insertAuditLog(this.olddocCategoryItem,this.docCategoryItem,Id);
          this.getdocCategoryMasterList();
        }
        else
          this.errMsgPop = data;

      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving department data..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'docCategory name already exists';
    }
  }
  deletedocCategory(data: docCategory): void {
    this.docCategoryItem = new docCategory();
    this.aduitpurpose='';
    this.olddocCategoryItem=new docCategory();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.docCategoryItem, data);
        let connection: any;
        this.auditType="Delete";
        this.docCategoryItem.isActive = false;
        this.docCategoryItem.modifiedBy = this.currentUser.uid;
        this.docCategoryItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_DOC_CAT_MASTER_INSERT, this.docCategoryItem.id, this.docCategoryItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.docCategoryItem,this.olddocCategoryItem,this.docCategoryItem.id);
            this.getdocCategoryMasterList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting docCategory..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='docCategory'; // Change MasterName
  insertAuditLog(oldObj: docCategory, newObj: docCategory, id) {
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
