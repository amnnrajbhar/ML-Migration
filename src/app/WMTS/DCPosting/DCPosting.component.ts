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
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-DCPosting',
  templateUrl: './DCPosting.component.html',
  styleUrls: ['./DCPosting.component.css']

})

export class DCPostingComponent implements OnInit {


  public tableWidget: any;
  public tableWidget1: any;
  DCNo: string;
  pimdatalist: any[] = [];
  HeaderList: Header[] = [];
  ItemList: LineItem[] = [];
  isLoading: boolean;
  isLoadingPop: boolean;
  plant: string;
  path: string;
  currentUser: AuthData;
  locationList: any[] = []
  filteredModel: any[] = [];
  pickingModel: any[] = [];
  looseModel: any[] = [];
  dcverificationModel: any[] = [];
  totaltimeModel: any[] = [];
  customerModel: any[] = [];
  materialstatusmodel: any[] = [];
  errMsg: string = "";
  totalqty: number;
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



  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationMaster();
    this.getbase64image();
  }

  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        // this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        this.plant = 'ML54';
        this.locationname = this.locationList.find(x => x.code == this.plant).name;

      }
      this.reInitDatatable();
      //this.reInitDatatable1();
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  BinModel: any[] = [];
  BIN: any;
  pimheader = {} as Header;
  Tracking: any = {};
  docNo: any = null;
  toNo: any = null;

  post: boolean = false;
  groupbydcforsum;
  getDcData(dcNo: String) {
    this.totalqty = 0;
    this.httpService.getDCData(APIURLS.BR_GET_DC_DATA, dcNo).then((data: any) => {

      if (data.table[0].type == 'E') {
        swal({
          title: "Message",
          text: data.table[0].message,
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        })
      }
      else {
        this.filteredModel = data.table;
        this.pickingModel = data.table1;
        this.looseModel = data.table2;
        this.dcverificationModel = data.table3;
        this.totaltimeModel = data.table4;
        this.customerModel = data.table5;
        if(this.customerModel != null)
        {
          this.CustomerName = this.customerModel[0].customerName;
          this.City = this.customerModel[0].city;
        }
        
        
        this.filteredModel.forEach(element => {
          this.totalqty = this.totalqty + +element.quantity
        });
        let temp = this.filteredModel.find(x => x.status == true);
        temp ? this.post = true : this.post = false;

        this.filteredModel.reverse();
        this.groupbydcforsum = this.groupBy(this.filteredModel, 'dcno');
        this.processData();
      }
    }).catch(error => {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  pimheaderModel = {} as Header;
  ItemModel: LineItem[] = [];

  dataTable: any[] = [];

  private processData() {
    const labelchecked = {};

    this.dataTable = this.filteredModel
      .sort((a, b) => {
        const taskComparator = a.dcno.localeCompare(b.dcno);
        return taskComparator
          ? taskComparator
          : a.dcno.localeCompare(b.dcno);
      })
      .map((x) => {
        const taskColumnSpan = labelchecked[x.dcno]
          ? 0
          : this.filteredModel.filter((y) => y.dcno === x.dcno).length;
        labelchecked[x.dcno] = true;
        return { ...x, taskColumnSpan };
      });
  }

  groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
      var key = obj[property];
      if (!acc[key]) {
        acc[key] = { count: 1, aggregation: obj.quantity };
      } else {
        let count = acc[key].count + 1;
        let aggregation = acc[key].aggregation += obj.quantity;
        acc[key] = { count: count, aggregation: aggregation };
      }
      return acc;
    }, {});
  }

  Postdata() {
    this.isLoading = true

    var filterModel: any = {};
    filterModel.Dcno = this.DCNo;
    filterModel.plant = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
    filterModel.generatedBy = this.currentUser.employeeId;
    this.httpService.postMIGO(APIURLS.BR_GET_PIM_POST_DC_DATA, filterModel).then((data: any) => {
      if (data.length > 0 || data != null) {
        // this.locationAllList = data;
        if (data.type == 'E') {
          //  this.pimheader=data;   
          swal({
            title: "Message",
            text: data.message,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
          this.isLoading = false
        }
        else {
          //this.filteredModel=[];
          swal({
            title: "Message",
            text: data.message,
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          })
          this.isLoading = false;
        }
      }
      //this.getDcData(this.DCNo);
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.pimdatalist = [];
    });
  }



  detailedList: any[] = [];
  showDetailedView(item) {
    this.detailedList = [];
    this.detailedList = this.materialstatusmodel.filter(x => x.lineItemNo == item.lineItemNo);
    jQuery('#DetailedModal').modal('show');
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
  setFormatedTime(date: any) {
    let dt = new Date(date);
    let formateddate =
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  locationname: any;
  async printreport(dcNo: String) {
    //  await this.httpService.getDCData(APIURLS.BR_GET_DC_POSTED_DATA,dcNo).then((data: any) => {
    //     if (data.length > 0) {
    //       this.customerModel = data;
    //       this.CustomerName = this.customerModel[0].customerName1;
    //     this.City = this.customerModel[0].city;
    //     }
    //   });
    this.getDcData(dcNo);
    this.downloadPdf();

  }

  downloadPdf() {

    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.plant + ' - ' + this.locationname;
    var ReportName = "DC POSTING SUMMARY REPORT"
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
        title: 'DC Posting Report',
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



  image: string;
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
}

