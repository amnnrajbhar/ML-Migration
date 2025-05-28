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
import { toBase64String } from "@angular/compiler/src/output/source_map";
declare var toastr: any;
@Component({
  selector: 'app-GatePass',
  templateUrl: './GatePass.component.html',
  styleUrls: ['./GatePass.component.css']

})

export class GatePassComponent implements OnInit {


  public tableWidget: any;
  public tableWidget1: any;
  isLoading!: boolean;
  isLoadingPop!: boolean;
  plant!: string
  path!: string
  currentUser!: AuthData;
  filteredModel: any[] = [];
  errMsg: string = "";
  DCList: any[] = [];
  isMasterSel: boolean = false;
  CancelType!: string
  PickedfilteredModel: any[] = [];
  LineQty!: number;
  RemQty!: number;
  TotalQty: any;
  TotalFull: any;
  TotalLoose: any;
  locationList: any[] = [];
  locationname!: string
  image!: string
  Vehicle!: string
  OldVehicle!: string
  transporter!: string
  gtime!: string
  slno!: number;
  today = new Date();
  Slno!: string
  transporterModel: any[] = [];
  oldModel: any[] = [];
  oldModelLoose: any[] = [];
  printedby!: string
  oldTotals: any;
  
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

  private initDatatable(): void {
    let exampleId: any = jQuery('#datatable1');
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

  getReport(vehicleno) {

    this.TotalQty = 0
    this.TotalFull = 0;
        this.TotalLoose = 0;
    this.httpService.GetGatePass(APIURLS.BR_GET_GATE_PASS, vehicleno, this.plant, this.currentUser.employeeId, 'GET', this.Slno, this.from_date, this.to_date).then((data: any) => {
      if (data.table.length > 0) {
        // this.locationAllList = data;
        if (data.table[0].type == 'E') {
          swal({
            title: "Error",
            text: data.table[0].message,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
          return;
        }
        this.oldModel = data.table;
        this.transporter = this.oldModel[0].transporterName;
        this.oldTotals = data.table1;
         
          this.TotalFull = this.oldTotals[0].fullShippers;  
          this.TotalLoose = this.oldTotals[0].looseShippers;
        this.TotalQty = this.oldTotals[0].total;
        this.processData();
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
      alert(error);
    });
  }

  PrintGatePass() {
    var pipe = new DatePipe('en-US');
        var now = Date.now();
        this.gtime = pipe.transform(now, 'HH:mm');
    this.httpService.GetGatePass(APIURLS.BR_GET_GATE_PASS, this.Vehicle, this.plant, this.currentUser.employeeId, 'POST', this.Slno, this.from_date, this.to_date).then((data: any) => {
      if (data.table.length > 0) {
        var pipe = new DatePipe('en-US');
        var now = Date.now();
        this.gtime = pipe.transform(now, 'HH:mm');
        this.slno = data.table[0].slNo;
        this.downloadPDF()
        this.filteredModel=[];
        this.transporter='';
        this.TotalQty = 0;
        this.TotalFull = 0;
        this.TotalLoose = 0;

        swal({
          title: "Message",
          text: "Gate Pass printed successfully.",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        })
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
      alert(error);
    });

  }

  getOldReport()
  {
    this.httpService.GetGatePass(APIURLS.BR_GET_GATE_PASS, this.Vehicle, this.plant, this.currentUser.employeeId, 'OLD', this.Slno, this.getFormatedDateTime(this.from_date), this.getFormatedDateTime(this.to_date)).then((data: any) => {
      if (data.table.length > 0) {
        this.transporterModel = data.table;        
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
      alert(error);
    });

  }

  getOldPass(slNo)
  {
    var pipe = new DatePipe('en-US');
       this.TotalQty = 0;
        this.TotalFull = 0;
        this.TotalLoose = 0;
    this.httpService.GetGatePass(APIURLS.BR_GET_GATE_PASS, this.Vehicle, this.plant, this.currentUser.employeeId, 'GETOLD', slNo, this.from_date, this.to_date).then((data: any) => {
      if (data.table.length > 0) {
        var pipe = new DatePipe('en-US');
        var now = data.table[0].printedOn;
        this.gtime = pipe.transform(now, 'HH:mm');
        this.slno = data.table[0].slNo;
        this.oldModel=data.table;
        this.oldTotals = data.table1;
         
          this.TotalFull = this.oldTotals[0].fullShippers;  
          this.TotalLoose = this.oldTotals[0].looseShippers;
        this.TotalQty = this.oldTotals[0].total;

        this.OldVehicle = this.oldModel[0].vehicleNo;
        this.transporter = this.oldModel[0].transporterName;
        this.processData();
        jQuery('#DetailedModal').modal('show');       
       
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
      alert(error);
    });
  }

  dataTable: any[] = [];


  private processData() {
    const taskColumnChecked = {};
    const descriptionColumnChecked = {};

    this.dataTable = this.oldModel
      .sort((a:any, b:any) => {
        const taskComparator = a.customerName.localeCompare(b.customerName);
        return taskComparator
          ? taskComparator
          : a.customerName.localeCompare(b.customerName);
      })
      .map((x:any) => {
        const taskColumnSpan = taskColumnChecked[x.customerName]
          ? 0
          : this.oldModel.filter((y) => y.customerName === x.customerName).length;

        taskColumnChecked[x.customerName] = true;

      
        return { ...x, taskColumnSpan};
      });
  }


  printoldpass()
  {
    this.downloadPDF1();
    this.transporter = '';
    this.TotalQty = 0;
    this.TotalFull = 0;
    this.TotalLoose = 0;
    swal({
      title: "Message",
      text: "Gate Pass printed successfully.",
      icon: "success",
      dangerMode: false,
      buttons: [false, true]
    })
    jQuery('#DetailedModal').modal('hide');
  }
  
  closemodal()
  {
    this.oldModel = [];
    this.transporter = '';
    this.TotalQty = 0;
    this.TotalFull = 0;
    this.TotalLoose = 0;

  }

  downloadPDF() {
    var printContents = document.getElementById('pdf')!.innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.plant + ' - ' + this.locationname;
    var ReportName = "GATE PASS"
    var printedBy = this.currentUser.fullName;
    var pipe = new DatePipe('en-US');
    var now = Date.now();
    var logo = this.image;
    var SLNO = this.slno;
    //var now = new Date('dd-MM-yyyy h:mm a');
    var date = pipe.transform(now, 'dd/MM/yy');
   /* var htmnikhitml = htmlToPdfmake(`<html>
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
    })*/
    var docDefinition = {
      info: {
        title: 'Gate Pass',
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
      pageMargins: [40, 100, 40, 40],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [60, 350, 80],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50,
                alignment: 'center'
              }
                , { text: ReportName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' },
              {
                text: ['Sl. No.: ', { text: SLNO }], bold: true, fontSize: 10, color: 'black', alignment: 'left'
              }],
              [''
                , { text: OrganisationName, bold: true, fontSize: 18, color: 'black', alignment: 'center', height: '*' }, { text: ['Date: ', { text: date }], bold: true, fontSize: 10, color: 'black', alignment: 'left' }]

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
    //pdfMake.createPdf(docDefinition).open();
  }

  downloadPDF1() {
    var printContents = document.getElementById('pdf1').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + this.plant + ' - ' + this.locationname;
    var ReportName = "GATE PASS (REPRINT)"
    var printedBy = this.currentUser.fullName;
    var pipe = new DatePipe('en-US');
    var now = this.oldModel[0].printedOn;
    var logo = this.image;
    var SLNO = this.slno;
    //var now = new Date('dd-MM-yyyy h:mm a');
    var date = pipe.transform(now, 'dd/MM/yy');
   /* var htmnikhitml = htmlToPdfmake(`<html>
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
    })*/
    var docDefinition = {
      info: {
        title: 'Gate Pass',
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
      pageMargins: [40, 100, 40, 40],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {
          // pageMargins: [40, 80, 40, 60],
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [60, 350, 80],
            headerRows: 2,
            heights: [20, 10, 10, 10],
            // keepWithHeaderRows: 1,
            body: [
              [{
                rowSpan: 2, image: logo,
                width: 50,
                alignment: 'center'
              }
                , { text: ReportName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' },
              {
                text: ['Sl. No.: ', { text: SLNO }], bold: true, fontSize: 10, color: 'black', alignment: 'left'
              }],
              [''
                , { text: OrganisationName, bold: true, fontSize: 18, color: 'black', alignment: 'center', height: '*' }, { text: ['Date: ', { text: date }], bold: true, fontSize: 10, color: 'black', alignment: 'left' }]

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
    //pdfMake.createPdf(docDefinition).open();
  }
}
