import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { UserAcknowledgement } from './UserAcknowledgement.model';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-UserAcknowledgement',
  templateUrl: './UserAcknowledgement.component.html',
  styleUrls: ['./UserAcknowledgement.component.css'],
  providers: [DatePipe],
})

export class UserAcknowledgementComponent implements OnInit {
@ViewChild('filterForm', { static: false }) filterForm: any;

  searchTerm = new FormControl();
  currentUser!: AuthData;
  public tableWidget: any;
  isLoading: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  isEdit: boolean = false;
  catList: any[] = [];
  assStateList: any[] = [];
  locationList: any;
  assetList: any[] = [];
  softwaresList: any[] = [];
  softwaresList1: any[] = [];
  locationAllList: any;
  locListCon: any;
  UserAcknowledgement = {} as UserAcknowledgement;
  catCode!: any[];
  departmentList: any;
  filteredModel: any;
  catList1: any[] = [];
  softType: any[] = [];
  licType: any[] = [];
  sizeList: any[] = [];
  monType: any[] = [];
  filterreporttype: any;
  filterlocation: any;
  filterassetType: any;
  filterassetState: any;
  filterusageType: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe, private route: ActivatedRoute) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }


  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.getEmpAssetData();
    this.getAssetStateList();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getDepartList();
    this.getSizeList();
    this.getMonType();
  }

  getPlantsassigned(id:any) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
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

  CategoryList!: any[];
  getCatList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_CAT_MASTER).then((data: any) => {
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

  getAssetState(id:any) {
    let temp = this.assStateList.find((x:any)  => x.id == id);
    return temp ? temp.status : '';
  }

  onChange() {
    this.assetList = [];
    this.reInitDatatable();
  }

  clearFilter() {
   // this.filterlocation = null;
 this.filterlocation = '';
    this.filterassetType = null;
    this.filterusageType = null;
    this.filterassetState = null;
    this.assetList = [];
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
  softSTXT: any;
  softName: any;
  licSTXT: any;
  softProductKey: any;
  softVersion: any;
  expiryDate: any;
  asset_No: any;
  onUserActions(isEdit: boolean, UserAcknowledgement: UserAcknowledgement, isprint: boolean, value: string) {
    this.view = false;
    this.success = null;
    this.softwaresList1=[];
    this.errMsgPop = "";
    if (this.isEdit) {
      this.softwaresList1=this.softwaresList.filter((x:any)=>x.asset_ID == UserAcknowledgement.asset_ID);
    }
    if (value == 'View') {
      this.view = true;
      this.softwaresList1=this.softwaresList.filter((x:any)=>x.asset_ID == UserAcknowledgement.asset_ID)
      this.UserAcknowledgement = Object.assign({}, UserAcknowledgement);
    }
    jQuery('#myModal').modal('show');
  }

  getEmpAssetData() {
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.currentUser.baselocation;
    filterModel.empNo = this.currentUser.employeeId;
    this.httpService.amspost(APIURLS.BR_GET_AMS_EMP_ASSET_DETAILS, filterModel).then((data: any) => {
      if (data.table.length > 0) {
        this.assetList = data.table;
        this.softwaresList = data.table1;
        this.isLoading = false;
      }
      else if(data.table.length <= 0){
        swal({
          title: "Message",
          text: "No Asset details found for you...!!",
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.router.navigate(["/vms-homepage"]);
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  AcknowledgeAsset() {
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.acknowledge = 1;
    filterModel.comments = this.UserAcknowledgement.comments;
    filterModel.assetNo = this.UserAcknowledgement.asset_No;
    filterModel.empNo = this.UserAcknowledgement.empNo;
    filterModel.doneBy = this.UserAcknowledgement.empNo;
    this.httpService.amspost(APIURLS.BR_AMS_ACKNOWLEDGE_ASSET,filterModel).then((data: any) => {
      if (data) {
        swal({
          title: "Message",
          text: "Asset Acknowledged..!!",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.closeSaveModal();
        this.isLoading = false;
      }
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}


