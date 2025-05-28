import { OnInit, Component } from "@angular/core";
import { Router } from "@angular/router";
import { APIURLS } from "../../shared/api-url";
import { AppComponent } from "../../app.component";
import { HttpService } from "../../shared/http-service";
import { AuthData } from "../../auth/auth.model";
import swal from 'sweetalert';
declare var jQuery: any;
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, Time } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from "@angular/common/http";
import { SamplingFilter } from '../SamplingReport/SamplingReport.model';
import { ExcelService } from '../../shared/excel-service';
declare var toastr: any;
@Component({
  selector: 'app-SamplingReport',
  templateUrl: './SamplingReport.component.html',
  styleUrls: ['./SamplingReport.component.css']

})

export class SamplingReportComponent implements OnInit {


  public tableWidget: any;
  public tableWidget1: any;
  isLoading!: boolean;
  isLoadingPop!: boolean;
  plant!: string
  path!: string
  currentUser!: AuthData;
  errMsg: string = "";
  TotalQty!: number;
  locationList: any[] = [];
  locationname!: string
  image!: string
  gtime!: string
  slno!: number;
  today = new Date();
  Slno!: string
  PimNo!: string
  BatchNo!: string
  ItemCode!: string
  SamplesType!: string
  filterModel: SamplingFilter = {} as SamplingFilter;
  filterData: any[] = [];
  paginationData: any[] = [];
  exportfilterData: any[] = [];


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe, private excelService: ExcelService) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

  private initDatatable(): void {
    let exampleId: any = jQuery('#sampletable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });

  }

  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;

  getFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }
  ngOnInit(): void {
    this.path = this.router.url;
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;
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

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getSamplingReport();    
    this.filterModel.pageNo=1;
    this.filterModel.pageSize = 10;
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getSamplingReport();
  }

  totalCount: any;
  totalPages: any;
  getSamplingReport() {
    this.filterModel.export = false;
    this.filterModel.BatchNo = this.BatchNo;
    this.filterModel.PimNo = this.PimNo;
    this.filterModel.ItemCode = this.ItemCode;
    this.filterModel.Plant = this.plant;
    if (this.from_date != null)
      this.filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    if (this.to_date != null)
      this.filterModel.Todate = this.getFormatedDateTime(this.to_date);
    this.httpService.GetSamplingReport(APIURLS.BR_GET_SAMPLING_DATA, this.filterModel).then((data: any) => {
      if (data.table.length > 0) {
        this.filterData = data.table;
        this.totalCount = data.table1[0].totalCount;
        this.totalPages = data.table1[0].totalPages;

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
      alert(error);
    });

  }

  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.filterModel.Plant = this.plant;
    if (this.from_date != null)
      this.filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    if (this.to_date != null)
      this.filterModel.Todate = this.getFormatedDateTime(this.to_date);
    this.httpService.GetSamplingReport(APIURLS.BR_GET_SAMPLING_DATA, this.filterModel).then((data: any) => {
      if (data.table.length > 0) {
        this.exportfilterData = data.table;
        this.filterModel.export = false;
        var exportList = [];
        let index = 0;
        this.exportfilterData.forEach((item :any) => {
          index = index + 1;
          let exportItem = {
            "SNo": index,
            "PIM No": item.piM_No,
            "PIM Date": this.getFormatedDateTime(item.pimDate),
            "Item Code": item.item_Code,
            "Item Desc": item.item_Desc,
            "Batch No": item.batchNo,
            "Shipper": item.barcode,
            "QC Samples": item.qC_Stock,
            "Control Samples": item.controlSample,
            "Sampled By": item.sampledBy,
            "Mfg Date": this.getFormatedDateTime(item.mfg_Date),
            "Exp Date": this.getFormatedDateTime(item.exp_Date)
          };
          exportList.push(exportItem);
        });
        this.excelService.exportAsExcelFile(exportList, 'Sampling Report');
        this.isLoading = false;
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
      alert(error);
    });


  }

  downloadPDF() {
    var printContents = document.getElementById('pdf')!.innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.plant + ' - ' + this.locationname;
    var ReportName = "PICKED SUMMARY REPORT"
    var printedBy = this.currentUser.fullName;
    var pipe = new DatePipe('en-US');
    var now = Date.now();
    var date = pipe.transform(now, 'short');
    var logo = this.image;
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
        title: ReportName,
      },
      content: [
     //   htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        // pageMargins: [30, 60, 10, 20],
        bold: false,
        th: { bold: true }
      },
      stack: [{
        unbreakable: true,
      }],
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [80, 100, 100, 60],
      pageOrientation: 'landscape',
      header: function (currentPage:any, pageCount:any) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [100, 500, 70],
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


          margin: [70, 40, 40, 60]
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'right',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + date + '.', alignment: 'right' }
              ],

              bold: true,
              fontSize: 10,
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
