import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import { MasterDataService } from '../../Services/masterdata.service';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-salarystructure-master',
  templateUrl: './salarystructure-master.component.html',
  styleUrls: ['./salarystructure-master.component.css'],
  providers: [Util]
})
export class SalarystructureMasterComponent implements OnInit {
@ViewChild(NgForm, { static: false }) detailsForm: NgForm;

  isLoading: boolean = false;
  currentUser: AuthData;
  filterModel: any = {};
  filterData: any = {}
  item: any = {};
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  metroList = [{ type: "Yes" }, { type: "No" }];
  salaryTypes = [{ type: "I", text: "Income" }, { type: "R", text: "Reimbursement" }, { type: "B", text: "Benefits" }, { type: "D", text: "Deduction" }, { type: "V", text: "Variable Pay" }, { type: "O", text: "One-time" }];
  salaryFrequency = [{ type: "A", text: "Annual" }, { type: "H", text: "Half-Yearly" }, { type: "Q", text: "Quarterly" }, { type: "M", text: "Monthly" }, { type: "O", text: "One-time" }];
  yesNoList = [{ type: "X", text: "Yes" }, { type: "N", text: "No" }];

  constructor(private httpService: HttpService,
    private router: Router, private util: Util, private masterService: MasterDataService, private excelService: ExcelService) {
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.filterModel.salaryType = '';
    this.filterModel.frequency = '';
    this.filterModel.gratuity = '';
    this.filterModel.status = '';
    this.filterModel.pf = '';
    this.filterModel.bonus = '';
    this.filterModel.textSearch = "";
    this.getListData();
    this.item.client = "900";
  }

  getListData() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_SALARY_HEAD_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        if (this.salaryTypes.find(x => x.type == item.salaryType) != null) {
          this.item.salaryType = this.salaryTypes.find(x => x.type == item.salaryType).text;
          item.salaryTypeText = this.salaryTypes.find(x => x.type == item.salaryType).text;
        }
        if (this.salaryFrequency.find(x => x.type == item.salaryPayableFrequency) != null) {
          this.item.salaryPayableFrequency = this.salaryFrequency.find(x => x.type == item.salaryPayableFrequency).text;
          item.salaryPayableFrequencyText = this.salaryFrequency.find(x => x.type == item.salaryPayableFrequency).text;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error("Error while fetching the list. Error: " + error);
      this.isLoading = false;
    });
  }


  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getData();
  }


  addData() {

    toastr.info("Adding...");
    this.isLoading = true;

    if (this.item.statusBool)
      this.item.status = "X";
    if (this.item.lWPIsapplicableBool)
      this.item.lWPIsapplicable = "X"
    if (this.item.showSalaryinPaySlipBool)
      this.item.showSalaryinPaySlip = "X"
    if (this.item.eligibleforPFDeductionBool)
      this.item.eligibleforPFDeduction = "X"
    if (this.item.eligibleforESIDeductionBool)
      this.item.eligibleforESIDeduction = "X"
    if (this.item.eligibleforPTDeductionBool)
      this.item.eligibleforPTDeduction = "X"
    if (this.item.eligibleforBonusPaymentBool)
      this.item.eligibleforBonusPayment = "X"
    if (this.item.eligibleforITDeductionBool)
      this.item.eligibleforITDeduction = "X"
    if (this.item.eligibleforITProjectionCalculationBool)
      this.item.eligibleforITProjectionCalculation = "X"
    if (this.item.eligibleforGratuityCalculationBool)
      this.item.eligibleforGratuityCalculation = "X"

    this.item.createdBy = this.currentUser.uid;
    this.item.createdOn = this.util.getFormatedDateTime(new Date());
    this.item.modifiedBy = this.currentUser.uid;
    this.item.modifiedOn = this.util.getFormatedDateTime(new Date());

    this.httpService.HRpost(APIURLS.BR_SALARYHEAD, this.item)
      .then((data: any) => {
        if (data == 200 || data.id > 0) {
          this.item.id = data.id;
          toastr.success("Successfully added the details.");
          $("#detailsModal").modal("hide");
          this.getData();
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error adding details...' + error);
      })
  }

  updateData() {

    toastr.info("Updating...");
    this.isLoading = true;

    this.isLoading = true;
    if (this.item.statusBool)
      this.item.status = "X";
    if (this.item.lWPIsapplicableBool)
      this.item.lWPIsapplicable = "X"
    if (this.item.showSalaryinPaySlipBool)
      this.item.showSalaryinPaySlip = "X"
    if (this.item.eligibleforPFDeductionBool)
      this.item.eligibleforPFDeduction = "X"
    if (this.item.eligibleforESIDeductionBool)
      this.item.eligibleforESIDeduction = "X"
    if (this.item.eligibleforPTDeductionBool)
      this.item.eligibleforPTDeduction = "X"
    if (this.item.eligibleforBonusPaymentBool)
      this.item.eligibleforBonusPayment = "X"
    if (this.item.eligibleforITDeductionBool)
      this.item.eligibleforITDeduction = "X"
    if (this.item.eligibleforITProjectionCalculationBool)
      this.item.eligibleforITProjectionCalculation = "X"
    if (this.item.eligibleforGratuityCalculationBool)
      this.item.eligibleforGratuityCalculation = "X"

    this.item.modifiedBy = this.currentUser.uid;
    this.item.modifiedOn = this.util.getFormatedDateTime(new Date());

    this.httpService.HRput(APIURLS.BR_SALARYHEAD, this.item.id, this.item)
      .then((data: any) => {
        if (data == 200 || data.id > 0) {
          toastr.success("Successfully updated the details.");
          $("#detailsModal").modal("hide");
          this.getData();
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error updating details...' + error);
      })
  }



  onAddClick() {
    this.clearInput();
    $("#detailsModal").modal("show");
  }

  onAddLine() {
    this.filterData.list.push(this.item);
    this.count++;
    this.clearInput();
  }

  EditLine(item, index) {
    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
    $("#detailsModal").modal("show");
  }

  onUpdateLine() {
    this.filterData.list[this.editIndex] = this.item;
    this.clearInput();
  }

  RemoveLine(no) {
    if (no == this.editIndex && this.isEdit) {
      this.clearInput();
    } else if (no < this.editIndex) {
      this.editIndex--;
    }
    this.filterData.list.splice(no, 1);
    this.count--;
  }

  clearInput() {
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;
    this.detailsForm.form.markAsPristine();
    this.detailsForm.form.markAsUntouched();
  }

  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_SALARY_HEAD_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      for (var item of data.list) {
        if (this.salaryTypes.find(x => x.type == item.salaryType) != null) {
          item.salaryTypeText = this.salaryTypes.find(x => x.type == item.salaryType).text;
        }
        if (this.salaryFrequency.find(x => x.type == item.salaryPayableFrequency) != null) {
          item.salaryPayableFrequencyText = this.salaryFrequency.find(x => x.type == item.salaryPayableFrequency).text;
        }
      }
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Client": item.client,
          "Salary ST": item.salaryST,
          "Salary LT": item.salaryLT,
          "Salary Type": item.salaryTypeText,
          "Salary Payable Frequency": item.salaryPayableFrequencyText,
          "Description In Pay Slip": item.descriptionInPaySlip,
          "Investment Code": item.investmentCode,
          "SAP SalaryId": item.salaryId,
          "Salary Sequence No": item.salarysequencenumber,
          "Prerequisite Id": this.setDateFormate(item.perquisiteID),
          "Salary Calculation Type": item.salaryCalculationType,
          "Salary Rounding To": item.salaryRoundingTo,
          "Grouping Salary Head": item.groupingSalaryHeadsforITProcessing,
          "Active": item.statusBool == true ? "Yes" : "No",
          "LWPIs Applicable": item.lWPIsapplicableBool == true ? "Yes" : "No",
          "Show Salary in PaySlip": item.showSalaryinPaySlipBool == true ? "Yes" : "No",
          "Eligible for PF Deduction": item.eligibleforPFDeductionBool == true ? "Yes" : "No",
          "Eligible for ESI Deduction": item.eligibleforESIDeductionBool == true ? "Yes" : "No",
          "Eligible for PT Deduction": item.eligibleforPTDeductionBool == true ? "Yes" : "No",
          "Eligible for Bonus Payment": item.eligibleforBonusPaymentBool == true ? "Yes" : "No",
          "Eligible for IT Deduction": item.eligibleforITDeductionBool == true ? "Yes" : "No",
          "Eligible for IT Projection Calculation": item.eligibleforITProjectionCalculationBool == true ? "Yes" : "No",
          "Eligible for Gratuity Calculation": item.eligibleforGratuityCalculationBool == true ? "Yes" : "No",
          "Created By": item.createdByName,
          "Created On": this.setDateFormate(item.createdOn),
          "Modified By": item.modifiedByName,
          "Modified On": this.setDateFormate(item.modifiedOn),
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'SalaryHead_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  
  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
}
