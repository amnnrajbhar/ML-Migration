import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { SparesReceipt } from './SparesReceipt.model';
import swal from 'sweetalert';
//import { forEach } from '@angular/router/src/utils/collection';
//import { filter } from 'rxjs-compat/operator/filter';
// import { FileSaver }  from 'angular-file-saver';
// //import { saveAs } from 'file-saver';
declare var $: any;

@Component({
  selector: 'app-SparesReceipt',
  templateUrl: './SparesReceipt.component.html',
  styleUrls: ['./SparesReceipt.component.css']
})
export class SparesReceiptComponent implements OnInit {

@ViewChild('filterForm', { static: false }) filterForm: any;

  searchTerm = new FormControl();
  currentUser!: AuthData;
  public tableWidget: any;
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
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  receiptList: any;
  filtermatCode: any;
  filterrecno: any;
  newDynamic!: {};
  materialList: any[] = [];
  filtermaterialCode: any;
  filtermaterialDesc: any;
  filterquantity: any;
  filtervendorcode: any;
  filterreceiptdate: any;
  filterinvoiceNo: any;
  filterinvoiceDate: any;
  filtervendorname: any;
  SparesReceiptmodel = {} as SparesReceipt;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private route: ActivatedRoute) { }


  ngOnInit() {
    // this.path = this.router.url;
    // console.log(this.path);
    // var chkaccess = this.appService.validateUrlBasedAccess(this.path);

  }


  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
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

  rowcount: number = 1;
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, filtermaterialCode: null, filtermaterialDesc: null, filterquantity: null };
    this.materialList.push(this.newDynamic);
  }
  removeRows(item:any) {
    if (this.materialList.length > 1) {
      const index = this.materialList.indexOf(item);
      this.materialList.splice(index, 1);
    }
  }

  resetForm() {
    this.errMsg = "";
    this.filtermaterialCode = null;
    this.filtermaterialDesc = null;
    this.filterquantity = null;
    this.filterreceiptdate = null;
    this.filtervendorcode = null;
    this.filtervendorname = null;
    this.filterinvoiceNo = null;
    this.filterinvoiceDate = null;
  }

  onUserActions(isedit: boolean, SparesReceipt: SparesReceipt, isprint: boolean) {
    this.isEdit = isedit;
    this.resetForm();
    jQuery("#searchModal").modal('hide');
    jQuery('#myModal').modal('show');
  }


  getAllEntries() {
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string
    let formatedTOdate: string
    var filterModel: any = {};
    if (this.from_date == '' || this.from_date == null) {
      formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
      this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
    }
    else {
      let fd = new Date(this.from_date);
      formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
        ("00" + fd.getDate()).slice(-2);
      this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());
    }
    if (this.to_date == '' || this.to_date == null) {
      formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
        ("00" + td.getDate()).slice(-2);
      this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
    }
    else {
      let ed = new Date(this.to_date);
      formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
        ("00" + ed.getDate()).slice(-2);
      this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);
    }
    filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    filterModel.ToDate = this.getFormatedDateTime(this.to_date);

    this.httpService.amspost(APIURLS.BR_GET_AMS_SPARES_RECEIPT, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.receiptList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
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

  clearFilter() {
    this.from_date = null;
    this.to_date = null;
    this.filterrecno = null;
    this.filtermatCode = null;
  }

  sparesList: any[] = [];

  onSaveEntry(status:any) {
    this.errMsg = "";
    let connection: any;

    if (!this.isEdit) {
     
      this.materialList.forEach((mtrl:any) => {
        let filtermodel: any = {};
        filtermodel.materialCode = mtrl.filtermaterialCode;
        filtermodel.materialDesc = mtrl.filtermaterialDesc;
        filtermodel.quantity = mtrl.filterquantity;
        filtermodel.dateOfReceipt = this.filterreceiptdate;
        filtermodel.invoiceNo = this.filterinvoiceNo;
        filtermodel.invoiceDate = this.filterinvoiceDate;
        filtermodel.vendorCode = this.filtervendorcode;
        filtermodel.vendorName = this.filtervendorname;
        connection = this.httpService.amspost(APIURLS.BR_GET_AMS_RECEIPT_DATA, filtermodel);
      });
      
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.receiptNo > 0) {

        swal({
          title: "Message",
          text: "Spare Receipt No " + output.receiptNo + " created",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}
