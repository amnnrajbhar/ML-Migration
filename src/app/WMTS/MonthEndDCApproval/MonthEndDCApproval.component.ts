import { OnInit, Component } from "@angular/core";
import { Router } from "@angular/router";
import { APIURLS } from "../../shared/api-url";
import { AppComponent } from "../../app.component";
import { HttpService } from "../../shared/http-service";
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
  selector: 'app-MonthEndDCApproval',
  templateUrl: './MonthEndDCApproval.component.html',
  styleUrls: ['./MonthEndDCApproval.component.css']

})

export class MonthEndDCApprovalComponent implements OnInit {


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
  LineQty: number;
  RemQty: number;
  TotalQty: number;
  TotalFull: number;
  TotalLoose: number;
  locationList: any[] = [];
  locationname: string;
  image: string;
  DCNo: string;
  gtime: string;
  slno: number;
  today = new Date();
  ApprovalStatus: string;
  approvedModel: any;
  
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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

  isAllSelected() {
    this.isMasterSel = this.filteredModel.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.filteredModel.length; i++) {
      if (this.filteredModel[i].isSelected) {
        this.checkedlist.push(this.filteredModel[i]);
      }

    }
    this.checkedRequestList = this.checkedlist;
    this.checkedRequestList[0].approvedBy = this.currentUser.employeeId;
  }

  TypeofStatus()
  {
      this.filteredModel = [];
      this.checkedRequestList = [];
  }

  getDCData()
  {
    this.httpService.GetMonthEndDCData(APIURLS.BR_GET_MONTHEND_DC_DATA, this.DCNo, this.ApprovalStatus, this.plant, this.getFormatedDateTime(this.from_date), this.getFormatedDateTime(this.to_date)).then((data: any) => {
      if (data.length > 0) {
        this.filteredModel = data;        
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

  AppoveDC()
  {
      if (this.checkedRequestList.length == 0)
      {
        swal({
            title: "Warning",
            text: "Please select atleast one line item to approve.",
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
          return;
      }
    this.httpService.postMIGO(APIURLS.BR_APPROVE_MONTHEND_DC, this.checkedRequestList).then((data: any) => {
        if (data != null) {
          this.approvedModel = data;
          if (this.approvedModel.type == "S" )
          {
            swal({
                title: "Success",
                text: this.approvedModel.message,
                icon: "success",
                dangerMode: false,
                buttons: [false, true]
              })
              this.filteredModel = [];
              this.checkedRequestList = [];
              return;
          } 
          else
          {
            swal({
                title: "Message",
                text: this.approvedModel.message,
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
              })
          }      
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
  closemodal()
  {
   
    this.TotalQty = 0;
    this.TotalFull = 0;
    this.TotalLoose = 0;

  } 
}
