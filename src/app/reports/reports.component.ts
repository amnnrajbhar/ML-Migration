import { Component, OnInit } from '@angular/core';
import { AppComponent } from './../app.component';
import { APIURLS } from './../shared/api-url';
import { HttpService } from '../shared/http-service';
import * as alaSQLSpace from 'alasql';
import * as _ from "lodash";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  startDate: Date;
  endDate: Date;
  report: any;
  errMsg: string = "";
  errMsgStrt: string = "";
  errMsgEnd: string = "";
  isLoading: boolean = false;
  isValidate: boolean = true;
  repHeaderList: any[];
  constructor(private appService: AppComponent, private httpService: HttpService,) { }

  ngOnInit() {
      this.getReportHeaders();
      var date = new Date();
      this.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      this.endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      this.report = { b2b_list: [], b2cl_list: [], b2cs_list: [], hsn_list:[]};
  }

  public reportAsExcelExport(): void {
      this.isLoading = true;
      var mystyle = {
          headers: false,
          column: { style: { Font: { Bold: "1" } } },
          rows: { 1: { style: { Font: { Color: "#FF0077" } } } },
      };
      var opts = [{ sheetid: 'b2b', headers: false }, { sheetid: 'b2cl', headers: false }, { sheetid: 'b2cs', headers: false }, { sheetid: 'hsn', headers: false }];
      var res = alasql('SELECT INTO XLSX("report_export_' + new Date().getTime()+'.xlsx",?) FROM ?', [opts, [this.report.b2b_list, this.report.b2cl_list, this.report.b2cs_list, this.report.hsn_list]]);
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
      this.errMsg = "";
      this.isValidate=this.validateForm();
      if (!this.isValidate) {
          this.errMsgStrt = this.errMsgStrt;
          this.errMsgEnd = this.errMsgEnd;
      }
      else {
          this.isLoading = true;
          let reqData = { 'fdate': this.startDate, 'tdate': this.endDate };
          this.httpService.post(APIURLS.BR_REPORT_API, reqData).then((data: any) => {
              this.isLoading = false;
              if (data.status == 'SUCCESS') {
                  var b2bHeaders = [{ "inv_gstin": "Summary For B2B(4)", "inv_no": "", "inv_date": "", "inv_value": "", "inv_state": "", "inv_reverse": "", "inv_type": "", "inv_ecgstin": "", "inv_rate": "", "inv_pamount": "", "inv_cess": "" },
                  { "inv_gstin": "No. of Recipients", "inv_no": "No. of Invoices", "inv_date": "", "inv_value": "Total Invoice Value", "inv_state": "", "inv_reverse": "", "inv_type": "", "inv_ecgstin": "", "inv_rate": "", "inv_pamount": "Total Taxable Value", "inv_cess": "Total Cess" },
                  { "inv_gstin": _.chain(data.b2b_list).map('inv_gstin').uniq().value().length, "inv_no": _.chain(data.b2b_list).map('inv_no').uniq().value().length, "inv_date": "", "inv_value": _.chain(data.b2b_list).uniqBy('inv_no').sumBy('inv_value').value(), "inv_state": "", "inv_reverse": "", "inv_type": "", "inv_ecgstin": "", "inv_rate": "", "inv_pamount": _.chain(data.b2b_list).uniqBy('inv_no').sumBy('inv_pamount').value(), "inv_cess": _.chain(data.b2b_list).uniqBy('inv_no').sumBy('inv_cess').value() },
                  { "inv_gstin": "GSTIN/UIN of Recipient", "inv_no": "Invoice Number", "inv_date": "Invoice date", "inv_value": "Invoice Value", "inv_state": "Place Of Supply", "inv_reverse": "Reverse Charge", "inv_type": "Invoice Type", "inv_ecgstin": "E-Commerce GSTIN", "inv_rate": "Rate", "inv_pamount": "Taxable Value", "inv_cess": "Cess Amount" }];
                  this.report.b2b_list = _.concat(b2bHeaders, data.b2b_list);

                  var b2clHeaders = [{ "inv_no": "Summary For B2CL(5)", "inv_date": "", "inv_value": "", "inv_state": "", "inv_rate": "", "inv_pamount": "", "inv_cess": "", "inv_egstin": "" },
                  { "inv_no": "No. of Invoices", "inv_date": "", "inv_value": "Total Inv Value", "inv_state": "", "inv_rate": "", "inv_pamount": "Total Taxable Value", "inv_cess": "Total Cess", "inv_egstin": "" },
                  { "inv_no": _.chain(data.b2cl_list).map('inv_no').uniq().value().length, "inv_date": "", "inv_value": _.chain(data.b2cl_list).uniqBy('inv_no').sumBy('inv_value').value(), "inv_state": "", "inv_rate": "", "inv_pamount": _.chain(data.b2cl_list).uniqBy('inv_no').sumBy('inv_pamount').value(), "inv_cess": _.chain(data.b2cl_list).uniqBy('inv_no').sumBy('inv_cess').value(), "inv_egstin": "" },
                  { "inv_no": "Invoice Number", "inv_date": "Invoice date", "inv_value": "Invoice Value", "inv_state": "Place Of Supply", "inv_rate": "Rate", "inv_pamount": "Taxable Value", "inv_cess": "Cess Amount", "inv_egstin": "E-Commerce GSTIN" }];
                  this.report.b2cl_list = _.concat(b2clHeaders, data.b2cl_list);

                  var b2csHeaders = [{ "inv_type": "Summary For B2CS(7)", "inv_state": "", "inv_rate": "", "inv_pamount": "", "inv_cess": "", "inv_egstin": "" },
                  { "inv_type": "", "inv_state": "", "inv_rate": "", "inv_pamount": "Total Taxable  Value", "inv_cess": "Total Cess", "inv_egstin": "" },
                  { "inv_type": "", "inv_state": "", "inv_rate": "", "inv_pamount": _.chain(data.b2cs_list).uniqBy('inv_no').sumBy('inv_pamount').value(), "inv_cess": _.chain(data.b2cs_list).uniqBy('inv_no').sumBy('inv_cess').value(), "inv_egstin": "E-Commerce GSTIN" },
                  { "inv_type": "Type", "inv_state": "Place Of Supply", "inv_rate": "Rate", "inv_pamount": "Taxable Value", "inv_cess": "Cess Amount", "inv_egstin": "" }];
                  this.report.b2cs_list = _.concat(b2csHeaders, data.b2cs_list);

                  var hsnHeaders = [{ "hsn": "Summary For HSN(12)", "desciption": "", "UQC": "", "tqty": "", "tvalue": "", "pvalue": "", "tigst": "", "tcgst": "", "tsgst": "", "tcess": "" },
                  { "hsn": "No. of HSN", "desciption": "", "UQC": "", "tqty": "", "tvalue": "Total Value", "pvalue": "Total Taxable Value", "tigst": "Total Integrated Tax", "tcgst": "Total Central Tax", "tsgst": "Total State/UT Tax", "tcess": "Total Cess" },
                  { "hsn": _.chain(data.hsn_list).map('hsn').uniq().value().length, "desciption": "", "UQC": "", "tqty": "", "tvalue": _.sumBy(data.hsn_list, 'tvalue'), "pvalue": _.sumBy(data.hsn_list, 'pvalue'), "tigst": _.sumBy(data.hsn_list, 'tigst'), "tcgst": _.sumBy(data.hsn_list, 'tcgst'), "tsgst": _.sumBy(data.hsn_list, 'tsgst'), "tcess": _.sumBy(data.hsn_list, 'tcess') },
                  { "hsn": "HSN", "desciption": "Description", "UQC": "UQC", "tqty": "Total Quantity", "tvalue": "Total Value", "pvalue": "Taxable Value", "tigst": "Integrated Tax Amount", "tcgst": "Central Tax Amount", "tsgst": "State/UT Tax Amount", "tcess": "Cess Amount" }];
                  this.report.hsn_list = _.concat(hsnHeaders, data.hsn_list);
                  this.reportAsExcelExport();
              }
          }).catch(error => {
              this.isLoading = false;
              this.report.b2b_list = [];
              this.report.b2cl_list = [];
              this.report.b2cs_list = [];
              this.report.hsn_list = [];
          });
      }
  }
  getReportHeaders() {
      this.httpService.get(APIURLS.BR_FORM_DATA_API).then((data: any) => {
          if (data.status == 'SUCCESS') {
              this.repHeaderList = data.formDataList;
              this.repHeaderList = data.formDataList.find(s => s.subMenuId == '10'); //_.filter(data.formData, function (obj) { if (obj.name == 'Entity') return obj; });
          }
      }).catch(error => {
          this.repHeaderList = null;
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
