import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { GateOutwardMaster } from '../gateentrymodels/gateoutwardm.model';
import { APIURLS } from '../shared/api-url';
import { HttpService } from '../shared/http-service';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
import { fn } from '@angular/compiler/src/output/output_ast';
import { ExcelService } from '../shared/excel-service';
declare var jQuery: any;
declare var $: any;

import swal from 'sweetalert';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient,HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-geoutregreport',
  templateUrl: './geoutregreport.component.html',
  styleUrls: ['./geoutregreport.component.css']
})
export class GEOutRegComponent implements OnInit {
  currentUser!: AuthData;
  tableWidget: any;
  path!: string
  errMsg: string = "";
  isLoading!: boolean;
  gateOutwardMList: GateOutwardMaster[]=[];
  gateOutwardDList: any;
  exportList!: any[];
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,private excelService:ExcelService,
    private http: HttpClient) { 
//pdfMake.vfs = pdfFonts.pdfMake.vfs;
}
  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getFinacialYears();
      this.getLocationList();
      this.getbase64image();
      this.getEmployeeList();
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
        { "orderable": false, "targets": 0 }
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
  onYearDeSelect(item: any) {
  }
  onYearDeSelectAll(items: any) {
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
  onLocationDeSelect(item: any) {
  }
  onLocationDeSelectAll(items: any) {
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
        this.locationList = data.filter((x:any)=>{ return x.isActive;}).map((i:any) => { i.location = i.code + '-' + i.name; return i; });
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        this.locationList.sort((a:any,b:any)=>{return collator.compare(a.code,b.code)});
        let temp=data.find(x=>x.id== this.currentUser.baselocation);
        this.locationname=temp.code +'-'+temp.name;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
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
    {id:0, name: 'In Person' },
    {id:1, name: 'Courier' },
    {id:2, name: 'Vehicle' }
  ]
  selectedModes: any = null;
  onItemDeSelect(item: any) {
  }
  onDeSelectAll(items: any) {
    this.selectedModes = [];
  }
  onSelectAll(items: any) {
    this.selectedModes = items;
  }
  goTypeList = [
    { name: 'SALES',type:'E' },
    { name: 'STO' ,type:'4'},
    { name: 'Sub-Contracting' ,type:'3'},
    { name: 'Returnable' ,type:'2'},
    { name: 'Non-Retunable' ,type:'N'}
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
  onTypeDeSelect(item: any) {
  }
  onTypeDeSelectAll(items: any) {
    this.selectedTypes = [];
  }
  onTypeSelectAll(items: any) {
    this.selectedTypes = items;
  }
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.delete = false;
    this.pendingbysecurity=false;
    this.fltrGONO = null;
    this.fltrInvoiceNo = null;
    this.fltrDCNO = null;
    this.selectedLocations = [];
    this.selectedModes = [];
    this.selectedFNYears = [];
    this.selectedTypes=[];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  delete: boolean = false;
  pendingbysecurity:boolean=false;
  fltrGONO: string
  fltrInvoiceNo: string
  fltrDCNO: string
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
    genericGateEntryM.pendingbysecurity = this.pendingbysecurity ? 'Yes':'No';
    genericGateEntryM.gI_NO = this.fltrGONO;
    genericGateEntryM.doC_NO = this.fltrInvoiceNo;
    genericGateEntryM.ack = this.fltrDCNO;
    if (this.selectedModes != null) {
      let delmodes = null;
      this.selectedModes.forEach(mode => {
        delmodes = mode.name + ',' + delmodes;
      });
      genericGateEntryM.deliverymode = delmodes;
    }
    this.httpService.post(APIURLS.BR_MASTER_GATEOUTWARDM_REGISTER_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.gateOutwardMList = data;
        this.gateOutwardMList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.gateOutwardMList = [];
    });
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  employeeList:any[]=[];
  getEmployeeList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_USER_API).then((data: any) => {
      if (data.length > 0) {
        this.employeeList = data;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.employeeList = [];
    });
  }
  showEmployeeName(empid) {
    return this.employeeList.find((x:any)  => x.employeeId == empid)?this.employeeList.find((x:any)  => x.employeeId == empid).fullName:empid;
  }
  showGoType(type) {
    let temp = this.goTypeList.find((x:any)  => x.type == type);

    if (!temp) {
      return null;
    }

    return temp.name;
  }
  materialType:boolean=false;
  onGateEntryActions(gateOutwardM: GateOutwardMaster) {
    if (gateOutwardM.gO_TYPE == '2' || gateOutwardM.gO_TYPE == 'N')
      this.materialType = true;
      this.httpService.getById(APIURLS.BR_MASTER_GATEOUTWARDD_ANY_API, gateOutwardM.id).then((data: any) => {
        if (data) {
          this.gateOutwardDList = data;
        }
      }).catch((error)=> {
        this.gateOutwardDList = [];
      });
      jQuery("#MaterialModal").modal('show');
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
  exportAsXLSX(): void {
    this.exportList=[];
    let index=0;
    this.gateOutwardMList.forEach((item :any) => {
      index=index+1;
      let exportItem={
        "SNo":index,
        "Financial Year":item.fiN_YEAR,
        "Location":item.planT_ID,
        "Document Type":this.showGoType(item.gO_TYPE),
        "GateNO":item.gO_GATENO,
        "GONo":item.gO_NO,
        "Actual Out Time":item.ouT_TIME?this.setFormatedDateTime(item.ouT_TIME):'',
        "DC No":item.dC_NO,
        "DC Date":item.dC_DATE?this.setDateFormate(item.dC_DATE):'',
        "Invoice/DOC No":item.doC_NO,
        "Invoice/DOC Date":item.doC_DATE?this.setDateFormate(item.doC_DATE):'',
        "Sending Department":item.sendinG_DEPT_NM,
        "Sending Person":this.showEmployeeName(item.sendinG_PERSON),
        "Sending Reason":item.sendinG_REASON,
        "DESTINATION/Location":item.destinatioN_NM,
        "Returnable Closure":item.gO_TYPE=='2'?item.gO_FLG=='Y'?'Yes':'No':'NA',
        "Returnable Comments":item.comments,
        "EXP RETURN DATE":item.exP_RETURN_DATE?this.setDateFormate(item.exP_RETURN_DATE):'',
        "Delivery Mode":item.deliverymode,
        "Delivery Person":item.deliveryperson,
        "Courier Name":item.courier_Name,
        "Courier Num":item.courier_Num,
        "Courier Date":item.courier_Date?this.setDateFormate(item.courier_Date):'',
        "Vehicle no":item.vehicleno,
        // "EXP OUT TIME":item.exP_OUT_TIME?this.setFormatedDateTime(item.exP_OUT_TIME):'',
        "Security Person":this.showEmployeeName(item.persoN_NAME),
        "Reason for Cancellation":item.deL_REASON,
        "Cancelled by":item.deleteD_BY,
        "Cancelled date":item.deleteD_DATE?this.setDateFormate(item.deleteD_DATE):'',
        "REMARKS":item.remarks
      }
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, 'GateEntry_Outward_Register');
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
    var printContents = document.getElementById('pdf')!.innerHTML;
    var OrganisationName ="MICROLABS LIMITED"+','+this.locationname;
    var ReportName = "GATE OUTWARD REGISTRY REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate =this.setFormatedDateTime(now);
    var logo = this.image;
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
        title:'OutRegister Report',
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
      pageSize: 'A3',
      pageMargins: [40, 80, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage:any, pageCount:any) {
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
    //pdfMake.createPdf(docDefinition).open();
  }
}
