import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { ApproveAsset } from './ApproveAsset.model';
//import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
//import * as fs from 'file-saver';
import swal from 'sweetalert';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-ApproveAsset',
  templateUrl: './ApproveAsset.component.html',
  styleUrls: ['./ApproveAsset.component.css'],
})

export class ApproveAssetComponent implements OnInit {
@ViewChild('filterForm', { static: false }) filterForm: any;

  searchTerm = new FormControl();
  currentUser!: AuthData;
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
  dashboardlocation: any;
  ApproveAsset = {} as ApproveAsset;
  catCode!: any[];
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
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe, private route: ActivatedRoute) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }


  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.getCatList();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getAssetStateList();
    this.getLocationMaster();
    this.getSoftType();
    this.getLicType();
    this.getDepartList();
    this.getbase64image();
    this.getSizeList();
    this.getMonType();
  }

  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        if (this.currentUser.fkProfileId == 1 || this.currentUser.fkProfileId == 1014) {
          this.locationList = data.filter((x:any)  => x.isActive);
        }
        else {
          this.locationList = data.filter((x:any)  => x.isActive && x.id == this.currentUser.baselocation);
        }
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x:any) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }


  plantList:any[]=[];
  getPlantsassigned(id:any)
  {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter((x:any)=>{ return x.isActive;}).map((i:any) => { i.location = i.code + '-' + i.name; return i; });;          
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });          
        this.plantList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantList = [];
    });
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
        this.catList.sort((a:any, b:any) => { return collator.compare(a.name, b.name) });
        this.catList1 = this.catList.filter((item, i, arr) => arr.findIndex((t) => t.catCode === item.catCode) === i);
      }
    }).catch((error)=> {
      this.catList = [];
    });
  }

  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.departmentList = [];
      this.isLoading = false;

    });
  }

  getAssetStateList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.assStateList = data;
      }
    }).catch((error)=> {
      this.assStateList = [];
    });
  }

  getApproverList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.assStateList = data;
      }
    }).catch((error)=> {
      this.assStateList = [];
    });
  }

  getAssetState(id:any) {
    let temp = this.assStateList.find((x:any)  => x.id == id);
    return temp ? temp.status : '';
  }

  clearFilter() {
    this.dashboardlocation = null;
    this.dashboardcatName = null;
    this.dashboardassetstate = null;
    this.dashboardcatCode = null;
    this.filtertype = null;
    this.filterinput = null;
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
    }).catch((error)=> {
      // this.isLoading = false;
      this.sizeList = [];
    });
  }

  getStorageSize(id:any) {
    let temp = this.sizeList.find((x:any)  => x.storId == id);
    return temp ? temp.storTxt : '';
  }

  getMonType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_MONITOR_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.monType = data;
        console.log(this.monType);
      }
    }).catch((error)=> {
      this.monType = [];
    });
  }

  getMonitorType(id:any) {
    let temp = this.monType.find((x:any)  => x.id == id);
    return temp ? temp.type : '';
  }

  subCategorylist: any[] = []
  GetSubCategory(type) {
    this.subCategorylist = this.catList.filter((x:any)  => x.catCode == type);
  }

  getSoftType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_SOFTWARE_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.softType = data;
        console.log(this.softType);
      }
    }).catch((error)=> {
      this.softType = [];
    });
  }

  getSoftTypename(id:any) {
    let temp = this.softType.find((x:any)  => x.softId == id);
    return temp ? temp.softStxt : '';
  }

  getLicType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_LICENSE_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.licType = data;
        console.log(this.licType);
      }
    }).catch((error)=> {
      this.licType = [];
    });
  }

  getLicTypename(id:any) {
    let temp = this.licType.find((x:any)  => x.licId == id);
    return temp ? temp.licStxt : '';
  }

  image!: string
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
  onUserActions(isEdit: boolean, ApproveAsset: ApproveAsset, isprint: boolean, value: string) {
    this.view = true;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";

    this.ApproveAsset = Object.assign({}, ApproveAsset);
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#searchModal").modal('hide');
    jQuery('#myModal').modal('show');
  }

  // USED TO GET LIST OF ASSET REPORTS FOR APPROVAL
  getInstallationReport1() {
    if (this.filterinput == null || this.filterinput == '') {
      toastr.error("Search Text should not be left blank..!");
      return;
    }
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.dashboardlocation;
    filterModel.category = this.dashboardcatName;
    filterModel.assetType = this.dashboardcatCode;
    filterModel.input = this.filterinput;
    filterModel.reportViewStatus = 0;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.assetList = [];
      this.reInitDatatable();
    });
  }

  approveAsset() {
    if (this.filterinput == null) {
      toastr.error("Search Text should not be left blank..!");
      return;
    }
    this.errMsg = "";
    let connection: any;
    this.checkedRequestList.forEach((element:any)=> {

      let value = this.assetList.find((x:any)  => x.assetId == element.assetId);
      this.ApproveAsset = Object.assign({}, value);
      this.ApproveAsset.viewStatusApprover = this.currentUser.employeeId;
      this.ApproveAsset.reportViewStatus = 1;
      this.ApproveAsset.softwares = null;
      this.ApproveAsset.sizeType = this.ApproveAsset.sizeType ? this.sizeList.find((x:any)  => x.storTxt == this.ApproveAsset.sizeType).storId : '';
      this.ApproveAsset.ramSize = this.ApproveAsset.ramSize ? this.sizeList.find((x:any)  => x.storTxt == this.ApproveAsset.ramSize).storId : '';
      this.ApproveAsset.assetState = this.ApproveAsset.assetState ? this.assStateList.find((x:any)  => x.status == this.ApproveAsset.assetState).id : '';
      this.ApproveAsset.comDept = this.ApproveAsset.comDept ? this.departmentList.find((x:any)  => x.name == this.ApproveAsset.comDept).id : '';
      this.ApproveAsset.monitorType = this.ApproveAsset.monitorType ? this.monType.find((x:any)  => x.type == this.ApproveAsset.monitorType).id : '';
      this.ApproveAsset.statusApprovedDate = new Date();
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.ApproveAsset.assetId, this.ApproveAsset);
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
          this.reInitDatatable();
          this.clearFilter();
        }
      }).catch((error)=> {
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


