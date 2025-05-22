import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { SpocDetails } from './SpocDetails.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
declare var jQuery: any;
declare var $: any;
export class actionItemModel {
  description: string;
  id: number;
  uname: string;
}
@Component({
  selector: 'app-SpocDetails',
  templateUrl: './SpocDetails.component.html',
  styleUrls: ['./SpocDetails.component.css']
})


export class SpocDetailsComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
@ViewChild(NgForm, { static: false }) leaveForm: NgForm;

  public tableWidget: any;
  SpocDetailsItem: SpocDetails = new SpocDetails();
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
  oldSpocDetailsItem: SpocDetails = new SpocDetails();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  id: any;
  checkdup: any;
  checkdup1: any;
  userList: any;
  empListCon: any[] = [];

  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent,
    private http: HttpClient) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#SpocDetailsTable');
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
      this.getSpocDetailsList();
      this.getPlantsassigned(this.currentUser.fkEmpId);
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  locationList: any[] = [[]];
  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  lastReportingkeydown = 0;
  getEmployee($event) {
    let text = $('#empNo').val();

    if (text.length > 3) {
      let self = this;
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.employeeName > b.employeeName) return 1; if (a.employeeName < b.employeeName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.employeeName + " (" + item.employeeId + ")", value: item.employeeId, label1: item.employeeName};
            })
            $('#empNo').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#empNo").val(ui.item.value);
                  $("#empNo").val(ui.item.value);
                  self.SpocDetailsItem.employeeNo = ui.item.value;
                  self.SpocDetailsItem.employeeName = ui.item.label1;
                }
                else {
                  $("#empNo").val('');
                  $("#empNo").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#empNo").val(ui.item.value);
                  $("#empNo").val(ui.item.value);
                  self.SpocDetailsItem.employeeNo = ui.item.value;
                  self.SpocDetailsItem.employeeName = ui.item.label1;
                }
                else {
                  $("#empNo").val('');
                  $("#empNo").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }

  SpocDetailsList: SpocDetails[] = [];
  getSpocDetailsList() {
    this.errMsg = "";
    this.httpService.amsget(APIURLS.GET_AMS_PLANT_IT_CONTACTS).then((data: any) => {
      if (data.length > 0) {
        this.SpocDetailsList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.SpocDetailsList = [];
    });
  }

  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  onAddSpocDetails(isEdit: boolean, data: SpocDetails) {
    this.leaveForm.form.markAsPristine();
    this.leaveForm.form.markAsUntouched();
    this.leaveForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.SpocDetailsItem = new SpocDetails();
    this.aduitpurpose = '';
    this.oldSpocDetailsItem = new SpocDetails();
    if (this.isEdit) {
      this.SpocDetailsItem = Object.assign({}, data);
    }
    else {
      this.SpocDetailsItem = new SpocDetails();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  // Edit(data: any) {
  //   this.SpocDetailsItem = Object.assign({}, data)
  // }

  onSaveSpocDetails() {
    if (this.SpocDetailsItem.mobileNo == null) {
      toastr.error("Please enter Mobile No...!");
      return;
    }
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;

    if (!this.isEdit) {
      if (this.SpocDetailsList.find(x => x.employeeNo == this.SpocDetailsItem.employeeNo
        && x.location == this.SpocDetailsItem.location)) {
        this.isLoadingPop = false;
        swal({
          title: "Entered location is already assigned with IT Person",
          icon: "warning",
          dangerMode: true
        });
      }
      else {
        this.auditType = "Create";
        this.SpocDetailsItem.isActive = true;
        this.SpocDetailsItem.createdBy = this.currentUser.employeeId;
        connection = this.httpService.amspost(APIURLS.BR_AMS_SPOC_DETAILS_INSERT, this.SpocDetailsItem);
      }
    }
    else {
        this.auditType = "Update";
        this.SpocDetailsItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.amsput(APIURLS.BR_AMS_SPOC_DETAILS_UPDATE, this.SpocDetailsItem.id, this.SpocDetailsItem);
    }
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.length == null) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = ' IT Contact data saved successfully!';
        jQuery("#saveModal").modal('show');
        let Id = !this.isEdit ? data.id : this.SpocDetailsItem.id;
        this.getSpocDetailsList();
      }
      else
        this.errMsgPop = data;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving IT Contact data..';
    });

  }

  onDeleteSpocDetails(data: SpocDetails): void {
    this.aduitpurpose = '';
    swal({
      title: "Are you sure to make it in-active ?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.SpocDetailsItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.SpocDetailsItem.isActive = false;
        this.SpocDetailsItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.amsput(APIURLS.BR_AMS_SPOC_DETAILS_UPDATE, this.SpocDetailsItem.id, this.SpocDetailsItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' IT Contact Data Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.getSpocDetailsList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Details..';
        });
      }
    });
  }

  onDeleteNSpocDetails(data: SpocDetails): void {
    this.aduitpurpose = '';
    swal({
      title: "Are you sure to make it active ?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.SpocDetailsItem, data);
        let connection: any;  
        this.auditType = "Delete";
        this.SpocDetailsItem.isActive = true;
        this.SpocDetailsItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.amsput(APIURLS.BR_AMS_SPOC_DETAILS_UPDATE, this.SpocDetailsItem.id, this.SpocDetailsItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' IT Contact Data Updated successfully!';
            jQuery("#saveModal").modal('show');
            this.getSpocDetailsList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error updating Details..';
        });
      }
    });
  }

  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_BASE_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res);
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );
    });
    return promise;
  }

getHeader(): { headers: HttpHeaders } {
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}
}
