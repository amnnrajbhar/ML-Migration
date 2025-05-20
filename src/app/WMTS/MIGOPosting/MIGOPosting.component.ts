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
  selector: 'app-MIGOPosting',
  templateUrl: './MIGOPosting.component.html',
  styleUrls: ['./MIGOPosting.component.css']

})

export class MIGOPostingComponent implements OnInit {


    public tableWidget: any;
    public tableWidget1: any;
    PIMNo:string;
    pimdatalist:any[]=[];
    HeaderList:Header[]=[];
    ItemList:LineItem[]=[];
    isLoading: boolean;
    isLoadingPop: boolean;
    plant:string;
    path: string;
    currentUser: AuthData;
    locationList:any[]=[]
    filteredModel:any[]=[];
    samplesData:any[]=[];
    materialstatusmodel:any[]=[];
    errMsg: string = "";
    TotalShippers:number=0;
    TotalLooseShippers:number=0;
    TotalFullShippers:number=0;
    TotalPIMQty:number=0;
    TotalPIMPallets:number=0;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }




  private initDatatable(): void {
    let exampleId: any = jQuery('#datatable');
    this.tableWidget = exampleId.DataTable({
      //  "order": []
    });

  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }
  private initDatatable1(): void {
    let exampleId: any = jQuery('#datatable1');
    this.tableWidget1 = exampleId.DataTable({
      "order": []
    });

  }

  private reInitDatatable1(): void {
    if (this.tableWidget1) {
      this.tableWidget1.destroy()
      this.tableWidget1 = null
    }
    setTimeout(() => this.initDatatable1(), 0)
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
        this.plant = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
        // this.locationname=this.plant+' - '+this.locationList.find(x=>x.id==this.currentUser.baselocation).name
      }
      this.reInitDatatable();
      this.reInitDatatable1();
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
  docdate: any;
  todate: any;
  toNo: any = null;
  PostedBy: any = null;
  PostedOn: any = null;
  GetData(pim) {
    this.docNo = null;
    this.toNo = null;
    this.TotalPIMPallets = 0;
    this.TotalPIMQty=0;
    this.httpService.GetPimData(APIURLS.BR_GET_PIM_DATA, pim, this.plant).then((data: any) => {
      if (data.length > 0 || data != null) {
        // this.locationAllList = data;
        if (data.type == 'E') {
          this.pimheader = data;
          swal({
            title: "Message",
            text: this.pimheader.message,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
        }
        else {
          this.BIN = null;
          this.pimheader = data;
          this.filteredModel = this.pimheader.filteredstatusmodel;
          this.materialstatusmodel = this.pimheader.materialstatusmodel;
          this.BinModel = this.pimheader.binModel;

          this.filteredModel.forEach(element => {
            element.binModel=this.BinModel.filter(x=>x.lineItemNo==element.lineItemNo && x.batchNo==element.batchNo);
            this.TotalPIMQty = this.TotalPIMQty+ +element.qty;
            this.TotalPIMPallets = this.TotalPIMPallets+ +element.totalPallets;
          });


          this.GetPimData(pim);
          this.Tracking = this.pimheader.tracking;
          if (this.Tracking != null || this.Tracking != undefined) {
            this.docNo = this.Tracking.docNo == '' ? null : this.Tracking.docNo;
            this.toNo = this.Tracking.toNo == '' ? null : this.Tracking.toNo;
            this.docdate = this.Tracking.docNo ? this.Tracking.docpostedOn : null;
            this.todate = this.Tracking.topostedOn ? this.Tracking.topostedOn : null;
            this.TotalLooseShippers = this.Tracking.looseCount ? +this.Tracking.looseCount : 0;
            this.TotalFullShippers = this.Tracking.fullCount ? +this.Tracking.fullCount : 0;
            this.PostedBy = this.Tracking.docpostedBy == '' ? null : this.Tracking.docpostedBy + ' - ' + this.Tracking.fullName;
            this.PostedOn = this.Tracking.docpostedOn == '' ? null : this.Tracking.docpostedOn;
          }

        }
        this.reInitDatatable();
        this.reInitDatatable1();
      }

    }).catch(error => {
      this.isLoading = false;
      this.pimdatalist = [];
    });
  }
  GetPimData(pim: string) {
    this.httpService.GetPimData(APIURLS.BR_GET_PIM_ITEM_DATA, pim, this.plant).then((data: any) => {
      if (data.length > 0 || data != null) {

        this.pimdatalist = data;
        this.getDataforReport();
      }

    }).catch(error => {
      this.isLoading = false;
      this.pimdatalist = [];
    });
  }

    ReportModel:any[]=[];
    getDataforReport()
    {
      this.ReportModel=[];
      this.TotalShippers=0;
      this.pimheader.binModel.forEach(element => {
       element.itemDesc=this.filteredModel.find(x=>x.itemCode==element.itemCode).itemDesc;
       element.mfgDate=this.filteredModel.find(x=>x.batchNo==element.batchNo).mfgDate;
       element.expDate=this.filteredModel.find(x=>x.batchNo==element.batchNo).expDate;
       element.packSize =this.filteredModel.find(x=>x.batchNo==element.batchNo).packSize;
       element.pimNo=this.filteredModel.find(x=>x.batchNo==element.batchNo).pimNo;
       element.mrp=this.filteredModel.find(x=>x.batchNo==element.batchNo).mrp;
      });
     this.ReportModel=this.pimheader.binModel;
     this.samplesData=this.pimheader.samples;
     for(let i=0;i<this.ReportModel.length;i++)
     {
      this.TotalShippers=this.TotalShippers+ +this.ReportModel[i].shippers;
     }
     let temp=this.locationList.find(x=>x.code==this.materialstatusmodel[0].plant);
     this.locationname=temp.code+' - '+temp.name
    }



  pimheaderModel = {} as Header;
  ItemModel: LineItem[] = [];
  Postdata() {
    this.isLoading = true;
    var filterModel: any = {};
    this.ItemModel = [];
    this.pimheader.binModel.forEach(element => {
      let item = new LineItem();
      var temp = this.pimheader.materialstatusmodel.find(x => x.lineItemNo == element.lineItemNo && x.batchNo == element.batchNo && x.itemCode == element.itemCode && x.poStoSr == element.poStoSr);
      item.batchNo = element.batchNo;
      item.costCenter = '';
      item.itemCode = element.itemCode;
      item.movTyp = '';
      item.plant = temp.plant;
      item.po = temp.poStoSr;
      item.poLineItem = element.lineItemNo;
      item.profitCenter = '';
      item.qtyUOM = element.qty;
      item.stockType = '';
      item.storageLoc = '';
      item.uom = '';
      item.destStorageBin = element.bin;
      item.destStorageSection = '';
      item.destStorageType = ''
      item.vendorCode = temp.vendorCode;
      item.oBDNo = temp.obdNo;
      item.oBDItem = temp.obdItem;
      this.ItemModel.push(item);
    });
    this.pimheader.refDocNo = this.pimheader.slNo;
    filterModel.PostedBy = this.currentUser.employeeId;
    filterModel.Plant = this.plant;
    this.pimheader.matDocNo = this.docNo;
    filterModel.hedaer = this.pimheader;
    filterModel.items = this.ItemModel;
    this.httpService.postMIGO(APIURLS.BR_GET_PIM_POST_MIGO_DATA, filterModel).then((data: any) => {
      this.isLoadingPop = false;
      if (data.length > 0 || data != null) {
        // this.locationAllList = data;

        if (data.type == 'E') {
          this.isLoadingPop = false;
          //  this.pimheader=data;   
          swal({
            title: "Message",
            text: data.message,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
        }
        else {
          this.isLoadingPop = false;
          swal({
            title: "Message",
            text: data.message,
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          })
          this.docNo = data.docNo;
          this.toNo = data.toNo;
        }
        this.isLoading = false;
      }
      this.isLoading = false;
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
  downloadPdf() {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.locationname;
    var ReportName = "MIGO POSTING SUMMARY REPORT"
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
        title: 'MIGO Posting Report',
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
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [90, 550, 90],
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
                { text: 'Printed By' + " : " + printedBy +', '+'Printed On' + ": " + date+'.'  }
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
