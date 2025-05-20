import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
// import { GateEntryM } from '../gateentry/gateentrym.model';
import { APIURLS } from '../shared/api-url';
import { HttpService } from '../shared/http-service';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
import { GateEntryD } from '../gateentry/gateentryd.model';
import { ExcelService } from '../shared/excel-service';
import { GEInwardRegister } from './geinwardregister.model';
declare var jQuery: any;

import swal from 'sweetalert';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-geinregreport',
  templateUrl: './geinregreport.component.html',
  styleUrls: ['./geinregreport.component.css']
})
export class GEInwardRegReportComponent implements OnInit {

  currentUser: AuthData;
  tableWidget: any;
  path: string;
  errMsg: string = "";
  isLoading: boolean;
  // gateEntryMList: GateEntryM[] = [];
  gateEntryMList: GEInwardRegister[] = [];
  gateEntryDList: GateEntryD[] = [];
  exportList: any[];
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private excelService:ExcelService,
    private http: HttpClient) {pdfMake.vfs = pdfFonts.pdfMake.vfs; }
  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getFinacialYears();
      this.getLocationList();
      this.getbase64image();
      this.getEmployeeList();
      this.getPlantsassigned(this.currentUser.fkEmpId);
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
      "destroy": true,
      "columnDefs": [
        { "orderable": false}
      ]
    });
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }
  //Search Filters
  fNYearSettings = {
    singleSelection: false,
     idField: 'id',
     textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  finYearList: any[] = [];
  selectedFNYears: any = null;
  onYearDeSelect() {
  }
  onYearDeSelectAll() {
    this.selectedFNYears = [];
  }
  onFNYearSelectAll(items: any) {
    this.selectedFNYears = items;
  }
  getFinacialYears() {
    var defaultYear = 2019;
    var currentYear = new Date().getFullYear();
    var totalNo = (currentYear + 1) - defaultYear;
    for (let i = 0; i < totalNo; i++) {
      var t = { 'id': 0, 'name': '' };
      t.id=i;
      let finYear = (defaultYear + i) + "-" + (defaultYear + i + 1).toString().substring(2);
      t.name=finYear;
      this.finYearList.push(t);
    }
  }
  locationSettings = {
    singleSelection: false,
    idField: 'code',
    textField: 'location',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  locationList: any[] = [];
  selectedLocations: any = null;
  onLocationDeSelect() {
  }
  onLocationDeSelectAll() {
    this.selectedLocations = [];
  }
  onLocationSelectAll(items: any) {
    this.selectedLocations = items;
  }
  locationname:string;
  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data) {
        this.locationList = data.filter(x=>{ return x.isActive;}).map((i) => { i.location = i.code + '-' + i.name; return i; });
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        this.locationList.sort((a,b)=>{return collator.compare(a.code,b.code)});
        this.selectedLocations=this.locationList.filter(x=>x.id== this.currentUser.baselocation);
        let temp=data.find(x=>x.id== this.currentUser.baselocation);
        this.locationname=temp.code +'-'+temp.name;

      }
      this.isLoading = false;
    }).catch(() => {
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
     
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  deliveryModeSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  deliveryModeList = [
    { id:0,name: 'In Person' },
    { id:1,name: 'Courier' },
    { id:2, name: 'Vehicle' }
  ]
  selectedModes: any = null;
  onItemDeSelect() {
  }
  onDeSelectAll() {
    this.selectedModes = [];
  }
  onSelectAll(items: any) {
    this.selectedModes = items;
  }
  goTypeList = [
    { name: 'With PO', type: '0' },
    { name: 'WithOut PO', type: '1' },
    { name: 'Sub-Contracting', type: '3' },
    { name: 'STO', type: '4' },
    { name: 'Retunable', type: '2' }
  ]
  goTypeSettings = {
    singleSelection: false,
    idField: 'type',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  selectedTypes: any = null;
  onTypeDeSelect() {
  }
  onTypeDeSelectAll() {
    this.selectedTypes = [];
  }
  onTypeSelectAll(items: any) {
    this.selectedTypes = items;
  }
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.delete = false;
    this.isAck=false;
    this.fltrGONO = null;
    this.fltrInvoiceNo = null;
    this.fltrDCNO = null;
    this.selectedLocations = [];
    this.selectedModes = [];
    this.selectedFNYears = [];
    this.selectedTypes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  delete: boolean = false;
  isAck:boolean=false;
  fltrGONO: string;
  fltrInvoiceNo: string;
  fltrDCNO: string;
  loadGateOutwardList() {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    if (this.selectedFNYears != null) {
      let fnYears = null;
      this.selectedFNYears.forEach(fnyear => {
        fnYears = fnyear.name + ',' + fnYears;
      });
      genericGateEntryM.fiN_YEAR = fnYears;
    }
    if (this.selectedLocations != null) {
      let locations = null;
      this.selectedLocations.forEach(loc => {
        locations = loc.code + ',' + locations;
      });
      genericGateEntryM.planT_ID = locations;
    }
    if (this.selectedTypes != null) {
      let types = null;
      this.selectedTypes.forEach(loc => {
        types = loc.type + ',' + types;
      });
      genericGateEntryM.gI_TYPE = types;
    }

    if (this.from_date != null)
      genericGateEntryM.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      genericGateEntryM.todate = this.getDateFormate(this.to_date);
    genericGateEntryM.isActive = this.delete ? '0' : '1';
    genericGateEntryM.isack=this.isAck?'Yes':'No';
    genericGateEntryM.gI_NO = this.fltrGONO;
    genericGateEntryM.doC_NO = this.fltrInvoiceNo;
    genericGateEntryM.dC_NO = this.fltrDCNO;
    if (this.selectedModes != null) {
      let delmodes = null;
      this.selectedModes.forEach(mode => {
        delmodes = mode.name + ',' + delmodes;
      });
      genericGateEntryM.deliverymode = delmodes;
    }
    this.httpService.post(APIURLS.BR_MASTER_GATEINWARDM_REGISTER_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.gateEntryMList = data;
        this.gateEntryMList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.gateEntryMList = [];
    });
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  employeeList: any[] = [];
  getEmployeeList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_USER_API).then((data: any) => {
      if (data.length > 0) {
        this.employeeList = data;
      }
    }).catch(() => {
      this.isLoading = false;
      this.employeeList = [];
    });
  }
  showEmployeeName(empid) {
    return this.employeeList.find(x => x.employeeId == empid)?this.employeeList.find(x => x.employeeId == empid).fullName:empid;
  }
  showGoType(type) {
    return this.goTypeList.find(x => x.type == type).name;
  }
  showlocationName(code)
  {
    return code +'-'+ (this.locationList.find(x=>x.code==code)?this.locationList.find(x=>x.code==code).name:code);
  }
  gIType:string;
  // onGateEntryActions(gateEntryM: GateEntryM) {
  //   this.gIType=gateEntryM.gI_TYPE;
  //   this.httpService.getById(APIURLS.BR_MASTER_GATEINWARDD_ANY_API, gateEntryM.id).then((data: any) => {
  //     if (data) {
  //       this.gateEntryDList = data;
  //     }
  //   }).catch(() => {
  //     this.gateEntryDList = [];
  //   });
  //   jQuery("#MaterialModal").modal('show');
  // }
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
  exportAsXLSX(): void {
    this.exportList=[];
    let index=0;
    this.gateEntryMList.forEach(item => {
      index=index+1;
      let exportItem={
        "SNo":index,
        "Financial Year":item.fiN_YEAR,
        "Location":item.planT_ID,
        "Document Type":this.showGoType(item.gI_TYPE),
        "GateNO":item.gI_GATENO,
        "GINo":item.gI_NO,
        "GONo":item.gO_NO,
        "IN Date Time":item.iN_TIME?this.setFormatedDateTime(item.iN_TIME):"",
        "DC No":item.dC_NO,
        "DC Date":item.dC_DATE?this.setDateFormate(item.dC_DATE):"",
        "Invoice/DOC No":item.doC_NO,
        "Invoice/DOC Date":item.doC_DATE?this.setDateFormate(item.doC_DATE):"",
        "Supplier Code":item.lifnr,
        "Supplier Name":item.namE1,
        "City":item.orT01,
        "Regio":item.regio,
        "Country":item.landx,
        "Delivery Mode":item.deliverymode,
        "Delivery Person":item.deliveryperson,
        "Courier Name":item.courier_Name,
        "Courier Num":item.courier_Num,
        "Courier Date":item.courier_Date?this.setDateFormate(item.courier_Date):"",
        "Vehicle no":item.vehicleno,
        "Security Person":item.persoN_NAME,
        "Acknowledged By":item.receiveD_BY,
        "Acknowledged Date":item.receiveD_DATE?this.setDateFormate(item.receiveD_DATE):"",
        "Acknowledge Comments":item.comments,
        "Reason for Cancellation":item.deL_REASON,
        "Cancelled By":item.deleteD_BY,
        "Cancelled date":item.deleteD_DATE?this.setDateFormate(item.deleteD_DATE):"",
        "REMARKS":item.remarks,
        "ACK":item.ack,
        "ITEM_NO":item.iteM_NO,
        "PO_NO":item.pO_NO,
        "PO_DATE":item.pO_DATE?this.setDateFormate(item.pO_DATE):"",
        "ITEM_CODE":item.iteM_CODE,
        "MATERIAL_TYPE":item.materiaL_TYPE,
        "ITEM_DESC":item.iteM_DESC,
        "UOM":item.uom,
        // "NO_OF_CASES":item.nO_OF_CASES,
        "QTY":item.qty,
        "QTY_RCVD":item.qtY_RCVD
      }
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, 'GateEntry_Inward_Register');
  }
  image:string;
  getbase64image()
  {
    this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
    .subscribe(blob => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
        console.log('Image in Base64: ', event.target.result);
        this.image=event.target.result;
      };

    });
  }
  downloadPdf()
  {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName ="MICROLABS LIMITED"+','+this.locationname;
    var ReportName = "GATE INWARD REGISTRY REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
    var logo = this.image;
    var htmnikhitml = htmlToPdfmake(`<html>
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
    })
    var docDefinition = {
      info: {
        title:'InRegister Report',
        },
     
      content: [
        htmnikhitml,
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
      pageSize: 'A3',
      pageMargins: [40, 80, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          
          columns: [
            {
              alignment: 'left',
              image: logo,
              width: 80,
              height: 60,
  
              margin: [30, 0, 0, 0]
            },
            {
              alignment: 'center',
              stack: [
                { text: OrganisationName},
                { text: ReportName},
              ],
              bold: true,
              fontSize: 16,
              width:'*',
              margin: [250, 0, 0, 0]
            
            },
            {
              alignment: 'right',
              stack: [
                { text: ['page ', { text: currentPage.toString() }, ' of ', { text: pageCount.toString() }]},
                { text: 'printedBy' + ":" + printedBy},
                { text: 'printedOn' + ":" + jsDate},
              ],
              bold: true,
              fontSize: 10,
              margin: [0, 0, 30, 0]
            }
           
          ],
          margin: 20
        }
      },
  
    };
    pdfMake.createPdf(docDefinition).open();
  }
  
}
