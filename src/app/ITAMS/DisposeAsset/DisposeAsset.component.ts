import { Component, OnInit, ViewEncapsulation } from '@angular/core';
declare var jQuery: any;
import swal from 'sweetalert';
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { AuthData } from '../../auth/auth.model';
import { HttpService } from '../../shared/http-service';
import { DisposeAsset } from '../DisposeAsset/DisposeAsset.model';
declare var $: any;

@Component({
  selector: 'app-DisposeAsset',
  templateUrl: './DisposeAsset.component.html',
  styleUrls: ['./DisposeAsset.component.css']
})
export class DisposeAssetComponent implements OnInit {

  public tableWidget: any;
  dashboard: any = {};
  isLoading: boolean = false;
  currentUser!: AuthData;
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
  filterstatus: any;
  sizeList: any;
  softType: any;
  licType: any;
  locationAllList: any;
  locListCon: any;
  filterlocation: any;
  assetList: any;
  Comments: any;
  DisposeAsset = {} as DisposeAsset;
  newassState: string
  monType: any[] = [];
  departmentList: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#assetTable');
    this.tableWidget = exampleId.DataTable({
      order: []
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
    console.log(this.path);
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.getAssetStateList();
    this.getLocationMaster();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    //this.getAllEntries();
    this.getSizeList();
    this.getMonType();
    this.getDepartList();
  }

  ngAfterViewInit() {
    this.initDatatable();
  }


  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter((x:any)  => x.isActive);
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

 

  getAssetStateList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.assStateList = data;
        console.log(this.assStateList);
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.assStateList = [];
    });
  }

  getAssetState(id:any) {
    let temp = this.assStateList.find((x:any)  => x.id == id);
    return temp ? temp.status : '';
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

  getAllEntries() {
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.Location = this.filterlocation;
    filterModel.AssStatus = 5;
    let serchstr = this.filterlocation + ',' + '5';
    this.httpService.amsgetByParam(APIURLS.BR_GET_AMS_ASSET_DATA_MASTER, serchstr).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.assetList = [];
    });
  }

  clearFilter() {
   // this.filterlocation = null;
 this.filterlocation = '';
  // this.filterstatus = null;
  this.filterstatus = '';
  }

  resetForm() {
    this.errMsg = "";
    this.DisposeAsset.vendorcode = null;
    this.DisposeAsset.vendorname = null;
    this.DisposeAsset.vendorcity = null;
    this.DisposeAsset.newassState = null;
    this.clearFilter();
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

  success: any;
  view: boolean = false;
  onUserActions(isedit: boolean, DisposeAsset: DisposeAsset, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.view = false;
    this.resetForm();
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";
    if (isedit) {
      this.DisposeAsset = Object.assign({}, DisposeAsset);
    }
    else {
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#searchModal").modal('hide');
    jQuery('#myModal').modal('show');
  }

  onUserActions1(isedit: boolean, DisposeAsset: DisposeAsset, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";
    this.strassetId = "";
    this.getCheckedItemList();
    jQuery("#searchModal").modal('hide');
    jQuery('#myModal1').modal('show');
  }

  onSaveEntry(status:any) {
    this.errMsg = "";
    let connection: any;
    if (this.DisposeAsset.newassState != '6') {
      swal({
        title: "Message",
        text: "Asset Status not changed",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      this.DisposeAsset.location = this.filterlocation;
      this.DisposeAsset.assetState = this.DisposeAsset.newassState;
      this.DisposeAsset.modifiedBy = this.currentUser.employeeId;
      this.DisposeAsset.viewStatusApprover = null;
      this.DisposeAsset.statusApprovedDate = null;
      this.DisposeAsset.reportViewStatus = 0;
      this.DisposeAsset.vendorcity = this.DisposeAsset.vendorcity;
      this.DisposeAsset.vendorcode = this.DisposeAsset.vendorcode;
      this.DisposeAsset.vendorname = this.DisposeAsset.vendorname;

      connection = this.httpService.amspost1(APIURLS.BR_GET_AMS_DISPOSE_ASSET, this.DisposeAsset);

      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200 || output.id >= 0) {
          swal({
            title: "Message",
            text: "Asset disposed successfully ",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.resetForm();
          this.closeSaveModal();
          this.reInitDatatable();
          this.isLoading = false;
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving status..';
      });
    }
  }

  statuslist: any[] = [
    { id: 1, name: 'In Use' },
    { id: 2, name: 'In Repair' },
    { id: 3, name: 'Decomissioned' },
    { id: 4, name: 'In store' },
    { id: 5, name: 'Retired' },
    { id: 6, name: 'Dispose' },
    { id: 7, name: 'Transferred' },
    { id: 8, name: 'Sold' }
  ];

  isMasterSel: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.assetList.length; i++) {
      this.assetList[i].isSelected = this.isMasterSel;
    }
  }

  isAllSelected() {
    this.isMasterSel = this.assetList.every(function (item: any) {
      return item.isSelected == true;
    })
  }

  strassetId : string
  checkedRequestList: any;
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.assetList.length; i++) {
      if (this.assetList[i].isSelected)
        //this.checkedlist.push(this.assetList[i].assetId);
        if(this.strassetId == undefined || this.strassetId == '' )
        {
          this.strassetId = this.assetList[i].assetId;
        }
        else {
          this.strassetId= this.strassetId + ',' + this.assetList[i].assetId;
        }
    }
    this.DisposeAsset.strassetId = this.strassetId;
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
    jQuery("#myModal1").modal('hide');
  }
}
