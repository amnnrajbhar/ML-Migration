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
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from "@angular/common/http";
import { toBase64String } from "@angular/compiler/src/output/source_map";
declare var toastr: any;
@Component({
  selector: 'app-DCCancellation',
  templateUrl: './DCCancellation.component.html',
  styleUrls: ['./DCCancellation.component.css']

})

export class DCCancellationComponent implements OnInit {


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
  TotalRemQty!: number;
  DCNo!: string
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
    this.checkedRequestList[0].generatedBy = this.currentUser.employeeId;
  }

  post: boolean = false;
  getDcData(dcNo: String) {

    this.httpService.getDCData(APIURLS.BR_GET_DC_CANCELLATION_DATA, dcNo + ',' + this.CancelType).then((data: any) => {
      if (data.length > 0) {
        // this.locationAllList = data;
        if (data[0].itemDesc == 'E') {
          this.filteredModel = [];
          swal({
            title: "Message",
            text: data[0].dcno,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
        }
        else {


          this.filteredModel = data;

          this.filteredModel.sort((x:any)  => x.batch);
          let temp = this.filteredModel.find((x:any)  => x.status == true);
          temp ? this.post = true : this.post = false;
        }
      }
      else {
        this.filteredModel = [];
        swal({
          title: "Message",
          text: "No data exists.",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        })
      }
      this.reInitDatatable();
      //this.reInitDatatable1();
    }).catch((error)=> {
      this.isLoading = false;
      this.filteredModel = [];
    });
  }

  Typeofcancellation(dcNo: String) {
    if (dcNo.length > 0) {
      this.getDcData(dcNo);
    }
    this.reInitDatatable();
  }
  EditedQty() {

  }
  VerifyClicked() {
    if (this.CancelType == "Line Item") {
      this.isLoadingPop = true;
      this.httpService.postMIGO(APIURLS.BR_CANCEL_DC_LINTE_ITEM, this.checkedRequestList).then((data: any) => {

        if (data.length > 0 || data != null) {
          this.isLoadingPop = false;
          if (data[0].type == 'S') {
            swal({
              title: "Message",
              text: data[0].message,
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            });
            this.getDcData(this.DCNo);
          }
          else if (data[0].type == 'E') {
            swal({
              title: "Error",
              text: data[0].message,
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            });
            this.getDcData(this.DCNo);
          }

          this.isLoading = false;
        }
        this.isLoading = false;

      }).catch((error)=> {
        this.isLoading = false;
      });
    }
    else if (this.CancelType == "Full DC") {
      this.isLoadingPop = true;
      this.httpService.postMIGO(APIURLS.BR_CANCEL_FULL_DC, this.filteredModel).then((data: any) => {

        if (data.length > 0 || data != null) {
          this.isLoadingPop = false;
          if (data[0].type == 'S') {
            swal({
              title: "Message",
              text: data[0].message,
              icon: "success",
              dangerMode: false,
              buttons: [false, true]
            });
            this.getDcData(this.DCNo);
          }
          else if (data[0].type == 'E') {
            swal({
              title: "Error",
              text: data[0].message,
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            });
            this.getDcData(this.DCNo);
          }


          this.isLoading = false;
        }
        this.isLoading = false;

      }).catch((error)=> {
        this.isLoading = false;
      });
    }

  }
  getShippers(selectedline: any) {
    this.PickedfilteredModel = [];

    this.httpService.postMIGO(APIURLS.BR_GET_SHIPPERS_DC_CANCELLATION, selectedline).then((data: any) => {
      this.isLoadingPop = false;
      if (data.length > 0 || data != null) {
        this.isLoadingPop = false;
        this.LineQty = selectedline.quantity;
        this.PickedfilteredModel = data;
        for (var i = 0; i < this.PickedfilteredModel.length; i++) {
          this.PickedfilteredModel[i].RemovedQty = 0;

        }
        this.TotalRemQty = 0;
        jQuery('#DetailedModal').modal('show');


        this.isLoading = false;
      }
      this.isLoading = false;

    }).catch((error)=> {
      this.isLoading = false;

    });
  }
  QtyRemoved(event: any, i: number) {
    if (event.target.value > this.PickedfilteredModel[i].qty) {
      this.PickedfilteredModel[i].RemovedQty = 0;
      toastr.error("Removing quantity can not be greater than the available quantity.");
      // swal({
      //   title: "Message",
      //   text: "Removing quantity can not be greater than the available quantity.",
      //   icon: "warning",
      //   dangerMode: false,
      //   buttons: [false, true]
      // })
      event.target.value = 0;
      return;
    }
    this.TotalRemQty = 0;
    for (var i = 0; i < this.PickedfilteredModel.length; i++) {
      this.TotalRemQty = this.TotalRemQty + +this.PickedfilteredModel[i].RemovedQty;
    }
  }
  UpdateDCforLineItemChange() {
    if (this.TotalRemQty == 0) {
      toastr.error("Total removable quantity can not be 0.");
      return;
    }
    this.isLoadingPop = true;
    this.PickedfilteredModel = this.PickedfilteredModel.filter((x:any)  => x.RemovedQty > 0)
    for (var i = 0; i < this.PickedfilteredModel.length; i++) {
      if (this.PickedfilteredModel[i].RemovedQty == this.PickedfilteredModel[i].qty) {
        this.PickedfilteredModel[i].fullOrPartial = 1;
        this.PickedfilteredModel[i].typeOfDCCancellation = 3;
        this.PickedfilteredModel[i].dCCancelledBy = this.currentUser.employeeId;
      }
      else if (this.PickedfilteredModel[i].RemovedQty == 0) {
        this.PickedfilteredModel[i].fullOrPartial = 0;
        this.PickedfilteredModel[i].typeOfDCCancellation = 0;
      }
      else if (this.PickedfilteredModel[i].RemovedQty < this.PickedfilteredModel[i].qty) {
        this.PickedfilteredModel[i].fullOrPartial = 2;
        this.PickedfilteredModel[i].typeOfDCCancellation = 3;
        this.PickedfilteredModel[i].dCCancelledBy = this.currentUser.employeeId;

      }


    }
    this.httpService.postMIGO(APIURLS.BR_CANCEL_DC_LINTE_ITEM_CHANGE, this.PickedfilteredModel).then((data: any) => {

      if (data.length > 0 || data != null) {
        this.isLoadingPop = false;
        if (data[0].type == 'S') {
          swal({
            title: "Message",
            text: data[0].message,
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          jQuery('#DetailedModal').modal('hide');
          this.getDcData(this.DCNo);
          this.isLoading = false;
        }
        else if (data[0].type == 'E') {
          swal({
            title: "Error",
            text: data[0].message,
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });    
          this.isLoading = false;      
        }

      }
      this.isLoading = false;

    }).catch((error)=> {
      this.isLoading = false;
    });
  }
}
