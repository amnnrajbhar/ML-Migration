import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { AssetSummary } from './AssetSummary.model';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
// import { FileSaver }  from 'angular-file-saver';
// import { saveAs } from 'file-saver';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-AssetSummary',
  templateUrl: './AssetSummary.component.html',
  styleUrls: ['./AssetSummary.component.css']
})
export class AssetSummaryComponent implements OnInit {
  @ViewChild('filterForm') filterForm: any;
  searchTerm = new FormControl();
  currentUser: AuthData;
  public tableWidget: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  isSaved: boolean = false;
  catList = [];
  assStateList: any;
  locationList: any;
  dashboardcategory: any;
  dashboardassetstate: any;
  dashboardusage: any;
  AssetSummary = {} as AssetSummary;
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
    this.getPlantsassigned(this.currentUser.fkEmpId);
  }

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
    itemsShowLimit: 4,
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

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'catName',
    textField: 'catName',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectM(item: any) {
  }

  notFirst = true;
  rmnotFirst = true;
  checkStatus() {
    if (this.catList.length <= 0) this.notFirst = false;
  }
  checkStatusRep() {
    if (this.catList.length <= 0) this.rmnotFirst = false;
  }

  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAll() {
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

  dropdownList2 = [];
  selectedItems2 = [];
  dropdownSettings2 = {
    singleSelection: false,
    idField: 'id',
    textField: 'status',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectA(item: any) {
  }

  notFirstA = true;
  rmnotFirstA = true;
  checkStatusA() {
    if (this.assStateList.length <= 0) this.notFirstA = false;
  }
  checkStatusRepA() {
    if (this.assStateList.length <= 0) this.rmnotFirstA = false;
  }

  isEmptyA(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAllA() {
  }

  usageList: any[] = [
    { id: 1, name: 'User' },
    { id: 2, name: 'Common' },
    { id: 3, name: 'Instrument' },
    { id: 4, name: 'Field Staff' }
  ];

  dropdownList3 = [];
  selectedItemsU = [];
  dropdownSettings3 = {
    singleSelection: false,
    idField: 'name',
    textField: 'name',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectU(item: any) {
  }

  notFirstU = true;
  rmnotFirstU = true;
  checkStatusU() {
    if (this.usageList.length <= 0) this.notFirstU = false;
  }
  checkStatusRepU() {
    if (this.usageList.length <= 0) this.rmnotFirstU = false;
  }

  isEmptyU(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAllU() {
  }

  getAllEntries() {
    if(this.dashboardlocation == null){
      toastr.error("Please enter Location...!");
      return;
    }
    else if(this.dashboardcategory == null){
      toastr.error("Please enter Category...!");
      return;
    }
    else if(this.dashboardusage == null){
      toastr.error("Please enter Usage Type...!");
      return;
    }
    else if(this.dashboardassetstate == null){
      toastr.error("Please enter Asset State...!");
      return;
    }
    this.assetList = [];
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.dashboardlocation.map(x=>x.code).join();
    filterModel.category = this.dashboardcategory.map(x=>x).join();
    filterModel.usageType = this.dashboardusage.map(x=>x).join();
    filterModel.assetState = this.dashboardassetstate.map(x=>x.id).join();
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_DASHBOARD_COUNT, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.reInitDatatable();
    });
  }

  clearFilter() {
    this.dashboardlocation = null;
    this.dashboardcategory = null;
    this.dashboardassetstate = null;
    this.dashboardusage = null;
    this.assetList=[];
    this.reInitDatatable();
  }

  success: any;
  view: boolean = false;
  onUserActions(AssetSummary: AssetSummary, isprint: boolean, value: string) {
    this.AssetSummary = Object.assign({}, AssetSummary);
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

  exportToExcel() {
    const title = 'Asset Summary Report';
    const header = ["Sl No","Location","VDI", "Dotmatrix", "Router ", "Deskjet", "Laptop", "Desktop", "Server", "Laser", "MFP", "Switch",
    "Video Camera", "Firewall", "Mini Laptop", "Scanner", "Tape Drive", "Fire Proof Cabinet", "IP Phone", "Smart Cabinet", "Datamax",
    "Disk Storage", "Tablets", "Projector", "Projector Screen", "VC Camera", "VC Speakers", "VC Microphone", "VC Controller",
    "Wireless Presenter", "Interactive Panel/ Display", "WiFi AP", "Biometric", "PBX"]

    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.assetList.forEach(element => {
      index = index + 1;
      ts = {};
      ts.slNo = index;
      ts.location = element.location;
      ts.vdi = element.vdi;
      ts.dotmatrix = element.dotmatrix;
      ts.router = element.router;
      ts.deskjet = element.deskjet;
      ts.laptop = element.laptop;
      ts.desktop = element.desktop;
      ts.server = element.server;
      ts.laser = element.laser;
      ts.mfp = element.mfp;
      ts.switch = element.switch;
      ts.videoCamera = element.videoCamera;
      ts.firewall = element.firewall;
      ts.miniLaptop = element.miniLaptop;
      ts.scanner = element.scanner;
      ts.tapeDrive = element.tapeDrive;
      ts.fireProofCabinet = element.fireProofCabinet;
      ts.ipPhone = element.ipPhone;
      ts.smartCabinet = element.smartCabinet;
      ts.datamax = element.datamax;
      ts.diskStorage = element.diskStorage;
      ts.tablets = element.tablets;
      ts.projector = element.projector;
      ts.projectorScreen = element.projectorScreen;
      ts.vcCamera = element.vcCamera;
      ts.vcSpeakers = element.vcSpeakers;
      ts.vcMicrophone = element.vcMicrophone;
      ts.vcController = element.vcController;
      ts.wirelessPresenter = element.wirelessPresenter;
      ts.interactivePanelDisplay = element.interactivePanelDisplay;
      ts.wiFiAP = element.wiFiAP;
      ts.biometric = element.biometric;
      ts.pbx = element.pbx;
      exportList.push(ts);
    });
    var OrganisationName = "MICROLABS LIMITED";
    const data = exportList;
    //Create workbook and worksheet
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('ASSET SUMMARY REPORT');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:AH1');
    worksheet.mergeCells('A2:AH2');
    worksheet.mergeCells('A3:AH3');

    //Blank Row 
    worksheet.addRow([]);
    //Add Header Row
    let headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    for (let x1 of data) {
      let x2 = Object.keys(x1);
      let temp = []
      for (let y of x2) {
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet.addRow([]);
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'AssetSummaryReport.xlsx');
    })
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}
