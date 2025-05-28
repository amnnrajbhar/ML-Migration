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
//import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
//import * as fs from 'file-saver';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-LooseDCLabelSummary',
  templateUrl: './LooseDCLabelSummary.component.html',
  styleUrls: ['./LooseDCLabelSummary.component.css']

})

export class LooseDCLabelSummaryComponent implements OnInit {


  public tableWidget: any;
  DCLabel: string
  ItemList: LineItem[] = [];
  isLoading!: boolean;
  isLoadingPop!: boolean;
  filterplant!: string
  path!: string
  currentUser!: AuthData;
  filteruser: string
  locationList: any[] = [];
  filteredModel: any[] = [];
  materialstatusmodel: any[] = [];
  errMsg: string = "";
  date: any;
  today = new Date();
  filtermatType: string
  Barcode: string
  ItemDesc: string
  BatchNo: string
  ItemCode: string
  filterPONo: string
  DCNo: string
  TotalQty!: number;
  plant!: string
  locationname!: string
  image!: string
  CustomerName: string
  City: string
  DoneBy: string
  groupbydclabelforsum;
  summary: any[] = [];
  userwisesummary: any[] = [];
  TotalLoose!: number;
  TotalFull!: number;
  TotalShippers!: number;
  CustomerModel: any[] = [];

  dtOptions = {};

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private datePipe: DatePipe
    , private http: HttpClient) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

  ngOnInit() {
    this.path = this.router.url;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.getLocationMaster();
    this.getbase64image();
  }
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


  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        // this.locationAllList = data;
        this.locationList = data.filter((x:any)  => x.isActive);
        this.plant = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation).code;
        this.locationname = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation).name;

      }
      this.reInitDatatable();
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  getLooseTransferReport(DCLabel: any) {
    this.TotalQty = 0;
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};

    filterModel.plant = this.plant;
    filterModel.DCLabel = DCLabel;


    this.httpService.postMIGO(APIURLS.BR_GET_DCLOOSETRANSFER_DATA, filterModel).then((data: any) => {
      if (data) {
        if (data.table[0].type == 'E') {
          this.isLoadingPop = false;
          swal({
            title: "Message",
            text: data.table[0].message,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
        }
        else {
          this.CustomerName = data.table3[0].customerName;
          this.City = data.table3[0].city;
          this.DoneBy = data.table[0].doneBy
          this.filteredModel = data.table;
          this.CustomerModel = data.table3
          this.summary = data.table1;
          this.TotalFull = this.summary[0].totalfull;
          this.TotalLoose = this.summary[0].totaldcshippers;
          this.TotalShippers = this.TotalFull+ +this.TotalLoose;
          this.userwisesummary = data.table2;

          this.filteredModel.forEach((element:any)=> {

          this.TotalQty = this.TotalQty+ +element.qty});

          this.filteredModel.reverse();
          this.groupbydclabelforsum = this.groupBy(this.filteredModel, 'dcLabel');
          this.processData();
        }

      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  dataTable: any[] = [];

  private processData() {
    const labelchecked = {};

    this.dataTable = this.filteredModel
      .sort((a:any, b:any) => {
        const taskComparator = a.dcLabel.localeCompare(b.dcLabel);
        return taskComparator
          ? taskComparator
          : a.dcLabel.localeCompare(b.dcLabel);
      })
      .map((x:any) => {
        const taskColumnSpan = labelchecked[x.dcLabel]
          ? 0
          : this.filteredModel.filter((y) => y.dcLabel === x.dcLabel).length;

        labelchecked[x.dcLabel] = true;



        return { ...x, taskColumnSpan };
      });
  }

  groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
      var key = obj[property];
      if (!acc[key]) {
        acc[key] = { count: 1, aggregation: obj.qty };
      } else {
        let count = acc[key].count + 1;
        let aggregation = acc[key].aggregation += obj.qty;
        acc[key] = { count: count, aggregation: aggregation };
      }
      return acc;
    }, {});
  }

  downloadPDF() {
    var printContents = document.getElementById('pdf')!.innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.plant + ' - ' + this.locationname;
    var ReportName = "LOOSE SHIPPER DETAILS"
    var printedBy = this.currentUser.fullName;
    var pipe = new DatePipe('en-US');
    var now = Date.now();
    var date = pipe.transform(now, 'dd/MM/yyyy HH:mm');
    var logo = this.image;
    var CheckedBy = this.DoneBy;
    // var htmnikhitml = htmlToPdfmake(`<html>
    // <head>
    // </head>
    // <body>
    // ${printContents}
    // <div> 
    // </div>
    // </body>  
    // </html>`, {
    //   tableAutoSize: true,
    //   tablebordered: true,
    //   headerRows: 1,
    //   dontBreakRows: true,
    //   keepWithHeaderRows: true,
    // })
    var docDefinition = {
      info: {
        title: 'Loose Summary Slip',
      },
      content: [
     //   htmnikhitml,
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
      pageMargins: [40, 100, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [60, 350, 70],
            headerRows: 2,
            //heights: [20, 10, 10,10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50, height: 40,
                opacity: 0.5, alignment: 'center'
              }
                , { text: OrganisationName, arial: true, bold: true, fontSize: 15, color: 'black', alignment: 'center' },
              {
                rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportName, arial: true, bold: true, fontSize: 13, color: 'black', alignment: 'center' },
                '']
            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              stack: [
               
                {
                  table: {
                    widths: [550,0,0],
                    body: [
                      [{ text: "Loose items checked by: " + CheckedBy, bold: true, fontSize: 12, color: 'black', alignment: 'left', height: '100' }]
                    ]
                  }
                },
               
           
                {
                  alignment: 'right',

                  stack: [
                    { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.', alignment: 'right' }
                    //,

                    //  { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString(), alignment: 'right' }
                  ],

                  bold: true,
                  fontSize: 10,
                }
              ]
            }
            //imgData
          ],
          margin: 20
        }
      },

    };
    //pdfMake.createPdf(docDefinition).open();
  }
}

