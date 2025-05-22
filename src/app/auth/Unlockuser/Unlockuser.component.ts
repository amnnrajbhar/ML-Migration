import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Lockout } from './Unlockuser.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import * as _ from "lodash";
declare var jQuery: any;
export class actionItemModel {
  name: string;
  description: string;
}
@Component({
  selector: 'app-Unlockuser',
  templateUrl: './Unlockuser.component.html',
  styleUrls: ['./Unlockuser.component.css']
})
export class UnlockuserComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
@ViewChild(NgForm, { static: false }) desigForm: NgForm;

  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  UnlockuserList: any[];
  UnlockuserList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  UnlockuserItem: Lockout = new Lockout();
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
  oldUnlockuserItem: Lockout = new Lockout();// For aduit log
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
      this.getUnlockuserMasterList();
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

  EmployeeID: string = '';
  getUnlockuserMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_MASTER_LOCKOUT_BY_PARAM_API, this.EmployeeID).then((data: any) => {
      if (data.length > 0) {
        this.UnlockuserList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      else {
        swal({
          title: "No Employee found, Please check employeeId",
          icon: "warning",
          dangerMode: true,
          buttons: [false, true],
        })
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.UnlockuserList = [];
    });
  }

  onAddUnlockuser(isEdit: boolean, data: Lockout) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.UnlockuserItem = new Lockout();
    this.aduitpurpose = '';
    this.oldUnlockuserItem = new Lockout();
    if (this.isEdit) {
      Object.assign(this.oldUnlockuserItem, data);
      this.UnlockuserItem = Object.assign({}, data);
    }
    else {
      this.UnlockuserItem = new Lockout();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSaveUnlockuser(data: Lockout) {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    // if (!this.UnlockuserList.some(s => s.name.toLowerCase() == this.UnlockuserItem.name.toLowerCase() && s.id != this.UnlockuserItem.id)) {
    this.UnlockuserItem = Object.assign({}, data);
    this.auditType = "Update";
    this.UnlockuserItem.count = 0;
    this.UnlockuserItem.lockoutFlag= false;
    this.UnlockuserItem.lockoutDate = null;
    this.UnlockuserItem.modifiedBy = this.currentUser.employeeId;
    //    this.UnlockuserItem.modifiedDate = new Date().toLocaleString();
    connection = this.httpService.put(APIURLS.BR_MASTER_LOCKOUT_BYID_API, this.UnlockuserItem.id, this.UnlockuserItem);


    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.length == null) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = ' User unlocked successfully!';
        jQuery("#saveModal").modal('show');
        let Id = !this.isEdit ? data.id : this.UnlockuserItem.id;
        this.getUnlockuserMasterList();
      }
      else
        this.errMsgPop = data;

    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error unlocking user..';
    });

  }
  UpdatePassword() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    // if (!this.UnlockuserList.some(s => s.name.toLowerCase() == this.UnlockuserItem.name.toLowerCase() && s.id != this.UnlockuserItem.id)) {
    if (!this.isEdit) {
      this.auditType = "Create";
      this.UnlockuserItem.isActive = true;
      this.UnlockuserItem.modifiedBy = this.currentUser.employeeId;
      this.UnlockuserItem.passwordReset = true;
      // this.UnlockuserItem.modifiedDate = new Date().toLocaleString();
      connection = this.httpService.post(APIURLS.BR_MASTER_LOCKOUT_BYID_API, this.UnlockuserItem);
    }
    else {
      this.auditType = "Update";
      this.UnlockuserItem.count = 0;
      this.UnlockuserItem.lockoutDate = null;
      this.UnlockuserItem.passwordReset = true;
      this.UnlockuserItem.modifiedBy = this.currentUser.employeeId;
      //    this.UnlockuserItem.modifiedDate = new Date().toLocaleString();
      connection = this.httpService.put(APIURLS.BR_MASTER_LOCKOUT_BYID_API, this.UnlockuserItem.id, this.UnlockuserItem);
    }

    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.length == null) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = ' Password reset done successfully!';
        jQuery("#saveModal").modal('show');
        let Id = !this.isEdit ? data.id : this.UnlockuserItem.id;
        this.getUnlockuserMasterList();
      }
      else
        this.errMsgPop = data;

    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error unlocking user..';
    });
  }
  deleteUnlockuser(data: Lockout): void {
    this.UnlockuserItem = new Lockout();
    this.aduitpurpose = '';
    this.oldUnlockuserItem = new Lockout();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.UnlockuserItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.UnlockuserItem.isActive = false;
        this.UnlockuserItem.modifiedBy = this.currentUser.employeeId;
        this.UnlockuserItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_LOCKOUT_BYID_API, this.UnlockuserItem.id, this.UnlockuserItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.getUnlockuserMasterList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Unlockuser..';
        });
      }
    });
  }

}
