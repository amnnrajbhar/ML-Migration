import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { HttpService } from '../../../shared/http-service';
import { MaterialMaster } from '../../../masters/materialmaster/materialmaster.model';

import {MaterialGroup} from '../MaterialGroup/MaterialGroup.model';
import { AuditLogChange } from '../../../masters/auditlogchange.model';
import { AuditLog } from '../../../masters/auditlog.model';


import * as _ from "lodash";
import { AuthData } from '../../../auth/auth.model';
declare var jQuery: any;

export class actionItemModel {  
  materialGroupId: string
  stxt: string
  ltxt: string
  materialType: string
  isActive:boolean;
}

@Component({
  selector: 'app-MaterialGroup',
  templateUrl: './MaterialGroup.component.html',
  styleUrls: ['./MaterialGroup.component.css']
})
export class MaterialGroupComponent implements OnInit {

@ViewChild(NgForm, { static: false }) materialForm!: NgForm;

  public tableWidget: any;
  companyId!: number;
  materialList: MaterialMaster[] = [];
  materialItem: MaterialMaster = new MaterialMaster();

  materialgroupList: MaterialGroup[] = [];
  materialgroup: MaterialGroup = new MaterialGroup();
  oldmaterialgroup: MaterialGroup = new MaterialGroup();// For aduit log
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string

  isLoading: boolean = false;
  entityTabHeader: string
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';

  currentUser = {} as AuthData;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#materialTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
    this.isLoading = false;
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
  //  if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getMaterialGroupList();
      this.getMaterialMasterList();
    // }
    // else
    //   this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onAddMaterial(isEdit: boolean, data: MaterialGroup) {
    this.materialForm.form.markAsPristine();
    this.materialForm.form.markAsUntouched();
    this.materialForm.form.updateValueAndValidity();

    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.aduitpurpose='';
    this.oldmaterialgroup=new MaterialGroup();
    if (this.isEdit) {
      // this.materialItem = data;
      Object.assign(this.oldmaterialgroup, data);
      Object.assign(this.materialgroup, data);
    }
    else {
      this.materialgroup = new MaterialGroup();
    }
    jQuery("#myModal").modal('show');
  }
  getMaterialMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_MATERIALTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.materialList = data.filter((x:any)  => x.isActive);
      }
    //  this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.materialList = [];
    });
  }
  getMaterialGroupList() {
    this.httpService.get(APIURLS.BR_MASTER_MATERIAL_GROUP_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.materialgroupList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.materialgroupList = [];
    });
  }
  onSaveMaterial() {
    this.errMsg = "";
    let connection: any;
    
      if (!this.isEdit)
      {
        this.auditType="Create";
        this.materialgroup.createdBy=this.currentUser.employeeId;;
        this.materialgroup.createdOn=new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_MATERIAL_GROUP_POST_PUT_API, this.materialgroup);
      }
      else
      {
        this.auditType="Update";
        this.materialgroup.lastModifiedBy=this.currentUser.employeeId;;
        this.materialgroup.lastModifiedOn=new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_MATERIAL_GROUP_POST_PUT_API, this.materialgroup.id, this.materialgroup);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Material Group saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.materialgroup.id;
          this.insertAuditLog(this.oldmaterialgroup,this.materialgroup,Id);
          this.getMaterialGroupList();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving material Group..';
      });
   
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }

    //AuditLogging
    masterName:string='Material Group'; // Change MasterName
    insertAuditLog(oldObj: MaterialGroup, newObj: MaterialGroup, id) {
      let oldObject: actionItemModel = new actionItemModel();
      let newObject: actionItemModel = new actionItemModel(); 
     
      oldObject.materialGroupId = oldObj.materialGroupId;
      oldObject.stxt = oldObj.stxt;
      oldObject.ltxt = oldObj.ltxt;
      oldObject.materialType = oldObj.materialType;
      oldObject.isActive = oldObj.isActive;
  
      newObject.materialGroupId = newObj.materialGroupId;
      newObject.stxt = newObj.stxt;
      newObject.ltxt = newObj.ltxt;
      newObject.materialType = newObj.materialType;
      newObject.isActive = newObj.isActive;

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
      auditlog.keyValue=newObj.materialGroupId?newObj.materialGroupId:oldObj.materialGroupId;
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
