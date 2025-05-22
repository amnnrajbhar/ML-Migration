import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { ApproveAssets } from './ApproveAssets.model';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
import swal from 'sweetalert';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-ApproveAssets',
  templateUrl: './ApproveAssets.component.html',
  styleUrls: ['./ApproveAssets.component.css'],
})

export class ApproveAssetsComponent implements OnInit {
@ViewChild('filterForm', { static: false }) filterForm: any;

  searchTerm = new FormControl();
  currentUser: AuthData;
  public tableWidget: any;
  dashboard: any = {};
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  isSaved: boolean = false;
  catList: any[] = [];
  assStateList: any[] = [];
  locationList: any;
  dashboardcatName: any;
  dashboardassetstate: any;
  dashboardusage: any;
  assetList: any[] = [];
  locationAllList: any;
  locListCon: any;
  ApproveAssets = {} as ApproveAssets;
  catCode: any[];
  departmentList: any;
  dashboardcatCode: any;
  filteredModel: any;
  catList1: any[] = [];
  softType: any[] = [];
  licType: any[] = [];
  filterlicType: any;
  filtersoftType: any;
  filterdepartment: any;
  filterinput: any;
  filtertype: any;
  sizeList: any[] = [];
  monType: any[] = [];
  filterreporttype: any;
  appDet: any[] = [];
  filterassetState : any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe, private route: ActivatedRoute) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }


  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getCatList();
    this.getAssetStateList();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getSoftType();
    this.getLicType();
    this.getDepartList();
    this.getbase64image();
    this.getSizeList();
    this.getMonType();
  }

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
      this.locationList = [];
    });
  }

  dropdownList1 = [];
  selectedItems1 = [];
  dropdownSettings1 = {
    singleSelection: false,
    idField: 'code',
    textField: 'location',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
  };

  onItemSelectM1(item: any) {
  }

  notFirst1 = true;
  rmnotFirst1 = true;
  checkStatus1() {
    if (this.locationList.length <= 0) this.notFirst1 = false;
  }
  checkStatusRep1() {
    if (this.locationList.length <= 0) this.rmnotFirst1 = false;
  }

  isEmpty1(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAll1() {
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
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

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  getFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  getCatList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_CAT_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.catList = data;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.catList.sort((a, b) => { return collator.compare(a.name, b.name) });
        this.catList1 = this.catList.filter((item, i, arr) => arr.findIndex((t) => t.catCode === item.catCode) === i);
      }
    }).catch(error => {
      this.catList = [];
    });
  }

  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
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

  getAssetStateList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.assStateList = data;
      }
    }).catch(error => {
      this.assStateList = [];
    });
  }

  getApproverList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.assStateList = data;
      }
    }).catch(error => {
      this.assStateList = [];
    });
  }

  getAssetState(id) {
    let temp = this.assStateList.find(x => x.id == id);
    return temp ? temp.status : '';
  }

  clearFilter() {
    this.filterlocation = null;
    this.dashboardcatName = null;
    this.dashboardassetstate = null;
    this.dashboardcatCode = null;
    this.filtertype = null;
    this.filterinput = null;
    this.filterassetState = null;
    this.assetList = [];
    this.reInitDatatable();
  }

  getSizeList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_STORAGE_SIZE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.sizeList = data;
        console.log(this.sizeList);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.sizeList = [];
    });
  }

  getStorageSize(id) {
    let temp = this.sizeList.find(x => x.storId == id);
    return temp ? temp.storTxt : '';
  }

  getMonType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_MONITOR_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.monType = data;
        console.log(this.monType);
      }
    }).catch(error => {
      this.monType = [];
    });
  }

  getMonitorType(id) {
    let temp = this.monType.find(x => x.id == id);
    return temp ? temp.type : '';
  }

  subCategorylist: any[] = []
  GetSubCategory(type) {
    this.subCategorylist = this.catList.filter(x => x.catCode == type);
  }

  getSoftType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_SOFTWARE_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.softType = data;
        console.log(this.softType);
      }
    }).catch(error => {
      this.softType = [];
    });
  }

  getSoftTypename(id) {
    let temp = this.softType.find(x => x.softId == id);
    return temp ? temp.softStxt : '';
  }

  getLicType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_LICENSE_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.licType = data;
        console.log(this.licType);
      }
    }).catch(error => {
      this.licType = [];
    });
  }

  getLicTypename(id) {
    let temp = this.licType.find(x => x.licId == id);
    return temp ? temp.licStxt : '';
  }

  image: string;
  getbase64image() {
    this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
        };

      });
  }

  success: any;
  view: boolean = false;
  onUserActions(isEdit: boolean, ApproveAssets: ApproveAssets, isprint: boolean, value: string) {
    this.view = true;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";

    this.ApproveAssets = Object.assign({}, ApproveAssets);
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#searchModal").modal('hide');
    jQuery('#myModal').modal('show');
  }

  filterlocation: any;
  // USED TO GET LIST OF ASSET REPORTS FOR APPROVAL
  getInstallationReport1() {
    if (this.filterinput == null || this.filterinput == '' && this.filterassetState != '7') {
      toastr.error("Search Text should not be left blank..!");
      return;
    }
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.filterlocation.map(x => x.code).join();
    filterModel.assetState = this.filterassetState;
    filterModel.assetType = this.dashboardcatCode;
    filterModel.category = this.dashboardcatName;
    filterModel.input = this.filterinput;
    filterModel.reportViewStatus = 0;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.assetList = [];
      this.reInitDatatable();
    });
  }

  ApprovalAssets() {
    if (this.filterinput == null) {
      toastr.error("Search Text should not be left blank..!");
      return;
    }
    this.errMsg = "";
    let connection: any;
    this.checkedRequestList.forEach(element => {
      let value = this.assetList.find(x => x.assetId == element.assetId);
      this.ApproveAssets = Object.assign({}, value);
      this.ApproveAssets.viewStatusApprover = this.currentUser.employeeId;
      this.ApproveAssets.reportViewStatus = 1;
      this.ApproveAssets.softwares = null;
      this.ApproveAssets.sizeType = this.ApproveAssets.sizeType ? this.sizeList.find(x => x.storTxt == this.ApproveAssets.sizeType).storId : '';
      this.ApproveAssets.ramSize = this.ApproveAssets.ramSize ? this.sizeList.find(x => x.storTxt == this.ApproveAssets.ramSize).storId : '';
      this.ApproveAssets.assetState = this.ApproveAssets.assetState ? this.assStateList.find(x => x.status == this.ApproveAssets.assetState).id : '';
      this.ApproveAssets.comDept = this.ApproveAssets.comDept ? this.departmentList.find(x => x.name == this.ApproveAssets.comDept).id : '';
      this.ApproveAssets.monitorType = this.ApproveAssets.monitorType ? this.monType.find(x => x.type == this.ApproveAssets.monitorType).id : '';
      this.ApproveAssets.statusApprovedDate = new Date();
      connection = this.httpService.amsput(APIURLS.GET_AMS_APPROVE_ASSET, this.ApproveAssets.assetId, this.ApproveAssets);
    }),
      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200 || output.assetId >= 0) {
          swal({
            title: "Message",
            text: "Asset approved successfully ",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.assetList = [];
          this.isMasterSel = false;
          this.clearFilter();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error approving Asset..';
      });
  }

  ApprovalAssetLTL() {
    if (this.filterinput == null) {
      toastr.error("Search Text should not be left blank..!");
      return;
    }
    this.errMsg = "";
    let connection: any;
    this.checkedRequestList.forEach(element => {
      let value = this.assetList.find(x => x.assetId == element.assetId);
      this.ApproveAssets = Object.assign({}, value);
      this.ApproveAssets.viewStatusApprover = this.currentUser.employeeId;
      this.ApproveAssets.reportViewStatus = 1;
      connection = this.httpService.amspost1(APIURLS.GET_AMS_APPROVE_ASSETLTL, this.ApproveAssets);
    }),
      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200) {
          swal({
            title: "Message",
            text: "Asset approved successfully ",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.assetList = [];
          this.isMasterSel = false;
          this.clearFilter();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error approving Asset..';
      });
  }




  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.assetList.length; i++) {
      this.assetList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }

  isAllSelected() {
    this.isMasterSel = this.assetList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }

  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.assetList.length; i++) {
      if (this.assetList[i].isSelected)
        this.checkedlist.push(this.assetList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}


