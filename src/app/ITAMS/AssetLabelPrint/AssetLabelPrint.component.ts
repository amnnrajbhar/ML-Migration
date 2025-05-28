import { Component, OnInit, ViewEncapsulation } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AssetLabelPrint } from './AssetLabelPrint.model';
import swal from 'sweetalert';
import { AuthData } from '../../auth/auth.model';
declare var $: any;

@Component({
  selector: 'app-AssetLabelPrint',
  templateUrl: './AssetLabelPrint.component.html',
  styleUrls: ['./AssetLabelPrint.component.css']
})
export class AssetLabelPrintComponent implements OnInit {

  public tableWidget: any;
  currentUser!: AuthData;
  dashboard: any = {};
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  isSaved: boolean = false;
  printerList: any;
  filterassetNo: any;
  filterprintList: any;
  filtercount: number = 0;
  filterprinttype: any;
  filterseries: number = 0;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidget = exampleId.DataTable();
  }

  ngOnInit() {
    this.path = this.router.url;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    console.log(this.path);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.getPrinterMaster();
  }

  getPrinterMaster() {
    var filterModel: any = {};
    filterModel.Plant = this.currentUser.baselocation;
    this.httpService.amspost(APIURLS.BR_GET_AMS_PRINTER_MASTER, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.printerList = data;
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.printerList = [];
    });
  }

  clearFilter() {
    this.filterassetNo = null;
    this.filterprintList = null;
    this.filtercount = 0;
    this.filterseries = 0;
    this.filterprinttype = null;
  }

  getPrintedLabel() {

    if ((this.filterseries == 0 && this.filterprinttype =='Series') || (this.filtercount == 0 && this.filterprinttype == 'Copies') ) {
      alert("Number of Prints cannot be 0. Please enter a valid count!")
    }
    else {
      swal({
        title: "Message",
        text: "Are you sure to print?",
        icon: "warning",
        dangerMode: false,
        buttons: [true, true]
      }).then((any) => {
        if (any) {
          this.isLoading = true;

          var printLabel: any = {};
          printLabel.assetNumber = this.filterassetNo;
          printLabel.printerName = this.filterprintList;
          printLabel.count = this.filtercount;
          printLabel.series = this.filterseries;
          this.httpService.amspost(APIURLS.BR_GET_AMS_PRINTED_LABEL, printLabel).then((output: any) => {
            this.isLoadingPop = false;
            if (output) {
              swal({
                title: "Message",
                text: "Barcode Printed Successfully",
                icon: "success",
                dangerMode: false,
                buttons: [false, true]
              });
              printLabel = {};
              this.clearFilter();
            }
          }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error printing Barcode..';
          });
        }
      });
    }
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}
