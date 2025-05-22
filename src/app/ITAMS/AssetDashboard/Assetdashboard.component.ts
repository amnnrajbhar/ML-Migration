import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { AssetDashboard } from './Assetdashboard.model';
// import { FileSaver }  from 'angular-file-saver';
// import { saveAs } from 'file-saver';
declare var $: any;

@Component({
  selector: 'app-Assetdashboard',
  templateUrl: './Assetdashboard.component.html',
  styleUrls: ['./Assetdashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
  assStateList: any;
  locationList: any;
  dashboardcategory: any;
  dashboardassetstate: any;
  dashboardusage: any;
  AssetDashboard = {} as AssetDashboard;
  assetList: any;
  locationAllList: any;
  locListCon: any;
  dashboardlocation: any;
  sizeList: any[] = [];
  monType: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private route: ActivatedRoute) { }


  ngOnInit() {
    this.path = this.router.url;    
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(this.path);
    this.getCatList();
    this.getAssetStateList();
    this.getLocationMaster();
    this.getSizeList();
    this.getMonType();
    this.getPlantsassigned(this.currentUser.fkEmpId);
  }

  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
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

  plantList:any[]=[];
  getPlantsassigned(id)
  {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter(x=>{ return x.isActive;}).map((i) => { i.location = i.code + '-' + i.name; return i; });;          
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });          
        this.plantList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch(error => {
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

  getCatList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_CAT_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.catList = data;
      }
    }).catch(error => {
      this.catList = [];
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

  getAssetState(id) {
    let temp = this.assStateList.find(x => x.id == id);
    return temp ? temp.status : '';
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

  getAllEntries() {
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.dashboardlocation;
    filterModel.category = this.dashboardcategory;
    filterModel.usageType = this.dashboardusage;
    filterModel.assetState = this.dashboardassetstate;
    //let serchstr = this.dashboardlocation + ',' + this.dashboardcatName + ',' + this.dashboardusage + ',' + this.dashboardassetstate;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  clearFilter() {
    this.dashboardlocation = null;
    this.dashboardcategory = null;
    this.dashboardassetstate = null;
    this.dashboardusage = null;
  }

  success: any;
  view: boolean = false;
  onUserActions(AssetDashboard: AssetDashboard, isprint: boolean, value: string) {
    this.AssetDashboard = Object.assign({}, AssetDashboard);
    this.view = false;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";

    if (value == 'View') {
      this.view = true;
    }

    jQuery("#searchModal").modal('hide');
    jQuery('#myModal').modal('show');
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}
