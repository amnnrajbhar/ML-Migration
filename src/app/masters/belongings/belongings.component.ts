import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
// import { User } from '../user/user.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
// import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
import { Employee } from '../employee/employee.model';
import { FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
// import { throwMatDialogContentAlreadyAttachedError, MatAutocompleteTrigger } from '@angular/material';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Belongings } from './belongings.model';
declare var jQuery: any;
import swal from 'sweetalert';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
// import { Subject, Observable } from 'rxjs';
export class actionItemModel {
  name: string;
}

@Component({
  selector: 'app-belongings',
  templateUrl: './belongings.component.html',
  styleUrls: ['./belongings.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class BelongingsComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) belongingsForm: NgForm;
  searchTerm: FormControl = new FormControl();
  // private trigger: Subject<void> = new Subject<void>();
  public tableWidget: any;
  indexI: number = 0;
  belongingsList: any[];
  empMList: any[] = [[]];
  parentList: any[];
  // employeeList: any[];
  selParentRole: any;
  selHeadEmpId: any;
  belongingsItem: Belongings = new Belongings();
  empItem: Employee = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  currentUser = {} as AuthData;
  // myControl: FormControl = new FormControl();
  path: string = '';
  public filteredItems = [];

  public employeeList: any[] = [[]];
  oldbelongingsItem: Belongings = new Belongings();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private http: HttpClient,
 private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#belongings');
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
  // public get triggerObservable(): Observable<void> {
  //   return this.trigger.asObservable();
  // }

  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getBelongingsList();
      this.getEmpList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  // clearForm(){
  //   console.log('form reset');
  //   this.belongingsForm.resetForm();
  //   this.getBelongingsList();
  // }

  onAddBelongings(isEdit: boolean, data: Belongings) {
    this.belongingsForm.form.markAsPristine();
    this.belongingsForm.form.markAsUntouched();
    this.belongingsForm.form.updateValueAndValidity();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.aduitpurpose='';
    if (this.isEdit) {
      Object.assign(this.oldbelongingsItem, data);
      Object.assign(this.belongingsItem, data);
    }
    else {
      this.searchTerm.setValue('');
      this.belongingsItem = new Belongings();
      this.oldbelongingsItem=new Belongings();
      this.empItem = new Employee(0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', 0, '', '', 0, '', 0, '', true, 0, 0, 0);
      this.selParentRole = null;
      this.selHeadEmpId = null;
    }
    jQuery("#myModal").modal('show');
  }
  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
    headers.append("Authorization", "Bearer " + authData.token);
    let options = { headers: headers };
    return options;
  }

  getHeadBelongingsName(id: number) {
    let temp: any;
    temp = this.empMList.find(s => s.id == id);
    var name = (typeof temp != 'undefined') ? temp.firstName + ' ' + temp.lastName : '';
    return name;
  }

  getEmpList() {
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.empMList = data;
        this.employeeList = data;
      }
    }).catch(error => {
      // this.isLoading = false;
      this.empMList = [];
      this.employeeList = [];
    });
  }

  getBelongingsList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITORBELONGING_ALL).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.belongingsList = data.filter(s => s.checked).sort((a,b)=>{
                                  if(a.name > b.name) return 1;
                                  if(a.name < b.name) return -1;
                                  return 0;
                              });
        // console.log(this.belongingsList);
      }
      this.reInitDatatable();
    }).catch(error => {
      // this.isLoading = false;
      this.belongingsList = [];
    });
  }

  validatedForm: boolean = true;


  closeSaveModal() {
    //  console.log('testpop')
    jQuery("#saveModal").modal('hide');

    // window.location.reload();
  }
  onSaveBelongings() {
    this.errMsg = '';
    this.errMsgPop = '';
    this.isLoadingPop = true;
    // this.belongingsItem.fkParentId = this.selParentRole.id;
    // this.belongingsItem.headEmpId = this.selHeadEmpId.id;
    let connection: any;
    this.validatedForm = true;
    let validName = this.belongingsList.some(s => s.name.toLowerCase() == this.belongingsItem.name.toLowerCase() && s.id != this.belongingsItem.id);
    // let validCode = this.belongingsList.some(s => s.code == this.belongingsItem.code && s.id != this.belongingsItem.id);
    if (validName) {
      this.isLoadingPop = false;
      this.validatedForm = false;
      this.errMsgPop = 'Belongings name already exists..';
      // this.getBelongingsList();
    }

    // else if(validCode){
    //   this.isLoadingPop = false;
    //   this.validatedForm = false;
    //     this.errMsgPop = 'Belongings code entered already exists..';
    //     this.getBelongingsList();
    // }
    else {
      if (!this.isEdit) {
        this.auditType="Create";
        this.belongingsItem.checked = true;
        this.belongingsItem.createdBy = this.currentUser.uid;
        this.belongingsItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_VISITORBELONGING, this.belongingsItem);
      }
      else {
        this.auditType="Update";
        this.belongingsItem.modifiedBy = this.currentUser.uid;
        this.belongingsItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_VISITORBELONGING, this.belongingsItem.id, this.belongingsItem);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        //  console.log(data);
        if (data == 200 || data.id > 0) {
          //  console.log(data);
          jQuery('#myModal').modal('hide');
          this.errMsgPop1 = ' Visitor Belonging data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.belongingsItem.id;
          this.insertAuditLog(this.oldbelongingsItem,this.belongingsItem,Id);
          this.getBelongingsList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving visitor belonging..';
      });
    }
    // else{
    //   this.isLoadingPop = false;
    //   this.errMsgPop = 'Belongings already exists..';
    // }
  }
  deleteBelonging(data: Belongings): void {
    this.aduitpurpose='';
    this.belongingsItem = new Belongings();
    this.oldbelongingsItem=new Belongings();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode:true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.belongingsItem, data);
        let connection: any;
        this.auditType="Delete";
        this.belongingsItem.checked = false;
        this.belongingsItem.modifiedBy = this.currentUser.uid;
        this.belongingsItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_VISITORBELONGING, this.belongingsItem.id, this.belongingsItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.belongingsItem,this.oldbelongingsItem,this.belongingsItem.id);
            this.getBelongingsList();
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting visitor belonging..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='Visitor Belongings'; // Change MasterName
  insertAuditLog(oldObj: Belongings, newObj: Belongings, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.name = oldObj.name;
    newObject.name = newObj.name;

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
