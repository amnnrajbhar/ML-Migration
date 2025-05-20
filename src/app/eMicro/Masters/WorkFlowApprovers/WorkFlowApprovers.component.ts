import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, NgForm } from '@angular/forms';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { HttpService } from '../../../shared/http-service';
import { MaterialMaster } from '../../../masters/materialmaster/materialmaster.model';

import {WorkFlowApprovers} from '../WorkFlowApprovers/WorkFlowApprovers.model';
import { AuditLogChange } from '../../../masters/auditlogchange.model';
import { AuditLog } from '../../../masters/auditlog.model';

import * as _ from "lodash";
import { AuthData } from '../../../auth/auth.model';
import { StorageLocation } from '../StorageLocation/StorageLocation.model';
import { MaterialGroup } from '../MaterialGroup/MaterialGroup.model';
import { ProcessMaster } from '../ProcessMaster/ProcessMaster.model';
declare var jQuery: any;

export class actionItemModel {
  keyValue: string;
  approverId: string;
  priority: number;
  parllelApprover1: string;
  parllelApprover2: string;
  parllelApprover3: string;
  parllelApprover4: string;
  role: string;
  processId: number;
  closure: Boolean;
  isActive: Boolean;
}

@Component({
  selector: 'app-WorkFlowApprovers',
  templateUrl: './WorkFlowApprovers.component.html',
  styleUrls: ['./WorkFlowApprovers.component.css']
})
export class WorkFlowApproversComponent implements OnInit {

  @ViewChild(NgForm) materialForm: NgForm;
  public tableWidget: any;
  companyId: number;
  materialList: MaterialMaster[] = [];
  materialItem: MaterialMaster = new MaterialMaster();

  workflowapproverslist: WorkFlowApprovers[] = [];
  workflowapprovers: WorkFlowApprovers = new WorkFlowApprovers();
  oldworkflowapprovers: WorkFlowApprovers = new WorkFlowApprovers();// For aduit log
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

  matType:string;
  Prod_type:string;
  market:string;
  location:string;
  storagelocation:string;
  materialgroup:string;

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
      this.getworkflowapproversList();
      this.getMaterialMasterList();
      this.getLocationMaster();
      this.getstoragelocationList();
      //this.getMaterialGroupList();
      this.getProcessList();
      this.getEmployeeList();
      this.getsoftwareMasterList();
   // }
    //else
      //this.router.navigate(["/unauthorized"]);
  }
  softwareList: any[] = [];
  getsoftwareMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareList = [];
    });
  }
  locationList: any[] = [[]];
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        this.locationList.sort((a,b)=>{return collator.compare(a.code,b.code)});
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  ngAfterViewInit() {
    this.initDatatable();
  }

  storagelocationlist: StorageLocation[] = [];
  storagelocationlist1: StorageLocation[] = [];
  getstoragelocationList() {
    this.httpService.get(APIURLS.BR_MASTER_STORAGE_LOCATION_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.storagelocationlist = data;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.storagelocationlist = [];
    });
  }

  processlist: ProcessMaster[] = [];
  getProcessList() {
    this.httpService.get(APIURLS.BR_MASTER_PROCESS_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.processlist = data;
      }
     // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.processlist = [];
    });
  }

  materialgroupList: MaterialGroup[] = [];
  getMaterialGroupList() {
    this.httpService.get(APIURLS.BR_MASTER_MATERIAL_GROUP_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //this.materialgroupList = data;
        this.materialgroupList=data.filter(x=>x.stxt !=null);
      }
     // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialgroupList = [];
    });
  }
  
  resetform()
  {
    this.workflowapprovers = {} as WorkFlowApprovers;
    this.matType=undefined;
    this.location=undefined;
    this.storagelocation=undefined;
    this.materialgroup=undefined;
  }
  gettype(value)
  {
    let type=value.split('~');
    if(type[1] != null || type[1] != undefined)
    {
      if(type[1] =='Import' ||type[1] =='Local' )
      {
        return 'Vendor Master';
      }
      else if(type[1] =='Exports' ||type[1] =='Domestic' )
      {
        return 'Customer Master';
      }
      else
      {
        return type[1];
      }    
    }   
    else 
    {
      return 'Service Master';
    }
  }
  getloc(value)
  {
    let type=value.split('~');
    return type[0];
  }
  getstoloc(value)
  {
    let type=value.split('~');
    if(type[2] != null || type[2] != undefined)
    {
      return type[2];
    }
    else if(type[1] =='Import' ||type[1] =='Local' )
    {
      return type[1];
    }
    else if(type[1] =='Exports' ||type[1] =='Domestic' )
    {
      return type[1];
    }
  }
  getprocessname(id)
  {
    let process=this.processlist.find(x=>x.processId==id);
    return process ? process.processName : "";
  }
  getstoloclist(value)
  {
    this.storagelocationlist1=this.storagelocationlist.filter(x=>x.matType==value);
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

  employeeList = [];
  empListCon:any[]=[];
  
  getEmployeeList() {
    this.isLoading = true;
   // let id= this.locationList.find(x=>x.code == loc).id;
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_GET_All_API).then((data: any) => {
      if (data.length > 0) {
        this.employeeList = data;
        //this.empListCon = data.map((i) => { i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation; return i; });
        //this.employeeList=this.employeeList.filter(x=>x.fkDepartment == this.currentUser.fK_Department);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.employeeList = [];
    });
  }
  getworkflowapproversList() {
    this.httpService.get(APIURLS.BR_MASTER_APPROVERS_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.workflowapproverslist = data;
        this.workflowapproverslist=this.workflowapproverslist.filter(x=>x.isActive==true);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.workflowapproverslist = [];
    });
  }

  onAddWorkFlowApprovers(isEdit: boolean, data: WorkFlowApprovers) {
    this.materialForm.form.markAsPristine();
    this.materialForm.form.markAsUntouched();
    this.materialForm.form.updateValueAndValidity();
    
    this.resetform();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
   
    this.aduitpurpose='';
    this.oldworkflowapprovers=new WorkFlowApprovers();
    if (this.isEdit) {
      this.storagelocationlist1=this.storagelocationlist;
      // this.materialItem = data;
      Object.assign(this.oldworkflowapprovers, data);
      Object.assign(this.workflowapprovers, data);

      let values=[];
      values=this.workflowapprovers.keyValue.split('~');
      //this.getEmployeeList(values[0]);      
      if(this.workflowapprovers.processId ==3)
      {
        this.location=values[0];
       this.workflowapprovers.vendorCat = values[1];
       this.workflowapprovers.vendorSubCat = values[2];
      }
      else if(this.workflowapprovers.processId ==4)
      {
        this.location=values[0];
          this.workflowapprovers.viewType = values[1];
      }
      else if(this.workflowapprovers.processId ==5)
      {
        this.location=this.workflowapprovers.keyValue;
         
      }
      else if(values[1]=='FG')
      {
       this.storagelocationlist1=this.storagelocationlist;
        this.location=values[0];
        this.matType=values[1];
        this.storagelocation=values[2];
        this.Prod_type=values[3];
        this.market=values[4];
      }
      else{
        
        this.location=values[0];
        this.matType=values[1];
        this.storagelocation=values[2];
      }
      
    }
    this.storagelocationlist1=this.storagelocationlist;
    this.workflowapprovers.isActive=true;
    jQuery("#myModal").modal('show');
  }

  onSaveApprovers() {
    this.errMsg = "";
    let connection: any;
    
    if(this.workflowapprovers.processId ==3)
    {
     this.workflowapprovers.keyValue = this.location +'~'+ this.workflowapprovers.vendorCat+'~'+this.workflowapprovers.vendorSubCat
    }
    else if(this.workflowapprovers.processId ==6 && this.matType=='SAP UserId')
    {
     this.workflowapprovers.keyValue = this.location +'~'+ this.workflowapprovers.vendorCat+'~'+this.workflowapprovers.vendorSubCat
    }
    else if(this.workflowapprovers.processId ==4)
    {
      this.workflowapprovers.keyValue = this.location +'~'+ this.workflowapprovers.viewType;
    }
    else if(this.workflowapprovers.processId ==5)
    {
      this.workflowapprovers.keyValue = this.location ;
    }
    else if(this.matType =='FG')
    {
      this.workflowapprovers.keyValue=this.location +'~'+this.matType+'~'+this.storagelocation+'~'+this.Prod_type+'~'+this.market;
    }
    else if(this.workflowapprovers.processId ==6 && this.matType !='SAP UserId')
    {
      this.workflowapprovers.keyValue =this.location +'~'+this.matType ;
    }
    else{
      this.workflowapprovers.keyValue=this.location +'~'+this.matType+'~'+this.storagelocation;
    }        
    
      if (!this.isEdit)
      {
        this.auditType="Create";
       
        this.workflowapprovers.createdBy=this.currentUser.employeeId;;
       // this.workflowapprovers.createdOn=new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_APPROVERS_POST_PUT_API, this.workflowapprovers);
      }
       
      else
      {
        this.auditType="Update";
        this.workflowapprovers.lastModifiedBy=this.currentUser.employeeId;;
       // this.workflowapprovers.lastModifiedOn=new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_APPROVERS_POST_PUT_API, this.workflowapprovers.id, this.workflowapprovers);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'WorkFlowApprovers saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.workflowapprovers.id;
          this.insertAuditLog(this.oldworkflowapprovers,this.workflowapprovers,Id);
          this.getworkflowapproversList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving WorkFlowApprovers..';
      });
    
   
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }
   //AuditLogging
   masterName:string='WorkFlowApprovers'; // Change MasterName
   insertAuditLog(oldObj: WorkFlowApprovers, newObj: WorkFlowApprovers, id) {
     let oldObject: actionItemModel = new actionItemModel();
     let newObject: actionItemModel = new actionItemModel(); 
    
     oldObject.keyValue = oldObj.keyValue;
     oldObject.approverId = oldObj.approverId;
     oldObject.parllelApprover1 = oldObj.parllelApprover1;
     oldObject.parllelApprover2 = oldObj.parllelApprover2;
     oldObject.parllelApprover3 = oldObj.parllelApprover3;
     oldObject.parllelApprover4 = oldObj.parllelApprover4;
     oldObject.priority = oldObj.priority;
     oldObject.isActive = oldObj.isActive;
     oldObject.processId = oldObj.processId;
     oldObject.closure = oldObj.closure;
     oldObject.role = oldObj.role;
    
     newObject.keyValue = newObj.keyValue;
     newObject.approverId = newObj.approverId;
     newObject.parllelApprover1 = newObj.parllelApprover1;
     newObject.parllelApprover2 = newObj.parllelApprover2;
     newObject.parllelApprover3 = newObj.parllelApprover3;
     newObject.parllelApprover4 = newObj.parllelApprover4;
     newObject.priority = newObj.priority;
     newObject.isActive = newObj.isActive;
     newObject.processId = newObj.processId;
     newObject.closure = newObj.closure;
     newObject.role = newObj.role;
 
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
     auditlog.keyValue=newObj.keyValue?newObj.keyValue:oldObj.keyValue;
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

  //filterModel: PageFilter = {} as PageFilter;
  pageSize: any = 10;
  pageNo: any;
  totalCount: number;
  totalPages: number
  gotoPage(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getworkflowapproversList();
  }

  pageSizeChange() {
    this.pageNo = 1;
    this.getworkflowapproversList();
  }
  getlist() {
    this.pageNo = 1
    this.getworkflowapproversList();
  }

}
