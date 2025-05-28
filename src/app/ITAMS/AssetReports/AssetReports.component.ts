import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { AssetReports } from './AssetReports.model';
//import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
//import * as fs from 'file-saver';
import swal from 'sweetalert';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';
import { DataSource } from '@angular/cdk/collections';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-AssetReports',
  templateUrl: './AssetReports.component.html',
  styleUrls: ['./AssetReports.component.css'],
})

export class AssetReportsComponent implements OnInit {
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
  AssetReports = {} as AssetReports;
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
    this.getAssetStateList();
    this.getLocationMaster();
    this.getPlantsassigned(this.currentUser.fkEmpId);
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

  plantList: any[] = [];
  getPlantsassigned(id:any) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.location = i.code + '-' + i.name; return i; });;
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

  onChange() {
    this.assetList = [];
    this.reInitDatatable();
  }

  clearFilter() {
    this.dashboardlocation = null;
    this.dashboardcatName = null;
    this.dashboardassetstate = null;
    this.dashboardusage = null;
    this.dashboardcatCode = null;
    this.filtersoftType = null;
    this.filterlicType = null;
    this.filtertype = null;
    this.filterinput = null;
    this.filterreporttype = null;
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
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
  onUserActions(isEdit: boolean, AssetReports: AssetReports, isprint: boolean, value: string) {
    this.view = true;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";

    this.AssetReports = Object.assign({}, AssetReports);
    if (value == 'View') {
      this.view = true;
    }

    jQuery("#searchModal").modal('hide');
    jQuery('#myModal').modal('show');
  }

  printReport(AssetReports: AssetReports) {
    this.appDet = [];
    this.AssetReports = Object.assign({}, AssetReports);
    this.getApprover(this.AssetReports.empNo);
    swal({
      title: "Message",
      text: "Are you sure to print?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {
        this.onUserActions1();
      }
    });
  }

  getApprover(employeeNumber) {
    var filterModel: any = {};
    filterModel.employeeNumber = this.AssetReports.empNo;
    this.httpService.amspost(APIURLS.BR_GET_AMS_APPROVER_DET, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.appDet = data;
        console.log(this.appDet);
      }
    }).catch((error)=> {
      this.appDet = [];
    });
  }

  //   WHEN REPORT TYPE IS ASSET INSTALLATION REPORT
  onUserActions1() {

    if (this.dashboardcatCode == 'Computers') {
      var printContents = document.getElementById('pdf')!.innerHTML;
    } else if (this.dashboardcatCode == 'Printers') {
      var printContents = document.getElementById('pdf1').innerHTML;
    } else if (this.dashboardcatCode == 'Network') {
      var printContents = document.getElementById('pdf2').innerHTML;
    } else if (this.dashboardcatCode == 'Others') {
      var printContents = document.getElementById('pdf3').innerHTML;
    } else {
      var printContents = document.getElementById('pdf4').innerHTML;
    }
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "IT ASSET INSTALLATION REPORT";
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.datePipe.transform(now, 'dd/MM/yyyy');
    var logo = this.image;
    var assetfor = this.AssetReports.empName + " - " + this.AssetReports.department; //(asset alloted to)
    if (this.AssetReports.modifiedBy == null || this.AssetReports.modifiedBy == '') {
      var systemadmin = this.AssetReports.createdBy + " - " + this.AssetReports.creatorName; //(employee printing report)
    }
    else {
      var systemadmin = this.AssetReports.modifiedBy + " - " + this.AssetReports.modifierName; //(employee printing report)
    }
    if (this.appDet.length > 0) {
      var depthead = this.appDet[0].approver_Name + " - " + this.appDet[0].approver_Department;
    }
    /*var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>
  ${printContents}
  <div>     
  </div>
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })*/
    var docDefinition = {
      info: {
        title: 'Asset Installtion Report',
      },
      content: [
     //   htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
        bold: false,
        table: {
          width: '*',
        },
        th: { bold: true, fillColor: '#8B0000' }
      },
      stack: [{
        unbreakable: true,
      }],
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 90, 40, 100],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {
          columns: [
            {
              pageMargins: [40, 80, 40, 70],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [50, 400, 70],
                headerRows: 2,
                keepWithHeaderRows: 1,
                body: [
                  [{
                    rowSpan: 2, image: logo,
                    width: 50,
                    alignment: 'center'
                  }
                    , { text: OrganisationName, bold: true, fontSize: 13, color: 'black', alignment: 'center', height: '*' },
                  {
                    rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                      { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                  }],
                  [''
                    , { text: ReportName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' }, '']
                ]
              }
            }
          ],
          margin: 20
        }
      },
      footer: function () {
        return {
          columns: [
            {

              style: 'tableExample',
              color: '#444',
              stack: [
                {
                  table: {
                    widths: [175, 175, 175],
                    body: [
                      [{ text: systemadmin, fontSize: 10, color: 'blue', alignment: 'left', height: '*' },
                      { text: depthead, fontSize: 10, color: 'blue', alignment: 'left', height: '*' },
                      { text: assetfor, fontSize: 10, color: 'blue', alignment: 'left', height: '*' }
                      ],
                      [{ text: 'System Admin', fontSize: 10, alignment: 'left' },
                      { text: 'Department Head', fontSize: 10, alignment: 'left' },
                      { text: 'End User', fontSize: 10, alignment: 'left' }
                      ]
                    ]
                  }
                },
                {
                  alignment: 'right',
                  stack: [
                    { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' }
                  ],
                  bold: true,
                  fontSize: 8,
                }]
            },

          ],

          margin: 20
        }
      },
    };
    //pdfMake.createPdf(docDefinition).open();
  }


  //   WHEN REPORT TYPE IS HARDWARE SUMMARY
  getHardwareSummary() {
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.dashboardlocation;
    filterModel.category = this.dashboardcatName;
    filterModel.usageType = this.dashboardusage;
    filterModel.assetState = this.dashboardassetstate;
    //let serchstr = this.dashboardlocation + ',' + this.dashboardcatName + ',' + this.dashboardusage + ',' + this.dashboardassetstate;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }


  //   WHEN REPORT TYPE IS HARDWARE DETAILED 
  getHardwareDetailed() {
    if (this.dashboardlocation == null || this.dashboardlocation == undefined) {
      toastr.error("Please select Location !!");
      return;
    }
    else {
      this.isLoading = true;
      let td = new Date();
      let formatedFROMdate: string
      let formatedTOdate: string
      var filterModel: any = {};
      if (this.from_date == '' || this.from_date == null) {
        formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
        this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
      }
      else {
        let fd = new Date(this.from_date);
        formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
          ("00" + fd.getDate()).slice(-2);
        this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

      }

      if (this.to_date == '' || this.to_date == null) {
        formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
          ("00" + td.getDate()).slice(-2);
        this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
      }
      else {
        let ed = new Date(this.to_date);
        formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
          ("00" + ed.getDate()).slice(-2);
        this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

      }
      filterModel.location = this.dashboardlocation;
      filterModel.category = this.dashboardcatName;
      filterModel.assetType = this.dashboardcatCode;
      filterModel.department = this.filterdepartment;
      filterModel.assetState = this.dashboardassetstate;
      filterModel.FromDate = this.getFormatedDateTime(this.from_date);
      filterModel.ToDate = this.getFormatedDateTime(this.to_date);
      this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel).then((data: any) => {
        if (data.length > 0) {
          this.assetList = data;
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
      });
    }

  }

  //   WHEN REPORT TYPE IS SOFTWARE SUMMARY
  getSoftwareSummary() {
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.dashboardlocation;
    filterModel.softwareType = this.filtersoftType;
    filterModel.licenseType = this.filterlicType;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_SOFT_DETAILED, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });

  }

  //   WHEN REPORT TYPE IS SOFTWARE DETAILED 
  getSoftwareDetailed() {
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.dashboardlocation;
    filterModel.softwareType = this.filtersoftType;
    filterModel.licenseType = this.filterlicType;
    filterModel.assetState = this.dashboardassetstate;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_SOFT_DETAILED, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }


  //  WHEN REPORT TYPE IS ASSET LOG HARDWARE
  getHardware() {
    if (this.dashboardlocation == null || this.dashboardlocation == undefined) {
      toastr.error("Please select Location !!");
      return;
    }
    else {
      this.isLoading = true;
      var filterModel: any = {};
      filterModel.location = this.dashboardlocation;
      this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel).then((data: any) => {
        if (data.length > 0) {
          this.assetList = data;
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
      });
    }
  }


  //  WHEN REPORT TYPE IS ASSET LOG SOFTWARE
  getSoftware() {
    if (this.dashboardlocation == null || this.dashboardlocation == undefined) {
      toastr.error("Please select Location !!");
      return;
    }
    else {
      this.isLoading = true;
      var filterModel: any = {};
      filterModel.location = this.dashboardlocation;
      this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_SOFT_DETAILED, filterModel).then((data: any) => {
        if (data.length > 0) {
          this.assetList = data;
        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
      });
    }
  }

  // USED TO GET LIST OF ASSET INSTALLATION REPORTS FOR PRINT
  getInstallationReport() {
    if (this.dashboardlocation == null || this.dashboardlocation == '') {
      toastr.error("Location field cannot be empty..!");
      return;
    }
    if (this.dashboardcatCode == null || this.dashboardcatCode == '') {
      toastr.error("Category field cannot be empty..!");
      return;
    }
    else if (this.filterinput == null || this.filterinput == '') {
      toastr.error("Search Text field cannot be empty..!");
      return;
    }
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.dashboardlocation;
    filterModel.category = this.dashboardcatName;
    filterModel.assetType = this.dashboardcatCode;
    filterModel.reportViewStatus = 1;
    filterModel.input = this.filterinput;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_DETAILS, filterModel).then((data: any) => {
      if (data) {
        this.assetList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.assetList = [];
    });
  }

  // USED TO GET LIST OF ASSET REPORTS FOR APPROVAL
  getInstallationReport1() {
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
    });
  }


  // USED TO DOWNLOAD HARDWARE DETAILED REPORT
   //v10
  // exportHardwareDetailed() {
  //   const title = ' Asset Hardware Detailed Report';
  //   const header = ["Sl No", "Asset ID", "Category", "Location", "Asset No", "Host Name", "Emp Name", "EmpNo", "Department", "Com Dept", "Com floor", "Bar Code", "Model", "Manufacturer",
  //     "Part No", "Serial No", "Processor", "RAM", "Ram size", "HDD", "Size type", "Config", "Gxp Applicable", "IP Address", "Monitor Type", "Make", "Size", "Keyboard", "Mouse",
  //     "Usage Type", "InstName", "InstType", "Version", "Software", "OperatingSystem", "Sw Version", "ProductKey", "AssetState", "NatureofActivities", "PONumber", "PODate", "InvoiceNumber",
  //     "InvoiceDate", "SupplierName", "Value", "WarrantyExpiration", "PreventiveMaintenace", "InstallationDate", "InstallationType", "Created by", "Created date", "Modified by", "Modified date",
  //     "Other Software Name", "Other version", "Other product key", "Other Expiry on", "Remarks", "Date of Issue", "Ppm", "Machine Life", "Cpp", "Asset Type", "EmpAd", "Replacement Type",
  //     "ViewStatusApprover", "StatusApprovedDate", "ReportViewStatus", "VendorCode", "VendorCity", "VendorName"]

  //   var exportList = [];
  //   var ts: any = {};
  //   let index = 0;
  //   this.assetList.forEach((element:any)=> {

  //     index = index + 1;
  //     ts = {};
  //     ts.slNo = index;
  //     ts.assetId = element.assetId;
  //     ts.category = element.category;
  //     ts.location = element.location;
  //     ts.assetNo = element.assetNo;
  //     ts.hostName = element.hostName;
  //     ts.empName = element.empName;
  //     ts.empNo = element.empNo;
  //     ts.empdept = element.department;
  //     ts.comDept = element.comDept;
  //     ts.comFloor = element.comFloor;
  //     ts.barcode = element.barcode;
  //     ts.model = element.model;
  //     ts.manufacturer = element.manufacturer;
  //     ts.partNo = element.partNo;
  //     ts.serailNo = element.serialNo;
  //     ts.processor = element.processor;
  //     ts.ram = element.ram;
  //     ts.ramSize = element.ramSize;
  //     ts.hdd = element.hdd;
  //     ts.sizeType = element.sizeType;
  //     ts.config = element.config;
  //     ts.Gxp = element.gxPApplicable;
  //     ts.ipAdress = element.ipAddress;
  //     ts.monitorType = element.monitorType;
  //     ts.make = element.make;
  //     ts.size = element.size;
  //     ts.keyboard = element.keyboard;
  //     ts.mouse = element.mouse;
  //     ts.usagetype = element.usageType;
  //     ts.instName = element.instName;
  //     ts.instType = element.instType;
  //     ts.version = element.version;
  //     ts.software = element.software;
  //     ts.operationSystem = element.operatingSystem;
  //     ts.swVersion = element.swVersion;
  //     ts.productKey = element.productKey;
  //     ts.assetstate = element.assetState;
  //     ts.natureofActivities = element.natureofActivities;
  //     ts.ponumber = element.ponumber;
  //     ts.podate = element.podate;
  //     ts.invoiceNumber = element.invoiceNumber;
  //     ts.invoiceDate = element.invoiceDate;
  //     ts.supplierName = element.supplierName;
  //     ts.value = element.value;
  //     ts.warrantyExpiration = element.warrantyExpiration;
  //     ts.preventiveMaintenace = element.preventiveMaintenace;
  //     ts.installationDate = element.installationDate;
  //     ts.installationType = element.installationType;
  //     ts.createdBy = element.createdBy;
  //     ts.createdDate = element.createdDate;
  //     ts.modifiedBy = element.modifiedBy;
  //     ts.modifiedDate = element.modifiedDate;
  //     ts.otherSoftwareName = element.otherSoftwareName;
  //     ts.otherVersion = element.otherVersion;
  //     ts.otherProductKey = element.otherProductKey;
  //     ts.otherExpiryOn = element.otherExpiryOn;
  //     ts.remarks = element.remarks;
  //     ts.dateOfIssue = element.dateOfIssue;
  //     ts.ppm = element.ppm;
  //     ts.machineLife = element.machineLife;
  //     ts.cpp = element.cpp;
  //     ts.assetType = element.assetType;
  //     ts.empAd = element.empAd;
  //     ts.replacementType = element.replacementType;
  //     ts.viewStatusApprover = element.viewStatusApprover;
  //     ts.statusApprovedDate = element.statusApprovedDate;
  //     ts.reportViewStatus = element.reportViewStatus;
  //     ts.vendorCode = element.vendorCode;
  //     ts.vendorCity = element.vendorCity;
  //     ts.vendorName = element.vendorName;
  //     exportList.push(ts);
  //   });
  //   var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.dashboardlocation;
  //   const data = exportList;
  //   //Create workbook and worksheet
  //   //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //   let worksheet = workbook.addWorksheet('Summary Report');
  //   //Add Row and formatting
  //   var head = worksheet.addRow([OrganisationName]);
  //   head.font = { size: 16, bold: true }
  //   head.alignment = { horizontal: 'left' }
  //   let titleRow = worksheet.addRow([title]);
  //   titleRow.font = { size: 16, bold: true }
  //   titleRow.alignment = { horizontal: 'left' }
  //   worksheet.mergeCells('A1:BS1');
  //   worksheet.mergeCells('A2:BS2');
  //   worksheet.mergeCells('A3:BS3');

  //   //Blank Row 
  //   worksheet.addRow([]);
  //   //Add Header Row
  //   let headerRow = worksheet.addRow(header);

  //   headerRow.eachCell((cell, number) => {
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFFFFF00' },
  //       bgColor: { argb: 'FF0000FF' }
  //     }
  //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //   })

  //   for (let x1 of data) {
  //     let x2 = Object.keys(x1);
  //     let temp = []
  //     for (let y of x2) {
  //       temp.push(x1[y])
  //     }
  //     worksheet.addRow(temp)
  //   }
  //   worksheet.eachRow((cell, number) => {
  //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //   })
  //   worksheet.addRow([]);
  //   workbook.xlsx.writeBuffer().then((data:any) => {
  //     let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     fs.saveAs(blob, 'HardwareDetailedReport.xlsx');
  //   })

  // }


  // USED TO DOWNLOAD ASSET DISPOSED REPORT
   //v10
  // exportAssetDisposed() {
  //   const title = ' Disposed Asset Report';
  //   const header = ["Sl No", "Asset ID", "Category", "Location", "Asset No", "Host Name", "Emp Name", "EmpNo", "Department", "Com Dept", "Com floor", "Bar Code", "Model", "Manufacturer",
  //     "Part No", "Serial No", "Processor", "RAM", "Ram size", "HDD", "Size type", "Config", "Gxp Applicable", "IP Address", "Monitor Type", "Make", "Size", "Keyboard", "Mouse",
  //     "Usage Type", "InstName", "InstType", "Version", "Software", "OperatingSystem", "Sw Version", "ProductKey", "AssetState", "NatureofActivities", "PONumber", "PODate", "InvoiceNumber",
  //     "InvoiceDate", "SupplierName", "Value", "WarrantyExpiration", "PreventiveMaintenace", "InstallationDate", "InstallationType", "Created by", "Created date", "Disposed by", "Disposed date",
  //     "VendorCode", "VendorCity", "VendorName", "Date of Issue", "Ppm", "Machine Life", "Cpp", "Asset Type", "EmpAd", "Replacement Type",
  //     "ViewStatusApprover", "StatusApprovedDate", "ReportViewStatus"]

  //   var exportList = [];
  //   var ts: any = {};
  //   let index = 0;
  //   this.assetList.forEach((element:any)=> {

  //     index = index + 1;
  //     ts = {};
  //     ts.slNo = index;
  //     ts.assetId = element.assetId;
  //     ts.category = element.category;
  //     ts.location = element.location;
  //     ts.assetNo = element.assetNo;
  //     ts.hostName = element.hostName;
  //     ts.empName = element.empName;
  //     ts.empNo = element.empNo;
  //     ts.empdept = element.department;
  //     ts.comDept = element.comDept;
  //     ts.comFloor = element.comFloor;
  //     ts.barcode = element.barcode;
  //     ts.model = element.model;
  //     ts.manufacturer = element.manufacturer;
  //     ts.partNo = element.partNo;
  //     ts.serailNo = element.serialNo;
  //     ts.processor = element.processor;
  //     ts.ram = element.ram;
  //     ts.ramSize = element.ramSize;
  //     ts.hdd = element.hdd;
  //     ts.sizeType = element.sizeType;
  //     ts.config = element.config;
  //     ts.Gxp = element.gxPApplicable;
  //     ts.ipAdress = element.ipAddress;
  //     ts.monitorType = element.monitorType;
  //     ts.make = element.make;
  //     ts.size = element.size;
  //     ts.keyboard = element.keyboard;
  //     ts.mouse = element.mouse;
  //     ts.usagetype = element.usageType;
  //     ts.instName = element.instName;
  //     ts.instType = element.instType;
  //     ts.version = element.version;
  //     ts.software = element.software;
  //     ts.operationSystem = element.operatingSystem;
  //     ts.swVersion = element.swVersion;
  //     ts.productKey = element.productKey;
  //     ts.assetstate = element.assetState;
  //     ts.natureofActivities = element.natureofActivities;
  //     ts.ponumber = element.ponumber;
  //     ts.podate = element.podate;
  //     ts.invoiceNumber = element.invoiceNumber;
  //     ts.invoiceDate = element.invoiceDate;
  //     ts.supplierName = element.supplierName;
  //     ts.value = element.value;
  //     ts.warrantyExpiration = element.warrantyExpiration;
  //     ts.preventiveMaintenace = element.preventiveMaintenace;
  //     ts.installationDate = element.installationDate;
  //     ts.installationType = element.installationType;
  //     ts.createdBy = element.createdBy;
  //     ts.createdDate = element.createdDate;
  //     ts.modifiedBy = element.modifiedBy;
  //     ts.modifiedDate = element.modifiedDate;
  //     ts.vendorCode = element.vendorCode;
  //     ts.vendorCity = element.vendorCity;
  //     ts.vendorName = element.vendorName;
  //     ts.dateOfIssue = element.dateOfIssue;
  //     ts.ppm = element.ppm;
  //     ts.machineLife = element.machineLife;
  //     ts.cpp = element.cpp;
  //     ts.assetType = element.assetType;
  //     ts.empAd = element.empAd;
  //     ts.replacementType = element.replacementType;
  //     ts.viewStatusApprover = element.viewStatusApprover;
  //     ts.statusApprovedDate = element.statusApprovedDate;
  //     ts.reportViewStatus = element.reportViewStatus;
  //     exportList.push(ts);
  //   });
  //   var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.dashboardlocation;
  //   const data = exportList;
  //   //Create workbook and worksheet
  //   //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //   let worksheet = workbook.addWorksheet('Disposed Asset Report');
  //   //Add Row and formatting
  //   var head = worksheet.addRow([OrganisationName]);
  //   head.font = { size: 16, bold: true }
  //   head.alignment = { horizontal: 'center' }
  //   let titleRow = worksheet.addRow([title]);
  //   titleRow.font = { size: 16, bold: true }
  //   titleRow.alignment = { horizontal: 'center' }
  //   worksheet.mergeCells('A1:BS1');
  //   worksheet.mergeCells('A2:BS2');
  //   worksheet.mergeCells('A3:BS3');

  //   //Blank Row 
  //   worksheet.addRow([]);
  //   //Add Header Row
  //   let headerRow = worksheet.addRow(header);

  //   headerRow.eachCell((cell, number) => {
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFFFFF00' },
  //       bgColor: { argb: 'FF0000FF' }
  //     }
  //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //   })

  //   for (let x1 of data) {
  //     let x2 = Object.keys(x1);
  //     let temp = []
  //     for (let y of x2) {
  //       temp.push(x1[y])
  //     }
  //     worksheet.addRow(temp)
  //   }
  //   worksheet.eachRow((cell, number) => {
  //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //   })
  //   worksheet.addRow([]);
  //   workbook.xlsx.writeBuffer().then((data:any) => {
  //     let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     fs.saveAs(blob, 'DisposedAssetReport.xlsx');
  //   })

  // }


  //USED TO DOWNLOAD SOFTWARE DETAILED REPORT
   //v10
  // exportSoftwareDetailed() {

  //   const title = ' Asset Software Detailed Report';
  //   const header = ["Sl No", "Asset No", "Location", "Department", "Software Type", "License Type", "Software Name", "Software Version ", "Product Key ", "Expires On"]

  //   var exportList = [];
  //   var ts: any = {};
  //   let index = 0;
  //   this.assetList.forEach((element:any)=> {

  //     index = index + 1;
  //     ts = {};
  //     ts.slNo = index;
  //     ts.assetNo = element.assetNo;
  //     ts.location = element.location;
  //     ts.empdept = element.department;
  //     ts.softwareType = element.softwareType;
  //     ts.licenseType = element.licenseType;
  //     ts.otherSoftwareName = element.otherSoftwareName;
  //     ts.otherVersion = element.otherVersion;
  //     ts.otherProductKey = element.otherProductKey;
  //     ts.otherExpiryOn = element.otherExpiryOn;
  //     exportList.push(ts);

  //   });
  //   var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.dashboardlocation;
  //   const data = exportList;
  //   //Create workbook and worksheet
  //   //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //   let worksheet = workbook.addWorksheet('Summary Report');
  //   //Add Row and formatting
  //   var head = worksheet.addRow([OrganisationName]);
  //   head.font = { size: 16, bold: true }
  //   head.alignment = { horizontal: 'center' }
  //   let titleRow = worksheet.addRow([title]);
  //   titleRow.font = { size: 16, bold: true }
  //   titleRow.alignment = { horizontal: 'center' }
  //   worksheet.mergeCells('A1:R1');
  //   worksheet.mergeCells('A2:R2');
  //   worksheet.mergeCells('A3:R3');

  //   //Blank Row 
  //   worksheet.addRow([]);
  //   //Add Header Row
  //   let headerRow = worksheet.addRow(header);

  //   headerRow.eachCell((cell, number) => {
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFFFFF00' },
  //       bgColor: { argb: 'FF0000FF' }
  //     }
  //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //   })

  //   for (let x1 of data) {
  //     let x2 = Object.keys(x1);
  //     let temp = []
  //     for (let y of x2) {
  //       temp.push(x1[y])
  //     }
  //     worksheet.addRow(temp)
  //   }
  //   worksheet.eachRow((cell, number) => {
  //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //   })
  //   worksheet.addRow([]);
  //   workbook.xlsx.writeBuffer().then((data:any) => {
  //     let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     fs.saveAs(blob, 'SoftwareDetailedReport.xlsx');
  //   })
  // }


  // USED TO DOWNLOAD ASSET LOG REPORT (HARDWARE)
   //v10
  // exportAssetHardwareReport() {
  //   swal({
  //     title: "Message",
  //     text: "Are you sure to print?",
  //     icon: "warning",
  //     dangerMode: false,
  //     buttons: [true, true]
  //   }).then((willsave) => {
  //     if (willsave) {
  //       const title = ' Asset Hardware Report';
  //       const header = ["Sl No", "Asset ID", "Category", "Location", "Asset No", "Host Name", "Emp Name", "EmpNo", "Department", "Com Dept", "Com floor", "Bar Code", "Model", "Manufacturer",
  //         "Part No", "Serial No", "Processor", "RAM", "Ram size", "HDD", "Size type", "Config", "Gxp Applicable", "IP Address", "Monitor Type", "Make", "Size", "Keyboard", "Mouse",
  //         "Usage Type", "InstName", "InstType", "Version", "Software", "OperatingSystem", "Sw Version", "ProductKey", "AssetState", "NatureofActivities", "PONumber", "PODate", "InvoiceNumber",
  //         "InvoiceDate", "SupplierName", "Value", "WarrantyExpiration", "PreventiveMaintenace", "InstallationDate", "InstallationType", "Created by", "Created date", "Modified by", "Modified date",
  //         "Other Software Name", "Other version", "Other product key", "Other Expiry on", "Remarks", "Date of Issue", "Ppm", "Machine Life", "Cpp", "Asset Type", "EmpAd", "Replacement Type",
  //         "ViewStatusApprover", "StatusApprovedDate", "ReportViewStatus", "VendorCode", "VendorCity", "VendorName"]

  //       var exportList = [];
  //       var ts: any = {};
  //       let index = 0;
  //       this.assetList.forEach((element:any)=> {

  //         index = index + 1;
  //         ts = {};
  //         ts.slNo = index;
  //         ts.assetId = element.assetId;
  //         ts.category = element.category;
  //         ts.location = element.location;
  //         ts.assetNo = element.assetNo;
  //         ts.hostName = element.hostName;
  //         ts.empName = element.empName;
  //         ts.empNo = element.empNo;
  //         ts.empdept = element.department;
  //         ts.comDept = element.comDept;
  //         ts.comFloor = element.comFloor;
  //         ts.barcode = element.barcode;
  //         ts.model = element.model;
  //         ts.manufacturer = element.manufacturer;
  //         ts.partNo = element.partNo;
  //         ts.serailNo = element.serialNo;
  //         ts.processor = element.processor;
  //         ts.ram = element.ram;
  //         ts.ramSize = element.ramSize;
  //         ts.hdd = element.hdd;
  //         ts.sizeType = element.sizeType;
  //         ts.config = element.config;
  //         ts.Gxp = element.gxPApplicable;
  //         ts.ipAdress = element.ipAddress;
  //         ts.monitorType = element.monitorType;
  //         ts.make = element.make;
  //         ts.size = element.size;
  //         ts.keyboard = element.keyboard;
  //         ts.mouse = element.mouse;
  //         ts.usagetype = element.usageType;
  //         ts.instName = element.instName;
  //         ts.instType = element.instType;
  //         ts.version = element.version;
  //         ts.software = element.software;
  //         ts.operationSystem = element.operatingSystem;
  //         ts.swVersion = element.swVersion;
  //         ts.productKey = element.productKey;
  //         ts.assetstate = element.assetState;
  //         ts.natureofActivities = element.natureofActivities;
  //         ts.ponumber = element.ponumber;
  //         ts.podate = element.podate;
  //         ts.invoiceNumber = element.invoiceNumber;
  //         ts.invoiceDate = element.invoiceDate;
  //         ts.supplierName = element.supplierName;
  //         ts.value = element.value;
  //         ts.warrantyExpiration = element.warrantyExpiration;
  //         ts.preventiveMaintenace = element.preventiveMaintenace;
  //         ts.installationDate = element.installationDate;
  //         ts.installationType = element.installationType;
  //         ts.createdBy = element.createdBy;
  //         ts.createdDate = element.createdDate;
  //         ts.modifiedBy = element.modifiedBy;
  //         ts.modifiedDate = element.modifiedDate;
  //         ts.otherSoftwareName = element.otherSoftwareName;
  //         ts.otherVersion = element.otherVersion;
  //         ts.otherProductKey = element.otherProductKey;
  //         ts.otherExpiryOn = element.otherExpiryOn;
  //         ts.remarks = element.remarks;
  //         ts.dateOfIssue = element.dateOfIssue;
  //         ts.ppm = element.ppm;
  //         ts.machineLife = element.machineLife;
  //         ts.cpp = element.cpp;
  //         ts.assetType = element.assetType;
  //         ts.empAd = element.empAd;
  //         ts.replacementType = element.replacementType;
  //         ts.viewStatusApprover = element.viewStatusApprover;
  //         ts.statusApprovedDate = element.statusApprovedDate;
  //         ts.reportViewStatus = element.reportViewStatus;
  //         ts.vendorCode = element.vendorCode;
  //         ts.vendorCity = element.vendorCity;
  //         ts.vendorName = element.vendorName;
  //         exportList.push(ts);
  //       });
  //       var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.dashboardlocation;
  //       const data = exportList;
  //       //Create workbook and worksheet
  //       //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //       let worksheet = workbook.addWorksheet('Summary Report');
  //       //Add Row and formatting
  //       var head = worksheet.addRow([OrganisationName]);
  //       head.font = { size: 16, bold: true }
  //       head.alignment = { horizontal: 'left' }
  //       let titleRow = worksheet.addRow([title]);
  //       titleRow.font = { size: 16, bold: true }
  //       titleRow.alignment = { horizontal: 'left' }
  //       worksheet.mergeCells('A1:BS1');
  //       worksheet.mergeCells('A2:BS2');
  //       worksheet.mergeCells('A3:BS3');

  //       //Blank Row 
  //       worksheet.addRow([]);
  //       //Add Header Row
  //       let headerRow = worksheet.addRow(header);

  //       headerRow.eachCell((cell, number) => {
  //         cell.fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'FFFFFF00' },
  //           bgColor: { argb: 'FF0000FF' }
  //         }
  //         cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //       })

  //       for (let x1 of data) {
  //         let x2 = Object.keys(x1);
  //         let temp = []
  //         for (let y of x2) {
  //           temp.push(x1[y])
  //         }
  //         worksheet.addRow(temp)
  //       }
  //       worksheet.eachRow((cell, number) => {
  //         cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //       })
  //       worksheet.addRow([]);
  //       workbook.xlsx.writeBuffer().then((data:any) => {
  //         let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //         fs.saveAs(blob, 'Asset Hardware Report.xlsx');

  //       })
  //     }

  //   });
  // }



  // USED TO DOWNLOAD ASSET LOG REPORT (SOFTWARE)
   //v10
  // exportAssetSoftwareReport() {
  //   swal({
  //     title: "Message",
  //     text: "Are you sure to print?",
  //     icon: "warning",
  //     dangerMode: false,
  //     buttons: [true, true]
  //   }).then((willsave) => {
  //     if (willsave) {
  //       const title = ' Asset Software Report';
  //       const header = ["Sl No", "Asset Id", "Asset No", "Location", "Software Type", "License Type", "Software Name", "Software Version ", "Product Key ", "Expires On"]

  //       var exportList = [];
  //       var ts: any = {};
  //       let index = 0;
  //       this.assetList.forEach((element:any)=> {

  //         index = index + 1;
  //         ts = {};
  //         ts.slNo = index;
  //         ts.assetId = element.assetId;
  //         ts.assetNo = element.assetNo;
  //         ts.location = element.location;
  //         ts.softwareType = element.softwareType;
  //         ts.licenseType = element.licenseType;
  //         ts.otherSoftwareName = element.otherSoftwareName;
  //         ts.otherVersion = element.otherVersion;
  //         ts.otherProductKey = element.otherProductKey;
  //         ts.otherExpiryOn = element.otherExpiryOn;
  //         exportList.push(ts);

  //       });
  //       var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.dashboardlocation;
  //       const data = exportList;
  //       //Create workbook and worksheet
  //       //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //       let worksheet = workbook.addWorksheet('Summary Report');
  //       //Add Row and formatting
  //       var head = worksheet.addRow([OrganisationName]);
  //       head.font = { size: 16, bold: true }
  //       head.alignment = { horizontal: 'center' }
  //       let titleRow = worksheet.addRow([title]);
  //       titleRow.font = { size: 16, bold: true }
  //       titleRow.alignment = { horizontal: 'center' }
  //       worksheet.mergeCells('A1:R1');
  //       worksheet.mergeCells('A2:R2');
  //       worksheet.mergeCells('A3:R3');

  //       //Blank Row 
  //       worksheet.addRow([]);
  //       //Add Header Row
  //       let headerRow = worksheet.addRow(header);

  //       headerRow.eachCell((cell, number) => {
  //         cell.fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'FFFFFF00' },
  //           bgColor: { argb: 'FF0000FF' }
  //         }
  //         cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //       })

  //       for (let x1 of data) {
  //         let x2 = Object.keys(x1);
  //         let temp = []
  //         for (let y of x2) {
  //           temp.push(x1[y])
  //         }
  //         worksheet.addRow(temp)
  //       }
  //       worksheet.eachRow((cell, number) => {
  //         cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //       })
  //       worksheet.addRow([]);
  //       workbook.xlsx.writeBuffer().then((data:any) => {
  //         let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //         fs.saveAs(blob, 'Asset Software Report.xlsx');

  //       });
  //     }
  //   });
  // }


  approveAsset() {
    this.errMsg = "";
    let connection: any;
    this.checkedRequestList.forEach((element:any)=> {

      let value = this.assetList.find((x:any)  => x.assetId == element.assetId);
      this.AssetReports = Object.assign({}, value);
      this.AssetReports.viewStatusApprover = this.currentUser.employeeId;
      this.AssetReports.reportViewStatus = 1;
      this.AssetReports.softwares = null;
      this.AssetReports.sizeType = this.AssetReports.sizeType ? this.sizeList.find((x:any)  => x.storTxt == this.AssetReports.sizeType).storId : '';
      this.AssetReports.ramSize = this.AssetReports.ramSize ? this.sizeList.find((x:any)  => x.storTxt == this.AssetReports.ramSize).storId : '';
      this.AssetReports.assetState = this.AssetReports.assetState ? this.assStateList.find((x:any)  => x.status == this.AssetReports.assetState).id : '';
      this.AssetReports.comDept = this.AssetReports.comDept ? this.departmentList.find((x:any)  => x.name == this.AssetReports.comDept).id : '';
      this.AssetReports.monitorType = this.AssetReports.monitorType ? this.monType.find((x:any)  => x.type == this.AssetReports.monitorType).id : '';
      this.AssetReports.statusApprovedDate = new Date();
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.AssetReports.assetId, this.AssetReports);
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
          this.clearFilter();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error approving Asset..';
      });
  }


  isMasterSel: boolean = false;
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


