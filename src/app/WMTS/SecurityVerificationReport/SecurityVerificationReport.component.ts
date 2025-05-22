import { OnInit, Component } from "@angular/core";
import { Router } from "@angular/router";
import { APIURLS } from "../../shared/api-url";
import { AppComponent } from "../../app.component";
import { HttpService } from "../../shared/http-service";
import { Header } from "../Header.model";
import { LineItem } from "../Lineitem.model";
import { AuthData } from "../../auth/auth.model";
import swal from 'sweetalert';
declare var jQuery: any;
import { ExcelService } from '../../shared/excel-service';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from "@angular/common/http";
import { filter } from "rxjs-compat/operator/filter";

@Component({
  selector: 'app-SecurityVerificationReport',
  templateUrl: './SecurityVerificationReport.component.html',
  styleUrls: ['./SecurityVerificationReport.component.css']

})

export class SecurityVerificationReportComponent implements OnInit {


  public tableWidget: any;
  Invoice: string;
  ItemList: LineItem[] = [];
  isLoading: boolean;
  isLoadingPop: boolean;
  filterplant: string;
  path: string;
  currentUser: AuthData;
  filteruser: string;
  locationList: any[] = [];
  filteredModel: any;
  VerifiedModel: any[] = [];
  InvoiceModel: any[] = [];
  BarcodeModel: any[] = [];
  materialstatusmodel: any[] = [];
  errMsg: string = "";
  date: any;
  today = new Date();
  summary: any[] = [];
  userwisesummary: any[] = [];
  vehicleno: string;
  dtOptions = {};
  image: any;
  plant: string;
  locationname: string;
  transportername: string;
  transportdate: string;
  groupbyinvoiceforsum;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private datePipe: DatePipe
    , private http: HttpClient) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationMaster();
    this.getbase64image();
  }

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

  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
       // this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        this.plant='ML54';
        this.locationname=this.locationList.find(x=>x.code==this.plant).name;
       
      }
      this.reInitDatatable();
        //this.reInitDatatable1();
      }).catch(error => {
        this.isLoading = false;
        this.locationList = [];
      });
    }
  private initDatatable(): void {
    let exampleId: any = jQuery('#datatable');
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

  inv1: string;
  Total: number =0;
  getReport(inv: string)
  {
    this.Total=0
    this.httpService.getDCData(APIURLS.BR_GET_SECURITY_VERIFICATION_DATA, inv).then((data: any) => {
      if (data.table.length > 0) {
       // this.locationAllList = data;
        
          this.filteredModel = data;
          this.InvoiceModel = data.table1;
          this.VerifiedModel = data.table;
          this.BarcodeModel = data.table4;
          this.summary = data.table2;
        this.userwisesummary = data.table3;
        this.vehicleno = this.InvoiceModel[0].vehicleNo;
        this.transportdate = this.InvoiceModel[0].doneOn;
        this.transportername = this.InvoiceModel[0].transporterName;
         this.VerifiedModel.forEach((element: { qty: string | number; }) => { 
           this.Total = this.Total+ +element.qty;
         });
         
         this.InvoiceModel.reverse();
         this.groupbyinvoiceforsum = this.groupBy(this.InvoiceModel, 'invoiceNo');
         this.processData();
          this.reInitDatatable;
                 
      }
      else
      {
        swal({
          title: "Message",
          text: "No data exists.",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        })
      }
     // this.reInitDatatable();
      //this.reInitDatatable1();
    }).catch((error: any) => {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  dataTable: any[] = [];

  private processData() {
    const labelchecked = {};

    this.dataTable = this.InvoiceModel
      .sort((a, b) => {
        const taskComparator = a.invoiceNo.localeCompare(b.invoiceNo);
        return taskComparator
          ? taskComparator
          : a.invoiceNo.localeCompare(b.invoiceNo);
      })
      .map((x) => {
        const taskColumnSpan = labelchecked[x.invoiceNo]
          ? 0
          : this.InvoiceModel.filter((y) => y.invoiceNo === x.invoiceNo).length;

        labelchecked[x.invoiceNo] = true;



        return { ...x, taskColumnSpan };
      });
  }

  groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
      var key = obj[property];
      if (!acc[key]) {
        acc[key] = { count: 1, aggregationf: obj.full, aggregationl: obj.loose };
      } else {
        let count = acc[key].count + 1;
        let aggregationf = acc[key].aggregationf += obj.full;
        let aggregationl = acc[key].aggregationl += obj.loose;
        acc[key] = { count: count, aggregationf: aggregationf, aggregationl: aggregationl };       
      }
      return acc;
    }, {});
  }

  downloadPDF()
  {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName ="MICRO LABS LIMITED"+', '+this.plant+' - '+this.locationname;
    var ReportName = "SECURITY LOADING REPORT"
    var printedBy = this.currentUser.fullName;
    var pipe = new DatePipe('en-US');
    var now = Date.now();
    var logo = this.image;
    //var now = new Date('dd-MM-yyyy h:mm a');
    var date = pipe.transform(now, 'short');
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
      tablebordered:true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: 'Security Loading Report',
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
       // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 100, 40, 40],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
        // pageMargins: [40, 80, 40, 60],
         style: 'tableExample',
         color: '#444',
         table: {
          widths: [60, 370, 60],
           headerRows: 2,
           heights: [20, 10, 10,10],
           // keepWithHeaderRows: 1,
           body: [
            [{rowSpan: 2,	image: logo,
            width: 50,
              alignment: 'center'}
            , {text: OrganisationName, 	bold: true, fontSize: 15,color: 'black',alignment: 'center',height:'*'}, 
            {rowSpan: 2,text: ['Page ', { text: currentPage.toString() }, ' of ',
             { text: pageCount.toString() }], bold: true, fontSize: 10,color: 'black', alignment: 'center'}],
             [''
              , {text: ReportName, bold: true, fontSize: 14,color: 'black', alignment: 'center',height:'*'},'']
           
          ]
         },

         
          margin: [40, 40, 40, 60]
        }
      },
      footer: function(){
        return {

          columns: [
           
            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy +', '+'Printed On' + ": " + date+'.'  }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }
//imgData
          ],
          margin: 20
        }
      },
     
    };
    pdfMake.createPdf(docDefinition).open();
  }

}