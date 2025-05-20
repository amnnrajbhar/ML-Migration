import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { HttpService } from '../../../shared/http-service';
import { MaterialMaster } from '../../../masters/materialmaster/materialmaster.model';

import {StorageLocation} from '../StorageLocation/StorageLocation.model';
import { AuditLogChange } from '../../../masters/auditlogchange.model';
import { AuditLog } from '../../../masters/auditlog.model';

import * as _ from "lodash";
import { AuthData } from '../../../auth/auth.model';
declare var jQuery: any;

export class actionItemModel {
  
    storageLocationId: string;
    storageLocationName: string;
    matType: String;
    isActive: boolean;
}

@Component({
  selector: 'app-StorageLocation',
  templateUrl: './StorageLocation.component.html',
  styleUrls: ['./StorageLocation.component.css']
})
export class StorageLocationComponent implements OnInit {

  @ViewChild(NgForm) materialForm: NgForm;
  public tableWidget: any;
  companyId: number;
  materialList: MaterialMaster[] = [];
  materialItem: MaterialMaster = new MaterialMaster();

  storagelocationlist: StorageLocation[] = [];
  storagelocation: StorageLocation = new StorageLocation();
  oldstoragelocation: StorageLocation = new StorageLocation();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;

  isLoading: boolean = false;
  entityTabHeader: string;
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
    //if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getstoragelocationList();
      this.getMaterialMasterList();
   // }
    //else
      //this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onAddStorageLocation(isEdit: boolean, data: StorageLocation) {
    this.materialForm.form.markAsPristine();
    this.materialForm.form.markAsUntouched();
    this.materialForm.form.updateValueAndValidity();

    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;

    this.aduitpurpose='';
    this.oldstoragelocation=new StorageLocation();
    if (this.isEdit) {
      // this.materialItem = data;
      Object.assign(this.oldstoragelocation, data);
      Object.assign(this.storagelocation, data);
    }
    else {
      this.storagelocation = new StorageLocation();
    }
    jQuery("#myModal").modal('show');
  }

  getMaterialMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_MATERIALTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.materialList = data.filter(x => x.isActive);
      }
     // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialList = [];
    });
  }

  getstoragelocationList() {
    this.httpService.get(APIURLS.BR_MASTER_STORAGE_LOCATION_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.storagelocationlist = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.storagelocationlist = [];
    });
  }


  onSaveStorage() {
    this.errMsg = "";
    let connection: any;
    
      if (!this.isEdit)
      {
        this.auditType="Create";
        this.storagelocation.createdBy=this.currentUser.employeeId;;
        this.storagelocation.createdOn=new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_STORAGE_LOCATION_POST_PUT_API, this.storagelocation);
      }
       
      else
      {
        this.auditType="Update";
        this.storagelocation.lastModifiedBy=this.currentUser.employeeId;;
        this.storagelocation.lastModifiedOn=new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_STORAGE_LOCATION_POST_PUT_API, this.storagelocation.id, this.storagelocation);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Storage Location saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.storagelocation.id;
          this.insertAuditLog(this.oldstoragelocation,this.storagelocation,Id);
          this.getstoragelocationList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving storage Location..';
      });
    
   
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }
   //AuditLogging
   masterName:string='Storage Location'; // Change MasterName
   insertAuditLog(oldObj: StorageLocation, newObj: StorageLocation, id) {
     let oldObject: actionItemModel = new actionItemModel();
     let newObject: actionItemModel = new actionItemModel(); 
    
     oldObject.storageLocationId = oldObj.storageLocationId;
     oldObject.storageLocationName = oldObj.storageLocationName;
     oldObject.matType = oldObj.matType;
     oldObject.isActive = oldObj.isActive;
    
     newObject.storageLocationId = newObj.storageLocationId;
     newObject.storageLocationName = newObj.storageLocationName;
     newObject.matType = newObj.matType;
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
     auditlog.keyValue=newObj.storageLocationName?newObj.storageLocationName:oldObj.storageLocationName;
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
