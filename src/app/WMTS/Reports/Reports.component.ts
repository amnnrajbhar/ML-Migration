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

@Component({
  selector: 'app-Reports',
  templateUrl: './Reports.component.html',
  styleUrls: ['./Reports.component.css']

})

export class ReportsComponent implements OnInit {


  public tableWidget: any;
  filterPIMNo: string;
  ItemList: LineItem[] = [];
  isLoading: boolean;
  isLoadingPop: boolean;
  filterplant: string;
  path: string;
  currentUser: AuthData;
  filteruser: string;
  locationList: any[] = [];
  filteredModel: any[] = [];
  materialstatusmodel: any[] = [];
  errMsg: string = "";
  date: any;
  today = new Date();
  filtermatType: string;
  filtermatCode: string;
  filtermatDesc: string;
  filterbatchNo: string;
  filtersuppCode: string;
  filterPONo: string;
  filterfloor: string;
  filterrack: string;
  filterbin: string;
  filterpalletId: string;
  filtercustomer: string;
  filterdeliveryNo: string;
  filterinvoiceNo: string;
  filtertype: string;
  filterstages: string;
  filterquantity: string;
  filterspace: string;
  filterReportType: string;
  filterType: string;
  dtOptions = {};

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private datePipe: DatePipe
    , private http: HttpClient) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationMaster();
    this.getbase64image();
    this.dtOptions = {

      dom: '<"cutomHyleft"l><"cutomHyright"B>frtip',
      buttons: [
        {
          "extend": 'excel', "text": '<span class="fa fa-file" style="color:white"></span>&nbsp;&nbsp; Export to Excel', "className": 'btn btn-info btn-sm cutomHytop',
          "exportOptions": { columns: [0, 1, 2, 3, 4, 5] },
          filename: 'Department',
          title: '',
        },
      ],
    };

  }



  clearFilter() {
    this.filterplant = null;
    this.date = new Date();
    this.filtermatType = null;
    this.filtermatCode = null;
    this.filtermatDesc = null;
    this.filterbatchNo = null;
    this.filteruser = null;
    this.filtersuppCode = null;
    this.filterPIMNo = null;
    this.filterPONo = null;
    this.filterfloor = null;
    this.filterrack = null;
    this.filterbin = null;
    this.filterpalletId = null;
    this.filtercustomer = null;
    this.filterdeliveryNo = null;
    this.filterinvoiceNo = null;
    this.filtertype = null;
    this.filterstages = null;
    this.filterquantity = null;
    this.filterspace = null;
    this.filterReportType = null;
    this.filterType = null;
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
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

  //today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  getAllEntries() {
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};

    filterModel.plant = this.filterplant;
    filterModel.materialType = this.filtermatType;
    filterModel.materialCode = this.filtermatCode;
    filterModel.materialDescription = this.filtermatDesc;
    filterModel.batchNo = this.filterbatchNo;
    filterModel.user = this.filteruser;
    filterModel.supplier = this.filtersuppCode;
    filterModel.pimNo = this.filterPIMNo;
    filterModel.poNo = this.filterPONo;
    filterModel.rack = this.filterrack;
    filterModel.bin = this.filterbin;
    filterModel.palletID = this.filterpalletId;
    filterModel.Customer = this.filtercustomer;
    filterModel.DeliveryNo = this.filterdeliveryNo;
    filterModel.InvoiceNo = this.filterinvoiceNo;
    filterModel.Type = this.filtertype;
    filterModel.Stages = this.filterstages;
    filterModel.Quantity = this.filterquantity;
    filterModel.Space = this.filterspace;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    filterModel.type = this.filterType

    this.httpService.postMIGO(APIURLS.BR_GET_INWARD_REPORT_DATA, filterModel).then((data: any) => {
      if (data) {
        this.filteredModel = data;
        this.filteredModel.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  //BR_GET_OUTWARD_REPORT_DATA
  getOutwardReport() {
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};

    filterModel.plant = this.filterplant;
    filterModel.materialType = this.filtermatType;
    filterModel.materialCode = this.filtermatCode;
    filterModel.materialDescription = this.filtermatDesc;
    filterModel.batchNo = this.filterbatchNo;
    filterModel.user = this.filteruser;
    filterModel.supplier = this.filtersuppCode;
    filterModel.pimNo = this.filterPIMNo;
    filterModel.poNo = this.filterPONo;
    filterModel.rack = this.filterrack;
    filterModel.bin = this.filterbin;
    filterModel.palletID = this.filterpalletId;
    filterModel.supplier = this.filtercustomer;
    filterModel.pimNo = this.filterdeliveryNo;
    filterModel.poNo = this.filterinvoiceNo;
    filterModel.Stages = this.filterstages;
    filterModel.Quantity = this.filterquantity;
    filterModel.Space = this.filterspace;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    filterModel.type = this.filterType

    this.httpService.postMIGO(APIURLS.BR_GET_OUTWARD_REPORT_DATA, filterModel).then((data: any) => {
      if (data) {
        this.filteredModel = data;
        this.filteredModel.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  getSpaceUtilisationReport()
  {
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};

    filterModel.plant = this.filterplant;
    filterModel.floor=this.filterfloor;

    this.httpService.postMIGO(APIURLS.BR_GET_SPACE_UTILISATION_REPORT, filterModel).then((data: any) => {
      if (data) {
        this.filteredModel = data;
        //this.filteredModel.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
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
        this.locationList = data.filter(x => x.isActive);
       // this.filterplant = this.locationList.find(x => x.id == this.currentUser.baselocation).code;

      }
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  ChangeType() {
    this.filteredModel = [];
    this.reInitDatatable();
  }
  GetTypes(typ) {
    //this.clearFilter();
    this.ReportsTypeList1 = [];
    this.filterType=null;
    this.ReportsTypeList1 = this.ReportsTypeList.filter(x => x.type == typ);
    this.reInitDatatable();
  }
  ReportsTypeList1: any[] = [];
  ReportsTypeList: any[] = [
    { id: 1, name: 'Summary', type: 'Inward Report' },
    { id: 2, name: 'ItemWise', type: 'Inward Report' },
    { id: 3, name: 'PalletWise', type: 'Inward Report' },
    { id: 4, name: 'Summary', type: 'Outward Report' },
    { id: 5, name: 'ItemWise', type: 'Outward Report' },
    { id: 6, name: 'PalletWise', type: 'Outward Report' },
    { id: 7, name: 'Login/Logoff', type: 'User Based Report' },
    { id: 8, name: 'Activity', type: 'User Based Report' },
    { id: 9, name: 'UserBased', type: 'User Based Report' },
    { id: 10, name: 'Summary', type: 'Inventory Report' },
    { id: 11, name: 'ItemWise', type: 'Inventory Report' },
    { id: 12, name: 'BatchWise', type: 'Inventory Report' },
    { id: 13, name: 'PalletWise', type: 'Inventory Report' },
    { id: 14, name: 'Bin Transfers', type: 'Inventory Report' },
    { id: 15, name: 'Ledger', type: 'Inventory Report' },
    { id: 16, name: 'Summary', type: 'Space Utilisation Report' },
    { id: 17, name: 'Detailed', type: 'Space Utilisation Report' },
    { id: 18, name: 'Stock Verification', type: 'Stock Verification' }
  ];

  detailedList: any[] = [];
  showDetailedView(item) {
    this.detailedList = [];
    this.detailedList = this.materialstatusmodel.filter(x => x.lineItemNo == item.lineItemNo);
    jQuery('#DetailedModal').modal('show');
  }

  exportInwardSummary() {
    const title = 'Summary Report';
    const header = ["SNo", "Plant Code", "Plant Name", "Migo No", "Migo Date", "PIM No", "PIM Date",
      "Vendor Code", "Vendor Name", "Invoice No", "Invoice Date", "No of Items", "No of Batches", "Total Qty", "Full Qty",
      "Loose Qty", "No of Shippers", "No Of Pallets"]

    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.filteredModel.forEach(element => {
      index = index + 1;
      ts = {};
      ts.slNo = index;
      ts.plantCode = element.plantCode;
      ts.plantName = element.plantName;
      ts.docNo = element.docNo;
      ts.docDate = this.datePipe.transform(element.docDate, 'dd/MM/yyyy HH:mm a');
      ts.pimNo = element.pimNo;
      ts.pimDate = this.datePipe.transform(element.pimDate, 'dd/MM/yyyy');
      ts.vendorCode = element.vendorCode;
      ts.vendorName = element.vendorName;
      ts.invoiceNo = element.invoiceNo;
      ts.invoiceDate = this.datePipe.transform(element.invoiceDate, 'dd/MM/yyyy');
      ts.noOfItems = element.noOfItems;
      ts.noOfBatches = element.noOfBatches;
      ts.totalQty = element.totalQty;
      ts.fullQty = element.fullQty;
      ts.looseQty = element.looseQty;
      ts.noOfShippers = element.noOfShippers;
      ts.noOfPallets = element.noOfPallets;
      exportList.push(ts);

    });
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.filterplant;
    const data = exportList;
    //Create workbook and worksheet
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Summary Report');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    let subTitleRow = worksheet.addRow(['Summary Report from ' + this.datePipe.transform(this.from_date, 'dd/MM/yyyy') + ' To ' + this.datePipe.transform(this.to_date, 'dd/MM/yyyy')])
    //Add Image
    subTitleRow.font = { size: 12, bold: true }
    worksheet.mergeCells('A1:R1');
    worksheet.mergeCells('A2:R2');
    worksheet.mergeCells('A3:R3');

    //Blank Row 
    // worksheet.addRow([]);
    //Add Header Row
    let headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    //  worksheet.addRows(data);
    // Add Data and Conditional Formatting
    //data.forEach()

    for (let x1 of data) {
      let x2 = Object.keys(x1);
      let temp = []
      for (let y of x2) {
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }
    // data.forEach((element) => {
    //   let eachRow = [];
    //   header.forEach((headers) => {
    //     eachRow.push(element.id);
    //   })   

    //   worksheet.addRow(eachRow); 
    // })
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // worksheet.getColumn(2).width = 10;
    // worksheet.getColumn(4).width = 20;
    // worksheet.getColumn(5).width = 60;
    // worksheet.getColumn(6).width = 40;
    // worksheet.getColumn(7).width = 10;    
    // worksheet.getColumn(8).width = 20;    
    worksheet.addRow([]);

    // pdfMake.createPdf(worksheet).open()
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'SummaryReport.xlsx');
    })

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

  getReportName() {
    var printsection;
    if(this.filterReportType=='Inward Report')
    {
    switch (this.filterType) {
      case 'Summary':
        printsection = 'Inward Summary'
        return printsection;
      case 'ItemWise':
        printsection = 'Inward ItemWise'
        return printsection;
        default:
        printsection = 'Inward PalletWise'
        return printsection;
      }
    }
    else if(this.filterReportType=='Outward Report')
    {
    switch (this.filterType) {
      case 'Summary':
        printsection = 'Outward Summary'
        return printsection;
      case 'ItemWise':
        printsection = 'Outward ItemWise'
        return printsection;
        default:
        printsection = 'Outward PalletWise'
        return printsection;
      }
    }
    else if(this.filterReportType=='Inventory Report')
    {
    switch (this.filterType) {
      case 'Inventory Report' && 'Summary':
        printsection = 'Inventory Summary'
        return printsection;
      case 'Inventory Report' && 'PalletWise':
        printsection = 'Inventory PalletWise'
        return printsection;
      case 'Inventory Report' && 'ItemWise':
        printsection = 'Inventory ItemWise'
        return printsection;
      case 'Inventory Report' && 'BatchWise':
        printsection = 'Inventory BatchWise'
        return printsection;
      case 'Inventory Report' && 'Bin Transfers':
        printsection = 'Inventory BinTransfers'
        return printsection;
        default:
        printsection = 'InventoryLedger'
        return printsection;  
    }
  }
  else if(this.filterReportType=='User Based Report')
    {
    switch (this.filterType) {
      case  'Login/Logoff':
        printsection = 'User Based Login'
        return printsection;
      case  'Activity':
        printsection = 'User Based Activity'
        return printsection;
    
        default:
        printsection = 'User Based'
        return printsection;
      }
    }
    else{
      switch (this.filterType) {
      case 'Space Utilisation Report' && 'Summary':
        printsection = 'Space Utilisation Summary'
        return printsection;

      default:
        printsection = 'Space Utilisation Detailed'
        return printsection;
    }
  }
  }

  downloadPdf() {
    var printsection: string;
    let temp=this.locationList.find(x=>x.code==this.filterplant);
    printsection = this.getReportName();
    var printContents = document.getElementById(printsection).innerHTML;
    if(temp)
    {
      var OrganisationName = "MICRO LABS LIMITED" + ', ' + temp.code+ '-'+temp.name;
    }
    else{
      var OrganisationName = "MICRO LABS LIMITED";
    }

    var ReportName = printsection.toLocaleUpperCase() + " REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = new Date().toDateString();
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: ReportName,
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
      pageMargins: [40, 100, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [80, 565, 90],
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
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' }
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
  downloadUSERPdf() {
    var printsection: string;
    let temp=this.locationList.find(x=>x.code==this.filterplant);
    printsection = this.getReportName();
    var printContents = document.getElementById(printsection).innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + temp.code+ '-'+temp.name;
    var ReportName = printsection.toLocaleUpperCase() + " REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = new Date().toDateString();
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
        tablebordered: true,
        headerRows: 1,
        dontBreakRows: true,
        keepWithHeaderRows: true,
      })
      var docDefinition = {
        info: {
          title: ReportName,
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
        pageMargins: [40, 100, 40, 60],
        pageOrientation: 'portrait',
        header: function (currentPage, pageCount) {
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
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' }
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


  downloadSpacePdf()
  {
    var printsection: string;
    let temp=this.locationList.find(x=>x.code==this.filterplant);
    printsection = this.getReportName();
    var printContents = document.getElementById(printsection).innerHTML;
    if(temp)
    {
      var OrganisationName = "MICRO LABS LIMITED" + ', ' + temp.code+ '-'+temp.name;
    }
    else{
      var OrganisationName = "MICRO LABS LIMITED";
    }
    var ReportName = printsection.toLocaleUpperCase() + " REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = new Date().toDateString();
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
        tablebordered: true,
        headerRows: 1,
        dontBreakRows: true,
        keepWithHeaderRows: true,
      })
      var docDefinition = {
        info: {
          title: ReportName,
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
        pageMargins: [40, 100, 40, 60],
        pageOrientation: 'portrait',
        header: function (currentPage, pageCount) {
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
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' }
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

  getUserBasedReport() {
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};

    filterModel.plant = this.filterplant;
    filterModel.materialType = this.filtermatType;
    filterModel.materialCode = this.filtermatCode;
    filterModel.materialDescription = this.filtermatDesc;
    filterModel.batchNo = this.filterbatchNo;
    filterModel.user = this.filteruser;
    filterModel.supplier = this.filtersuppCode;
    filterModel.pimNo = this.filterPIMNo;
    filterModel.poNo = this.filterPONo;
    filterModel.rack = this.filterrack;
    filterModel.bin = this.filterbin;
    filterModel.palletID = this.filterpalletId;
    filterModel.Customer = this.filtercustomer;
    filterModel.DeliveryNo = this.filterdeliveryNo;
    filterModel.InvoiceNo = this.filterinvoiceNo;
    filterModel.Type = this.filtertype;
    filterModel.Stages = this.filterstages;
    filterModel.Quantity = this.filterquantity;
    filterModel.Space = this.filterspace;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    if (this.filterType == 'Login/Logoff') {
      filterModel.type = 'LOGINLOGOFF'
    }
    else if (this.filterType == 'Activity') {
      filterModel.type = 'ACTIVITY'
    }
    else {
      filterModel.type = 'USERWISE';
    }


    this.httpService.postMIGO(APIURLS.BR_GET_USER_BASED_REPORT_DATA, filterModel).then((data: any) => {
      if (data) {
        this.filteredModel = data;
        this.filteredModel.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  getStockVerReport() {
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};

    filterModel.plant = this.filterplant;
    filterModel.user = this.filteruser;
    filterModel.bin = this.filterbin;
    filterModel.palletID = this.filterpalletId;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);


    this.httpService.postMIGO(APIURLS.BR_GET_STOCK_VER_REPORT_DATA, filterModel).then((data: any) => {
      if (data) {
        this.filteredModel = data;
        this.filteredModel.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  dowloadstockpdf() {
    let temp = this.locationList.find(x => x.code == this.filterplant);
    var printContents = document.getElementById('stock').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.filterplant + ' - ' + temp.name;
    var ReportName = "STOCK VERIFICATION REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = new Date().toDateString();
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
      tablebordered: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: ReportName,
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
      pageMargins: [40, 100, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
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
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' }
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

