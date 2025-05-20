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
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, Time } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from "@angular/common/http";
import { toBase64String } from "@angular/compiler/src/output/source_map";
declare var toastr: any;

@Component({
  selector: 'app-DCVerificationReport',
  templateUrl: './DCVerificationReport.component.html',
  styleUrls: ['./DCVerificationReport.component.css']

})

export class DCVerificationReportComponent implements OnInit {


  public tableWidget: any;
  public tableWidget1: any;
  isLoading: boolean;
  isLoadingPop: boolean;
  plant: string;
  path: string;
  currentUser: AuthData;
  filteredModel: any[] = [];
  errMsg: string = "";
  DCList: any[] = [];
  isMasterSel: boolean = false;
  CancelType: string;
  PickedfilteredModel: any[] = [];
  Total: number;
  TotalLoose: number;
  TotalFull: number;
  RemQty: number;
  TotalQty: number;
  locationList: any[] = [];
  locationname: string;
  image: string;
  Vehicle: string;
  transporter: string;
  gtime: string;
  slno: number;
  VerifiedModel: any[] = [];
  CustomerModel: any[] = [];
  BarcodeModel: any[] = [];
  summary: any[] = [];
  userwisesummary: any[] = [];
  City: string;
  CustomerName: string;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  private initDatatable(): void {
    let exampleId: any = jQuery('#datatable1');
    this.tableWidget = exampleId.DataTable({
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

  private initDatatable2(): void {
    let exampleId: any = jQuery('#datatable2');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });

  }

  private reInitDatatable2(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable2(), 0)
  }

  private initDatatable3(): void {
    let exampleId: any = jQuery('#datatable3');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });

  }

  private reInitDatatable3(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable3(), 0)
  }

  ngOnInit(): void {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        // this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        this.plant = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
        this.locationname = this.locationList.find(x => x.id == this.currentUser.baselocation).name;

      }
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  getReport(dcno: string) {
    this.Total = 0;
    this.TotalLoose = 0;
    this.TotalFull = 0;
    this.httpService.GetDCVerificationData(APIURLS.BR_GET_DC_VERIFICATIO_REPORT, dcno, this.plant).then((data: any) => {
      if (data.table.length > 0) {
        // this.locationAllList = data;
        if (data.table[0].type == 'E') {
          this.isLoadingPop = false;
          swal({
            title: "Message",
            text: data.table[0].message,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
          return;
        }
        this.filteredModel = data;
        this.CustomerModel = data.table1;
        this.VerifiedModel = data.table;
        this.BarcodeModel = data.table4;
        this.summary = data.table2;
        this.userwisesummary = data.table3;
        this.VerifiedModel.forEach((element: { qty: string | number; }) => {
          this.Total = this.Total + +element.qty;
        });
        var loosemodel = this.VerifiedModel.filter(x => x.looseShippers == 1);
        loosemodel.forEach(element => {
          this.TotalLoose = this.TotalLoose+ +element.qty;
        });
        this.TotalFull = this.Total - this.TotalLoose;
        this.CustomerName = this.CustomerModel[0].customerName;
        this.City = this.CustomerModel[0].city;
        this.CustomerModel.reverse();
        //this.processData();
        this.reInitDatatable;

      }
      else {
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

  TypeofReport(dcno: string) {
    if (dcno != '' && dcno != null) {
      this.getReport(dcno);
    }
  }

  downloadPDF() {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.plant + ' - ' + this.locationname;
    var ReportName = "DC VERIFICATION REPORT"
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: 'DC Verification Report',
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
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50,
                alignment: 'center'
              }
                , { text: OrganisationName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' },
              {
                rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                  { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
              }],
              [''
                , { text: ReportName, bold: true, fontSize: 14, color: 'black', alignment: 'center', height: '*' }, '']

            ]
          },


          margin: [40, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.' }
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