import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { HttpService } from '../../../shared/http-service';
import { MaterialMaster } from '../../../masters/materialmaster/materialmaster.model';

import {ValuationClass} from '../valuationclass/valuationclass.model';
import { AuditLogChange } from '../../../masters/auditlogchange.model';
import { AuditLog } from '../../../masters/auditlog.model';
import * as _ from "lodash";
import { AuthData } from '../../../auth/auth.model';
declare var jQuery: any;


export class actionItemModel {
  matType: string;
  valuationId: string;
  valuationDesc: string;
  isActive:boolean;
}


@Component({
  selector: 'app-valuationclass',
  templateUrl: './valuationclass.component.html',
  styleUrls: ['./valuationclass.component.css']
})
export class ValuationClassComponent implements OnInit {

@ViewChild(NgForm, { static: false }) materialForm: NgForm;

  public tableWidget: any;
  companyId: number;
  materialList: MaterialMaster[] = [];
  materialItem: MaterialMaster = new MaterialMaster();

  ValuationClasslist: ValuationClass[] = [];
  ValuationClass: ValuationClass = new ValuationClass();


  isLoading: boolean = false;
  entityTabHeader: string;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  currentUser = {} as AuthData;

  oldValuationClass: ValuationClass = new ValuationClass();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;

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
      this.getValuationClassList();
      this.getMaterialMasterList();
   // }
    //else
      //this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onAddValuationClass(isEdit: boolean, data: ValuationClass) {
    this.materialForm.form.markAsPristine();
    this.materialForm.form.markAsUntouched();
    this.materialForm.form.updateValueAndValidity();

    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.aduitpurpose='';
    this.oldValuationClass=new ValuationClass();
    if (this.isEdit) {
      // this.materialItem = data;
      Object.assign(this.oldValuationClass, data);
      Object.assign(this.ValuationClass, data);
    }
    else {
      this.ValuationClass = new ValuationClass();
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

  getValuationClassList() {
    this.httpService.get(APIURLS.BR_MASTER_VALUATION_CLASS_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.ValuationClasslist = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.ValuationClasslist = [];
    });
  }


  onSaveValuationClass() {
    this.errMsg = "";
    let connection: any;
    
      if (!this.isEdit)
      {
        this.auditType="Create";
        this.ValuationClass.createdBy=this.currentUser.employeeId;;
        this.ValuationClass.createdOn=new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_VALUATION_CLASS_POST_PUT_API, this.ValuationClass);
      }
       
      else
      {
        this.auditType="Update";
        this.ValuationClass.lastModifiedBy=this.currentUser.employeeId;;
        this.ValuationClass.lastModifiedOn=new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_VALUATION_CLASS_POST_PUT_API, +this.ValuationClass.id, this.ValuationClass);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Valuation Class saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.ValuationClass.id;
          this.insertAuditLog(this.oldValuationClass,this.ValuationClass,Id);
          this.getValuationClassList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Valuation Class..';
      });
    
   
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }

   //AuditLogging
   masterName:string='Valuation Class'; // Change MasterName
   insertAuditLog(oldObj: ValuationClass, newObj: ValuationClass, id) {
     let oldObject: actionItemModel = new actionItemModel();
     let newObject: actionItemModel = new actionItemModel(); 
    
     oldObject.valuationDesc = oldObj.valuationDesc;
     oldObject.isActive=oldObj.isActive;
     oldObject.matType=oldObj.matType;
     oldObject.valuationId=oldObj.valuationId
 
     newObject.matType=newObj.matType;
     newObject.valuationId=newObj.valuationId
     newObject.valuationDesc = newObj.valuationDesc;
     newObject.isActive=newObj.isActive;
 
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
     auditlog.keyValue=newObj.valuationDesc?newObj.valuationDesc:oldObj.valuationDesc;
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
