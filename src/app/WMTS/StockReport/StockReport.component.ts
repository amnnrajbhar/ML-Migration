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
import { StockFilter } from "../StockReport/StockReport.model";

@Component({
  selector: 'app-StockReport',
  templateUrl: './StockReport.component.html',
  styleUrls: ['./StockReport.component.css']

})

export class StockReportComponent implements OnInit {


  public tableWidget: any;
  isLoading!: boolean;
  isLoadingPop!: boolean;
  filterplant!: string
  path!: string
  currentUser!: AuthData;
  locationList: any[] = [];
  filterModel: StockFilter = {} as StockFilter;  
  errMsg: string = "";
  date: any;
  today = new Date();  
  image: any;
  plant!: string
  GroupBy: string
  locationname!: string
  filterData: any[] = [];
  paginationData: any[] = [];
  exportfilterData: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private datePipe: DatePipe
    , private http: HttpClient, private excelService: ExcelService) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

  ngOnInit() {
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
        this.locationname = this.locationList.find((x:any)  => x.code == this.plant).name;

      }

    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getReport();    
    this.filterModel.pageNo=1;
    this.filterModel.pageSize = 10;
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getReport();
  }

  totalCount: any;
  totalPages: any;
  getReport()
  {
    this.filterModel.export = false;
    this.filterModel.GroupBy = this.GroupBy;
    this.filterModel.Plant = this.plant;
    this.httpService.GetSamplingReport(APIURLS.BR_GET_STOCKREPORT, this.filterModel).then((data: any) => {
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

  getFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.filterModel.Plant = this.plant;
    this.httpService.GetSamplingReport(APIURLS.BR_GET_STOCKREPORT, this.filterModel).then((data: any) => {
      if (data.table.length > 0) {
        var pipe = new DatePipe('en-US');
    var now = Date.now();
        var date = pipe.transform(now, 'short');
        this.exportfilterData = data.table;
        this.filterModel.export = false;
        var exportList = [];
        let index = 0;
        this.exportfilterData.forEach((item :any) => {
          index = index + 1;
          let exportItem = {
            "SNo": index,
            "Item Desc": item.item_Desc,
            "Item Code": item.item_Code,
            "Batch No": item.batchNo,
            "Bin": item.bin,
            "Mfg Date": this.getFormatedDateTime(item.mfg_Date),
            "Exp Date": this.getFormatedDateTime(item.exp_Date),            
            "Stock": item.qty,
          };
          exportList.push(exportItem);
        });
        this.excelService.exportAsExcelFile(exportList, 'Stock Report as on '+ date );
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
}
