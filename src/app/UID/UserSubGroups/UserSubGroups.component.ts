import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from  '../../masters/auditlog.model';
import * as _ from "lodash";
import { UserSubGroupsMaster } from './UserSubGroups.model';
declare var jQuery: any;
export class actionItemModel {
  name: string;
  description: string;
  softwareid:number;
  usergroupid:number;
}
@Component({
  selector: 'app-UserSubGroups',
  templateUrl: './UserSubGroups.component.html',
  styleUrls: ['./UserSubGroups.component.css']
})
export class UserSubGroupsComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) desigForm: NgForm;
  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  UserSubGroupsList: any[]=[];
  UserSubGroupsList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  UserSubGroups: UserSubGroupsMaster = new UserSubGroupsMaster();
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
  oldUserSubGroups: UserSubGroupsMaster = new UserSubGroupsMaster();// For aduit log
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
    this.getUserSubGroupsMasterList();
    this.getsoftwareMasterList();
    this.getUserGroupsMasterList();
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

  softwareList:any;
  getsoftwareMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_SOFTWARE_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareList = data
      }
     // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareList = [];
    });
  }

  UserGroupsList:any;
  getUserGroupsMasterList() {
    this.errMsg = "";
    this.isLoading = true;
   // this.UserSubGroupsList=[];
    this.httpService.get(APIURLS.BR_USER_GROUPS_API).then((data: any) => {
      if (data.length > 0) {
        this.UserGroupsList = data;
      }
     // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.UserGroupsList = [];
    });
  }
  getUserSubGroupsMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.UserSubGroupsList=[];
    this.httpService.get(APIURLS.BR_USER_SUB_GROUPS_API).then((data: any) => {
      if (data.length > 0) {
        this.UserSubGroupsList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.UserSubGroupsList = [];
    });
  }
  getsoftName(id)
  {
    let name=this.softwareList.find(x=>x.id == id);
    return name ? name.name:'';
  }
  onAddUserSubGroups(isEdit: boolean, data: UserSubGroupsMaster) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.UserSubGroups = new UserSubGroupsMaster();
    this.aduitpurpose='';
    this.oldUserSubGroups=new UserSubGroupsMaster();
    if (this.isEdit) {
      Object.assign(this.oldUserSubGroups, data);
      this.UserSubGroups = Object.assign({}, data);
    }
    else {
      this.UserSubGroups = new UserSubGroupsMaster();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSaveUserSubGroups() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
   // if (!this.UserSubGroupsList.some(s => s.name.toLowerCase() == this.UserSubGroups.name.toLowerCase() && s.id != this.UserSubGroups.id)) {
      if (!this.isEdit) {
        this.auditType="Create";
        this.UserSubGroups.isActive = true;
        this.UserSubGroups.createdBy = this.currentUser.employeeId;
        //this.UserSubGroups.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_USER_SUB_GROUPS_INSERT_API, this.UserSubGroups);
      }
      else {
        this.auditType="Update";
        this.UserSubGroups.modifiedBy = this.currentUser.employeeId;
       // this.UserSubGroups.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_USER_SUB_GROUPS_INSERT_API, this.UserSubGroups.id, this.UserSubGroups);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' UserSubGroups data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.UserSubGroups.id;
          this.insertAuditLog(this.oldUserSubGroups,this.UserSubGroups,Id);
          this.getUserSubGroupsMasterList();
        }
        else
          this.errMsgPop = data;

      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving department data..';
      });
    //}
    // else {
    //   this.isLoadingPop = false;
    //   this.errMsgPop = 'UserSubGroups name already exists';
    // }
  }
 

  deleteUserSubGroups(data: UserSubGroupsMaster): void {
    this.UserSubGroups = new UserSubGroupsMaster();
    this.aduitpurpose='';
    this.oldUserSubGroups=new UserSubGroupsMaster();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.UserSubGroups, data);
        let connection: any;
        this.auditType="Delete";
        this.UserSubGroups.isActive = false;
        this.UserSubGroups.modifiedBy = this.currentUser.employeeId;
        this.UserSubGroups.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_USER_SUB_GROUPS_INSERT_API, this.UserSubGroups.id, this.UserSubGroups);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.UserSubGroups,this.oldUserSubGroups,this.UserSubGroups.id);
            this.getUserSubGroupsMasterList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Designation..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='UserSubGroups'; // Change MasterName
  insertAuditLog(oldObj: UserSubGroupsMaster, newObj: UserSubGroupsMaster, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.name = oldObj.name;
    oldObject.description = oldObj.description;
    oldObject.softwareid=oldObj.fkSoftwareId;
    oldObject.usergroupid=oldObj.fkUserGroupId;


    newObject.name = newObj.name;
    newObject.description = newObj.description;
    newObject.softwareid=newObj.fkSoftwareId;
    newObject.usergroupid=newObj.fkUserGroupId;

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
