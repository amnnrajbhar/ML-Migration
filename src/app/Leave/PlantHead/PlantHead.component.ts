import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { PlantHead } from './PlantHead.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as _ from "lodash";
declare var jQuery: any;
declare var $: any;
export class actionItemModel {
  description: string;
  id: number;
  uname: string;
}
@Component({
  selector: 'app-PlantHead',
  templateUrl: './PlantHead.component.html',
  styleUrls: ['./PlantHead.component.css']
})
export class PlantHeadcomponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) leaveForm: NgForm;
  public tableWidget: any;
  plantHeadItem: PlantHead = new PlantHead();
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
  oldPlantHeadItem: PlantHead = new PlantHead();// For aduit log
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
    let exampleId: any = jQuery('#PlantHeadTable');
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
      this.getplantHeadList();
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
    let text = $('#phempNo').val();

    if (text.length > 4) {
      let self = this;
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.getByParam(APIURLS.BR_GET_EMP_DETAILS, text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.firstName > b.firstName) return 1; if (a.firstName < b.firstName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return {
                label: item.firstName ? item.firstName : '' + item.middleName ? item.middleName : '' + item.lastName ? item.lastName : '' + " (" + item.employeeId + ")",
                value: item.employeeId, label1: item.firstName
              };
            })
            $('#phempNo').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#phempNo").val(ui.item.value);
                  $("#phempNo").val(ui.item.value);
                  self.plantHeadItem.pernr = ui.item.value;
                  self.plantHeadItem.head = ui.item.label1;
                }
                else {
                  $("#phempNo").val('');
                  $("#phempNo").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#phempNo").val(ui.item.value);
                  $("#phempNo").val(ui.item.value);
                  self.plantHeadItem.pernr = ui.item.value;
                  self.plantHeadItem.head = ui.item.label1;
                }
                else {
                  $("#phempNo").val('');
                  $("#phempNo").val('');
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

  plantHeadList: PlantHead[] = [];
  plantHead: any[] = [];
  getplantHeadList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.GET_PLANT_HEAD_DATA_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.plantHead = data;
        this.plantHeadList = this.plantHead.sort((a, b) => (a.plant < b.plant ? -1 : 1));
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantHeadList = [];
    });
  }

  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  onAddPlantHead(isEdit: boolean, data: PlantHead) {
    this.leaveForm.form.markAsPristine();
    this.leaveForm.form.markAsUntouched();
    this.leaveForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.plantHeadItem = new PlantHead();
    this.aduitpurpose = '';
    this.oldPlantHeadItem = new PlantHead();
    if (this.isEdit) {
      this.plantHeadItem = Object.assign({}, data);
    }
    else {
      this.plantHeadItem = new PlantHead();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  // Edit(data: any) {
  //   this.plantHeadItem = Object.assign({}, data)
  // }
  onSavePlantHead() {
    if(this.plantHeadItem.plant == null) {
      toastr.error("Please enter Plant...!");
      return;
    }
    if (this.plantHeadItem.emailId == null) {
      toastr.error("Please enter Plant Head EmailId...!");
      return;
    }
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;

    if (!this.isEdit) {
      if (this.plantHeadList.find(x => x.pernr == this.plantHeadItem.pernr
        && x.plant == this.plantHeadItem.plant)) {
        this.isLoadingPop = false;
        swal({
          title: "Entered location is already assigned with same Plant Head",
          icon: "warning",
          dangerMode: true
        });
      }
      else if (this.plantHeadList.find(x => x.plant == this.plantHeadItem.plant)) {
        this.isLoadingPop = false;
        swal({
          title: "Multiple Plant Heads cannot be assigned to a single location",
          icon: "warning",
          dangerMode: true
        });
      }
      else {
        this.auditType = "Create";
        this.plantHeadItem.isActive = true;
        this.plantHeadItem.createdBy = this.currentUser.employeeId;
        connection = this.httpService.LApost(APIURLS.BR_PLANTHEAD_INSERT_API, this.plantHeadItem);
      }
    }
    else {
      this.auditType = "Update";
      this.plantHeadItem.modifiedBy = this.currentUser.employeeId;
      connection = this.httpService.LAput(APIURLS.BR_PLANTHEAD_UPDATE_API, this.plantHeadItem.id, this.plantHeadItem);

    }
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.length == null) {
        jQuery("#myModal").modal('hide');
        swal({
          title: "Message",
          text: "Plant Head data saved successfully!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true],
        });
        this.isLoading = false;
        let Id = !this.isEdit ? data.id : this.plantHeadItem.id;
        this.getplantHeadList();
      }
      else
        this.errMsgPop = data;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving plant head data..';
    });

  }

  onDeletePlantHead(data: PlantHead): void {
    this.aduitpurpose = '';
    swal({
      title: "Are you sure to make it in-active ?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.plantHeadItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.plantHeadItem.isActive = false;
        this.plantHeadItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.BR_PLANTHEAD_UPDATE_API, this.plantHeadItem.id, this.plantHeadItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            swal({
              title: "Message",
              text: " Plant Head Data Deleted successfully!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true],
            });
            this.getplantHeadList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting PlantHead..';
        });
      }
    });
  }

  onDeleteNPlantHead(data: PlantHead): void {
    this.aduitpurpose = '';
    swal({
      title: "Are you sure to make it active ?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.plantHeadItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.plantHeadItem.isActive = true;
        this.plantHeadItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.BR_PLANTHEAD_UPDATE_API, this.plantHeadItem.id, this.plantHeadItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            swal({
              title: "Message",
              text: " Plant Head Data Updated successfully!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true],
            });
            this.getplantHeadList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error updating PlantHead..';
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

   getHeader(): any {
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
}
}
