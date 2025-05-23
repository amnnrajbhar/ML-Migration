import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import * as _ from "lodash";
import { FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { VisitorType } from './visitortype.model';
import swal from 'sweetalert';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
declare var jQuery: any;
export class actionItemModel {
  visitorType: string;
}
@Component({
  selector: 'app-visitortype',
  templateUrl: './visitortype.component.html',
  styleUrls: ['./visitortype.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class VisitorTypeComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) visitortypeForm: NgForm;
  searchTerm: FormControl = new FormControl();
  public tableWidget: any;
  visitorTypeList: any[];
  visitorTypeItem: VisitorType = new VisitorType();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  currentUser = {} as AuthData;
  oldvisitorTypeItem: VisitorType = new VisitorType();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  clearForm() {
    this.visitortypeForm.resetForm();
    this.getVisitorTypeList();
  }

  private initDatatable(): void {
    let exampleId: any = jQuery('#visitortype');
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
      this.getVisitorTypeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onAddVisitorType(isEdit: boolean, data: VisitorType) {
    this.visitortypeForm.form.markAsPristine();
    this.visitortypeForm.form.markAsUntouched();
    this.visitortypeForm.form.updateValueAndValidity();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.aduitpurpose='';
    if (this.isEdit) {
      Object.assign(this.oldvisitorTypeItem, data);
      Object.assign(this.visitorTypeItem, data);
    }
    else {
      this.searchTerm.setValue('');
      this.visitorTypeItem = new VisitorType();
      this.oldvisitorTypeItem=new VisitorType();
    }
    jQuery("#myModal").modal('show');
  }
  getVisitorTypeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITORTYPE_ALL).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.visitorTypeList = data.filter(x => x.isActive).sort((a,b)=>{
                                    if(a.visitor_Type > b.visitor_Type) return 1;
                                    if(a.visitor_Type < b.visitor_Type) return -1;
                                    return 0;
                                });
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(() => {
      this.isLoading = false;
      this.visitorTypeList = [];
    });
  }
  validatedForm: boolean = true;
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }
  onSaveVisitorType() {
    this.errMsg = '';
    this.errMsgPop = '';
    this.isLoadingPop = true;
    let connection: any;
    this.validatedForm = true;
    let blankName = this.visitorTypeItem.visitor_Type.trim() == '' || this.visitorTypeItem.visitor_Type.trim() == null;
    let validName = this.visitorTypeList.some(s => s.visitor_Type.toLowerCase() == this.visitorTypeItem.visitor_Type.toLowerCase() && s.id != this.visitorTypeItem.id);
    if (blankName) {
      this.isLoadingPop = false;
      this.validatedForm = false;
      this.errMsgPop = 'Visitor Type cannot be blank';
    }
    else if (validName) {
      this.isLoadingPop = false;
      this.validatedForm = false;
      this.errMsgPop = 'Visitor Type already exists';
    }
    else {
      if (!this.isEdit) {
        this.auditType="Create";
        this.visitorTypeItem.isActive = true;
        this.visitorTypeItem.createdBy = this.currentUser.uid;
       // this.visitorTypeItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_VISITORTYPE, this.visitorTypeItem);
      }
      else {
        this.auditType="Update";
        this.visitorTypeItem.modifiedBy = this.currentUser.uid;
       // this.visitorTypeItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_VISITORTYPE, this.visitorTypeItem.id, this.visitorTypeItem);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery('#myModal').modal('hide');
          this.errMsgPop1 = 'Visitor Type data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.visitorTypeItem.id;
          this.insertAuditLog(this.oldvisitorTypeItem,this.visitorTypeItem,Id);
          this.getVisitorTypeList();
          this.isLoadingPop = false;
        }
      }).catch(() => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving visitor type..';
      });
    }
  }
  deleteVisitorType(data: VisitorType): void {
    this.aduitpurpose='';
    this.visitorTypeItem = new VisitorType();
    this.oldvisitorTypeItem=new VisitorType();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.visitorTypeItem, data);
        let connection: any;
        this.auditType="Delete";
        this.visitorTypeItem.isActive = false;
        this.visitorTypeItem.modifiedBy = this.currentUser.uid;
        this.visitorTypeItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_VISITORTYPE, this.visitorTypeItem.id, this.visitorTypeItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.visitorTypeItem,this.oldvisitorTypeItem,this.visitorTypeItem.id);
            this.getVisitorTypeList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting visitor type..';
        });
      }
    });
  }
  masterName:string='Visitor Type'; // Change MasterName
  insertAuditLog(oldObj: VisitorType, newObj: VisitorType, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.visitorType = oldObj.visitor_Type;
    newObject.visitorType = newObj.visitor_Type;

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
    auditlog.keyValue=newObject.visitorType?newObject.visitorType:oldObject.visitorType;
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
