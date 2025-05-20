import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Designation } from './designation.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
import * as _ from "lodash";
declare var jQuery: any;
export class actionItemModel {
  name: string;
  description: string;
}
@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.css']
})
export class DesignationComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) desigForm: NgForm;
  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  designationList: any[];
  designationList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  designationItem: Designation = new Designation();
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
  olddesignationItem: Designation = new Designation();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#desigTable');
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
      this.getDesignationMasterList();
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

  getDesignationMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_DESIGNATION_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.filter(x => x.isActive).sort((a,b)=>{
                                    if(a.name > b.name) return 1;
                                    if(a.name < b.name) return -1;
                                    return 0;
                                });
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.designationList = [];
    });
  }

  onAddDesignation(isEdit: boolean, data: Designation) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.designationItem = new Designation();
    this.aduitpurpose='';
    this.olddesignationItem=new Designation();
    if (this.isEdit) {
      Object.assign(this.olddesignationItem, data);
      this.designationItem = Object.assign({}, data);
    }
    else {
      this.designationItem = new Designation();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSaveDesignation() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    if (!this.designationList.some(s => s.name.toLowerCase() == this.designationItem.name.toLowerCase() && s.id != this.designationItem.id)) {
      if (!this.isEdit) {
        this.auditType="Create";
        this.designationItem.isActive = true;
        this.designationItem.createdBy = this.currentUser.uid;
       // this.designationItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_DESIGNATION_INSERT_API, this.designationItem);
      }
      else {
        this.auditType="Update";
        this.designationItem.modifiedBy = this.currentUser.uid;
       // this.designationItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_DESIGNATION_INSERT_API, this.designationItem.id, this.designationItem);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' Designation data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.designationItem.id;
          this.insertAuditLog(this.olddesignationItem,this.designationItem,Id);
          this.getDesignationMasterList();
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
      this.errMsgPop = 'Designation name already exists';
    }
  }
  deleteDesignation(data: Designation): void {
    this.designationItem = new Designation();
    this.aduitpurpose='';
    this.olddesignationItem=new Designation();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.designationItem, data);
        let connection: any;
        this.auditType="Delete";
        this.designationItem.isActive = false;
        this.designationItem.modifiedBy = this.currentUser.uid;
        this.designationItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_DESIGNATION_INSERT_API, this.designationItem.id, this.designationItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.designationItem,this.olddesignationItem,this.designationItem.id);
            this.getDesignationMasterList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Designation..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='Designation'; // Change MasterName
  insertAuditLog(oldObj: Designation, newObj: Designation, id) {
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
