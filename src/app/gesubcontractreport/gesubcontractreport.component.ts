import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';
import { APIURLS } from '../shared/api-url';
import { ExcelService } from '../shared/excel-service';
import { HttpService } from '../shared/http-service';
declare var jQuery: any;
declare var $: any;

// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient,HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-gesubcontractreport',
  templateUrl: './gesubcontractreport.component.html',
  styleUrls: ['./gesubcontractreport.component.css']
})
export class GesubcontractreportComponent implements OnInit {

  currentUser!: AuthData;
  tableWidget: any;
  path!: string
  errMsg: string = "";
  isLoading!: boolean;
  gateOutwardMList: any=[];
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
      this.getLocationList();
      this.getbase64image();
      this.getDepartmentList();
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
  departmentList = [];
  sendingDEPTNAME: any;
  getDepartmentList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter((x:any)=>x.isActive);
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.departmentList = [];
    });
  }
  //Search Filters
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
        this.selectedLocations=this.locationList.filter((x:any)=>x.id== this.currentUser.baselocation);
        let temp=data.find(x=>x.id== this.currentUser.baselocation);
        this.locationname=temp.code +'-'+temp.name;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.status = null;
    this.fltrGONO = null;
    this.fltrInvoiceNo = null;
    this.fltrDCNo=null;
    this.selectedLocations = [];
    this.sendingDEPTNAME=null;
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  status: string=null;
  fltrGONO: string
  fltrInvoiceNo: string
  fltrDCNo:string;
  loadGateOutwardList() {
    this.isLoading = true;
    var genericGateEntryM = {} as GenericGateEntryM;
    if (this.selectedLocations != null) {
      let locations = null;
      this.selectedLocations.forEach(loc => {
        locations = loc.code + ',' + locations;
      });
      genericGateEntryM.planT_ID = locations;
    }
    if (this.from_date != null)
      genericGateEntryM.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      genericGateEntryM.todate = this.getDateFormate(this.to_date);
    genericGateEntryM.isack = this.status;
    genericGateEntryM.gI_NO = this.fltrGONO;
    genericGateEntryM.dC_NO= this.fltrDCNo;
    genericGateEntryM.doC_NO = this.fltrInvoiceNo;
    if (this.sendingDEPTNAME != null)
      genericGateEntryM.namE1 = this.sendingDEPTNAME.name;
    this.httpService.post(APIURLS.BR_GE_SUBCONTRACT_REPORT_API, genericGateEntryM).then((data: any) => {
      if (data) {
        this.gateOutwardMList = data;
        // this.gateOutwardMList.reverse();
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
        "FIN_YEAR":item.fiN_YEAR,
        "GONO":item.gO_NO,
        "GODATE":item.gO_DATE?this.setDateFormate(item.gO_DATE):'',
        "LOCATION":item.planT_ID,
        "DC No":item.dC_NO,
        "DC Date":item.dC_DATE?this.setDateFormate(item.dC_DATE):'',
        "DOC No":item.doC_NO,
        "DOC Date":item.doC_DATE?this.setDateFormate(item.doC_DATE):'',
        "Sending Department":item.sendinG_DEPT_NM,
        "Sending Person":item.personName,
        "DESTINATION":item.destinatioN_NM,
        "EXP RETURN DATE":item.exP_RETURN_DATE?this.setDateFormate(item.exP_RETURN_DATE):'',
        "Actual_OutTime":item.ouT_TIME?this.setFormatedDateTime(item.ouT_TIME):'',
        "ITEM CODE":item.itEM_CODE,
        "iteM DESC":item.iteM_DESC,
        "UOM":item.uom,
        "QTY":item.qty?item.qty:0,
        "QTY RCVD":item.qtY_RCVD?item.qtY_RCVD:0,
        "Remain QTY":item.remainQTY?item.remainQTY:0,
      }
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, 'GateEntry_Returnable_Closure_report');
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
    var ReportName = "SUBCONTRAC RECONCILIATION REPORT"
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
        title:'SubContract Report',
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
