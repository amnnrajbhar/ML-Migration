import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import { ManpowerModule } from '../Reports/Manpower/Manpower.module';
import { ManpowerComponent } from '../Reports/Manpower/Manpower.component';
import { ManpowerReport } from './ManpowerReport.model';

@Component({
  selector: 'app-ManpowerReport',
  templateUrl: './ManpowerReport.component.html',
  styleUrls: ['./ManpowerReport.component.css']
})
export class ManpowerReportComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;

  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;


  public tableWidget: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string;
  filterPlant: any = null;
  filterPayGroup: any = null;
  filterDepartment: any = null;
  filterStaffcat: any = null;
  filterContractor: any = null;
  filterSubDepartment: any = null;
  departmentList: any[] = [];
  subDepartmentList: any[] = [];
  locationList: any[] = [];
  StaffCategoryList: any[] = [];
  PayGroupList: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private excelService: ExcelService) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#location');
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


  dropdownSettings1 = {
    singleSelection: true,
    idField: 'id',
    textField: 'name1',
    allowSearchFilter: true
  };
  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }

  onSelectAll() {

  }

  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      // this.getManpowerReport();
      this.getpayGroupList();
      this.getempCatList();
      this.getDepartList();
      this.getSubDeptList();
      this.getPlantsassigned(this.currentUser.fkEmpId);
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();

  }

  getpayGroupList() {
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.PayGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.PayGroupList = [];
    });
  }
  getempCatList() {
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.StaffCategoryList = data;
        //this.filterStaffcat=this.StaffCategoryList.find(x=>x.id==8).catltxt;
      }
    }).catch(error => {
      this.isLoading = false;
      this.StaffCategoryList = [];
    });
  }

  payGroupList1: any[] = [];
  getPaygroupsBasedOnPlant() {
    //this.filterPaygroup = null;
    let temp = this.locationList.find(x => x.code == this.filterPlant);
    this.payGroupList1 = temp ? this.PayGroupList.filter(x => x.plant == temp.code) : [];
  }

  getPaygroupsBasedOnPlant1() {
    //this.filterPaygroup = null;
    let temp = this.locationList.find(x => x.code == this.manPowerReport.plant);
    this.payGroupList1 = temp ? this.PayGroupList.filter(x => x.plant == temp.code) : [];
  }


  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        // this.filterPlant=this.locationList.find(x=>x.fkPlantId==this.currentUser.baselocation).code;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  getDepartList() {
    this.httpService.LAget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.departmentList = [];
      this.isLoading = false;

    });
  }

  getSubDeptList() {
    this.httpService.LAget(APIURLS.BR_MASTER_SUBDEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.subDepartmentList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.subDepartmentList = [];
    });
  }

  lastcontractkeydown = 0;
  getContractor($event) {
    let self = this;
    let text = $('#contractor').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastcontractkeydown > 400) {
        this.httpService.LAgetByParam(APIURLS.BR_API_GET_CONTRACTORS, text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.name + " (" + item.sapCodeNo + ")", value: item.sapCodeNo };
            })
            $('#contractor').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#contractorId").val(ui.item.value);
                  $("#contractor").val(ui.item.label);
                  self.manPowerReport.contractor = ui.item.value;
                }
                else {
                  $("#contractorId").val('');
                  $("#contractor").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#contractorId").val(ui.item.value);
                  $("#contractor").val(ui.item.label);
                  self.manPowerReport.contractor = ui.item.value;
                }
                else {
                  $("#contractorId").val('');
                  $("#contractor").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastcontractkeydown = $event.timeStamp;
    }
  }

  manPowerReport: ManpowerReport = new ManpowerReport();
  oldmanPowerReport: ManpowerReport = new ManpowerReport();

  OnAddNewPlanning(isEdit: boolean, data: ManpowerReport) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.manPowerReport = new ManpowerReport();
    this.oldmanPowerReport = new ManpowerReport();
    if (this.isEdit) {
      this.manPowerReport = Object.assign({}, data);
    }
    else {
      this.manPowerReport = new ManpowerReport();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  PaygroupwiseList: any[] = [];
  Contractorwiselist: any[] = [];
  getManpowerReport() {
    let filterModel: any = {};
    filterModel.fkEmpId = this.currentUser.fkEmpId;
    filterModel.location = this.filterPlant;
    filterModel.payGroup = this.filterPayGroup;
    filterModel.staffCat = this.filterStaffcat;
    filterModel.dptid = this.filterDepartment;
    filterModel.sdptid = this.filterSubDepartment;
    let connection = this.httpService.LApost(APIURLS.GET_CONTRACT_MAN_POWER_REPORT, filterModel);
    connection.then((data: any) => {
      if (data) {
        this.Contractorwiselist = data.manpowerplannig.filter(x => x.type == 'ContractorWise');
      }
      else {
        toastr.error("<i>No data found.</i>")
      }
      this.reInitDatatable();
    }).catch(error => {
      this.errMsgPop = 'Error uploading file ..';
      this.PaygroupwiseList = [];
      this.Contractorwiselist = [];
    });
  }

  ClearData() {
    this.filterStaffcat = null;
    this.filterPayGroup = null;
    this.filterDepartment = null;
    this.filterSubDepartment = null;
    this.filterContractor = null;
    this.filterPlant = null;
  }

  ClearData1() {
    this.manPowerReport.plant = null;
    this.manPowerReport.paygroup = null;
    this.manPowerReport.department = null;
    this.manPowerReport.subDepartment = null;
    this.manPowerReport.count = 0;
    this.manPowerReport.budget = 0;
    this.manPowerReport.contractor = null;
  }

  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }

  getFormattedTime(date: any) {
    let dtStartTime = new Date(date);
    return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
      ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
      ("00" + dtStartTime.getSeconds()).slice(-2);
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

getHeader(): { headers: HttpHeaders } {
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

  onSaveManpowerPlanning() {
    if (this.manPowerReport.plant == undefined || this.manPowerReport.plant == null) {
      toastr.error("<i>Please select Plant..!</i>");
      return;
    }
    else if (this.manPowerReport.paygroup == undefined || this.manPowerReport.paygroup == null) {
      toastr.error("<i>Please select PayGroup..!</i>");
      return;
    }
    else if (this.manPowerReport.department == undefined || this.manPowerReport.department == null) {
      toastr.error("<i>Please select Department..!</i>");
      return;
    }
    else if (this.manPowerReport.count == '0' || this.manPowerReport.count == null) {
      toastr.error("<i>Please select Contractor Count..!</i>");
      return;
    }
    else if (this.manPowerReport.budget == '0' || this.manPowerReport.budget == null) {
      toastr.error("<i>Please select Contractor Budget..!</i>");
      return;
    }

    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.manPowerReport.staffcat = 8;
    this.manPowerReport.createdBy = this.currentUser.employeeId;
    let connection = this.httpService.LApost(APIURLS.BR_MANPOWERPLANNING_INSERT_API, this.manPowerReport);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.type == null) {
        jQuery("#myModal").modal('hide');
        swal({
          title: "Message",
          text: "Manpower Planning Saved Successfully..!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.getManpowerReport();
        this.ClearData1();
      }
      if (data.type == 'E') {
        swal({
          title: "Message",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.ClearData1();
      }

    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving planning data..';
    });

  }

}

