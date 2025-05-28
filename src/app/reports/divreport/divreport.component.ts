import { Component, OnInit } from '@angular/core';
import { AppComponent } from './../../app.component';
import { APIURLS } from './../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import * as alaSQLSpace from 'alasql';
import * as _ from "lodash";
import * as alasql from 'alasql';
declare var jQuery: any;

@Component({
  selector: 'app-divreport',
  templateUrl: './divreport.component.html',
  styleUrls: ['./divreport.component.css']
})
export class DivreportComponent implements OnInit {
  public tableWidget: any;
  dddivisionList: any[];
  divSelectedItem: string;
  revSelectedItem: number;
  divid: number;
  invoice: any;
  division: any;
  startDate: Date;
  isChecked: boolean = false;
  endDate: Date;
  report: any;
  errMsg: string = "";
  errMsgDiv: string = "";
  errMsgRev: string = "";
  errMsgStrt: string = "";
  errMsgEnd: string = "";
  isLoading: boolean = false;
  isValidate: boolean = true;
  invRepHeaderList: any[];
  constructor(private appService: AppComponent, private httpService: HttpService,) { }

  ngOnInit() {
      this.getInvReportHeaders();
      var date = new Date();
      this.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      this.endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      this.report = { invoice_list: [] };
      this.getDivisionList();
  }

  private initDatatable(): void {
      let exampleId: any = jQuery('#divisionTable');
      this.tableWidget = exampleId.DataTable();
  }

  private reInitDatatable(): void {
      if (this.tableWidget) {
          this.tableWidget.destroy()
          this.tableWidget = null
      }
      setTimeout(() => this.initDatatable(), 0)
  }



  public reportAsExcelExport(): void {
      this.isLoading = true;
      var mystyle = {
          headers: false,
          column: { style: { Font: { Bold: "1" } } },
          rows: { 1: { style: { Font: { Color: "#FF0077" } } } },
      };
      var opts = [{ sheetid: 'Invoice', headers: false }];
      var res = alasql.default('SELECT INTO XLSX("report_export_' + new Date().getTime() + '.xlsx",?) FROM ?', [opts, [this.report.invoice_list]]);
      this.isLoading = false;
  }

  validateForm() {
      //this.errMsg = "";
      if (this.startDate == undefined || this.startDate == null || this.startDate.toString() == "") {
          this.errMsgStrt = "please select From date.";
          this.isValidate = false;
          return this.isValidate;
      }

      if (this.errMsgStrt == 'Enter valid From Date') {
          this.errMsgStrt = "Enter valid From Date.";
          this.isValidate = false;
          return this.isValidate;
      }
      if (this.endDate == undefined || this.endDate == null || this.endDate.toString() == "") {
          this.errMsgEnd = "please select To date.";
          this.isValidate = false;
          return this.isValidate;
      }

      if (this.errMsgEnd == 'Enter valid To Date') {
          this.errMsgEnd = "Enter valid To Date.";
          this.isValidate = false;
          return this.isValidate;
      }
      else {
          this.isValidate = true;
          return this.isValidate;
      }
  }

  getReport() {
      //debugger;
      this.errMsg = "";
      this.isValidate = this.validateForm();
      if (!this.isValidate) {
          this.errMsgStrt = this.errMsgStrt;
          this.errMsgEnd = this.errMsgEnd;
      }
      else {
          this.isLoading = true;
          if (this.divid == 0 || this.divid == undefined) {
              this.errMsgDiv = "Select Division";
              this.isLoading = false;
              this.report.invoice_list = [];
          }
          else if (this.revSelectedItem == undefined) {
              //debugger;
              this.errMsgRev = "Select Invoice";
              this.isLoading = false;
              this.report.invoice_list = [];
          }
          else {
              let reqData = { 'fdate': this.startDate, 'tdate': this.endDate, 'divid': this.divid, 'reverseCharge': this.revSelectedItem };
              this.httpService.post(APIURLS.BR_DIVREPORT_API, reqData).then((data: any) => {
                  this.isLoading = false;
                  if (data.status == 'SUCCESS') {
                      //this.totDataList = data.divReport_list;
                      //filterTotalRate(this.totDataList);
                      var invoiceHeaders = [
                          {
                              "div_name": "Division Name", "inv_no": "Invoice Number", "inv_date": "Invoice date", "fiscal_year": "Fiscal Year", "period": "Period", "cust_name": "Customer Name", "inv_cust_gstin": "Customer GSTIN", "inv_supply_type": "Supply Type", "inv_ref_no": "Ref No.", "inv_gst_pay": "GST Payment", "inv_reverse": "Reverse Charge", "invd_line": "Line No", "invd_category": "Type",
                              "invd_item": "Product", "invd_item_descp": "Description", "invd_hsn_sac": "HSN/SAC", "invd_qty": "Qty", "invd_price": "Basic Value(Excl GST)", "invd_value": "Basic Amount(Excl GST)", "invd_sgst_rate": "SGST%", "invd_cgst_rate": "CGST%", "invd_igst_rate": "IGST%", "invd_sgst_amt": "SGST", "invd_cgst_amt": "CGST", "invd_igst_amt": "IGST", "inv_total_cess_str": "CESS", "inv_total_value_str": "Grand Total"
                          }];
                      this.report.invoice_list = _.concat(invoiceHeaders, data.divReport_list);

                      this.reportAsExcelExport();
                  }
              }).catch(error => {
                  this.isLoading = false;
                  this.report.invoice_list = [];
              });
          }
      }
  }
 

  onDivisionChange(item: any) {
      this.errMsgDiv = "";
      if (item == -2) {
          this.divSelectedItem = "--Select All--";
          this.divid = -2;
      }
      else {
          this.divSelectedItem = item.div_name;
          this.divid = item.divid;
      }
      //this.divSelectedItem = item.div_name;
      //this.divid = item.divid;
  }

  onReversalChange(item:any) {
      //debugger;
      this.revSelectedItem = item;
  }

  onDivSelectionChange(division) {

      //this.invoice.inv_customer = customer;
      //if (this.invoice.inv_customer.cust_state_code != undefined && this.invoice.inv_customer.cust_state_code === this.invoice.inv_division.div_state_code) {
      //    this.invoice.inv_supply_type = 1;
      //} else if (this.invoice.inv_customer.cust_state_code != undefined && this.invoice.inv_customer.cust_state_code != this.invoice.inv_division.div_state_code) {
      //    this.invoice.inv_supply_type = 0;
      //}
  }

  openDivSearch() {
      jQuery("#myModalDiv").modal('show');
      this.getDivisionList();
  }

  getDivisionList()
  {
      this.invoice = { inv_division: null };
      //debugger;
      this.dddivisionList = null;
      this.httpService.get(APIURLS.BR_MASTER_FILTERDIV_API).then((data: any) => {
          if (data.status == 'SUCCESS') {
              this.dddivisionList = data.divisionList;
             // this.reInitDatatable();
          }
      }).catch(error => {
          this.dddivisionList = [];
      });
  }
    getInvReportHeaders() {
        this.httpService.get(APIURLS.BR_FORM_DATA_API).then((data: any) => {
            if (data.status == 'SUCCESS') {
                this.invRepHeaderList = data.formDataList;
                this.invRepHeaderList = data.formDataList.find(s => s.subMenuId == '11'); //_.filter(data.formData, function (obj) { if (obj.name == 'Entity') return obj; });
            }
        }).catch(error => {
            this.invRepHeaderList = null;
        });
    }
    setStartDate(sDate: any) {
        //this.purchase.po_date = Number(new Date(poDate));
        this.errMsgStrt = '';
        var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
        if ((date_regex.test(sDate))) {
            this.startDate = sDate;
        }
        else if (sDate == "") {
            this.errMsgStrt = 'Enter valid From Date';
        }
    }

    setEndDate(eDate: any) {
        //this.purchase.po_date = Number(new Date(poDate));
        this.errMsgEnd = '';
        var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
        if ((date_regex.test(eDate))) {
            this.endDate = eDate;
        }
        else if (eDate == "") {
            this.errMsgEnd = 'Enter valid To Date';
        }
    }

}
