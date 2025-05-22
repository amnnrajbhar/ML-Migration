import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { LeaveType } from './LeaveType.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from "lodash";
declare var jQuery: any;
export class actionItemModel {
  description: string;
  id: number;
  uname: string;
}
@Component({
  selector: 'app-LeaveType',
  templateUrl: './LeaveType.component.html',
  styleUrls: ['./LeaveType.component.css']
})
export class LeaveTypecomponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) leaveForm: NgForm;
  public tableWidget: any;
  leavetypeItem: LeaveType = new LeaveType();
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
  oldleavetypeItem: LeaveType = new LeaveType();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  leavetypeList: any;
  id: any;
  checkdup: any;

  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent,
    private http: Http) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#LeaveTypeTable');
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
      this.getLeaveTypeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }


  leaveTypeList: LeaveType[] = [];
  getLeaveTypeList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.GET_LEAVE_TYPES_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.leaveTypeList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.leaveTypeList = [];
    });
  }

  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  onAddLeave(isEdit: boolean, data: LeaveType) {
    this.leaveForm.form.markAsPristine();
    this.leaveForm.form.markAsUntouched();
    this.leaveForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.leavetypeItem = new LeaveType();
    this.aduitpurpose = '';
    this.oldleavetypeItem = new LeaveType();
    if (this.isEdit) {
      this.leavetypeItem = Object.assign({}, data);
    }
    else {
      this.leavetypeItem = new LeaveType();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  Edit(data: any) {
    this.leavetypeItem = Object.assign({}, data)
  }
  onSaveLeave() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    this.checkdup = this.leaveTypeList.find(x => x.lvType == this.leavetypeItem.lvType && x.lvTypeid == this.leavetypeItem.lvTypeid && x.lvShrt == this.leavetypeItem.lvShrt)
    if (this.checkdup != null) {
      this.isLoadingPop = false;
      swal({
        title: "Entered leave type is already exists.",
        icon: "warning",
        dangerMode: true
      })
    }
    else {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.leavetypeItem.isActive = true;
        this.leavetypeItem.createdBy = this.currentUser.employeeId;
        connection = this.httpService.LApost(APIURLS.BR_LEAVETYPE_INSERT_API, this.leavetypeItem);
      }
      else {
        this.auditType = "Update";
        this.leavetypeItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.BR_LEAVETYPE_INSERT_API, this.leavetypeItem.id, this.leavetypeItem);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' Leave Type data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.leavetypeItem.id;
          this.getLeaveTypeList();
        }
        else
          this.errMsgPop = data;
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving department data..';
      });
    }
  }

  deleteLeave(data: LeaveType): void {
    this.leavetypeItem = new LeaveType();
    this.aduitpurpose = '';
    this.oldleavetypeItem = new LeaveType();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.leavetypeItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.leavetypeItem.isActive = false;
        this.leavetypeItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.BR_LEAVETYPE_DELETE, this.leavetypeItem.id, this.leavetypeItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Leave Type Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.getLeaveTypeList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting LeaveType..';
        });
      }
    });
  }

  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res.json());
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );
    });
    return promise;
  }

  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
  }
}
