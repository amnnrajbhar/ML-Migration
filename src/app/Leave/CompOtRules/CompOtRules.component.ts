import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { CompOtRules } from './CompOtRules.model';
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
  selector: 'app-CompOtRules',
  templateUrl: './CompOtRules.component.html',
  styleUrls: ['./CompOtRules.component.css']
})
export class CompOtRulescomponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) leaveForm: NgForm;
  public tableWidget: any;
  compotrulesItem: CompOtRules = new CompOtRules();
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
  oldcompotrulesItem: CompOtRules = new CompOtRules();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  id: any;
  locationAllList: any;
  locationList: any[] = [];
  workTypeList: any[] = [];
  locListCon: any;
  leaveList: any;
  checkdup: any[] = [];
  CompOtRulesList: any;

  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent,
    private http: Http) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#LeaveReasonTable');
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
      this.getCompOtRulesList();
      this.getempCatList();
      this.getplantMaster();
      this.getpayGroupList();
      this.getgradeList();
      this.getWorkTypeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  leaveReasonList: any[] = [];
  getCompOtRulesList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.BR_COMPOTRULES_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.CompOtRulesList = data.filter(x => x.isActive == true);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.CompOtRulesList = [];
    });
  }

  getPlantname(id) {
    let temp = this.locationList.find(x => x.id == id);
    return temp ? temp.code : '';
  }

  getPaygroupname(id) {
    let temp = this.payGroupList.find(x => x.id == id);
    return temp ? temp.short_desc : '';
  }

  getStaffcatname(id) {
    let temp = this.empCatList.find(x => x.id == id);
    return temp ? temp.catltxt : '';
  }

  getGradeName(id) {
    let temp = this.gradeList.find(x => x.id == id)
    return temp ? (temp.grdid + ' -- ' + temp.grdtxt) : '';
  }

  getWorkType(id) {
    let temp = this.workTypeList.find(x => x.id == id)
    return temp ? (temp.workTypeLongDesc) : '';
  }

  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  onAddCompOtRules(isEdit: boolean, data: CompOtRules) {
    this.leaveForm.form.markAsPristine();
    this.leaveForm.form.markAsUntouched();
    this.leaveForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.compotrulesItem = new CompOtRules();
    this.aduitpurpose = '';
    this.compotrulesItem = new CompOtRules();
    if (this.isEdit) {
      this.compotrulesItem = Object.assign({}, data);
    }
    else {
      this.compotrulesItem = new CompOtRules();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  Edit(data: any) {
    this.compotrulesItem = Object.assign({}, data)

  }

  onSaveCompOtRules() {
    if (this.compotrulesItem.plant == undefined || this.compotrulesItem.plant == null) {
      toastr.error("Please select Plant..!");
      return;
    }
    else if (this.compotrulesItem.paygroup == undefined || this.compotrulesItem.paygroup == null) {
      toastr.error("Please select PayGroup..!");
      return;
    }
    else if (this.compotrulesItem.staffcategory == undefined || this.compotrulesItem.staffcategory == null) {
      toastr.error("Please select Emp Category..!");
      return;
    }
    else if (this.compotrulesItem.grade == undefined || this.compotrulesItem.grade == null) {
      toastr.error("Please select Grade/Designation..!");
      return;
    }
    else if (this.compotrulesItem.workType == undefined || this.compotrulesItem.workType == null) {
      toastr.error("Please select Work Type..!");
      return;
    }
    else if (this.compotrulesItem.type == undefined || this.compotrulesItem.type == null) {
      toastr.error("Please select Type..!");
      return;
    }

    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    if (!this.isEdit) {
      if (this.CompOtRulesList.find(x => x.plant == this.compotrulesItem.plant && x.paygroup == this.compotrulesItem.paygroup && x.staffcategory == this.compotrulesItem.staffcategory &&
        x.grade == this.compotrulesItem.grade &&
        x.workType == this.compotrulesItem.workType && x.type == this.compotrulesItem.type)) {
        this.isLoadingPop = false;
        swal({
          title: "Entered Rule already exists..cannot Create..!",
          icon: "error",
          dangerMode: true,
        });
        return;
      }
      this.auditType = "Create";
      this.compotrulesItem.isActive = true;
      this.compotrulesItem.createdBy = this.currentUser.employeeId;
      connection = this.httpService.LApost(APIURLS.BR_COMPOTRULES_INSERT_API, this.compotrulesItem);
    }
    else {
      if (this.CompOtRulesList.find(x => x.plant == this.compotrulesItem.plant && x.paygroup == this.compotrulesItem.paygroup && x.staffcategory == this.compotrulesItem.staffcategory &&
        x.grade == this.compotrulesItem.grade &&
        x.workType == this.compotrulesItem.workType && x.type == this.compotrulesItem.type)) {
        this.isLoadingPop = false;
        swal({
          title: "Entered Rule already exists..cannot Update..!",
          icon: "error",
          dangerMode: true,
        });
        return;
      }
      this.auditType = "Update";
      this.compotrulesItem.modifiedBy = this.currentUser.employeeId;
      connection = this.httpService.LAput(APIURLS.BR_COMPOTRULES_INSERT_API, this.compotrulesItem.id, this.compotrulesItem);
    }

    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.length == null) {
        jQuery("#myModal").modal('hide');
        swal({
          title: "Message",
          text: "Compoff/Overtime Rule has been added successfully!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true],
        });
        this.isLoading = false;
        let Id = !this.isEdit ? data.id : this.compotrulesItem.id;
        this.getCompOtRulesList();
      }
      else
        this.errMsgPop = data;

    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving CompOtRules data..';
    });
  }
  deleteCompOtRules(data: CompOtRules): void {
    this.compotrulesItem = new CompOtRules();
    this.aduitpurpose = '';
    this.oldcompotrulesItem = new CompOtRules();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.compotrulesItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.compotrulesItem.isActive = false;
        this.compotrulesItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.BR_COMPOTRULES_DELETE, this.compotrulesItem.id, this.compotrulesItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.leavId > 0) {
            swal({
              title: "Message",
              text: "Compoff/OverTime Rule has been deleted successfully!",
              icon: "success",
              dangerMode: false,
              buttons: [false, true],
            });
            this.isLoading = false;
            this.getCompOtRulesList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Comp OT Rules..';
        });
      }
    });
  }

  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }

  empCatList: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.empCatList = [];
    });
  }

  getplantMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  getWorkTypeList() {
    this.httpService.LAget(APIURLS.BR_MASTER_WORKTYPE_API).then((data: any) => {
      if (data.length > 0) {
        this.workTypeList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.workTypeList = [];
    });
  }

  gradeList: any[] = [];
  getgradeList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.BR_MASTER_GRADE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.gradeList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.gradeList = [];
    });
  }

  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => {
            resolve(res.json());
          },
          err => {
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
